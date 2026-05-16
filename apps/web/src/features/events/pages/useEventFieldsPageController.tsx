import { useCallback, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { FieldDrawerResult } from "../fields/components/FieldDrawer";
import {
  isSelectType,
  moveField,
  normalizeOrder,
} from "../fields/utils/fields";
import type { EventField } from "../types";

type UseEventFieldsPageControllerParams = {
  draft: EventField[];
  setDraft: Dispatch<SetStateAction<EventField[]>>;
  reset: () => void;
  saveDraft: () => Promise<void>;
  showNotification: (message: string, severity: "success" | "error") => void;
};

export const useEventFieldsPageController = ({
  draft,
  setDraft,
  reset,
  saveDraft,
  showNotification,
}: UseEventFieldsPageControllerParams) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editingField, setEditingField] = useState<EventField | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventField | null>(null);

  const rows = useMemo(() => normalizeOrder(draft), [draft]);

  const moveUp = useCallback(
    (fieldId: number) => {
      setDraft((prev: EventField[]) => moveField(prev, fieldId, -1));
    },
    [setDraft],
  );

  const moveDown = useCallback(
    (fieldId: number) => {
      setDraft((prev: EventField[]) => moveField(prev, fieldId, 1));
    },
    [setDraft],
  );

  const openCreate = useCallback(() => {
    setDrawerMode("create");
    setEditingField(null);
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback((field: EventField) => {
    setDrawerMode("edit");
    setEditingField(field);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingField(null);
  }, []);

  const onSubmitDrawer = useCallback(
    (values: FieldDrawerResult) => {
      setDraft((prev: EventField[]) => {
        const next = normalizeOrder(prev);

        if (drawerMode === "create") {
          const tempId = -Date.now();
          const newField: EventField = {
            id: tempId,
            key: values.key,
            label: values.label,
            type: values.type,
            required: values.required,
            order: next.length,
            options: isSelectType(values.type) ? values.options : undefined,
          } as EventField;
          return normalizeOrder([...next, newField]);
        }

        if (!editingField) return next;

        return normalizeOrder(
          next.map((field) => {
            if (field.id !== editingField.id) return field;
            return {
              ...field,
              label: values.label,
              type: values.type,
              required: values.required,
              options: isSelectType(values.type) ? values.options : undefined,
            };
          }),
        );
      });
      closeDrawer();
    },
    [closeDrawer, drawerMode, editingField, setDraft],
  );

  const askDelete = useCallback((field: EventField) => {
    setDeleteTarget(field);
    setConfirmOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setConfirmOpen(false);
    setDeleteTarget(null);
  }, []);

  const doDelete = useCallback(() => {
    if (!deleteTarget) return;

    setDraft((prev: EventField[]) =>
      normalizeOrder(prev.filter((field) => field.id !== deleteTarget.id)),
    );
    closeDeleteDialog();
  }, [closeDeleteDialog, deleteTarget, setDraft]);

  const handleSaveDraft = useCallback(async () => {
    try {
      await saveDraft();
      showNotification("Campos actualizados correctamente", "success");
    } catch {
      showNotification("Hubo un error al guardar los campos", "error");
    }
  }, [saveDraft, showNotification]);

  return {
    rows,
    drawerOpen,
    drawerMode,
    editingField,
    confirmOpen,
    deleteTarget,
    moveUp,
    moveDown,
    openCreate,
    openEdit,
    closeDrawer,
    onSubmitDrawer,
    askDelete,
    closeDeleteDialog,
    doDelete,
    handleSaveDraft,
    reset,
  };
};
