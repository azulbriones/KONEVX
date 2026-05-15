import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";
import { designTokens } from "@/config/designTokens";

import styles from "./MetricCard.module.css";

type MetricTone = "primary" | "success" | "warning" | "neutral";

type MetricCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  tone?: MetricTone;
};

const toneMap: Record<MetricTone, { bg: string; fg: string }> = {
  primary: {
    bg: designTokens.colors.primarySoft,
    fg: designTokens.colors.primary,
  },
  success: { bg: "#DCFCE7", fg: designTokens.colors.success },
  warning: { bg: "#FEF3C7", fg: designTokens.colors.warning },
  neutral: {
    bg: designTokens.colors.bgMain,
    fg: designTokens.colors.textMuted,
  },
};

export const MetricCard = ({
  title,
  value,
  description,
  icon,
  tone = "neutral",
}: MetricCardProps) => {
  const palette = toneMap[tone];

  return (
    <Card
      variant="outlined"
      className={styles.card}
      style={
        {
          "--metric-border": designTokens.colors.borderSoft,
          "--metric-accent": palette.fg,
          "--metric-bg": palette.bg,
        } as CSSProperties
      }
    >
      <Box className={styles.topBar} />
      <CardContent>
        <Stack direction="row" spacing={2.25} alignItems="flex-start">
          <Box className={styles.iconWrap}>{icon}</Box>
          <Box className={styles.content}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={800}
              className={styles.title}
            >
              {title.toUpperCase()}
            </Typography>
            <Typography variant="h4" fontWeight={950} lineHeight={1.02}>
              {value}
            </Typography>
            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                className={styles.description}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
