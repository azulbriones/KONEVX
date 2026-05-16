import {
  BarChart,
  Description,
  OpenInNew,
  People,
} from "@mui/icons-material";
import { Button, Grid, Stack } from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useOutletContext } from "react-router-dom";
import StatCard from "../components/cards/StatCard";
import { EventOverviewFieldStatsCard } from "../components/overview/EventOverviewFieldStatsCard";
import { EventOverviewGroupsCard } from "../components/overview/EventOverviewGroupsCard";
import { EventOverviewSummaryCard } from "../components/overview/EventOverviewSummaryCard";
import { EventOverviewTechnicalCard } from "../components/overview/EventOverviewTechnicalCard";
import type { Ctx } from "../types";

import styles from "./EventOverviewPageView.module.css";

dayjs.locale("es");

const CONTACT_LABELS: Record<string, string> = {
  EMAIL: "Correo electrónico",
  PHONE: "Teléfono",
};

export const EventOverviewPage = () => {
  const { event, stats } = useOutletContext<Ctx>();

  const formatExactDate = (dateString?: Date | string | null) => {
    if (!dateString) return null;
    const cleanDate =
      typeof dateString === "string" ? dateString.split("T")[0] : dateString;
    return dayjs(cleanDate).format("DD MMM YYYY");
  };

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return null;
    return dayjs(`2000-01-01T${timeStr}`).format("hh:mm A");
  };

  const formatEventDateTime = (date?: string | null, time?: string | null) => {
    const d = formatExactDate(date);
    const t = formatTime(time);
    if (d && t) return `${d}, ${t}`;
    if (d) return d;
    if (t) return t;
    return "No definida";
  };

  const groupingFieldName = event.groupingSettings?.fieldLabel || "Campo de Agrupación";
  const hasFieldStats =
    !!stats.fieldOccupancy &&
    Object.keys(stats.fieldOccupancy).length > 0;
  const hasGroups =
    !!event.groupingSettings?.enabled &&
    !!stats.groupsOccupancy &&
    Object.keys(stats.groupsOccupancy).length > 0;

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="flex-end" alignItems="center">
        <Button
          variant="outlined"
          startIcon={<OpenInNew />}
          href={`/e/${event.slug}`}
          target="_blank"
          className={styles.publicButton}
        >
          Ver página pública
        </Button>
      </Stack>

      <Grid container className={styles.fullWidthGrid} spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Registros"
            value={stats.registrationsCount}
            icon={<People className={styles.peopleIcon} />}
            bgColor="#eff6ff"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Ocupación"
            value={`${stats.occupancy ?? 0}%`}
            icon={<BarChart className={styles.occupancyIcon} />}
            bgColor="#ecfdf5"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Campos Config."
            value={stats.fieldsCount}
            icon={<Description className={styles.fieldsIcon} />}
            bgColor="#f0fdfa"
          />
        </Grid>
      </Grid>

      <Grid container className={styles.fullWidthGrid} spacing={3}>
        {hasFieldStats && (
          <Grid item xs={12} md={hasGroups ? 6 : 12}>
            <EventOverviewFieldStatsCard
              title={`Resumen por ${groupingFieldName}`}
              items={Object.entries(stats.fieldOccupancy ?? {})}
            />
          </Grid>
        )}

        {hasGroups && (
          <Grid item xs={12} md={hasFieldStats ? 6 : 12}>
            <EventOverviewGroupsCard
              items={Object.entries(stats.groupsOccupancy ?? {})}
            />
          </Grid>
        )}
      </Grid>

      <Grid container className={styles.fullWidthGrid} spacing={3}>
        <Grid item xs={12} md={7}>
          <EventOverviewSummaryCard
            event={event}
            formatEventDateTime={formatEventDateTime}
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <EventOverviewTechnicalCard
            event={event}
            contactLabel={
              CONTACT_LABELS[event.contactRequirement] ||
              event.contactRequirement
            }
          />
        </Grid>
      </Grid>
    </Stack>
  );
};
