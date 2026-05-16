import { Divider, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

import styles from "./EventFormSection.module.css";

type EventFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const EventFormSection = ({
  title,
  description,
  children,
}: EventFormSectionProps) => {
  return (
    <Paper variant="outlined" className={styles.paper}>
      <Typography variant="subtitle1" fontWeight={800} color="primary">
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="body2"
          color="text.secondary"
          className={styles.description}
        >
          {description}
        </Typography>
      ) : null}
      <Divider className={styles.divider} />
      {children}
    </Paper>
  );
};
