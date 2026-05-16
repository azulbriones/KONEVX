import { useMemo, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import { useOutletContext, useParams } from "react-router-dom";

import { useNotification } from "@/components/ui/NotificationContext";
import { useUser } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/features/utils/getErrorMessage";

import {
  useAddEventMember,
  useEventMembers,
  useRemoveEventMember,
  useUpdateEventMemberRole,
} from "../hooks/useEventMembers";
import { buildEventMembersColumns } from "./useEventMembersPageController.columns";
import type { EventMember, EventMemberRole, EventOutletCtx } from "../types";

export const ROLE_OPTIONS: EventMemberRole[] = ["VIEWER", "CHECKIN", "EDITOR"];

const getErrorCode = (err: unknown) => {
  if (typeof err !== "object" || !err) return undefined;
  const error = err as {
    error?: { code?: string };
    response?: { data?: { error?: { code?: string } } };
  };
  return error.error?.code || error.response?.data?.error?.code;
};

export const useEventMembersPageController = () => {
  const { eventId } = useParams();
  const id = Number(eventId);
  const isValidEventId = Boolean(eventId && Number.isFinite(id));
  const { showNotification } = useNotification();
  const { access } = useOutletContext<EventOutletCtx>();
  const { data: me } = useUser();

  const canManageMembers = access?.canWrite ?? false;

  const { data, isLoading, isError, error } = useEventMembers(id);
  const addMutation = useAddEventMember(id);
  const updateRoleMutation = useUpdateEventMemberRole(id);
  const removeMutation = useRemoveEventMember(id);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EventMemberRole>("VIEWER");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<EventMember | null>(null);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventMember | null>(null);

  const rows = useMemo(() => data ?? [], [data]);
  const editorsCount = useMemo(
    () => rows.filter((member) => member.eventRole === "EDITOR").length,
    [rows],
  );

  const isSelf = (row: EventMember) => !!me?.id && row.userId === me.id;
  const isLastEditorRow = (row: EventMember) =>
    row.eventRole === "EDITOR" && editorsCount <= 1;

  const menuOpen = Boolean(menuAnchor);
  const busy =
    addMutation.isPending || updateRoleMutation.isPending || removeMutation.isPending;
  const addDisabled = busy || !email.trim();
  const menuIsSelf = menuRow ? isSelf(menuRow) : false;
  const menuIsLastEditor = menuRow ? isLastEditorRow(menuRow) : false;
  const disableRemove = busy || menuIsSelf || menuIsLastEditor || !menuRow;
  const disableDowngrade =
    busy || !menuRow || menuIsSelf || (menuRow.eventRole === "EDITOR" && menuIsLastEditor);

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const openMenu = (event: MouseEvent<HTMLElement>, row: EventMember) => {
    setMenuAnchor(event.currentTarget);
    setMenuRow(row);
  };

  const columns = useMemo(
    () => buildEventMembersColumns({ busy, openMenu }),
    [busy, openMenu],
  );

  const askRemove = () => {
    if (!menuRow || isSelf(menuRow) || isLastEditorRow(menuRow)) return;
    setDeleteTarget(menuRow);
    closeMenu();
    setConfirmOpen(true);
  };

  const doRemove = () => {
    if (!deleteTarget) return;
    removeMutation.mutate(deleteTarget.userId, {
      onSuccess: () => {
        showNotification("Usuario eliminado del evento", "success");
        setConfirmOpen(false);
        setDeleteTarget(null);
      },
      onError: (err) => showNotification(getErrorMessage(err), "error"),
    });
  };

  const setMemberRole = (newRole: EventMemberRole) => {
    if (!menuRow || isSelf(menuRow)) return;
    if (menuRow.eventRole === "EDITOR" && newRole !== "EDITOR" && isLastEditorRow(menuRow)) return;

    closeMenu();
    updateRoleMutation.mutate(
      { userId: menuRow.userId, role: newRole },
      {
        onSuccess: () => showNotification("Rol actualizado a " + newRole, "success"),
        onError: (err) => showNotification(getErrorMessage(err), "error"),
      },
    );
  };

  const onAdd = (event?: FormEvent) => {
    if (event) event.preventDefault();
    const emailTrim = email.trim();
    if (!emailTrim) return;

    addMutation.mutate(
      { email: emailTrim, role },
      {
        onSuccess: () => {
          setEmail("");
          setRole("VIEWER");
          setAddDrawerOpen(false);
          showNotification("Usuario agregado al evento", "success");
        },
        onError: (err: unknown) => {
          const errorCode = getErrorCode(err);

          if (errorCode === "USER_NOT_FOUND") {
            showNotification(
              "El usuario no existe. Pídele que se registre en la plataforma primero.",
              "warning",
            );
          } else if (errorCode === "USER_ALREADY_MEMBER") {
            showNotification("Este usuario ya es miembro del evento.", "info");
          } else {
            showNotification(getErrorMessage(err), "error");
          }
        },
      },
    );
  };

  return {
    canManageMembers,
    isValidEventId,
    isLoading,
    isError,
    error,
    rows,
    editorsCount,
    columns,
    busy,
    addDisabled,
    email,
    role,
    menuAnchor,
    menuRow,
    menuOpen,
    addDrawerOpen,
    confirmOpen,
    deleteTarget,
    disableRemove,
    disableDowngrade,
    setEmail,
    setRole,
    setAddDrawerOpen,
    setConfirmOpen,
    setDeleteTarget,
    openMenu,
    closeMenu,
    askRemove,
    doRemove,
    setMemberRole,
    onAdd,
    addPending: addMutation.isPending,
    updateRoleMutation,
    removeMutation,
  };
};

export type EventMembersPageController = ReturnType<typeof useEventMembersPageController>;
