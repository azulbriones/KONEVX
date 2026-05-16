import dayjs from "dayjs";
import { useMemo } from "react";
import type { MouseEvent } from "react";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import {
  getRegistrationAnswerEntries,
  getRegistrationPrimaryAnswer,
} from "../utils/registrationAnswers";
import {
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_OPTIONS,
} from "../utils/registrationStatus";
import type {
  EventOutletCtx,
  RegistrationItem,
  RegistrationStatus,
} from "../types";

import styles from "./useRegistrationsPageController.module.css";

type RegistrationEvent = EventOutletCtx["event"];

type UseRegistrationsPageGridModelParams = {
  canWrite: boolean;
  event: RegistrationEvent;
  rows: RegistrationItem[];
  openMenu: (event: MouseEvent<HTMLElement>, row: RegistrationItem) => void;
};

const openWhatsAppChat = (phone: string, message: string) => {
  window.open(
    `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`,
    "_blank",
  );
};

const buildWhatsAppMessage = (text: string) => encodeURIComponent(text);

const getAnswerDisplayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

export const useRegistrationsPageGridModel = ({
  canWrite,
  event,
  rows,
  openMenu,
}: UseRegistrationsPageGridModelParams) => {
  const columns = useMemo<GridColDef<RegistrationItem>[]>(() => {
    const baseColumns: GridColDef<RegistrationItem>[] = [
      {
        field: "actions",
        headerName: "",
        width: 60,
        sortable: false,
        align: "center",
        renderCell: (params) => (
          <IconButton
            size="small"
            disabled={!canWrite}
            onClick={(clickEvent) => openMenu(clickEvent, params.row)}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      },
      { field: "id", headerName: "ID", width: 70, sortable: false },
      {
        field: "status",
        headerName: "Estado",
        width: 130,
        renderCell: (params) => (
          <Chip
            size="small"
            label={STATUS_LABEL[params.value as RegistrationStatus]}
            color={STATUS_COLOR[params.value as RegistrationStatus]}
            variant="outlined"
            className={styles.statusChip}
          />
        ),
      },
      {
        field: "assignedGroup",
        headerName: "Grupo",
        width: 120,
        renderCell: (params) => (
          <Typography
            variant="body2"
            className={
              params.value
                ? styles.assignedGroupActive
                : styles.assignedGroupEmpty
            }
          >
            {params.value || "Sin asignar"}
          </Typography>
        ),
      },
    ];

    if (event?.contactRequirement === "PHONE") {
      baseColumns.push({
        field: "phone",
        headerName: "Teléfono",
        width: 180,
        renderCell: (params) => {
          const phone = params.row?.contact?.phone;
          if (!phone) return "-";
          const name = getRegistrationPrimaryAnswer(params.row);
          const msg = buildWhatsAppMessage(
            `¡Hola ${name || ""}! Te escribimos del equipo de logística de *${event?.name || "Konevx"}*. Queríamos saludarte y confirmar tu asistencia (ID: #${params.row.id}).`,
          );
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">{phone}</Typography>
              <IconButton
                size="small"
                className={styles.whatsappButton}
                onClick={() => openWhatsAppChat(phone, msg)}
              >
                <WhatsAppIcon fontSize="inherit" />
              </IconButton>
            </Stack>
          );
        },
      });
    } else {
      baseColumns.push({
        field: "email",
        headerName: "Email",
        minWidth: 200,
        renderCell: (params) => {
          const email = params.row?.contact?.email;
          if (!email) return "-";
          return (
            <Tooltip title={email} placement="top" arrow>
              <Typography variant="body2" className={styles.truncatedText}>
                {email}
              </Typography>
            </Tooltip>
          );
        },
      });
    }

    const dynamicColumns: GridColDef<RegistrationItem>[] = [];
    const firstRow = rows[0];

    if (firstRow?.answers) {
      const sortedKeys = getRegistrationAnswerEntries(firstRow).map(([key]) => key);

      sortedKeys.forEach((key) => {
        const fieldInfo = firstRow.answers[key];
        const isPhoneField = key.toLowerCase().includes("telefono");

        dynamicColumns.push({
          field: `answer_${key}`,
          headerName: fieldInfo.label,
          width: isPhoneField ? 200 : 180,
          sortable: false,
          renderCell: (params) => {
            const val = params.row?.answers?.[key]?.value;
            const displayValue = getAnswerDisplayValue(val);
            if (displayValue === "-") return "-";

            if (isPhoneField) {
              const name = getRegistrationPrimaryAnswer(params.row);
              const msg = buildWhatsAppMessage(
                `¡Hola ${name}! 👋 Te escribimos de *${event?.name || "Konevx"}* con relación al dato: *${fieldInfo.label}* (${displayValue}).`,
              );
              return (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Tooltip title={displayValue} arrow placement="top">
                    <Typography
                      variant="body2"
                      className={`${styles.truncatedText} ${styles.truncatedTextNarrow}`}
                    >
                      {displayValue}
                    </Typography>
                  </Tooltip>
                  <IconButton
                    size="small"
                    className={styles.whatsappButton}
                    onClick={() => openWhatsAppChat(String(val), msg)}
                  >
                    <WhatsAppIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              );
            }

            return (
              <Tooltip title={displayValue} placement="top" arrow>
                <Typography variant="body2" className={styles.truncatedText}>
                  {displayValue}
                </Typography>
              </Tooltip>
            );
          },
        });
      });
    }

    return [
      ...baseColumns,
      ...dynamicColumns,
      {
        field: "createdAt",
        headerName: "Fecha Registro",
        width: 160,
        renderCell: (params) => dayjs(params.row.createdAt).format("DD MMM YYYY, HH:mm"),
      },
    ];
  }, [canWrite, event, openMenu, rows]);

  const dynamicFieldsList = useMemo(() => {
    const firstRow = rows[0];
    if (!firstRow?.answers) return [];

    return getRegistrationAnswerEntries(firstRow).map(([key, val]) => ({
      key,
      label: val.label,
    }));
  }, [rows]);

  return {
    columns,
    dynamicFieldsList,
  };
};
