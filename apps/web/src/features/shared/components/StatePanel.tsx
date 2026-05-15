import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";
import { designTokens } from "@/config/designTokens";

import styles from "./StatePanel.module.css";

type StatePanelProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "error" | "empty";
};

export const StatePanel = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  variant = "default",
}: StatePanelProps) => {
  const palette =
    variant === "error"
      ? {
          bg: "#FEF2F2",
          border: "#FECACA",
          icon: "#DC2626",
          bar: "#DC2626",
          button: "error" as const,
        }
      : variant === "empty"
        ? {
            bg: designTokens.colors.bgPanel,
            border: designTokens.colors.borderSoft,
            icon: designTokens.colors.primary,
            bar: designTokens.colors.primary,
            button: "primary" as const,
          }
        : {
            bg: designTokens.colors.bgPanel,
            border: designTokens.colors.borderSoft,
            icon: designTokens.colors.primary,
            bar: designTokens.colors.primary,
            button: "primary" as const,
          };

  return (
    <Paper
      elevation={0}
      className={styles.panel}
      style={
        {
          "--state-bg": palette.bg,
          "--state-border": palette.border,
          "--state-bar": palette.bar,
          "--state-icon": palette.icon,
          "--state-icon-bg":
            variant === "error" ? "#FEE2E2" : designTokens.colors.primarySoft,
        } as CSSProperties
      }
    >
      <Box className={styles.bar} />
      <Box className={styles.spacer} />
      <Stack spacing={2} alignItems="center" justifyContent="center">
        {icon ? <Box className={styles.iconWrap}>{icon}</Box> : null}
        <Box>
          <Typography variant="h6" fontWeight={900} gutterBottom>
            {title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            className={styles.description}
          >
            {description}
          </Typography>
        </Box>
        {actionLabel && onAction && (
          <Button
            variant="contained"
            color={palette.button}
            onClick={onAction}
            className={styles.actionButton}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};
