import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import {
  cancelAttendance,
  downloadRegistrationsExcel,
  downloadRegistrationsPdf,
  markAttendance,
  quickRegistration,
} from "../api/registrations.service";
import { eventsKeys } from "./useEvents";
import { registrationsKeys, useRegistrations } from "./useRegistrations";
import type {
  Ctx,
  ListRegistrationsQuery,
  RegistrationItem,
  RegistrationStatus,
  RegistrationsListResponse,
} from "../types";
import { getRegistrationAnswerEntries } from "../utils/registrationAnswers";
import type { ExportOptions } from "@/components/ui/ExportConfigDialog";

type RegistrationWithNotes = RegistrationItem & {
  checkInNotes?: string | null;
};

export const useCheckInPageController = () => {
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const { access, stats, event } = useOutletContext<Ctx>();

  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [quickRegOpen, setQuickRegOpen] = useState(false);
  const [isQuickRegistering, setIsQuickRegistering] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<"xlsx" | "pdf">("xlsx");
  const [isExporting, setIsExporting] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; regId: number | null }>({ open: false, regId: null });

  const queryKey = registrationsKeys.list(Number(eventId), { q: searchTerm, limit: 50 });
  const { data, isLoading, refetch } = useRegistrations(Number(eventId), { q: searchTerm, limit: 50 });

  const counts = stats?.statusCounts || { REGISTERED: 0, CONFIRMED: 0, ATTENDED: 0, CANCELLED: 0 };
  const groupsOccupancy = stats?.groupsOccupancy || {};
  const groupEntries = Object.entries(groupsOccupancy).sort(([a], [b]) => a.localeCompare(b));

  const dynamicFieldsList = useMemo(() => {
    const firstRow = data?.items?.[0] as RegistrationItem | undefined;
    if (!firstRow?.answers) return [];
    return getRegistrationAnswerEntries(firstRow).map(([key, val]) => ({ key, label: val.label }));
  }, [data?.items]);

  const refreshAllData = async () => {
    await refetch();
    await queryClient.invalidateQueries({ queryKey: eventsKeys.detail(Number(eventId)) });
  };

  const checkInMutation = useMutation({
    mutationFn: ({ regId, notes }: { regId: number; notes?: string }) => markAttendance(Number(eventId), regId, notes),
    networkMode: "offlineFirst",
    retry: 3,
    retryDelay: 2000,
    onMutate: async ({ regId, notes }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData<RegistrationsListResponse | undefined>(queryKey, (oldData) => {
        if (!oldData?.items) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((reg) =>
            reg.id === regId
              ? ({
                ...reg,
                status: "ATTENDED",
                checkInNotes: notes || (reg as RegistrationWithNotes).checkInNotes,
              } satisfies RegistrationWithNotes)
              : reg,
          ),
        };
      });
      return { previousData };
    },
    onError: (err: unknown, _variables, context) => {
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
      const message =
        typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setStatusMsg({ type: "error", text: message || "Error de red. La entrada no se pudo guardar." });
    },
    onSettled: async () => {
      setLoadingId(null);
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(Number(eventId)) });
    },
  });

  const handleCheckIn = (regId: number, notes?: string) => {
    setLoadingId(regId);
    setStatusMsg(null);
    checkInMutation.mutate({ regId, notes });
  };

  const cancelCheckInMutation = useMutation({
    mutationFn: (regId: number) => cancelAttendance(Number(eventId), regId),
    networkMode: "offlineFirst",
    retry: 3,
    onMutate: async (regId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData<RegistrationsListResponse | undefined>(queryKey, (oldData) => {
        if (!oldData?.items) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((reg) => (reg.id === regId ? { ...reg, status: "REGISTERED" } : reg)),
        };
      });
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
      setStatusMsg({ type: "error", text: "Error de red. No se pudo anular." });
    },
    onSettled: async () => {
      setLoadingId(null);
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(Number(eventId)) });
    },
  });

  const handleCancelCheckIn = (regId: number) => {
    setCancelDialog({ open: true, regId });
  };

  const executeCancelCheckIn = () => {
    if (cancelDialog.regId) {
      setLoadingId(cancelDialog.regId);
      cancelCheckInMutation.mutate(cancelDialog.regId);
    }
    setCancelDialog({ open: false, regId: null });
  };

  const handleQuickRegistration = async (payload: { name: string; contact: string; assignedGroup?: string }) => {
    setIsQuickRegistering(true);
    setStatusMsg(null);
    try {
      await quickRegistration(Number(eventId), payload);
      setStatusMsg({ type: "success", text: "¡Registro express completado y admitido!" });
      setQuickRegOpen(false);
      setSearchTerm("");
      await refreshAllData();
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setStatusMsg({ type: "error", text: message || "Error al crear el registro express" });
    } finally {
      setIsQuickRegistering(false);
    }
  };

  const handleQRScan = (scannedText: string) => {
    setQrScannerOpen(false);
    const regId = parseInt(scannedText, 10);
    if (isNaN(regId)) {
      setStatusMsg({ type: "error", text: "Código QR inválido. No contiene un ID numérico." });
      return;
    }
    handleCheckIn(regId, "Entrada escaneada por QR");
  };

  const handleDownloadClick = (type: "xlsx" | "pdf") => {
    setExportType(type);
    setExportDialogOpen(true);
  };

  const executeDownload = async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      setStatusMsg(null);
      const downloadParams = {
        status: "ATTENDED" as RegistrationStatus,
        groupBy: options.groupBy || undefined,
        pageBreak: options.pageBreak,
        columns: options.columns.join(","),
      } satisfies Partial<ListRegistrationsQuery> & { columns: string; groupBy?: string; pageBreak: boolean };
      if (exportType === "xlsx") {
        await downloadRegistrationsExcel(Number(eventId), downloadParams);
      } else {
        await downloadRegistrationsPdf(Number(eventId), downloadParams);
      }
      setStatusMsg({ type: "success", text: `Lista de asistencia (${exportType.toUpperCase()}) descargada.` });
    } catch {
      setStatusMsg({ type: "error", text: "Error al generar el archivo." });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    access,
    event,
    counts,
    groupEntries,
    dynamicFieldsList,
    searchTerm,
    setSearchTerm,
    loadingId,
    statusMsg,
    setStatusMsg,
    quickRegOpen,
    setQuickRegOpen,
    isQuickRegistering,
    qrScannerOpen,
    setQrScannerOpen,
    exportDialogOpen,
    setExportDialogOpen,
    exportType,
    isExporting,
    cancelDialog,
    setCancelDialog,
    cancelCheckInPending: cancelCheckInMutation.isPending,
    data,
    isLoading,
    handleCheckIn,
    handleCancelCheckIn,
    executeCancelCheckIn,
    handleQuickRegistration,
    handleQRScan,
    handleDownloadClick,
    executeDownload,
  };
};
