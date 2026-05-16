import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useNotification } from "@/components/ui/NotificationContext";
import { useEventFieldsDraft } from "@/features/events/hooks/useEventFieldsDraft";
import { getErrorMessage } from "@/features/utils/getErrorMessage";

import {
  Add,
  Save,
  Undo,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useMemo } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { EventPermissionGate } from "../components/EventPermissionGate";
import { EventManagementPageShell } from "../components/EventManagementPageShell";
import { FieldDrawer } from "../fields/components/FieldDrawer";
import type { EventOutletCtx } from "../types";

import { buildEventFieldsColumns } from "./EventFieldsPage.columns";
import { useEventFieldsPageController } from "./useEventFieldsPageController";
import styles from "./EventFieldsPage.module.css";

export const EventFieldsPage = () => {
  const { eventId } = useParams();
  const id = Number(eventId);
  const { showNotification } = useNotification();

  const {
    draft,
    setDraft,
    dirty,
    reset,
    saveDraft,
    isLoading,
    isError,
    error,
    saving,
  } = useEventFieldsDraft(id);

  const { access } = useOutletContext<EventOutletCtx>();

  const canManageFields = access?.canWrite ?? false;

  const controller = useEventFieldsPageController({
    draft,
    setDraft,
    reset,
    saveDraft,
    showNotification,
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const columns = useMemo<GridColDef[]>(
    () =>
      buildEventFieldsColumns({
        rowCount: controller.rows.length,
        onEdit: controller.openEdit,
        onMoveUp: controller.moveUp,
        onMoveDown: controller.moveDown,
        onDelete: controller.askDelete,
      }),
    [
      controller.askDelete,
      controller.moveDown,
      controller.moveUp,
      controller.openEdit,
      controller.rows.length,
    ],
  );

  if (!canManageFields) {
    return (
      <EventPermissionGate
        allow={false}
        title="Acceso restringido"
        message="No tienes permisos para gestionar campos de este evento."
      />
    );
  }

  if (!eventId || !Number.isFinite(id))
    return <Typography color="error">ID de evento inválido</Typography>;
  if (isLoading)
    return (
      <Box className={styles.loadingWrap}>
        <Typography color="text.secondary">Cargando campos...</Typography>
      </Box>
    );
  if (isError)
    return <Typography color="error">{getErrorMessage(error)}</Typography>;

  return (
    <EventManagementPageShell
      title="Campos del Formulario"
      description="Ordená, editá y redefiní la estructura del formulario sin perder de vista qué está pendiente de guardar."
      chips={
        <>
          {dirty && (
            <Chip
              size="small"
              color="warning"
              label="Cambios sin guardar"
              variant="filled"
            />
          )}
          <Chip
            size="small"
            label={`${controller.rows.length} campos`}
            variant="outlined"
          />
        </>
      }
      actions={
        <>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Add />}
            onClick={controller.openCreate}
            disabled={saving}
          >
            Agregar
          </Button>
          <Button
            variant="text"
            color="error"
            startIcon={<Undo />}
            onClick={controller.reset}
            disabled={!dirty || saving}
          >
            Descartar
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? undefined : <Save />}
            onClick={controller.handleSaveDraft}
            disabled={!dirty || saving}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </>
      }
    >
      <Paper variant="outlined" className={styles.paper}>
        <DataGrid
          className={styles.dataGrid}
          rows={controller.rows}
          columns={columns}
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooter
          sortModel={[{ field: "order", sort: "asc" }]}
        />
      </Paper>

      <FieldDrawer
        open={controller.drawerOpen}
        mode={controller.drawerMode}
        fields={controller.rows}
        initial={controller.editingField}
        onClose={controller.closeDrawer}
        onSubmit={controller.onSubmitDrawer}
      />

      <ConfirmDialog
        open={controller.confirmOpen}
        title="Eliminar campo"
        description={
          controller.deleteTarget
            ? `¿Eliminar "${controller.deleteTarget.label}"? Esta acción será permanente al guardar.`
            : undefined
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onClose={controller.closeDeleteDialog}
        onConfirm={controller.doDelete}
      />
    </EventManagementPageShell>
  );
};
