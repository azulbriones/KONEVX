import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Box, Grid, Typography } from "@mui/material";
import { MetricCard } from "@/features/shared/components/MetricCard";

import styles from "./DashboardMetrics.module.css";

type DashboardMetricsProps = {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalCapacity: number;
};

export const DashboardMetrics = ({
  totalEvents,
  publishedEvents,
  draftEvents,
  totalCapacity,
}: DashboardMetricsProps) => (
  <Box className={styles.wrapper}>
    <Typography
      variant="overline"
      color="text.secondary"
      className={styles.title}
    >
      Resumen rápido
    </Typography>
    <Grid container spacing={3} className={styles.grid}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Eventos"
          value={totalEvents}
          description="Eventos registrados"
          icon={<EventNoteIcon />}
          tone="neutral"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Publicados"
          value={publishedEvents}
          description="Visibles al público"
          icon={<EventAvailableIcon />}
          tone="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Borradores"
          value={draftEvents}
          description="Listos para ajustar"
          icon={<PendingActionsIcon />}
          tone="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Cupos"
          value={totalCapacity}
          description="Capacidad total disponible"
          icon={<PeopleAltIcon />}
          tone="primary"
        />
      </Grid>
    </Grid>
  </Box>
);
