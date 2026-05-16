import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";

import styles from "./StatCard.module.css";

type Props = {
  title: string;
  value: string | number;
  icon: ReactNode;
  bgColor: string;
};

const StatCard = ({ title, value, icon, bgColor }: Props) => {
  return (
    <Card
      variant="outlined"
      className={styles.card}
      style={{ "--stat-bg": bgColor } as CSSProperties}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Box className={styles.iconBox}>{icon}</Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              className={styles.label}
            >
              {title.toUpperCase()}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
