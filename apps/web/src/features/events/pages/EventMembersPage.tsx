import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useNotification } from "@/components/ui/NotificationContext";
import { useUser } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { Add, Delete, MoreVert } from "@mui/icons-material";
import {
	Avatar,
	Box,
	Button,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { EventPermissionGate } from "../components/EventPermissionGate";
import {
	useAddEventMember,
	useEventMembers,
	useRemoveEventMember,
	useUpdateEventMemberRole,
} from "../hooks/useEventMembers";
import type { EventMember, EventMemberRole, EventOutletCtx } from "../types";

const ROLE_OPTIONS: EventMemberRole[] = ["VIEWER", "CHECKIN", "EDITOR"];

export function EventMembersPage() {
	const { eventId } = useParams();
	const id = Number(eventId);
	const { showNotification } = useNotification();

	const { access } = useOutletContext<EventOutletCtx>();

	const canManageMembers = access?.canWrite ?? false;

	const { data: me } = useUser();

	const { data, isLoading, isError, error } = useEventMembers(id);
	const addMutation = useAddEventMember(id);
	const updateRoleMutation = useUpdateEventMemberRole(id);
	const removeMutation = useRemoveEventMember(id);

	const [email, setEmail] = useState("");
	const [role, setRole] = useState<EventMemberRole>("VIEWER");

	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const [menuRow, setMenuRow] = useState<EventMember | null>(null);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<EventMember | null>(null);

	const rows = useMemo(() => data ?? [], [data]);

	const editorsCount = useMemo(
		() => rows.filter((m) => m.eventRole === "EDITOR").length,
		[rows],
	);

	const isSelf = (row: EventMember) => !!me?.id && row.userId === me.id;
	const isLastEditorRow = (row: EventMember) =>
		row.eventRole === "EDITOR" && editorsCount <= 1;

	if (!canManageMembers) {
		return (
			<EventPermissionGate
				allow={false}
				title="Acceso restringido"
				message="No tienes permisos para gestionar miembros de este evento."
			/>
		);
	}

	if (!eventId || !Number.isFinite(id))
		return <Typography color="error">ID de evento inválido</Typography>;
	if (isError)
		return <Typography color="error">{getErrorMessage(error)}</Typography>;

	const openMenu = (e: React.MouseEvent<HTMLElement>, row: EventMember) => {
		setMenuAnchor(e.currentTarget);
		setMenuRow(row);
	};

	const closeMenu = () => {
		setMenuAnchor(null);
		setMenuRow(null);
	};

	const askRemove = () => {
		if (!menuRow || isSelf(menuRow) || isLastEditorRow(menuRow)) return;
		setDeleteTarget(menuRow);
		closeMenu();
		setConfirmOpen(true);
	};

	const doRemove = () => {
		if (!deleteTarget) return;
		removeMutation.mutate(deleteTarget.userId, {
			onSuccess: () => {
				showNotification(`Usuario eliminado del evento`, "success");
				setConfirmOpen(false);
				setDeleteTarget(null);
			},
			onError: (err) => showNotification(getErrorMessage(err), "error"),
		});
	};

	const setMemberRole = (newRole: EventMemberRole) => {
		if (!menuRow || isSelf(menuRow)) return;
		if (
			menuRow.eventRole === "EDITOR" &&
			newRole !== "EDITOR" &&
			isLastEditorRow(menuRow)
		)
			return;

		closeMenu();
		updateRoleMutation.mutate(
			{ userId: menuRow.userId, role: newRole },
			{
				onSuccess: () =>
					showNotification(`Rol actualizado a ${newRole}`, "success"),
				onError: (err) =>
					showNotification(getErrorMessage(err), "error"),
			},
		);
	};

	const onAdd = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const emailTrim = email.trim();
		if (!emailTrim) return;

		addMutation.mutate(
			{ email: emailTrim, role },
			{
				onSuccess: () => {
					setEmail("");
					setRole("VIEWER");
					showNotification(`Usuario agregado al evento`, "success");
				},
				onError: (err: any) => {
					const errorCode =
						err?.error?.code || err?.response?.data?.error?.code;

					if (errorCode === "USER_NOT_FOUND") {
						showNotification(
							"El usuario no existe. Pídele que se registre en la plataforma primero.",
							"warning",
						);
					} else if (errorCode === "USER_ALREADY_MEMBER") {
						showNotification(
							"Este usuario ya es miembro del evento.",
							"info",
						);
					} else {
						showNotification(getErrorMessage(err), "error");
					}
				},
			},
		);
	};

	const busy =
		addMutation.isPending ||
		updateRoleMutation.isPending ||
		removeMutation.isPending;
	const addDisabled = busy || !email.trim();

	const menuIsSelf = menuRow ? isSelf(menuRow) : false;
	const menuIsLastEditor = menuRow ? isLastEditorRow(menuRow) : false;

	const disableRemove = busy || menuIsSelf || menuIsLastEditor || !menuRow;
	const disableDowngrade =
		busy ||
		!menuRow ||
		menuIsSelf ||
		(menuRow.eventRole === "EDITOR" && menuIsLastEditor);

	const columns: GridColDef<EventMember>[] = [
		{
			field: "email",
			headerName: "Usuario (Email)",
			flex: 1,
			minWidth: 250,
			renderCell: (params) => (
				<Stack
					direction="row"
					alignItems="center"
					spacing={1.5}
					height="100%"
				>
					<Avatar
						sx={{
							width: 30,
							height: 30,
							fontSize: "0.85rem",
							bgcolor: "primary.main",
						}}
					>
						{params.row.email.charAt(0).toUpperCase()}
					</Avatar>
					<Typography variant="body2" fontWeight={500}>
						{params.row.email}
					</Typography>
				</Stack>
			),
		},
		{
			field: "eventRole",
			headerName: "Permiso",
			width: 140,
			renderCell: (params) => {
				const role = params.row.eventRole;
				let color: "default" | "primary" | "success" = "default";
				let variant: "outlined" | "filled" = "outlined";

				if (role === "EDITOR") {
					color = "primary";
					variant = "filled";
				} else if (role === "CHECKIN") {
					color = "success";
					variant = "outlined";
				}

				return (
					<Chip
						size="small"
						label={role}
						color={color}
						variant={variant}
						sx={{ fontWeight: 600 }}
					/>
				);
			},
		},
		{
			field: "globalRole",
			headerName: "Rol Sistema",
			width: 140,
			renderCell: (params) => (
				<Typography variant="body2" color="text.secondary">
					{params.row.globalRole}
				</Typography>
			),
		},
		{
			field: "createdAt",
			headerName: "Agregado el",
			width: 180,
			valueGetter: (params) => params.row?.createdAt || "",
			renderCell: (params) => {
				const date = new Date(params.row.createdAt);
				return (
					<Typography variant="body2">
						{date.toLocaleDateString()}{" "}
						<Typography
							component="span"
							variant="caption"
							color="text.secondary"
						>
							{date.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</Typography>
					</Typography>
				);
			},
		},
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
					onClick={(e) => openMenu(e, params.row)}
					disabled={busy}
				>
					<MoreVert fontSize="small" />
				</IconButton>
			),
		},
	];

	return (
		<Stack spacing={3} sx={{ pt: 2 }}>
			<Stack
				direction={{ xs: "column", md: "row" }}
				justifyContent="space-between"
				alignItems={{ xs: "flex-start", md: "center" }}
				gap={2}
			>
				<Stack>
					<Typography variant="h6" fontWeight={800}>
						Equipo del Evento
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Gestiona quién puede ver o editar este evento.
					</Typography>
				</Stack>

				<Stack
					component="form"
					onSubmit={onAdd}
					direction={{ xs: "row", sm: "row" }}
					gap={1.5}
					alignItems="center"
				>
					<TextField
						size="small"
						label="Email del usuario"
						placeholder="usuario@ejemplo.com"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={busy}
						sx={{ minWidth: 220 }}
					/>

					<TextField
						size="small"
						label="Asignar Rol"
						select
						value={role}
						onChange={(e) =>
							setRole(e.target.value as EventMemberRole)
						}
						disabled={busy}
						sx={{ width: 140 }}
					>
						{ROLE_OPTIONS.map((r) => (
							<MenuItem key={r} value={r}>
								{r}
							</MenuItem>
						))}
					</TextField>

					<Button
						type="submit"
						variant="contained"
						startIcon={<Add />}
						disabled={addDisabled}
						sx={{ height: 40 }}
					>
						{addMutation.isPending ? "Agregando..." : "Agregar"}
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
					getRowId={(r) => r.userId}
					disableRowSelectionOnClick
					disableColumnMenu
					loading={isLoading || busy}
					pageSizeOptions={[25, 50, 100]}
					initialState={{
						pagination: {
							paginationModel: { pageSize: 25, page: 0 },
						},
					}}
					sx={{
						border: "none",
						"& .MuiDataGrid-cell:focus": { outline: "none" },
						"& .MuiDataGrid-columnHeader:focus": {
							outline: "none",
						},
					}}
				/>
			</Paper>

			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
				onClose={closeMenu}
				PaperProps={{ sx: { minWidth: 160, borderRadius: 2, mt: 0.5 } }}
			>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ px: 2, py: 1, display: "block", fontWeight: 700 }}
				>
					CAMBIAR ROL
				</Typography>

				{ROLE_OPTIONS.filter((r) => r !== menuRow?.eventRole).map(
					(r) => (
						<MenuItem
							key={r}
							onClick={() => setMemberRole(r)}
							disabled={
								busy ||
								(r !== "EDITOR" ? disableDowngrade : false)
							}
						>
							Asignar como {r}
						</MenuItem>
					),
				)}

				<Box sx={{ my: 1, height: 1, bgcolor: "divider" }} />

				<MenuItem
					onClick={askRemove}
					sx={{ color: "error.main" }}
					disabled={disableRemove}
				>
					<Delete fontSize="small" sx={{ mr: 1.5 }} />
					Quitar del evento
				</MenuItem>
			</Menu>

			<ConfirmDialog
				open={confirmOpen}
				title="Eliminar miembro"
				description={
					deleteTarget
						? `¿Estás seguro de que deseas quitar a "${deleteTarget.email}"? Perderá el acceso a este evento.`
						: undefined
				}
				confirmText="Sí, quitar"
				cancelText="Cancelar"
				onClose={() => {
					setConfirmOpen(false);
					setDeleteTarget(null);
				}}
				onConfirm={doRemove}
				loading={removeMutation.isPending}
			/>
		</Stack>
	);
}
