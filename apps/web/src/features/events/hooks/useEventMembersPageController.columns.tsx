import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Avatar, Chip, IconButton, Stack, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import type { MouseEvent } from "react";

import type { EventMember } from "../types";

import styles from "./useEventMembersPageController.module.css";

type BuildEventMembersColumnsParams = {
  busy: boolean;
  openMenu: (event: MouseEvent<HTMLElement>, row: EventMember) => void;
};

const renderEmailCell = (row: EventMember) => (
  <Stack direction="row" alignItems="center" spacing={1.5} height="100%">
    <Avatar className={styles.memberAvatar}>
      {row.email.charAt(0).toUpperCase()}
    </Avatar>
    <Typography variant="body2" className={styles.memberEmail}>
      {row.email}
    </Typography>
  </Stack>
);

const renderRoleCell = (row: EventMember) => {
  let color: "default" | "primary" | "success" = "default";
  let variant: "outlined" | "filled" = "outlined";

  if (row.eventRole === "EDITOR") {
    color = "primary";
    variant = "filled";
  } else if (row.eventRole === "CHECKIN") {
    color = "success";
  }

  return (
    <Chip
      size="small"
      label={row.eventRole}
      color={color}
      variant={variant}
      className={styles.roleChip}
    />
  );
};

const renderGlobalRoleCell = (row: EventMember) => (
  <Typography variant="body2" color="text.secondary">
    {row.globalRole}
  </Typography>
);

const renderCreatedAtCell = (row: EventMember) => {
  const date = new Date(row.createdAt);

  return (
    <Typography variant="body2">
      {date.toLocaleDateString()}
      {" "}
      <Typography component="span" variant="caption" color="text.secondary">
        {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Typography>
    </Typography>
  );
};

const renderActionsCell = (
  row: EventMember,
  busy: boolean,
  openMenu: (event: MouseEvent<HTMLElement>, row: EventMember) => void,
) => (
  <IconButton
    size="small"
    onClick={(event) => openMenu(event, row)}
    disabled={busy}
  >
    <MoreVertIcon fontSize="small" />
  </IconButton>
);

export const buildEventMembersColumns = ({
  busy,
  openMenu,
}: BuildEventMembersColumnsParams): GridColDef<EventMember>[] => [
  {
    field: "email",
    headerName: "Usuario (Email)",
    flex: 1,
    minWidth: 250,
    renderCell: (params) => renderEmailCell(params.row),
  },
  {
    field: "eventRole",
    headerName: "Permiso",
    width: 140,
    renderCell: (params) => renderRoleCell(params.row),
  },
  {
    field: "globalRole",
    headerName: "Rol Sistema",
    width: 140,
    renderCell: (params) => renderGlobalRoleCell(params.row),
  },
  {
    field: "createdAt",
    headerName: "Agregado el",
    width: 180,
    valueGetter: (params) => params.row?.createdAt || "",
    renderCell: (params) => renderCreatedAtCell(params.row),
  },
  {
    field: "actions",
    headerName: "",
    width: 60,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    align: "center",
    renderCell: (params) => renderActionsCell(params.row, busy, openMenu),
  },
];
