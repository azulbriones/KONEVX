import { ArrowDownward, ArrowUpward, Delete, Edit } from "@mui/icons-material";
import { Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import type { EventField } from "../types";

import styles from "./EventFieldsPage.module.css";

const renderOrderCell = (params: GridRenderCellParams) =>
  (params.value as number) + 1;

const renderKeyCell = (params: GridRenderCellParams) => (
  <Typography variant="body2" className={styles.keyCell}>
    {params.value}
  </Typography>
);

const renderTypeCell = (params: GridRenderCellParams) => (
  <Chip
    label={params.value}
    size="small"
    variant="outlined"
    className={styles.typeChip}
  />
);

type EventFieldActionsCellProps = {
  row: EventField;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (field: EventField) => void;
  onMoveUp: (fieldId: number) => void;
  onMoveDown: (fieldId: number) => void;
  onDelete: (field: EventField) => void;
};

const EventFieldActionsCell = ({
  row,
  isFirst,
  isLast,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
}: EventFieldActionsCellProps) => (
  <Stack direction="row" alignItems="center" height="100%">
    <Tooltip title="Editar">
      <IconButton
        size="small"
        aria-label={`Editar campo ${row.label}`}
        onClick={() => onEdit(row)}
      >
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Subir">
      <span>
        <IconButton
          size="small"
          aria-label={`Subir campo ${row.label}`}
          disabled={isFirst}
          onClick={() => onMoveUp(row.id)}
        >
          <ArrowUpward fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Bajar">
      <span>
        <IconButton
          size="small"
          aria-label={`Bajar campo ${row.label}`}
          disabled={isLast}
          onClick={() => onMoveDown(row.id)}
        >
          <ArrowDownward fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Eliminar">
      <IconButton
        size="small"
        color="error"
        aria-label={`Eliminar campo ${row.label}`}
        onClick={() => onDelete(row)}
      >
        <Delete fontSize="small" />
      </IconButton>
    </Tooltip>
  </Stack>
);

type EventFieldsColumnsOptions = {
  rowCount: number;
  onEdit: (field: EventField) => void;
  onMoveUp: (fieldId: number) => void;
  onMoveDown: (fieldId: number) => void;
  onDelete: (field: EventField) => void;
};

export const buildEventFieldsColumns = ({
  rowCount,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
}: EventFieldsColumnsOptions): GridColDef[] => [
  {
    field: "order",
    headerName: "#",
    width: 60,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: renderOrderCell,
  },
  {
    field: "label",
    headerName: "Etiqueta (Label)",
    flex: 1,
    minWidth: 180,
    sortable: false,
  },
  {
    field: "key",
    headerName: "Key",
    width: 180,
    sortable: false,
    renderCell: renderKeyCell,
  },
  {
    field: "type",
    headerName: "Tipo",
    width: 140,
    sortable: false,
    renderCell: renderTypeCell,
  },
  {
    field: "required",
    headerName: "Req",
    width: 70,
    type: "boolean",
    sortable: false,
  },
  {
    field: "actions",
    headerName: "Acciones",
    width: 160,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      const row = params.row as EventField;

      return (
        <EventFieldActionsCell
          row={row}
          isFirst={row.order === 0}
          isLast={row.order === rowCount - 1}
          onEdit={onEdit}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
        />
      );
    },
  },
];
