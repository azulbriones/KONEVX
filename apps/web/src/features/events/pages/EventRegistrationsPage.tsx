import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import {
	useRegistrations,
	useUpdateRegistrationStatus,
} from "@/features/events/hooks/useRegistrations";
import type {
	RegistrationItem,
	RegistrationStatus,
} from "@/features/events/types";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { useDebounce } from "@/hooks/useDebounce";
import {
	downloadRegistrationsCsv,
	downloadRegistrationsPdf,
} from "../api/registrations.service";

const STATUS_LABEL: Record<RegistrationStatus, string> = {
	REGISTERED: "Registrado",
	CONFIRMED: "Confirmado",
	CANCELLED: "Cancelado",
	ATTENDED: "Asistió",
	NO_SHOW: "No show",
};

const STATUS_COLOR: Record<
	RegistrationStatus,
	"default" | "success" | "warning" | "error" | "info"
> = {
	REGISTERED: "info",
	CONFIRMED: "success",
	CANCELLED: "error",
	ATTENDED: "success",
	NO_SHOW: "warning",
};

const STATUS_OPTIONS: RegistrationStatus[] = [
	"REGISTERED",
	"CONFIRMED",
	"CANCELLED",
	"ATTENDED",
	"NO_SHOW",
];

export function EventRegistrationsPage() {
	const { eventId } = useParams();
	const id = Number(eventId);

	const [q, setQ] = useState("");
	const debouncedQ = useDebounce(q, 500);

	const [status, setStatus] = useState<RegistrationStatus | "">("");
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(20);

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [activeRow, setActiveRow] = useState<RegistrationItem | null>(null);
	const menuOpen = Boolean(anchorEl);
	const [isDownloading, setIsDownloading] = useState(false);

	const params = useMemo(
		() => ({
			page: page + 1,
			limit: pageSize,
			q: debouncedQ.trim() || undefined,
			status: status || undefined,
		}),
		[page, pageSize, debouncedQ, status],
	);

	const { data, isLoading, isError, error, isFetching } = useRegistrations(
		id,
		params,
	);
	const updateStatusMutation = useUpdateRegistrationStatus(id);

	if (!eventId || !Number.isFinite(id)) {
		return <Typography color="error">ID de evento inválido</Typography>;
	}

	const rows = data?.items ?? [];
	const rowCount = data?.meta.total ?? 0;

	const openMenu = (
		e: React.MouseEvent<HTMLElement>,
		row: RegistrationItem,
	) => {
		setAnchorEl(e.currentTarget);
		setActiveRow(row);
	};

	const closeMenu = () => {
		setAnchorEl(null);
		setActiveRow(null);
	};

	const onChangeStatus = (newStatus: RegistrationStatus) => {
		if (!activeRow) return;
		updateStatusMutation.mutate(
			{ registrationId: activeRow.id, status: newStatus },
			{ onSuccess: closeMenu },
		);
	};

	const handleDownload = async (type: "csv" | "pdf") => {
		try {
			setIsDownloading(true);
			if (type === "csv") {
				await downloadRegistrationsCsv(id, params);
			} else {
				await downloadRegistrationsPdf(id, params);
			}
		} catch (error) {
			console.error("Error al descargar el archivo:", error);
		} finally {
			setIsDownloading(false);
		}
	};

	const columns: GridColDef<RegistrationItem>[] = [
		{
			field: "id",
			headerName: "ID",
			width: 80,
			sortable: false,
		},
		{
			field: "email",
			headerName: "Email",
			flex: 1,
			minWidth: 220,
			sortable: false,
			valueGetter: (params: {
				row: { participant: { emailNormalized: any } };
			}) => params.row?.participant?.emailNormalized || "-",
		},
		{
			field: "phone",
			headerName: "Teléfono",
			width: 160,
			sortable: false,
			valueGetter: (params: {
				row: { participant: { phoneNormalized: any } };
			}) => params.row?.participant?.phoneNormalized || "-",
		},
		{
			field: "status",
			headerName: "Estado",
			width: 140,
			sortable: false,
			renderCell: (params: { value: string }) => (
				<Chip
					size="small"
					label={STATUS_LABEL[params.value as RegistrationStatus]}
					color={STATUS_COLOR[params.value as RegistrationStatus]}
					variant="outlined"
					sx={{ fontWeight: 600 }}
				/>
			),
		},
		{
			field: "createdAt",
			headerName: "Fecha de Registro",
			width: 170,
			sortable: false,
			renderCell: (params: { row: { createdAt: any } }) =>
				dayjs(params.row.createdAt).format("DD MMM YYYY, HH:mm"),
		},
		{
			field: "actions",
			headerName: "",
			width: 60,
			sortable: false,
			filterable: false,
			disableColumnMenu: true,
			align: "center",
			renderCell: (params: { row: RegistrationItem }) => (
				<IconButton
					size="small"
					onClick={(e: any) => openMenu(e, params.row)}
					aria-label="acciones"
				>
					<MoreVertIcon fontSize="small" />
				</IconButton>
			),
		},
	];

	return (
		<Stack spacing={3} sx={{ pt: 2 }}>
			<Stack
				direction={{ xs: "column", md: "row" }}
				gap={2}
				alignItems={{ xs: "stretch", md: "center" }}
				justifyContent="space-between"
			>
				<Stack direction={{ xs: "column", sm: "row" }} gap={2} flex={1}>
					<TextField
						size="small"
						label="Buscar email o teléfono..."
						value={q}
						onChange={(e) => {
							setQ(e.target.value);
							setPage(0);
						}}
						fullWidth
						sx={{ maxWidth: 350 }}
					/>

					<TextField
						size="small"
						label="Filtrar por Estado"
						select
						value={status}
						onChange={(e) => {
							setStatus(e.target.value as any);
							setPage(0);
						}}
						sx={{ minWidth: 200 }}
					>
						<MenuItem value="">Todos los registros</MenuItem>
						{STATUS_OPTIONS.map((s) => (
							<MenuItem key={s} value={s}>
								{STATUS_LABEL[s]}
							</MenuItem>
						))}
					</TextField>
				</Stack>

				<Stack direction="row" gap={1} justifyContent="flex-end">
					<Button
						variant="outlined"
						color="secondary"
						startIcon={
							isDownloading ? (
								<CircularProgress size={20} color="inherit" />
							) : (
								<DownloadIcon />
							)
						}
						onClick={() => handleDownload("csv")}
						disabled={isLoading || rowCount === 0 || isDownloading}
					>
						CSV
					</Button>

					<Button
						variant="outlined"
						color="error"
						startIcon={
							isDownloading ? (
								<CircularProgress size={20} color="inherit" />
							) : (
								<DownloadIcon />
							)
						}
						onClick={() => handleDownload("pdf")}
						disabled={isLoading || rowCount === 0 || isDownloading}
					>
						PDF
					</Button>
				</Stack>
			</Stack>

			<Box sx={{ height: 600, width: "100%" }}>
				{isLoading ? (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							py: 8,
						}}
					>
						<CircularProgress />
					</Box>
				) : isError ? (
					<Typography color="error" textAlign="center" py={4}>
						{getErrorMessage(error)}
					</Typography>
				) : (
					<DataGrid
						rows={rows}
						columns={columns}
						getRowId={(r) => r.id}
						paginationMode="server"
						rowCount={rowCount}
						paginationModel={{ page, pageSize }}
						onPaginationModelChange={(m) => {
							setPage(m.page);
							setPageSize(m.pageSize);
						}}
						loading={isFetching}
						disableRowSelectionOnClick
						pageSizeOptions={[10, 20, 50, 100]}
						sx={{
							border: "1px solid",
							borderColor: "divider",
							bgcolor: "background.paper",
							borderRadius: 2,
							"& .MuiDataGrid-cell:focus": { outline: "none" },
							"& .MuiDataGrid-columnHeader:focus": {
								outline: "none",
							},
						}}
					/>
				)}
			</Box>

			<Menu
				anchorEl={anchorEl}
				open={menuOpen}
				onClose={closeMenu}
				PaperProps={{ sx: { borderRadius: 2, minWidth: 220, mt: 0.5 } }}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<Typography
					sx={{ px: 2, pt: 1.5, pb: 1 }}
					variant="caption"
					color="text.secondary"
					fontWeight={700}
				>
					ACTUALIZAR ESTADO
				</Typography>

				{STATUS_OPTIONS.map((s) => (
					<MenuItem
						key={s}
						disabled={
							updateStatusMutation.isPending ||
							activeRow?.status === s
						}
						onClick={() => onChangeStatus(s)}
						sx={{ py: 1 }}
					>
						<Chip
							size="small"
							label={STATUS_LABEL[s]}
							color={STATUS_COLOR[s]}
							variant={
								activeRow?.status === s ? "filled" : "outlined"
							}
							sx={{ mr: 1.5, minWidth: 90, cursor: "inherit" }}
						/>
						<Typography variant="body2" color="text.secondary">
							{activeRow?.status === s ? "(Actual)" : ""}
						</Typography>
					</MenuItem>
				))}
			</Menu>
		</Stack>
	);
}
