import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

import styles from "./EventManagementPageShell.module.css";

type EventManagementPageShellProps = {
  title: string;
  description: string;
  chips?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export const EventManagementPageShell = ({
  title,
  description,
  chips,
  actions,
  children,
}: EventManagementPageShellProps) => {
  return (
    <Stack spacing={3} className={styles.wrapper}>
      <Paper variant="outlined" className={styles.paper}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Stack spacing={1}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              flexWrap="wrap"
            >
              <Typography variant="h6" className={styles.title}>
                {title}
              </Typography>
              {chips}
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              className={styles.description}
            >
              {description}
            </Typography>
          </Stack>

          {actions ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {actions}
            </Stack>
          ) : null}
        </Stack>
      </Paper>

      {children}
    </Stack>
  );
};
