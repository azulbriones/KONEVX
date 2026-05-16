import { Button, Paper, Stack, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";
import { Link as RouterLink } from "react-router-dom";
import styles from "./EventPermissionGate.module.css";

type EventPermissionGateProps = PropsWithChildren<{
  allow: boolean;
  title?: string;
  message?: string;
  backTo?: string;
  backLabel?: string;
}>;

export const EventPermissionGate = ({
  allow,
  title = "Sin permisos",
  message = "No tienes permisos para ver esta sección.",
  backTo = "overview",
  backLabel = "Volver al resumen",
  children,
}: EventPermissionGateProps) => {
  if (allow) return <>{children ?? null}</>;

  return (
    <Paper
      variant="outlined"
      className={styles.paper}
      role="alert"
      aria-live="polite"
    >
      <Stack spacing={1.5}>
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>

        <Typography color="text.secondary">{message}</Typography>

        <Button
          component={RouterLink}
          to={backTo}
          variant="contained"
          className={styles.backButton}
        >
          {backLabel}
        </Button>
      </Stack>
    </Paper>
  );
};
