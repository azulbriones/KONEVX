import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";

import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
	Box,
	Button,
	Checkbox,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControlLabel,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
	ExportConfigDialog,
	ExportOptions,
} from "@/components/ui/ExportConfigDialog";
import { useNotification } from "@/components/ui/NotificationContext";

import { useEventFields } from "@/features/events/hooks/useEventFields";
import {
	useDeleteRegistration,
	useRegistrations,
	useUpdateRegistrationData,
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
	downloadRegistrationsExcel,
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

// ==========================================
// COMPONENTE SECUNDARIO: MODAL DE EDICIÓN
// ==========================================
function EditRegistrationDialog({
	open,
	row,
	event,
	fields,
	onClose,
	onSave,
	isPending,
}: {
	open: boolean;
	row: RegistrationItem | null;
	event: any;
	fields: any[] | undefined;
	onClose: () => void;
	onSave: (payload: any) => void;
	isPending: boolean;
}) {
	const [contact, setContact] = useState({ phone: "", email: "" });
	const [answers, setAnswers] = useState<Record<string, any>>({});

	const fieldsToRender = useMemo(() => {
		if (fields && fields.length > 0) {
			return [...fields].sort((a: any, b: any) => a.order - b.order);
		}
		if (row?.answers) {
			return Object.entries(row.answers)
				.map(([key, data]: any) => ({
					key,
					label: data.label,
					type: data.type,
					options: [],
					order: data.order || 0,
				}))
				.sort((a, b) => a.order - b.order);
		}
		return [];
	}, [fields, row]);

	useEffect(() => {
		if (row && open) {
			setContact({
				phone: row.contact?.phone || "",
				email: row.contact?.email || "",
			});
			const initialAnswers: Record<string, any> = {};
			if (row.answers) {
				Object.keys(row.answers).forEach((k) => {
					initialAnswers[k] = (row.answers as any)[k].value;
				});
			}
			setAnswers(initialAnswers);
		}
	}, [row, open]);

	if (!row) return null;

	const handleSave = () => {
		onSave({ contact, answers });
	};

	return (
		<Dialog
			open={open}
			onClose={isPending ? undefined : onClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle fontWeight={800}>
				Editar Datos del Registro
			</DialogTitle>
			<DialogContent dividers>
				<Stack spacing={3} py={1}>
					<Typography
						variant="subtitle2"
						color="primary"
						fontWeight={700}
					>
						CONTACTO
					</Typography>

					{event?.contactRequirement === "EMAIL" && (
						<TextField
							label="Correo Electrónico"
							fullWidth
							value={contact.email}
							onChange={(e) =>
								setContact({
									...contact,
									email: e.target.value,
								})
							}
						/>
					)}

					{event?.contactRequirement === "PHONE" && (
						<TextField
							label="Teléfono"
							fullWidth
							value={contact.phone}
							onChange={(e) =>
								setContact({
									...contact,
									phone: e.target.value,
								})
							}
						/>
					)}

					<Divider />

					<Typography
						variant="subtitle2"
						color="primary"
						fontWeight={700}
					>
						RESPUESTAS
					</Typography>

					{fieldsToRender.map((field) => {
						const key = field.key;
						const type = field.type;
						const value = answers[key];
						const options = Array.isArray(field.options)
							? field.options
							: [];

						if (type === "CHECKBOX") {
							return (
								<FormControlLabel
									key={key}
									control={
										<Checkbox
											checked={!!value}
											onChange={(e) =>
												setAnswers({
													...answers,
													[key]: e.target.checked,
												})
											}
										/>
									}
									label={field.label}
								/>
							);
						}

						if (type === "SELECT") {
							return (
								<TextField
									key={key}
									select
									label={field.label}
									fullWidth
									value={value || ""}
									onChange={(e) =>
										setAnswers({
											...answers,
											[key]: e.target.value,
										})
									}
								>
									<MenuItem value="">
										<em>Seleccione...</em>
									</MenuItem>
									{options.map((opt: string) => (
										<MenuItem key={opt} value={opt}>
											{opt}
										</MenuItem>
									))}
								</TextField>
							);
						}

						if (type === "MULTI_SELECT") {
							return (
								<TextField
									key={key}
									select
									SelectProps={{
										multiple: true,
										renderValue: (selected: any) =>
											(selected as string[]).join(", "),
									}}
									label={field.label}
									fullWidth
									value={Array.isArray(value) ? value : []}
									onChange={(e) =>
										setAnswers({
											...answers,
											[key]: e.target.value,
										})
									}
								>
									{options.map((opt: string) => (
										<MenuItem key={opt} value={opt}>
											<Checkbox
												checked={
													Array.isArray(value) &&
													value.includes(opt)
												}
											/>
											{opt}
										</MenuItem>
									))}
								</TextField>
							);
						}

						if (type === "DATE") {
							return (
								<TextField
									key={key}
									type="date"
									label={field.label}
									fullWidth
									InputLabelProps={{ shrink: true }}
									value={value || ""}
									onChange={(e) =>
										setAnswers({
											...answers,
											[key]: e.target.value,
										})
									}
								/>
							);
						}

						if (type === "NUMBER") {
							return (
								<TextField
									key={key}
									type="number"
									label={field.label}
									fullWidth
									value={value ?? ""}
									onChange={(e) =>
										setAnswers({
											...answers,
											[key]:
												e.target.value === ""
													? null
													: Number(e.target.value),
										})
									}
								/>
							);
						}

						return (
							<TextField
								key={key}
								label={field.label}
								fullWidth
								multiline={type === "TEXTAREA"}
								rows={type === "TEXTAREA" ? 3 : 1}
								value={value || ""}
								onChange={(e) =>
									setAnswers({
										...answers,
										[key]: e.target.value,
									})
								}
							/>
						);
					})}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} disabled={isPending}>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={handleSave}
					disabled={isPending}
				>
					{isPending ? "Guardando..." : "Guardar Cambios"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
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

	const [isEditingGroup, setIsEditingGroup] = useState(false);
	const [tempGroup, setTempGroup] = useState("");
	const [isDownloading, setIsDownloading] = useState(false);
	const [exportDialogOpen, setExportDialogOpen] = useState(false);
	const [exportType, setExportType] = useState<"xlsx" | "pdf">("xlsx");

	const [deleteDialog, setDeleteDialog] = useState<{
		open: boolean;
		row: RegistrationItem | null;
	}>({ open: false, row: null });

	const [editDialog, setEditDialog] = useState<{
		open: boolean;
		row: RegistrationItem | null;
	}>({ open: false, row: null });

	const { access, event } = useOutletContext<
		EventOutletCtx & { event: any }
	>();

	const canView = access?.canView ?? false;
	const canWrite = access?.canWrite ?? false;
	const canExport = access?.canView ?? false;

	if (!canView) {
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
			orderBy: "createdAt",
			orderDir: "asc",
		}),
		[page, pageSize, debouncedQ, status],
	);

	const { data: eventFields } = useEventFields(id);
	const { data, isLoading, isError, error, isFetching } = useRegistrations(
		id,
		params,
	);
	const updateStatusMutation = useUpdateRegistrationStatus(id);
	const deleteMutation = useDeleteRegistration(id);
	const updateDataMutation = useUpdateRegistrationData(id);

	const rows = data?.items ?? [];
	const rowCount = data?.meta.total ?? 0;

	const openMenu = (
		e: React.MouseEvent<HTMLElement>,
		row: RegistrationItem,
	) => {
		if (!canWrite) return;
		setAnchorEl(e.currentTarget);
		setActiveRow(row);
		setTempGroup(row.assignedGroup || "");
		setIsEditingGroup(false);
	};

	const closeMenu = () => {
		setAnchorEl(null);
		setActiveRow(null);
		setIsEditingGroup(false);
	};

	const handleDownloadClick = (type: "xlsx" | "pdf") => {
		setExportType(type);
		setExportDialogOpen(true);
	};

	const executeDownload = async (options: ExportOptions) => {
		try {
			setIsDownloading(true);
			const downloadParams = {
				...params,
				groupBy: options.groupBy || undefined,
				pageBreak: options.pageBreak,
				columns: options.columns.join(","),
			};
			if (exportType === "xlsx")
				await downloadRegistrationsExcel(id, downloadParams);
			else await downloadRegistrationsPdf(id, downloadParams);
			showNotification(
				`Archivo ${exportType.toUpperCase()} generado`,
				"success",
			);
		} catch (err) {
			showNotification("Error al generar el archivo", "error");
		} finally {
			setIsDownloading(false);
		}
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
					showNotification("Error al cambiar el estado", "error");
				},
			},
		);
	};

	const onSaveGroup = () => {
		if (!activeRow || !canWrite) return;
		updateStatusMutation.mutate(
			{
				registrationId: activeRow.id,
				status: activeRow.status,
				assignedGroup: tempGroup || null,
			},
			{
				onSuccess: () => {
					closeMenu();
					showNotification("Grupo actualizado", "success");
				},
				onError: () => {
					showNotification("Error al actualizar el grupo", "error");
				},
			},
		);
	};

	const onOpenDeleteConfirm = () => {
		if (!activeRow || !canWrite) return;
		setDeleteDialog({ open: true, row: activeRow });
		closeMenu();
	};

	const handleConfirmDelete = () => {
		if (!deleteDialog.row) return;

		deleteMutation.mutate(deleteDialog.row.id, {
			onSuccess: () => {
				setDeleteDialog({ open: false, row: null });
				showNotification(
					"Registro eliminado permanentemente",
					"success",
				);
			},
			onError: (err) => {
				setDeleteDialog({ open: false, row: null });
				showNotification(
					getErrorMessage(err) || "Error al eliminar el registro",
					"error",
				);
			},
		});
	};

	const handleSaveEditData = (payload: any) => {
		if (!editDialog.row) return;
		updateDataMutation.mutate(
			{ registrationId: editDialog.row.id, payload },
			{
				onSuccess: () => {
					setEditDialog({ open: false, row: null });
					showNotification(
						"Datos actualizados correctamente",
						"success",
					);
				},
				onError: (err) => {
					showNotification(
						getErrorMessage(err) || "Error al actualizar",
						"error",
					);
				},
			},
		);
	};

	// ==========================================
	// DEFINICIÓN DE COLUMNAS
	// ==========================================
	const columns: GridColDef<RegistrationItem>[] = useMemo(() => {
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
						onClick={(e) => openMenu(e, params.row)}
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
						sx={{ fontWeight: 600 }}
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
						fontWeight={params.value ? 700 : 400}
						color={params.value ? "primary" : "text.secondary"}
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
					const answers = Object.values(params.row.answers || {});
					const name = (answers[0] as any)?.value || "";
					const msg = encodeURIComponent(
						`¡Hola ${name || ""}! Te escribimos del equipo de logística de *${event?.name || "Konevx"}*. Queríamos saludarte y confirmar tu asistencia (ID: #${params.row.id}).`,
					);
					return (
						<Stack direction="row" alignItems="center" spacing={1}>
							<Typography variant="body2">{phone}</Typography>
							<IconButton
								size="small"
								sx={{ color: "#25d366" }}
								onClick={() =>
									window.open(
										`https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`,
										"_blank",
									)
								}
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
							<Typography
								variant="body2"
								sx={{
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									width: "100%",
								}}
							>
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
			const sortedKeys = Object.keys(firstRow.answers).sort(
				(a, b) =>
					((firstRow.answers[a] as any).order || 0) -
					((firstRow.answers[b] as any).order || 0),
			);

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
						if (val === null || val === undefined || val === "")
							return "-";

						let displayValue = String(val);
						if (typeof val === "boolean")
							displayValue = val ? "Sí" : "No";
						if (Array.isArray(val)) displayValue = val.join(", ");

						if (isPhoneField) {
							const answers = Object.values(
								params.row.answers || {},
							);
							const name = (answers[0] as any)?.value || "";
							const msg = encodeURIComponent(
								`¡Hola ${name}! 👋 Te escribimos de *${event?.name || "Konevx"}* con relación al dato: *${fieldInfo.label}* (${val}).`,
							);
							return (
								<Stack
									direction="row"
									alignItems="center"
									spacing={1}
								>
									<Tooltip
										title={displayValue}
										arrow
										placement="top"
									>
										<Typography
											variant="body2"
											sx={{
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
												maxWidth: 130,
											}}
										>
											{displayValue}
										</Typography>
									</Tooltip>
									<IconButton
										size="small"
										sx={{ color: "#25d366" }}
										onClick={() =>
											window.open(
												`https://wa.me/${String(val).replace(/\D/g, "")}?text=${msg}`,
												"_blank",
											)
										}
									>
										<WhatsAppIcon fontSize="inherit" />
									</IconButton>
								</Stack>
							);
						}

						return (
							<Tooltip title={displayValue} placement="top" arrow>
								<Typography
									variant="body2"
									sx={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										width: "100%",
									}}
								>
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
				renderCell: (p) =>
					dayjs(p.row.createdAt).format("DD MMM YYYY, HH:mm"),
			},
		];
	}, [rows, canWrite, event]);

	const dynamicFieldsList = useMemo(() => {
		const firstRow = rows[0];
		if (!firstRow?.answers) return [];
		return Object.entries(firstRow.answers).map(([key, val]: any) => ({
			key,
			label: val.label,
		}));
	}, [rows]);

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
						label="Buscar..."
						value={q}
						onChange={(e) => {
							setQ(e.target.value);
							setPage(0);
						}}
						fullWidth
					/>
					<TextField
						size="small"
						label="Estado"
						select
						value={status}
						onChange={(e) => {
							setStatus(e.target.value as any);
							setPage(0);
						}}
						sx={{ minWidth: 200 }}
					>
						<MenuItem value="">Todos</MenuItem>
						{STATUS_OPTIONS.map((s) => (
							<MenuItem key={s} value={s}>
								{STATUS_LABEL[s]}
							</MenuItem>
						))}
					</TextField>
				</Stack>

				{canExport && (
					<Stack direction="row" gap={1}>
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
							onClick={() => handleDownloadClick("xlsx")}
							disabled={
								isLoading || rowCount === 0 || isDownloading
							}
						>
							EXCEL
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
							onClick={() => handleDownloadClick("pdf")}
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
						initialState={{
							sorting: {
								sortModel: [
									{ field: "createdAt", sort: "asc" },
								],
							},
						}}
						sx={{
							border: "1px solid",
							borderColor: "divider",
							bgcolor: "background.paper",
							borderRadius: 2,
						}}
					/>
				)}
			</Box>

			<ExportConfigDialog
				open={exportDialogOpen}
				type={exportType}
				dynamicFields={dynamicFieldsList}
				onClose={() => setExportDialogOpen(false)}
				onConfirm={executeDownload}
			/>

			<Menu
				anchorEl={anchorEl}
				open={menuOpen}
				onClose={closeMenu}
				PaperProps={{ sx: { borderRadius: 2, minWidth: 260, mt: 0.5 } }}
			>
				<Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography
							variant="caption"
							color="text.secondary"
							fontWeight={700}
						>
							GRUPO / DORMITORIO
						</Typography>
						{!isEditingGroup && (
							<IconButton
								size="small"
								onClick={() => setIsEditingGroup(true)}
							>
								<EditIcon sx={{ fontSize: 16 }} />
							</IconButton>
						)}
					</Stack>
					{isEditingGroup ? (
						<Stack direction="row" gap={1} mt={1}>
							<TextField
								size="small"
								value={tempGroup}
								onChange={(e) =>
									setTempGroup(e.target.value.toUpperCase())
								}
								autoFocus
							/>
							<Button
								variant="contained"
								size="small"
								onClick={onSaveGroup}
							>
								OK
							</Button>
						</Stack>
					) : (
						<Typography
							variant="body1"
							fontWeight="bold"
							color={
								activeRow?.assignedGroup
									? "primary"
									: "text.disabled"
							}
							mt={0.5}
						>
							{activeRow?.assignedGroup || "Sin asignar"}
						</Typography>
					)}
				</Box>
				<Divider sx={{ my: 1 }} />

				<MenuItem
					onClick={() => {
						if (activeRow)
							setEditDialog({ open: true, row: activeRow });
						closeMenu();
					}}
					sx={{ py: 1.5 }}
				>
					<EditIcon
						fontSize="small"
						sx={{ mr: 1.5, color: "text.secondary" }}
					/>
					<Typography variant="body2" fontWeight="bold">
						Editar Datos (Nombre, etc.)
					</Typography>
				</MenuItem>

				<Divider sx={{ my: 1 }} />
				<Typography
					sx={{ px: 2, pt: 1, pb: 1 }}
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
							sx={{ mr: 1.5, minWidth: 90 }}
						/>
					</MenuItem>
				))}

				<Divider sx={{ my: 1 }} />
				<MenuItem
					onClick={onOpenDeleteConfirm}
					sx={{ py: 1.5, color: "error.main" }}
				>
					<DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
					<Typography variant="body2" fontWeight="bold">
						Eliminar Registro
					</Typography>
				</MenuItem>
			</Menu>

			<ConfirmDialog
				open={deleteDialog.open}
				title="Eliminar Registro"
				description={`¿Estás seguro de que deseas ELIMINAR permanentemente el registro #${deleteDialog.row?.id}? Esta acción destruirá todas sus respuestas y no se puede deshacer.`}
				confirmText="Eliminar permanentemente"
				cancelText="Cancelar"
				loading={deleteMutation.isPending}
				onConfirm={handleConfirmDelete}
				onClose={() => setDeleteDialog({ open: false, row: null })}
			/>

			<EditRegistrationDialog
				open={editDialog.open}
				row={editDialog.row}
				event={event}
				fields={eventFields}
				onClose={() => setEditDialog({ open: false, row: null })}
				onSave={handleSaveEditData}
				isPending={updateDataMutation.isPending}
			/>
		</Stack>
	);
}
