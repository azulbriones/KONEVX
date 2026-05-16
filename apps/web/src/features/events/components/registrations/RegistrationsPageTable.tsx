import { Box, Typography } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";

import { getErrorMessage } from "@/features/utils/getErrorMessage";
import type { RegistrationItem } from "@/features/events/types";

import styles from "./RegistrationsPageTable.module.css";

type Props = {
  rows: RegistrationItem[];
  columns: GridColDef<RegistrationItem>[];
  page: number;
  pageSize: number;
  rowCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  onPageChange: (next: GridPaginationModel) => void;
};

export const RegistrationsPageTable = ({
  rows,
  columns,
  page,
  pageSize,
  rowCount,
  isLoading,
  isFetching,
  isError,
  error,
  onPageChange,
}: Props) => {
  return (
    <Box className={styles.container}>
      {isError ? (
        <Typography color="error" className={styles.errorText}>
          {getErrorMessage(error)}
        </Typography>
      ) : (
        <DataGrid
          className={styles.grid}
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={onPageChange}
          loading={isLoading || isFetching}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20, 50, 100]}
          initialState={{
            sorting: { sortModel: [{ field: "createdAt", sort: "asc" }] },
          }}
        />
      )}
    </Box>
  );
};
