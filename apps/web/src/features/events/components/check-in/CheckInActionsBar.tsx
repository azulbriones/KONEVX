import {
  PersonAdd,
  PictureAsPdf,
  QrCodeScanner,
  Search,
  TableChart,
} from "@mui/icons-material";
import { Button, InputAdornment, Stack, TextField } from "@mui/material";
import styles from "./CheckInActionsBar.module.css";

type Props = {
  searchTerm: string;
  isExporting: boolean;
  canCheckIn: boolean;
  attendedCount: number;
  onSearchTermChange: (value: string) => void;
  onDownloadClick: (type: "xlsx" | "pdf") => void;
  onOpenQrScanner: () => void;
  onOpenQuickRegistration: () => void;
};

export const CheckInActionsBar = ({
  searchTerm,
  isExporting,
  canCheckIn,
  attendedCount,
  onSearchTermChange,
  onDownloadClick,
  onOpenQrScanner,
  onOpenQuickRegistration,
}: Props) => {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="flex-end" spacing={1} px={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<TableChart />}
          onClick={() => onDownloadClick("xlsx")}
          disabled={isExporting || attendedCount === 0}
          className={styles.excelButton}
        >
          Asistencia XLSX
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<PictureAsPdf />}
          onClick={() => onDownloadClick("pdf")}
          disabled={isExporting || attendedCount === 0}
          className={styles.pdfButton}
        >
          Asistencia PDF
        </Button>
      </Stack>

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          placeholder="Busca por nombre, ID, comunidad..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className={styles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className={styles.searchIcon} />
              </InputAdornment>
            ),
          }}
        />
        {canCheckIn && (
          <>
            <Button
              variant="contained"
              onClick={onOpenQrScanner}
              aria-label="Escanear código QR"
              className={styles.scanButton}
            >
              <QrCodeScanner />
            </Button>
            <Button
              variant="contained"
              onClick={onOpenQuickRegistration}
              aria-label="Abrir registro express"
              className={styles.quickButton}
            >
              <PersonAdd />
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
};
