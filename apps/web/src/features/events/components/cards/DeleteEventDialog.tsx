import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import styles from "./DeleteEventDialog.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
  isLoading: boolean;
};

export const DeleteEventDialog = ({
  open,
  onClose,
  onConfirm,
  eventName,
  isLoading,
}: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ className: styles.paper }}
    >
      <DialogTitle className={styles.title}>
        ¿Eliminar evento?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Estás a punto de eliminar <strong>{eventName}</strong>. Esta
          acción borrará permanentemente todos los registros
          asociados.
        </DialogContentText>
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={onClose} color="inherit" disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isLoading}
          startIcon={
            isLoading && (
              <CircularProgress size={16} color="inherit" />
            )
          }
        >
          {isLoading ? "Eliminando..." : "Sí, eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
