import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import styles from "./InfoRow.module.css";

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box className={styles.icon}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
};

export default InfoRow;
