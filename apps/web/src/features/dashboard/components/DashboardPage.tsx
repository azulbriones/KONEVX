import { EventCard } from "@/features/events/components/cards/EventCard";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useEvents } from "@/features/events/hooks/useEvents";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardErrorState } from "./DashboardErrorState";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMetrics } from "./DashboardMetrics";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { Box, CircularProgress, Grid, Stack } from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./DashboardPage.module.css";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const { data, isLoading, isError, error, refetch } = useEvents();
  const events = useMemo(() => data ?? [], [data]);
  const metrics = useMemo(() => {
    const totalEvents = events.length;
    const publishedEvents = events.filter((event) => event.isPublished).length;
    const draftEvents = totalEvents - publishedEvents;
    const totalCapacity = events.reduce(
      (sum, event) => sum + event.capacity,
      0,
    );

    return { totalEvents, publishedEvents, draftEvents, totalCapacity };
  }, [events]);

  const goCreate = () => navigate("/events/new");

  if (isLoading) {
    return (
      <Box className={styles.loading}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <DashboardErrorState
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Stack spacing={4}>
      <DashboardHeader
        onCreate={goCreate}
        onLogout={() => logoutMutation.mutate()}
      />

      {events.length > 0 && (
        <DashboardMetrics
          totalEvents={metrics.totalEvents}
          publishedEvents={metrics.publishedEvents}
          draftEvents={metrics.draftEvents}
          totalCapacity={metrics.totalCapacity}
        />
      )}

      {events.length > 0 ? (
        <Grid container spacing={3} className={styles.grid}>
          {events.map((e) => (
            <Grid item xs={12} sm={6} md={4} key={e.id}>
              <EventCard event={e} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <DashboardEmptyState onCreate={goCreate} />
      )}
    </Stack>
  );
};
