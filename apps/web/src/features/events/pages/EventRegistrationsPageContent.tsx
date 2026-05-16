import { Stack, Typography } from "@mui/material";

import { EventPermissionGate } from "../components/EventPermissionGate";
import { RegistrationsPageFilters } from "../components/registrations/RegistrationsPageFilters";
import { RegistrationsPageOverlays } from "../components/registrations/RegistrationsPageOverlays";
import { RegistrationsPageTable } from "../components/registrations/RegistrationsPageTable";
import { useRegistrationsPageController } from "../hooks/useRegistrationsPageController";

import styles from "./EventRegistrationsPageContent.module.css";

export const EventRegistrationsPage = () => {
  const controller = useRegistrationsPageController();

  if (!controller.canView) {
    return (
      <EventPermissionGate
        allow={false}
        title="Acceso restringido"
        message="No tienes permisos para ver los registros de este evento."
      />
    );
  }

  if (!controller.isValidEventId) {
    return <Typography color="error">ID de evento inválido</Typography>;
  }

  return (
    <Stack spacing={3} className={styles.page}>
      <RegistrationsPageFilters
        q={controller.q}
        status={controller.status}
        isLoading={controller.isLoading}
        rowCount={controller.rowCount}
        isDownloading={controller.isDownloading}
        canExport={controller.canExport}
        onQueryChange={controller.onQueryChange}
        onStatusChange={controller.onStatusChange}
        onDownloadClick={controller.startDownload}
      />

      <RegistrationsPageTable
        rows={controller.rows}
        columns={controller.columns}
        page={controller.page}
        pageSize={controller.pageSize}
        rowCount={controller.rowCount}
        isLoading={controller.isLoading}
        isFetching={controller.isFetching}
        isError={controller.isError}
        error={controller.error}
        onPageChange={controller.onPageChange}
      />

      <RegistrationsPageOverlays controller={controller} />
    </Stack>
  );
};
