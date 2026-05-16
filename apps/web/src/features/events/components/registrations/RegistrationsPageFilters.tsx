import {
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import {
  STATUS_LABEL,
  STATUS_OPTIONS,
} from "@/features/events/utils/registrationStatus";
import type { RegistrationStatus } from "@/features/events/types";
import styles from "./RegistrationsPageFilters.module.css";

type Props = {
  q: string;
  status: RegistrationStatus | "";
  isLoading: boolean;
  rowCount: number;
  isDownloading: boolean;
  canExport: boolean;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: RegistrationStatus | "") => void;
  onDownloadClick: (type: "xlsx" | "pdf") => void;
};

export const RegistrationsPageFilters = ({
  q,
  status,
  isLoading,
  rowCount,
  isDownloading,
  canExport,
  onQueryChange,
  onStatusChange,
  onDownloadClick,
}: Props) => {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      gap={2}
      alignItems={{ xs: "stretch", md: "center" }}
      justifyContent="space-between"
    >
      <Stack direction={{ xs: "column", sm: "row" }} gap={2} flex={1}>
        <TextField
          size="small"
          label="Buscar..."
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
          fullWidth
        />
        <TextField
          size="small"
          label="Estado"
          select
          value={status}
          onChange={(e) =>
            onStatusChange(e.target.value as RegistrationStatus | "")
          }
          className={styles.statusField}
        >
          <MenuItem value="">Todos</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {canExport && (
        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={
              isDownloading ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
            onClick={() => onDownloadClick("xlsx")}
            disabled={isLoading || rowCount === 0 || isDownloading}
          >
            EXCEL
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={
              isDownloading ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
            onClick={() => onDownloadClick("pdf")}
            disabled={isLoading || rowCount === 0 || isDownloading}
          >
            PDF
          </Button>
        </Stack>
      )}
    </Stack>
  );
};
