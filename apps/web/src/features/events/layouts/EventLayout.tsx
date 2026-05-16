import { useEvent, useSetPublish } from "@/features/events/hooks/useEvents";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  EventSectionTabs,
  type EventSectionTab,
} from "../components/sections/EventSectionTabs";
import type { EventAccess } from "../types";

import styles from "./EventLayout.module.css";

const TABS = [
  { label: "Resumen", path: "overview", gate: (a: EventAccess) => a?.canView },
  {
    label: "Check-in",
    path: "check-in",
    gate: (a: EventAccess) => a?.canCheckIn,
  },
  {
    label: "Registros",
    path: "registrations",
    gate: (a: EventAccess) => a?.canView,
  },
  { label: "Campos", path: "fields", gate: (a: EventAccess) => a?.canWrite },
  { label: "Miembros", path: "members", gate: (a: EventAccess) => a?.canWrite },
  { label: "Ajustes", path: "edit", gate: (a: EventAccess) => a?.canWrite },
] as const;

export const EventLayout = () => {
  const { eventId } = useParams();
  const id = Number(eventId);
  const location = useLocation();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useEvent(id);
  const publishMutation = useSetPublish(id);

  const currentTab =
    TABS.find((t) => location.pathname.endsWith(t.path))?.path || "overview";

  if (isLoading) {
    return (
      <Box className={styles.loading}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" className={styles.errorContainer}>
        <Typography color="error" variant="h6">
          {getErrorMessage(error)}
        </Typography>
        <Button onClick={() => navigate("/")} className={styles.backButton}>
          Volver al Dashboard
        </Button>
      </Container>
    );
  }

  if (!data) return null;

  const { event, stats, access } = data;

  const visibleTabs: EventSectionTab[] = TABS.map((tab) => ({
    label: tab.label,
    path: tab.path,
    enabled: Boolean(tab.gate(access)),
  }));

  return (
    <Stack spacing={2.5}>
      <Paper elevation={0} className={styles.headerPaper}>
        <Stack spacing={0.75} className={styles.headerCopy}>
          <Typography
            variant="overline"
            color="text.secondary"
            className={styles.overline}
          >
            Evento activo
          </Typography>
          <Typography variant="h5" className={styles.eventTitle}>
            {event.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            className={styles.description}
          >
            {event.description}
          </Typography>
        </Stack>

        <EventSectionTabs
          tabs={visibleTabs}
          currentTab={currentTab}
          isPublished={event.isPublished}
          canWrite={access.canWrite}
          isPublishing={publishMutation.isPending}
          onNavigate={(path) => navigate(path)}
          onTogglePublish={() => publishMutation.mutate(!event.isPublished)}
        />
      </Paper>

      <Box className={styles.outletWrap}>
        <Outlet context={{ event, stats, access }} />
      </Box>
    </Stack>
  );
};
