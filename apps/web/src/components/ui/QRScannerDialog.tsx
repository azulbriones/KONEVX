import { Box, Button, Dialog, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

import styles from "./QRScannerDialog.module.css";

type QRScannerDialogProps = {
  open: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
};

export const QRScannerDialog = ({ open, onClose, onScan }: QRScannerDialogProps) => {
  useEffect(() => {
    if (!open) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false,
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        console.log(error);
      },
    );

    return () => {
      scanner
        .clear()
        .catch((error) =>
          console.error("Error al limpiar el escáner", error),
        );
    };
  }, [open, onScan]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ className: styles.paper }}
    >
      <Box className={styles.content}>
        <Typography variant="h6" fontWeight={900} className={styles.title}>
          Escanear Pase de Entrada
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className={styles.subtitle}
        >
          Apunta la cámara al código QR del participante.
        </Typography>

        <Box id="reader" className={styles.reader} />
        <Button onClick={onClose} variant="text" className={styles.closeButton}>
          Cerrar
        </Button>
      </Box>
    </Dialog>
  );
};
