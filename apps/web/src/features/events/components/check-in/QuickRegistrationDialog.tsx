import PersonAdd from "@mui/icons-material/PersonAdd";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import styles from "./QuickRegistrationDialog.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    name: string;
    contact: string;
    assignedGroup?: string;
  }) => void;
  isSubmitting: boolean;
};

export const QuickRegistrationDialog = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
}: Props) => {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    assignedGroup: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleAction = () => {
    if (!form.name.trim() || !form.contact.trim()) {
      setError("Nombre y Teléfono/Email son obligatorios.");
      return;
    }
    setError(null);
    onConfirm(form);
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ className: styles.paper }}
    >
      <Box className={styles.content}>
        {error ? (
          <Alert severity="error" className={styles.error}>
            {error}
          </Alert>
        ) : null}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          className={styles.header}
        >
          <Avatar className={styles.avatar}>
            <PersonAdd fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={950} lineHeight={1.1}>
              Registro Express
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              Añade y admite en 1 clic
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={2.5}>
          <TextField
            label="Nombre Completo"
            variant="filled"
            fullWidth
            className={styles.field}
            value={form.name}
            onChange={(e) => {
              setError(null);
              setForm({ ...form, name: e.target.value });
            }}
          />
          <TextField
            label="Teléfono / Email"
            variant="filled"
            fullWidth
            className={styles.field}
            value={form.contact}
            onChange={(e) => {
              setError(null);
              setForm({ ...form, contact: e.target.value });
            }}
          />
          <TextField
            label="Asignar Dormitorio (Opcional)"
            variant="filled"
            fullWidth
            className={styles.field}
            value={form.assignedGroup}
            onChange={(e) =>
              setForm({ ...form, assignedGroup: e.target.value })
            }
            helperText="Si lo dejas vacío, entrará sin dormitorio asignado."
          />
          <Stack direction="row" spacing={1} className={styles.actions}>
            <Button
              variant="text"
              color="inherit"
              fullWidth
              onClick={onClose}
              disabled={isSubmitting}
              className={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAction}
              disabled={isSubmitting}
              className={styles.confirmButton}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "DAR ENTRADA"
              )}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
};
