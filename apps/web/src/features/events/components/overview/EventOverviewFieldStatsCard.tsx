import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import styles from "./EventOverviewCards.module.css";

type Props = {
  title: string;
  items: Array<[string, number]>;
};

export const EventOverviewFieldStatsCard = ({ title, items }: Props) => {
  return (
    <Card variant="outlined" className={styles.fieldCard}>
      <CardContent className={styles.cardContent}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          className={styles.cardHeader}
        >
          <Box className={styles.fieldAccent}>◉</Box>
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
        </Stack>
        <Divider className={styles.divider} />
        <Stack spacing={1}>
          {items.map(([label, count]) => (
            <Box key={label} className={styles.metricRow}>
              <Typography variant="body2" fontWeight={600}>
                {label}
              </Typography>
              <Typography variant="body2" fontWeight={700} color="warning.main">
                {count} registros
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
