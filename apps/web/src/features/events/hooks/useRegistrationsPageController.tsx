import { useCallback, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import type { GridPaginationModel } from "@mui/x-data-grid";

import { useNotification } from "@/components/ui/NotificationContext";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { useDebounce } from "@/hooks/useDebounce";

import type { ExportOptions } from "@/components/ui/ExportConfigDialog";
import {
  downloadRegistrationsExcel,
  downloadRegistrationsPdf,
} from "../api/registrations.service";
import { useEventFields } from "../hooks/useEventFields";
import {
  useDeleteRegistration,
  useRegistrations,
  useUpdateRegistrationData,
  useUpdateRegistrationStatus,
} from "../hooks/useRegistrations";
import { useRegistrationsPageGridModel } from "./useRegistrationsPageGridModel";
import type {
  EventField,
  EventOutletCtx,
  RegistrationItem,
  RegistrationStatus,
} from "../types";
import { STATUS_LABEL } from "../utils/registrationStatus";

const EMPTY_ROWS: RegistrationItem[] = [];

type DeleteDialogState = { open: boolean; row: RegistrationItem | null };
type EditDialogState = { open: boolean; row: RegistrationItem | null };

export const useRegistrationsPageController = () => {
  const { eventId } = useParams();
  const id = Number(eventId);
  const isValidEventId = Boolean(eventId && Number.isFinite(id));
  const activeEventId = isValidEventId ? id : 0;
  const { showNotification } = useNotification();
  const { access, event } = useOutletContext<EventOutletCtx>();

  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 500);
  const [status, setStatus] = useState<RegistrationStatus | "">("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<RegistrationItem | null>(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [tempGroup, setTempGroup] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<"xlsx" | "pdf">("xlsx");
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    row: null,
  });
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    row: null,
  });

  const canView = access?.canView ?? false;
  const canWrite = access?.canWrite ?? false;
  const canExport = access?.canExport ?? false;

  const params = useMemo(
    () => ({
      page: page + 1,
      limit: pageSize,
      q: debouncedQ.trim() || undefined,
      status: status || undefined,
      orderBy: "createdAt",
      orderDir: "asc",
    }),
    [debouncedQ, page, pageSize, status],
  );

  const { data: eventFields } = useEventFields(activeEventId);
  const { data, isLoading, isError, error, isFetching } = useRegistrations(
    activeEventId,
    params,
  );
  const updateStatusMutation = useUpdateRegistrationStatus(activeEventId);
  const deleteMutation = useDeleteRegistration(activeEventId);
  const updateDataMutation = useUpdateRegistrationData(activeEventId);

  const rows = data?.items ?? EMPTY_ROWS;
  const rowCount = data?.meta.total ?? 0;
  const menuOpen = Boolean(anchorEl);
  const isBusy =
    isDownloading ||
    updateStatusMutation.isPending ||
    deleteMutation.isPending ||
    updateDataMutation.isPending;

  const closeMenu = useCallback(() => {
    setAnchorEl(null);
    setActiveRow(null);
    setIsEditingGroup(false);
  }, []);

  const openMenu = useCallback(
    (e: MouseEvent<HTMLElement>, row: RegistrationItem) => {
      if (!canWrite) return;
      setAnchorEl(e.currentTarget);
      setActiveRow(row);
      setTempGroup(row.assignedGroup || "");
      setIsEditingGroup(false);
    },
    [canWrite],
  );

  const onQueryChange = useCallback((value: string) => {
    setQ(value);
    setPage(0);
  }, []);

  const onStatusChange = useCallback((value: RegistrationStatus | "") => {
    setStatus(value);
    setPage(0);
  }, []);

  const onPageChange = useCallback((next: GridPaginationModel) => {
    setPage(next.page);
    setPageSize(next.pageSize);
  }, []);

  const startDownload = useCallback((type: "xlsx" | "pdf") => {
    setExportType(type);
    setExportDialogOpen(true);
  }, []);

  const executeDownload = useCallback(
    async (options: ExportOptions) => {
      try {
        setIsDownloading(true);
        const downloadParams = {
          ...params,
          groupBy: options.groupBy || undefined,
          pageBreak: options.pageBreak,
          columns: options.columns.join(","),
        };

        if (exportType === "xlsx") {
          await downloadRegistrationsExcel(id, downloadParams);
        } else {
          await downloadRegistrationsPdf(id, downloadParams);
        }

        showNotification(
          `Archivo ${exportType.toUpperCase()} generado`,
          "success",
        );
      } catch {
        showNotification("Error al generar el archivo", "error");
      } finally {
        setIsDownloading(false);
      }
    },
    [id, exportType, params, showNotification],
  );

  const onChangeStatus = useCallback(
    (newStatus: RegistrationStatus) => {
      if (!activeRow || !canWrite) return;
      updateStatusMutation.mutate(
        { registrationId: activeRow.id, status: newStatus },
        {
          onSuccess: () => {
            closeMenu();
            showNotification(
              `Estado cambiado a ${STATUS_LABEL[newStatus]}`,
              "success",
            );
          },
          onError: () => {
            closeMenu();
            showNotification("Error al cambiar el estado", "error");
          },
        },
      );
    },
    [activeRow, canWrite, closeMenu, showNotification, updateStatusMutation],
  );

  const onSaveGroup = useCallback(() => {
    if (!activeRow || !canWrite) return;
    updateStatusMutation.mutate(
      {
        registrationId: activeRow.id,
        status: activeRow.status,
        assignedGroup: tempGroup || null,
      },
      {
        onSuccess: () => {
          closeMenu();
          showNotification("Grupo actualizado", "success");
        },
        onError: () => {
          showNotification("Error al actualizar el grupo", "error");
        },
      },
    );
  }, [
    activeRow,
    canWrite,
    closeMenu,
    showNotification,
    tempGroup,
    updateStatusMutation,
  ]);

  const onOpenDeleteConfirm = useCallback(() => {
    if (!activeRow || !canWrite) return;
    setDeleteDialog({ open: true, row: activeRow });
    closeMenu();
  }, [activeRow, canWrite, closeMenu]);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, row: null });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteDialog.row) return;

    deleteMutation.mutate(deleteDialog.row.id, {
      onSuccess: () => {
        setDeleteDialog({ open: false, row: null });
        showNotification("Registro eliminado permanentemente", "success");
      },
      onError: (err) => {
        setDeleteDialog({ open: false, row: null });
        showNotification(
          getErrorMessage(err) || "Error al eliminar el registro",
          "error",
        );
      },
    });
  }, [deleteDialog.row, deleteMutation, showNotification]);

  const openEditDialog = useCallback(() => {
    if (!activeRow) return;
    setEditDialog({ open: true, row: activeRow });
    closeMenu();
  }, [activeRow, closeMenu]);

  const closeEditDialog = useCallback(() => {
    setEditDialog({ open: false, row: null });
  }, []);

  const handleSaveEditData = useCallback(
    (payload: {
      contact: { phone: string; email: string };
      answers: Record<string, unknown>;
    }) => {
      if (!editDialog.row) return;
      updateDataMutation.mutate(
        { registrationId: editDialog.row.id, payload },
        {
          onSuccess: () => {
            setEditDialog({ open: false, row: null });
            showNotification("Datos actualizados correctamente", "success");
          },
          onError: (err) => {
            showNotification(
              getErrorMessage(err) || "Error al actualizar",
              "error",
            );
          },
        },
      );
    },
    [editDialog.row, showNotification, updateDataMutation],
  );

  const { columns, dynamicFieldsList } = useRegistrationsPageGridModel({
    canWrite,
    event,
    rows,
    openMenu,
  });

  return {
    canView,
    canWrite,
    canExport,
    isValidEventId,
    activeEventId,
    page,
    pageSize,
    event,
    eventFields: eventFields as EventField[] | undefined,
    rows,
    rowCount,
    columns,
    dynamicFieldsList,
    q,
    status,
    isLoading,
    isFetching,
    isError,
    error,
    isDownloading,
    exportDialogOpen,
    exportType,
    deleteDialog,
    editDialog,
    anchorEl,
    activeRow,
    menuOpen,
    isEditingGroup,
    tempGroup,
    isBusy,
    onQueryChange,
    onStatusChange,
    onPageChange,
    openMenu,
    closeMenu,
    startDownload,
    executeDownload,
    onChangeStatus,
    onSaveGroup,
    onOpenDeleteConfirm,
    closeDeleteDialog,
    handleConfirmDelete,
    openEditDialog,
    closeEditDialog,
    handleSaveEditData,
    setExportDialogOpen,
    setIsEditingGroup,
    setTempGroup,
    updateStatusPending: updateStatusMutation.isPending,
    deletePending: deleteMutation.isPending,
    updateDataPending: updateDataMutation.isPending,
  };
};

export type RegistrationsPageController = ReturnType<
  typeof useRegistrationsPageController
>;
