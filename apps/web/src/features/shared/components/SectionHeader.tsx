import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export const SectionHeader = ({
  title,
  subtitle,
  action,
}: SectionHeaderProps) => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      gap={2}
    >
      <Box>
        <Typography variant="h4" fontWeight={900} color="text.primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body1"
            color="text.secondary"
            className={styles.subtitle}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
};
