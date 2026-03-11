import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";

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

import { useNotification } from "@/components/ui/NotificationContext";
import {
	useRegistrations,
	useUpdateRegistrationStatus,
} from "@/features/events/hooks/useRegistrations";
import type {
	EventOutletCtx,
	RegistrationItem,
	RegistrationStatus,
} from "@/features/events/types";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { useDebounce } from "@/hooks/useDebounce";

import {
	downloadRegistrationsCsv,
	downloadRegistrationsPdf,
} from "../api/registrations.service";
import { EventPermissionGate } from "../components/EventPermissionGate";

const STATUS_LABEL: Record<RegistrationStatus, string> = {
	REGISTERED: "Registrado",
	CONFIRMED: "Confirmado",
	CANCELLED: "Cancelado",
	ATTENDED: "Asistió",
};

const STATUS_COLOR: Record<
	RegistrationStatus,
	"default" | "success" | "warning" | "error" | "info"
> = {
	REGISTERED: "info",
	CONFIRMED: "success",
	CANCELLED: "error",
	ATTENDED: "success",
};

const STATUS_OPTIONS: RegistrationStatus[] = [
	"REGISTERED",
	"CONFIRMED",
	"CANCELLED",
	"ATTENDED",
];

export function EventRegistrationsPage() {
	const { eventId } = useParams();
	const id = Number(eventId);

	const { showNotification } = useNotification();

	const [q, setQ] = useState("");
	const debouncedQ = useDebounce(q, 500);

	const [status, setStatus] = useState<RegistrationStatus | "">("");
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(20);

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [activeRow, setActiveRow] = useState<RegistrationItem | null>(null);
	const menuOpen = Boolean(anchorEl);

	const [isDownloading, setIsDownloading] = useState(false);

	const { access, event } = useOutletContext<
		EventOutletCtx & { event: any }
	>();

	const canRead = access?.canRead ?? false;
	const canWrite = access?.canWrite ?? false;
	const canExport = access?.canExport ?? false;

	if (!canRead) {
		return (
			<EventPermissionGate
				allow={false}
				title="Acceso restringido"
				message="No tienes permisos para ver los registros de este evento."
			/>
		);
	}

	if (!eventId || !Number.isFinite(id)) {
		return <Typography color="error">ID de evento inválido</Typography>;
	}

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

	const rows = data?.items ?? [];
	const rowCount = data?.meta.total ?? 0;

	const openMenu = (
		e: React.MouseEvent<HTMLElement>,
		row: RegistrationItem,
	) => {
		if (!canWrite) return;
		setAnchorEl(e.currentTarget);
		setActiveRow(row);
	};

	const closeMenu = () => {
		setAnchorEl(null);
		setActiveRow(null);
	};

	const onChangeStatus = (newStatus: RegistrationStatus) => {
		if (!activeRow || !canWrite) return;
		updateStatusMutation.mutate(
			{ registrationId: activeRow.id, status: newStatus },
			{
				onSuccess: () => {
					closeMenu();
					showNotification(
						`Estado cambiado a ${STATUS_LABEL[newStatus]}`,
						"success",
					);
				},
				onError: () => {
					closeMenu();
					showNotification(
						"Error al cambiar el estado del registro",
						"error",
					);
				},
			},
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
			showNotification(
				`Archivo ${type.toUpperCase()} descargado con éxito`,
				"success",
			);
		} catch (err) {
			console.error("Error al descargar el archivo:", err);
			showNotification(
				`Hubo un error al generar el ${type.toUpperCase()}`,
				"error",
			);
		} finally {
			setIsDownloading(false);
		}
	};

	const columns: GridColDef<RegistrationItem>[] = useMemo(() => {
		const baseColumns: GridColDef<RegistrationItem>[] = [
			{
				field: "actions",
				headerName: "",
				width: 60,
				sortable: false,
				filterable: false,
				disableColumnMenu: true,
				align: "center",
				renderCell: (params) => (
					<IconButton
						size="small"
						disabled={!canWrite}
						onClick={(e) => openMenu(e, params.row)}
						aria-label="acciones"
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
				sortable: false,
				renderCell: (params) => (
					<Chip
						size="small"
						label={STATUS_LABEL[params.value as RegistrationStatus]}
						color={STATUS_COLOR[params.value as RegistrationStatus]}
						variant="outlined"
						sx={{ fontWeight: 600 }}
					/>
				),
			},
		];

		if (event?.contactRequirement === "PHONE") {
			baseColumns.push({
				field: "phone",
				headerName: "Teléfono",
				width: 140,
				sortable: false,
				valueGetter: (params) => params.row?.contact?.phone || "-",
			});
		} else {
			baseColumns.push({
				field: "email",
				headerName: "Email",
				minWidth: 200,
				sortable: false,
				valueGetter: (params) => params.row?.contact?.email || "-",
			});
		}

		const dynamicColumns: GridColDef<RegistrationItem>[] = [];
		const firstRow = rows[0];

		if (firstRow?.answers) {
			const sortedKeys = Object.keys(firstRow.answers).sort(
				(a, b) =>
					((firstRow.answers[a] as any).order || 0) -
					((firstRow.answers[b] as any).order || 0),
			);

			sortedKeys.forEach((key) => {
				const fieldInfo = firstRow.answers[key];
				dynamicColumns.push({
					field: `answer_${key}`,
					headerName: fieldInfo.label,
					width: 180,
					sortable: false,
					valueGetter: (params) => {
						const val = params.row?.answers?.[key]?.value;
						if (val === null || val === undefined || val === "")
							return "-";
						if (typeof val === "boolean") return val ? "Sí" : "No";
						if (Array.isArray(val)) return val.join(", ");
						return val;
					},
				});
			});
		}

		const endColumns: GridColDef<RegistrationItem>[] = [
			{
				field: "createdAt",
				headerName: "Fecha de Registro",
				width: 160,
				sortable: false,
				renderCell: (params) =>
					dayjs(params.row.createdAt).format("DD MMM YYYY, HH:mm"),
			},
		];

		return [...baseColumns, ...dynamicColumns, ...endColumns];
	}, [rows, canWrite, event?.contactRequirement]);

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

				{canExport && (
					<Stack direction="row" gap={1} justifyContent="flex-end">
						<Button
							variant="outlined"
							color="secondary"
							startIcon={
								isDownloading ? (
									<CircularProgress
										size={20}
										color="inherit"
									/>
								) : (
									<DownloadIcon />
								)
							}
							onClick={() => handleDownload("csv")}
							disabled={
								isLoading || rowCount === 0 || isDownloading
							}
						>
							CSV
						</Button>

						<Button
							variant="outlined"
							color="error"
							startIcon={
								isDownloading ? (
									<CircularProgress
										size={20}
										color="inherit"
									/>
								) : (
									<DownloadIcon />
								)
							}
							onClick={() => handleDownload("pdf")}
							disabled={
								isLoading || rowCount === 0 || isDownloading
							}
						>
							PDF
						</Button>
					</Stack>
				)}
			</Stack>

			<Box sx={{ height: 600, width: "100%" }}>
				{isError ? (
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
						loading={isLoading || isFetching}
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
							!canWrite ||
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
