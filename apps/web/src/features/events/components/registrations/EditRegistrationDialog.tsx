import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { getRegistrationAnswerEntries } from "../../utils/registrationAnswers";
import type { EventOutletCtx, RegistrationItem } from "../../types";
import {
  RegistrationFieldEditor,
  type RegistrationField,
} from "./EditRegistrationDialogField";
import styles from "./EditRegistrationDialog.module.css";

type Props = {
  open: boolean;
  row: RegistrationItem | null;
  event: EventOutletCtx["event"];
  fields: Array<RegistrationField> | undefined;
  onClose: () => void;
  onSave: (payload: { contact: { phone: string; email: string }; answers: Record<string, unknown> }) => void;
  isPending: boolean;
};

const buildFieldsToRender = (
  fields: Props["fields"],
  row: RegistrationItem | null,
) => {
  if (fields && fields.length > 0) {
    return [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  if (row?.answers) {
    return getRegistrationAnswerEntries(row)
      .map(([key, data]) => ({
        key,
        label: data.label,
        type: data.type,
        options: [],
        order: data.order || 0,
      }))
      .sort((a, b) => a.order - b.order);
  }

  return [];
};

export const EditRegistrationDialog = ({ open, row, event, fields, onClose, onSave, isPending }: Props) => {
  const [contact, setContact] = useState({ phone: "", email: "" });
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  const fieldsToRender = useMemo(() => {
    return buildFieldsToRender(fields, row);
  }, [fields, row]);

  useEffect(() => {
    if (row && open) {
      setContact({
        phone: row.contact?.phone || "",
        email: row.contact?.email || "",
      });
      const initialAnswers: Record<string, unknown> = {};
      getRegistrationAnswerEntries(row).forEach(([key, data]) => {
        initialAnswers[key] = data.value;
      });
      setAnswers(initialAnswers);
    }
  }, [row, open]);

  const updateAnswer = (key: string, value: unknown) => {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  };

  if (!row) return null;

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle className={styles.title}>Editar Datos del Registro</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} className={styles.contentStack}>
          <Typography variant="subtitle2" color="primary" className={styles.sectionTitle}>
            CONTACTO
          </Typography>
          {event?.contactRequirement === "EMAIL" && (
            <TextField
              label="Correo Electrónico"
              fullWidth
              value={contact.email}
              onChange={(e) =>
                setContact((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
            />
          )}
          {event?.contactRequirement === "PHONE" && (
            <TextField
              label="Teléfono"
              fullWidth
              value={contact.phone}
              onChange={(e) =>
                setContact((current) => ({
                  ...current,
                  phone: e.target.value,
                }))
              }
            />
          )}
          <Divider />
          <Typography variant="subtitle2" color="primary" className={styles.sectionTitle}>
            RESPUESTAS
          </Typography>
          {fieldsToRender.map((field) => {
            const key = field.key;
            return (
              <RegistrationFieldEditor
                key={key}
                field={field}
                value={answers[key]}
                onChange={updateAnswer}
              />
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave({ contact, answers })}
          disabled={isPending}
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
