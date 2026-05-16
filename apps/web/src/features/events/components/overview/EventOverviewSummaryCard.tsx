import {
  AccessTime,
  CalendarMonth,
  LocationOn,
  Person,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import InfoRow from "../../components/sections/InfoRow";
import type { EventDetail } from "../../types";

import styles from "./EventOverviewCards.module.css";

type Props = {
  event: EventDetail;
  formatEventDateTime: (date?: string | null, time?: string | null) => string;
};

export const EventOverviewSummaryCard = ({
  event,
  formatEventDateTime,
}: Props) => {
  return (
    <Card variant="outlined" className={styles.summaryCard}>
      <CardContent className={styles.cardContent}>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          Información General
        </Typography>
        <Divider className={styles.dividerLarge} />

        <Stack spacing={3}>
          <InfoRow
            icon={<Person color="action" />}
            label="Organizador"
            value={event.organizerName || "No especificado"}
          />
          <InfoRow
            icon={<LocationOn color="action" />}
            label="Ubicación"
            value={event.location || "No especificada"}
          />

          <Box>
            <Divider className={styles.dashedDivider} />
            <Stack spacing={2} className={styles.innerStack}>
              <InfoRow
                icon={<CalendarMonth color="action" />}
                label="Inicio del evento"
                value={formatEventDateTime(event.startDate, event.entryTime)}
              />
              {(event.endDate || event.exitTime) && (
                <InfoRow
                  icon={<AccessTime color="action" />}
                  label="Fin del evento"
                  value={formatEventDateTime(event.endDate, event.exitTime)}
                />
              )}
            </Stack>
            <Divider className={styles.dashedDividerBottom} />
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Descripción corta
            </Typography>
            <Typography variant="body2" className={styles.clampedText}>
              {event.description || "Sin descripción."}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
