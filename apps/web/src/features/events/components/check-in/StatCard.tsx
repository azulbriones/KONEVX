import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";

import styles from "./StatCard.module.css";

type Props = {
  label: string;
  value: number | string;
  color: string;
  icon: ReactNode;
};

export const StatCard = ({ label, value, color, icon }: Props) => {
  return (
    <Card
      variant="outlined"
      className={styles.card}
      style={{ "--stat-accent": color } as CSSProperties}
    >
      <CardContent className={styles.content}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box className={styles.icon}>{icon}</Box>
          <Typography
            variant="caption"
            fontWeight={900}
            color="text.secondary"
            className={styles.label}
          >
            {label}
          </Typography>
        </Stack>
        <Typography variant="h5" fontWeight={950} className={styles.value}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};
