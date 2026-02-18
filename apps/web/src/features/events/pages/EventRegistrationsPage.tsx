import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "@mui/icons-material";
import {
	Box,
	Chip,
	CircularProgress,
	FormControl,
	InputAdornment,
	InputLabel,
	MenuItem,
	Pagination,
	Paper,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useRegistrations } from "../hooks/useRegistrations";
import { useUpdateRegistrationStatus } from "../hooks/useRegistrationStatus";
import type { RegistrationStatus } from "../types";

const STATUS_OPTIONS: Array<{ value: "" | RegistrationStatus; label: string }> =
	[
		{ value: "", label: "Todos" },
		{ value: "REGISTERED", label: "Registrado" },
		{ value: "CONFIRMED", label: "Confirmado" },
		{ value: "ATTENDED", label: "Asistió" },
		{ value: "NO_SHOW", label: "No Show" },
		{ value: "CANCELLED", label: "Cancelado" },
	];

const getStatusColor = (status: RegistrationStatus) => {
	switch (status) {
		case "CONFIRMED":
			return "info";
		case "ATTENDED":
			return "success";
		case "NO_SHOW":
			return "warning";
		case "CANCELLED":
			return "error";
		default:
			return "default";
	}
};

const getStatusLabel = (status: RegistrationStatus) => {
	const opt = STATUS_OPTIONS.find((o) => o.value === status);
	return opt ? opt.label : status;
};

export function EventRegistrationsPage() {
	const { eventId } = useParams();
	const id = Number(eventId);

	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [statusFilter, setStatusFilter] = useState<"" | RegistrationStatus>(
		"",
	);
	const [searchTerm, setSearchTerm] = useState("");

	const debouncedSearch = useDebounce(searchTerm, 500);

	const queryParams = useMemo(
		() => ({
			page,
			limit,
			status: statusFilter || undefined,
			q: debouncedSearch || undefined,
		}),
		[page, limit, statusFilter, debouncedSearch],
	);

	// Hooks de Data
	const { data, isLoading, isError, error, isFetching } = useRegistrations(
		id,
		queryParams,
	);
	const updateStatus = useUpdateRegistrationStatus(id);

	if (!eventId || !Number.isFinite(id))
		return <Typography color="error">Evento inválido</Typography>;
	if (isLoading)
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
				<CircularProgress />
			</Box>
		);
	if (isError)
		return <Typography color="error">{getErrorMessage(error)}</Typography>;
	if (!data) return null;

	const { meta, items } = data;

	// Handlers
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setPage(1);
	};

	const handleStatusFilterChange = (e: any) => {
		setStatusFilter(e.target.value);
		setPage(1);
	};

	return (
		<Stack spacing={3}>
			<Paper
				elevation={0}
				sx={{
					p: 2,
					bgcolor: "background.paper",
					border: 1,
					borderColor: "divider",
				}}
			>
				<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
					<TextField
						size="small"
						placeholder="Buscar por email o teléfono..."
						value={searchTerm}
						onChange={handleSearchChange}
						sx={{ flexGrow: 1 }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Search color="action" fontSize="small" />
								</InputAdornment>
							),
						}}
					/>

					<FormControl size="small" sx={{ minWidth: 200 }}>
						<InputLabel>Filtrar por Estado</InputLabel>
						<Select
							value={statusFilter}
							label="Filtrar por Estado"
							onChange={handleStatusFilterChange}
						>
							{STATUS_OPTIONS.map((opt) => (
								<MenuItem key={opt.label} value={opt.value}>
									{opt.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Stack>
			</Paper>

			<TableContainer component={Paper} variant="outlined">
				<Table
					size="small"
					sx={{
						opacity: isFetching ? 0.6 : 1,
						transition: "opacity 0.2s",
					}}
				>
					<TableHead sx={{ bgcolor: "background.default" }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 600 }}>
								Participante
							</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>
								Fecha Registro
							</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>
								Estado Actual
							</TableCell>
							<TableCell align="right" sx={{ fontWeight: 600 }}>
								Acciones
							</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{items.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={4}
									align="center"
									sx={{ py: 6 }}
								>
									<Typography color="text.secondary">
										No se encontraron registros.
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							items.map((r) => (
								<TableRow key={r.id} hover>
									<TableCell>
										<Stack>
											<Typography
												variant="body2"
												fontWeight={500}
											>
												{r.participant
													?.emailNormalized ||
													"Sin email"}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												{r.participant
													?.phoneNormalized || "-"}
											</Typography>
										</Stack>
									</TableCell>

									<TableCell>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											{new Date(
												r.createdAt,
											).toLocaleDateString()}
											<br />
											<Typography
												component="span"
												variant="caption"
											>
												{new Date(
													r.createdAt,
												).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</Typography>
										</Typography>
									</TableCell>

									<TableCell>
										<Chip
											size="small"
											label={getStatusLabel(r.status)}
											color={getStatusColor(r.status)}
											variant="outlined"
										/>
									</TableCell>

									<TableCell align="right">
										<FormControl
											variant="standard"
											size="small"
											sx={{ minWidth: 140 }}
										>
											<Select
												value={r.status}
												disableUnderline
												disabled={
													updateStatus.isPending
												}
												onChange={(e) => {
													updateStatus.mutate({
														registrationId: r.id,
														status: e.target
															.value as RegistrationStatus,
													});
												}}
												sx={{
													fontSize: "0.875rem",
													"& .MuiSelect-select": {
														py: 0.5,
													},
												}}
											>
												{STATUS_OPTIONS.filter(
													(o) => o.value !== "",
												).map((opt) => (
													<MenuItem
														key={opt.value}
														value={opt.value}
													>
														{opt.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<Stack
				direction={{ xs: "column", sm: "row" }}
				alignItems="center"
				justifyContent="space-between"
				spacing={2}
			>
				<Typography variant="body2" color="text.secondary">
					Mostrando <b>{items.length}</b> de <b>{meta.total}</b>{" "}
					registros
				</Typography>

				<Pagination
					count={meta.totalPages}
					page={meta.page}
					onChange={(_, p) => setPage(p)}
					color="primary"
					shape="rounded"
					showFirstButton
					showLastButton
				/>
			</Stack>
		</Stack>
	);
}
