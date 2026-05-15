import { Chip } from "@mui/material";

import styles from "./StatusPill.module.css";

export type StatusTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

export const StatusPill = ({ label, tone = "neutral" }: StatusPillProps) => {
  const toneClass = {
    primary: styles.primary,
    success: styles.success,
    warning: styles.warning,
    danger: styles.danger,
    neutral: styles.neutral,
  }[tone];

  return (
    <Chip
      label={label}
      size="small"
      className={`${styles.pill} ${toneClass}`}
    />
  );
};
