import {
  Bed,
  Cancel,
  CheckCircle,
  MeetingRoom,
  Person,
} from "@mui/icons-material";
import { Box, Card, Grid, Stack, Typography } from "@mui/material";

import { StatCard } from "./StatCard";
import styles from "./CheckInSummarySection.module.css";

type Props = {
  counts: {
    ATTENDED: number;
    CONFIRMED: number;
    REGISTERED: number;
    CANCELLED: number;
  };
  groupEntries: Array<[string, number]>;
};

export const CheckInSummarySection = ({ counts, groupEntries }: Props) => {
  return (
    <Box className={styles.wrapper}>
      <Grid container spacing={1.5} className={styles.statsGrid}>
        <Grid item xs={6}>
          <StatCard
            label="Asistió"
            value={counts.ATTENDED}
            color="#16a34a"
            icon={<CheckCircle fontSize="small" />}
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            label="Confirmado"
            value={counts.CONFIRMED}
            color="#2563eb"
            icon={<MeetingRoom fontSize="small" />}
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            label="Registrado"
            value={counts.REGISTERED}
            color="#64748b"
            icon={<Person fontSize="small" />}
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            label="Cancelado"
            value={counts.CANCELLED}
            color="#ef4444"
            icon={<Cancel fontSize="small" />}
          />
        </Grid>
      </Grid>

      {groupEntries.length > 0 && (
        <Box className={styles.groupsSection}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            className={styles.groupsHeader}
          >
            <Bed fontSize="small" className={styles.groupsIcon} />
            <Typography variant="caption" className={styles.groupsTitle}>
              Ocupación de Dormitorios
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} className={styles.groupsList}>
            {groupEntries.map(([groupName, count]) => (
              <Card key={groupName} elevation={0} className={styles.groupCard}>
                <Typography
                  variant="h5"
                  fontWeight={950}
                  color="primary.main"
                  lineHeight={1}
                >
                  {groupName}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="text.secondary"
                >
                  {count} asig.
                </Typography>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};
