import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useNotification } from "@/components/ui/NotificationContext";
import { useEventFieldsDraft } from "@/features/events/hooks/useEventFieldsDraft";
import { getErrorMessage } from "@/features/utils/getErrorMessage";

import {
	Add,
	ArrowDownward,
	ArrowUpward,
	Delete,
	Edit,
	Save,
	Undo,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Chip,
	IconButton,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { EventPermissionGate } from "../components/EventPermissionGate";
import {
	FieldDrawer,
	type FieldDrawerResult,
} from "../fields/components/FieldDrawer";
import {
	isSelectType,
	moveField,
	normalizeOrder,
} from "../fields/utils/fields";
import type { EventField, EventOutletCtx } from "../types";

export function EventFieldsPage() {
	const { eventId } = useParams();
	const id = Number(eventId);
	const { showNotification } = useNotification();

	const {
		draft,
		setDraft,
		dirty,
		reset,
		saveDraft,
		isLoading,
		isError,
		error,
		saving,
	} = useEventFieldsDraft(id);

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
	const [editingField, setEditingField] = useState<EventField | null>(null);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<EventField | null>(null);

	const { access } = useOutletContext<EventOutletCtx>();

	const canManageFields = access?.canWrite ?? false;

	const rows = useMemo(() => normalizeOrder(draft as EventField[]), [draft]);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (dirty) {
				e.preventDefault();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () =>
			window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [dirty]);

	const moveUp = (fieldId: number) => {
		setDraft((prev: EventField[]) => moveField(prev, fieldId, -1));
	};

	const moveDown = (fieldId: number) => {
		setDraft((prev: EventField[]) => moveField(prev, fieldId, 1));
	};

	const openCreate = () => {
		setDrawerMode("create");
		setEditingField(null);
		setDrawerOpen(true);
	};

	const openEdit = (field: EventField) => {
		setDrawerMode("edit");
		setEditingField(field);
		setDrawerOpen(true);
	};

	const closeDrawer = () => {
		setDrawerOpen(false);
		setEditingField(null);
	};

	const onSubmitDrawer = (values: FieldDrawerResult) => {
		setDraft((prev: EventField[]) => {
			const next = normalizeOrder(prev);

			if (drawerMode === "create") {
				const tempId = -Date.now();
				const newField: EventField = {
					id: tempId,
					key: values.key,
					label: values.label,
					type: values.type,
					required: values.required,
					order: next.length,
					options: isSelectType(values.type)
						? values.options
						: undefined,
				} as EventField;
				return normalizeOrder([...next, newField]);
			}

			if (!editingField) return next;

			return normalizeOrder(
				next.map((f) => {
					if (f.id !== editingField.id) return f;
					return {
						...f,
						label: values.label,
						type: values.type,
						required: values.required,
						options: isSelectType(values.type)
							? values.options
							: undefined,
					};
				}),
			);
		});
		closeDrawer();
	};

	const askDelete = (field: EventField) => {
		setDeleteTarget(field);
		setConfirmOpen(true);
	};

	const doDelete = () => {
		if (!deleteTarget) return;
		setDraft((prev: EventField[]) =>
			normalizeOrder(prev.filter((f) => f.id !== deleteTarget.id)),
		);
		setConfirmOpen(false);
		setDeleteTarget(null);
	};

	const handleSaveDraft = async () => {
		try {
			await saveDraft();
			showNotification("Campos actualizados correctamente", "success");
		} catch (err) {
			showNotification("Hubo un error al guardar los campos", "error");
		}
	};

	const columns = useMemo<GridColDef[]>(
		() => [
			{
				field: "order",
				headerName: "#",
				width: 60,
				align: "center",
				headerAlign: "center",
				sortable: false,
				renderCell: (params) => (params.value as number) + 1,
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
				renderCell: (params) => (
					<Typography
						variant="body2"
						sx={{
							fontFamily: "monospace",
							color: "text.secondary",
						}}
					>
						{params.value}
					</Typography>
				),
			},
			{
				field: "type",
				headerName: "Tipo",
				width: 140,
				sortable: false,
				renderCell: (params) => (
					<Chip
						label={params.value}
						size="small"
						variant="outlined"
						sx={{ fontSize: "0.75rem" }}
					/>
				),
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
					const isFirst = row.order === 0;
					const isLast = row.order === rows.length - 1;

					return (
						<Stack
							direction="row"
							alignItems="center"
							height="100%"
						>
							<Tooltip title="Editar">
								<IconButton
									size="small"
									onClick={() => openEdit(row)}
								>
									<Edit fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title="Subir">
								<span>
									<IconButton
										size="small"
										disabled={isFirst}
										onClick={() => moveUp(row.id)}
									>
										<ArrowUpward fontSize="small" />
									</IconButton>
								</span>
							</Tooltip>
							<Tooltip title="Bajar">
								<span>
									<IconButton
										size="small"
										disabled={isLast}
										onClick={() => moveDown(row.id)}
									>
										<ArrowDownward fontSize="small" />
									</IconButton>
								</span>
							</Tooltip>
							<Tooltip title="Eliminar">
								<IconButton
									size="small"
									color="error"
									onClick={() => askDelete(row)}
								>
									<Delete fontSize="small" />
								</IconButton>
							</Tooltip>
						</Stack>
					);
				},
			},
		],
		[rows.length, moveUp, moveDown, askDelete, openEdit],
	);

	if (!canManageFields) {
		return (
			<EventPermissionGate
				allow={false}
				title="Acceso restringido"
				message="No tienes permisos para gestionar campos de este evento."
			/>
		);
	}

	if (!eventId || !Number.isFinite(id))
		return <Typography color="error">ID de evento inválido</Typography>;
	if (isLoading)
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
				<Typography color="text.secondary">
					Cargando campos...
				</Typography>
			</Box>
		);
	if (isError)
		return <Typography color="error">{getErrorMessage(error)}</Typography>;

	return (
		<Stack spacing={3}>
			<Stack
				direction={{ xs: "column", md: "row" }}
				justifyContent="space-between"
				alignItems={{ xs: "flex-start", md: "center" }}
				spacing={2}
			>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Typography variant="h6" fontWeight={800}>
						Campos del Formulario
					</Typography>
					{dirty && (
						<Chip
							size="small"
							color="warning"
							label="Cambios sin guardar"
							variant="filled"
						/>
					)}
				</Stack>

				<Stack direction="row" spacing={1}>
					<Button
						variant="outlined"
						color="inherit"
						startIcon={<Add />}
						onClick={openCreate}
						disabled={saving}
					>
						Agregar
					</Button>
					<Button
						variant="text"
						color="error"
						startIcon={<Undo />}
						onClick={reset}
						disabled={!dirty || saving}
					>
						Descartar
					</Button>

					<Button
						variant="contained"
						startIcon={saving ? undefined : <Save />}
						onClick={handleSaveDraft}
						disabled={!dirty || saving}
					>
						{saving ? "Guardando..." : "Guardar Cambios"}
					</Button>
				</Stack>
			</Stack>

			<Paper
				variant="outlined"
				sx={{ height: 600, width: "100%", bgcolor: "background.paper" }}
			>
				<DataGrid
					rows={rows}
					columns={columns}
					disableRowSelectionOnClick
					disableColumnMenu
					hideFooter
					sortModel={[{ field: "order", sort: "asc" }]}
					sx={{
						border: "none",
						"& .MuiDataGrid-cell:focus": { outline: "none" },
						"& .MuiDataGrid-columnHeader:focus": {
							outline: "none",
						},
					}}
				/>
			</Paper>

			<FieldDrawer
				open={drawerOpen}
				mode={drawerMode}
				fields={rows}
				initial={editingField}
				onClose={closeDrawer}
				onSubmit={onSubmitDrawer}
			/>

			<ConfirmDialog
				open={confirmOpen}
				title="Eliminar campo"
				description={
					deleteTarget
						? `¿Eliminar "${deleteTarget.label}"? Esta acción será permanente al guardar.`
						: undefined
				}
				confirmText="Eliminar"
				cancelText="Cancelar"
				onClose={() => {
					setConfirmOpen(false);
					setDeleteTarget(null);
				}}
				onConfirm={doDelete}
			/>
		</Stack>
	);
}
