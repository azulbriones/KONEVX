import { Add } from "@mui/icons-material";
import { Button, Chip, Paper, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getErrorMessage } from "@/features/utils/getErrorMessage";

import { EventPermissionGate } from "../components/EventPermissionGate";
import { EventManagementPageShell } from "../components/EventManagementPageShell";
import { EventMembersPageOverlays } from "../components/members/EventMembersPageOverlays";
import { useEventMembersPageController } from "../hooks/useEventMembersPageController";

import styles from "./EventMembersPageView.module.css";

export const EventMembersPage = () => {
  const controller = useEventMembersPageController();

  if (!controller.canManageMembers) {
    return (
      <EventPermissionGate
        allow={false}
        title="Acceso restringido"
        message="No tienes permisos para gestionar miembros de este evento."
      />
    );
  }

  if (!controller.isValidEventId) {
    return <Typography color="error">ID de evento inválido</Typography>;
  }

  if (controller.isError) {
    return <Typography color="error">{getErrorMessage(controller.error)}</Typography>;
  }

  return (
    <EventManagementPageShell
      title="Equipo del Evento"
      description="Gestioná quién puede ver o editar este evento, sin perder de vista permisos críticos y tu propio acceso."
      chips={
        <>
          <Chip size="small" label={`${controller.rows.length} miembros`} variant="outlined" />
          <Chip size="small" color="primary" label={`${controller.editorsCount} editores`} variant="outlined" />
        </>
      }
      actions={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => controller.setAddDrawerOpen(true)}
          disabled={controller.busy}
        >
          Agregar miembro
        </Button>
      }
    >
      <Paper
        variant="outlined"
        className={styles.paper}
      >
        <DataGrid
          rows={controller.rows}
          columns={controller.columns}
          getRowId={(row) => row.userId}
          disableRowSelectionOnClick
          disableColumnMenu
          loading={controller.isLoading || controller.busy}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
          className={styles.grid}
        />
      </Paper>

      <EventMembersPageOverlays controller={controller} />
    </EventManagementPageShell>
  );
};
