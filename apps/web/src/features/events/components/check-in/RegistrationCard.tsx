import {
  Cancel,
  CheckCircle,
  EditNote,
  MeetingRoom,
  Person,
  Phone,
  Undo,
  WhatsApp,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { CSSProperties } from "react";
import { useState } from "react";
import type { Ctx, RegistrationItem } from "../../types";
import {
  getRegistrationAnswerEntries,
  getRegistrationPrimaryAnswer,
} from "../../utils/registrationAnswers";

import styles from "./RegistrationCard.module.css";

type Props = {
  reg: RegistrationItem;
  loadingId: number | null;
  access: Ctx["access"];
  onCheckIn: (regId: number, notes?: string) => void;
  onCancelCheckIn: (regId: number) => void;
  event: Ctx["event"];
};

const openWhatsAppChat = (phone: string, message: string) => {
  window.open(
    `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`,
    "_blank",
  );
};

export const RegistrationCard = ({
  reg,
  loadingId,
  access,
  onCheckIn,
  onCancelCheckIn,
  event,
}: Props) => {
  const isAttended = reg.status === "ATTENDED";
  const isCancelled = reg.status === "CANCELLED";
  const [localNote, setLocalNote] = useState(reg.checkInNotes || "");

  const sorted = getRegistrationAnswerEntries(reg).map(([, answer]) => answer);
  const primary = sorted[0];
  const secondary = sorted[1];
  const others = sorted.slice(2);

  const defaultMessage = encodeURIComponent(
    `¡Hola ${getRegistrationPrimaryAnswer(reg)}! Te escribimos del equipo de logística de *${event?.name || "Konevx"}*. Queríamos saludarte y confirmar un detalle de tu registro (ID: #${reg.id}).`,
  );
  const cardStyle = {
    "--reg-border": isCancelled
      ? "#ef4444"
      : isAttended
        ? "#16a34a"
        : localNote
          ? "#f59e0b"
          : "#d4d4d8",
    "--reg-bg": isCancelled
      ? "rgba(239, 68, 68, 0.05)"
      : isAttended
        ? "rgba(22, 163, 74, 0.05)"
        : "var(--color-surface)",
    "--reg-avatar": isCancelled
      ? "#ef4444"
      : isAttended
        ? "#16a34a"
        : "var(--color-primary)",
  } as CSSProperties;

  return (
    <Card elevation={0} className={styles.card} style={cardStyle}>
      <CardContent className={styles.content}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar className={styles.avatar}>
              {isCancelled ? (
                <Cancel />
              ) : isAttended ? (
                <CheckCircle />
              ) : (
                <Person />
              )}
            </Avatar>
            <Box className={styles.headerCopy}>
              <Typography variant="h6" className={styles.primaryText}>
                {primary?.value || "---"}
              </Typography>
              <Typography variant="body2" className={styles.secondaryText}>
                {secondary?.label}: {secondary?.value || ""}
              </Typography>
              <Chip
                size="small"
                label={`ID #${reg.id}`}
                className={styles.idChip}
              />
            </Box>
          </Stack>

          <Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="filled"
              label="Notas de Incidencia / Logística"
              placeholder="Ej: Pendiente de pago..."
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              disabled={
                loadingId === reg.id || !access.canCheckIn || isCancelled
              }
              className={styles.noteField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EditNote color={localNote ? "warning" : "disabled"} />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ className: styles.noteLabel }}
            />
          </Box>

          <Divider className={styles.divider} />

          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            className={styles.contactRow}
          >
            {reg.contact.phone && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Phone className={styles.phoneIcon} />
                <Typography variant="body2" fontWeight={700}>
                  {reg.contact.phone}
                </Typography>
                <Button
                  size="small"
                  className={styles.waButton}
                  onClick={() =>
                    openWhatsAppChat(reg.contact.phone, defaultMessage)
                  }
                >
                  <WhatsApp fontSize="small" />
                </Button>
              </Stack>
            )}
          </Stack>

          <Grid container spacing={1.5} className={styles.answersGrid}>
            {others.map((ans, i) => (
              <Grid item xs={6} key={i}>
                <Typography variant="caption" className={styles.answerLabel}>
                  {ans.label}
                </Typography>
                <Typography variant="body2" className={styles.answerValue}>
                  {ans.value || "---"}
                </Typography>
              </Grid>
            ))}
            {reg.assignedGroup && (
              <Grid item xs={12} mt={1}>
                <Chip
                  icon={<MeetingRoom />}
                  label={`DORMITORIO: ${reg.assignedGroup}`}
                  color={isCancelled ? "default" : "primary"}
                  className={styles.groupChip}
                />
              </Grid>
            )}
          </Grid>

          {isCancelled ? (
            <Box className={styles.cancelledBanner}>
              <Cancel fontSize="small" /> CANCELADO
            </Box>
          ) : !isAttended ? (
            <Button
              variant="contained"
              fullWidth
              onClick={() => onCheckIn(reg.id, localNote)}
              disabled={loadingId === reg.id || !access.canCheckIn}
              className={styles.checkInButton}
            >
              {loadingId === reg.id ? (
                <CircularProgress size={26} color="inherit" />
              ) : (
                "DAR ENTRADA"
              )}
            </Button>
          ) : (
            <Stack spacing={1}>
              <Box className={styles.attendedBanner}>✓ ADMITIDO</Box>
              {localNote !== reg.checkInNotes && (
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => onCheckIn(reg.id, localNote)}
                  className={styles.noteSaveButton}
                >
                  Guardar cambios en nota
                </Button>
              )}
              <Button
                variant="text"
                color="error"
                startIcon={<Undo />}
                onClick={() => onCancelCheckIn(reg.id)}
                disabled={loadingId === reg.id || !access.canCheckIn}
                className={styles.cancelButton}
              >
                Anular entrada
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
