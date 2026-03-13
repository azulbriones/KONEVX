import {
	Bed,
	Cancel,
	CheckCircle,
	EditNote,
	MeetingRoom,
	Person,
	PersonAdd,
	Phone,
	PictureAsPdf,
	QrCodeScanner,
	Search,
	TableChart,
	Undo,
	WhatsApp,
} from "@mui/icons-material";
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Dialog,
	Divider,
	Grid,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import {
	cancelAttendance,
	downloadRegistrationsExcel,
	downloadRegistrationsPdf,
	markAttendance,
	quickRegistration,
} from "../api/registrations.service";
import { eventsKeys } from "../hooks/useEvents";
import { useRegistrations } from "../hooks/useRegistrations";
import type { Ctx } from "../types";

import {
	ExportConfigDialog,
	type ExportOptions,
} from "@/components/ui/ExportConfigDialog";

// ==========================================
// 1. COMPONENTE PRINCIPAL (CONTENEDOR)
// ==========================================
export function EventCheckInPage() {
	const { eventId } = useParams();
	const queryClient = useQueryClient();
	const { access, stats } = useOutletContext<Ctx>();

	const [searchTerm, setSearchTerm] = useState("");
	const [loadingId, setLoadingId] = useState<number | null>(null);
	const [statusMsg, setStatusMsg] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const [quickRegOpen, setQuickRegOpen] = useState(false);
	const [isQuickRegistering, setIsQuickRegistering] = useState(false);
	const [qrScannerOpen, setQrScannerOpen] = useState(false);

	const [exportDialogOpen, setExportDialogOpen] = useState(false);
	const [exportType, setExportType] = useState<"xlsx" | "pdf">("xlsx");
	const [isExporting, setIsExporting] = useState(false);

	const queryKey = [
		"registrations",
		Number(eventId),
		{ q: searchTerm, limit: 50 },
	];

	const { data, isLoading, refetch } = useRegistrations(Number(eventId), {
		q: searchTerm,
		limit: 50,
	});

	const counts = stats?.statusCounts || {
		REGISTERED: 0,
		CONFIRMED: 0,
		ATTENDED: 0,
		CANCELLED: 0,
	};
	const groupsOccupancy = stats?.groupsOccupancy || {};
	const groupEntries = Object.entries(groupsOccupancy).sort(([a], [b]) =>
		a.localeCompare(b),
	);

	const dynamicFieldsList = useMemo(() => {
		const firstRow = data?.items?.[0];
		if (!firstRow?.answers) return [];
		return Object.entries(firstRow.answers).map(([key, val]: any) => ({
			key,
			label: val.label,
		}));
	}, [data?.items]);

	const refreshAllData = async () => {
		await refetch();
		await queryClient.invalidateQueries({
			queryKey: eventsKeys.detail(Number(eventId)),
		});
	};

	// ==========================================
	// LÓGICA DE MUTACIONES RESILIENTES (OFFLINE FIRST)
	// ==========================================
	const checkInMutation = useMutation({
		mutationFn: ({ regId, notes }: { regId: number; notes?: string }) =>
			markAttendance(Number(eventId), regId, notes),
		networkMode: "offlineFirst",
		retry: 3,
		retryDelay: 2000,
		onMutate: async ({ regId, notes }) => {
			await queryClient.cancelQueries({ queryKey });
			const previousData = queryClient.getQueryData(queryKey);

			queryClient.setQueryData(queryKey, (oldData: any) => {
				if (!oldData?.items) return oldData;
				return {
					...oldData,
					items: oldData.items.map((reg: any) =>
						reg.id === regId
							? {
									...reg,
									status: "ATTENDED",
									checkInNotes: notes || reg.checkInNotes,
								}
							: reg,
					),
				};
			});
			return { previousData };
		},
		onError: (err: any, variables, context) => {
			if (context?.previousData)
				queryClient.setQueryData(queryKey, context.previousData);
			setStatusMsg({
				type: "error",
				text:
					err.response?.data?.message ||
					"Error de red. La entrada no se pudo guardar.",
			});
		},
		onSettled: async () => {
			setLoadingId(null);
			queryClient.invalidateQueries({
				queryKey: eventsKeys.detail(Number(eventId)),
			});
		},
	});

	const handleCheckIn = (regId: number, notes?: string) => {
		setLoadingId(regId);
		setStatusMsg(null);
		checkInMutation.mutate({ regId, notes });
	};

	const cancelCheckInMutation = useMutation({
		mutationFn: (regId: number) => cancelAttendance(Number(eventId), regId),
		networkMode: "offlineFirst",
		retry: 3,
		onMutate: async (regId) => {
			await queryClient.cancelQueries({ queryKey });
			const previousData = queryClient.getQueryData(queryKey);

			queryClient.setQueryData(queryKey, (oldData: any) => {
				if (!oldData?.items) return oldData;
				return {
					...oldData,
					items: oldData.items.map((reg: any) =>
						reg.id === regId
							? { ...reg, status: "REGISTERED" }
							: reg,
					),
				};
			});
			return { previousData };
		},
		onError: (err, variables, context) => {
			if (context?.previousData)
				queryClient.setQueryData(queryKey, context.previousData);
			setStatusMsg({
				type: "error",
				text: "Error de red. No se pudo anular.",
			});
		},
		onSettled: async () => {
			setLoadingId(null);
			queryClient.invalidateQueries({
				queryKey: eventsKeys.detail(Number(eventId)),
			});
		},
	});

	const handleCancelCheckIn = (regId: number) => {
		if (!window.confirm("¿Seguro que quieres anular esta entrada?")) return;
		setLoadingId(regId);
		cancelCheckInMutation.mutate(regId);
	};

	const handleQuickRegistration = async (payload: {
		name: string;
		contact: string;
		assignedGroup?: string;
	}) => {
		setIsQuickRegistering(true);
		setStatusMsg(null);
		try {
			await quickRegistration(Number(eventId), payload);
			setStatusMsg({
				type: "success",
				text: "¡Registro express completado y admitido!",
			});
			setQuickRegOpen(false);
			setSearchTerm("");
			await refreshAllData();
		} catch (err: any) {
			setStatusMsg({
				type: "error",
				text:
					err.response?.data?.message ||
					"Error al crear el registro express",
			});
		} finally {
			setIsQuickRegistering(false);
		}
	};

	const handleQRScan = (scannedText: string) => {
		setQrScannerOpen(false);
		const regId = parseInt(scannedText, 10);

		if (isNaN(regId)) {
			setStatusMsg({
				type: "error",
				text: "Código QR inválido. No contiene un ID numérico.",
			});
			return;
		}

		handleCheckIn(regId, "Entrada escaneada por QR");
	};

	const handleDownloadClick = (type: "xlsx" | "pdf") => {
		setExportType(type);
		setExportDialogOpen(true);
	};

	const executeDownload = async (options: ExportOptions) => {
		try {
			setIsExporting(true);
			setStatusMsg(null);
			const downloadParams = {
				status: "ATTENDED" as any,
				groupBy: options.groupBy || undefined,
				pageBreak: options.pageBreak,
				columns: options.columns.join(","),
			};
			if (exportType === "xlsx")
				await downloadRegistrationsExcel(
					Number(eventId),
					downloadParams,
				);
			else
				await downloadRegistrationsPdf(Number(eventId), downloadParams);
			setStatusMsg({
				type: "success",
				text: `Lista de asistencia (${exportType.toUpperCase()}) descargada.`,
			});
		} catch (err) {
			setStatusMsg({
				type: "error",
				text: "Error al generar el archivo.",
			});
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Box sx={{ maxWidth: 600, mx: "auto", pb: 10, px: { xs: 1, sm: 0 } }}>
			<Stack spacing={2.5}>
				{/* === HEADER === */}
				<Box sx={{ pt: 2, pb: 1 }}>
					<Grid container spacing={1.5} mb={2}>
						<Grid item xs={6}>
							<StatCard
								label="Asistió"
								value={counts.ATTENDED}
								color="#16a34a"
								icon={<CheckCircle fontSize="small" />}
							/>
						</Grid>
						<Grid item xs={6}>
							<StatCard
								label="Confirmado"
								value={counts.CONFIRMED}
								color="#2563eb"
								icon={<MeetingRoom fontSize="small" />}
							/>
						</Grid>
						<Grid item xs={6}>
							<StatCard
								label="Registrado"
								value={counts.REGISTERED}
								color="#64748b"
								icon={<Person fontSize="small" />}
							/>
						</Grid>
						<Grid item xs={6}>
							<StatCard
								label="Cancelado"
								value={counts.CANCELLED}
								color="#ef4444"
								icon={<Cancel fontSize="small" />}
							/>
						</Grid>
					</Grid>

					{/* DORMITORIOS */}
					{groupEntries.length > 0 && (
						<Box sx={{ mb: 2.5 }}>
							<Stack
								direction="row"
								alignItems="center"
								spacing={1}
								sx={{ px: 1, mb: 1 }}
							>
								<Bed
									fontSize="small"
									sx={{ color: "text.secondary" }}
								/>
								<Typography
									variant="caption"
									sx={{
										fontWeight: 900,
										color: "text.secondary",
										textTransform: "uppercase",
									}}
								>
									Ocupación de Dormitorios
								</Typography>
							</Stack>
							<Stack
								direction="row"
								spacing={1.5}
								sx={{
									overflowX: "auto",
									px: 1,
									pb: 1,
									mx: { xs: -1, sm: 0 },
									"&::-webkit-scrollbar": { display: "none" },
									scrollbarWidth: "none",
								}}
							>
								{groupEntries.map(([groupName, count]) => (
									<Card
										key={groupName}
										elevation={0}
										sx={{
											minWidth: 90,
											borderRadius: "1rem",
											border: "2px solid",
											borderColor: "primary.main",
											bgcolor: "rgba(37, 99, 235, 0.05)",
											textAlign: "center",
											py: 1.5,
											flexShrink: 0,
										}}
									>
										<Typography
											variant="h5"
											fontWeight={950}
											color="primary.main"
											lineHeight={1}
										>
											{groupName}
										</Typography>
										<Typography
											variant="caption"
											fontWeight={800}
											color="text.secondary"
										>
											{count} asig.
										</Typography>
									</Card>
								))}
							</Stack>
						</Box>
					)}

					{/* ACCIONES Y BUSCADOR */}
					<Stack spacing={1.5}>
						<Stack
							direction="row"
							justifyContent="flex-end"
							spacing={1}
							px={1}
						>
							<Button
								size="small"
								variant="outlined"
								startIcon={<TableChart />}
								onClick={() => handleDownloadClick("xlsx")}
								disabled={isExporting || counts.ATTENDED === 0}
								sx={{
									borderRadius: 2,
									fontWeight: 800,
									color: "#16a34a",
									borderColor: "#16a34a",
								}}
							>
								Asistencia XLSX
							</Button>
							<Button
								size="small"
								variant="outlined"
								startIcon={<PictureAsPdf />}
								onClick={() => handleDownloadClick("pdf")}
								disabled={isExporting || counts.ATTENDED === 0}
								sx={{
									borderRadius: 2,
									fontWeight: 800,
									color: "#dc2626",
									borderColor: "#dc2626",
								}}
							>
								Asistencia PDF
							</Button>
						</Stack>

						<Stack direction="row" spacing={1}>
							<TextField
								fullWidth
								placeholder="Busca por nombre, ID, comunidad..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Search
												sx={{ color: "text.secondary" }}
											/>
										</InputAdornment>
									),
									sx: {
										borderRadius: "1rem",
										height: 60,
										bgcolor: "background.paper",
										fontSize: "1.1rem",
										"& fieldset": { border: "none" },
										boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
									},
								}}
							/>

							{access.canWrite && (
								<>
									{/* 💡 BOTÓN ESCÁNER QR */}
									<Button
										variant="contained"
										onClick={() => setQrScannerOpen(true)}
										sx={{
											borderRadius: "1rem",
											minWidth: 60,
											height: 60,
											bgcolor: "#2563eb",
											"&:hover": { bgcolor: "#1d4ed8" },
											boxShadow:
												"0 4px 12px rgba(37, 99, 235, 0.3)",
										}}
									>
										<QrCodeScanner />
									</Button>

									{/* BOTÓN REGISTRO EXPRESS */}
									<Button
										variant="contained"
										onClick={() => setQuickRegOpen(true)}
										sx={{
											borderRadius: "1rem",
											minWidth: 60,
											height: 60,
											bgcolor: "#16a34a",
											"&:hover": { bgcolor: "#15803d" },
											boxShadow:
												"0 4px 12px rgba(22, 163, 74, 0.3)",
										}}
									>
										<PersonAdd />
									</Button>
								</>
							)}
						</Stack>
					</Stack>
				</Box>

				{statusMsg && (
					<Alert
						severity={statusMsg.type}
						variant="filled"
						onClose={() => setStatusMsg(null)}
						sx={{ borderRadius: "0.75rem", fontWeight: 800 }}
					>
						{statusMsg.text}
					</Alert>
				)}

				<Stack spacing={2}>
					{isLoading ? (
						<Box display="flex" justifyContent="center" py={6}>
							<CircularProgress />
						</Box>
					) : data?.items.length === 0 ? (
						<Box textAlign="center" py={8}>
							<Typography color="text.secondary" fontWeight={700}>
								No se encontraron resultados.
							</Typography>
						</Box>
					) : (
						data?.items.map((reg: any) => (
							<RegistrationCard
								key={reg.id}
								reg={reg}
								loadingId={loadingId}
								access={access}
								onCheckIn={handleCheckIn}
								onCancelCheckIn={handleCancelCheckIn}
							/>
						))
					)}
				</Stack>
			</Stack>

			<ExportConfigDialog
				open={exportDialogOpen}
				type={exportType}
				dynamicFields={dynamicFieldsList}
				onClose={() => setExportDialogOpen(false)}
				onConfirm={executeDownload}
			/>
			<QuickRegistrationDialog
				open={quickRegOpen}
				onClose={() => setQuickRegOpen(false)}
				onConfirm={handleQuickRegistration}
				isSubmitting={isQuickRegistering}
			/>
			<QRScannerDialog
				open={qrScannerOpen}
				onClose={() => setQrScannerOpen(false)}
				onScan={handleQRScan}
			/>
		</Box>
	);
}

// ==========================================
// 2. COMPONENTE DE MODAL EXPRESS
// ==========================================
function QuickRegistrationDialog({
	open,
	onClose,
	onConfirm,
	isSubmitting,
}: any) {
	const [form, setForm] = useState({
		name: "",
		contact: "",
		assignedGroup: "",
	});

	const handleAction = () => {
		if (!form.name || !form.contact)
			return alert("Nombre y Teléfono/Email son obligatorios.");
		onConfirm(form);
	};

	return (
		<Dialog
			open={open}
			onClose={isSubmitting ? undefined : onClose}
			fullWidth
			maxWidth="xs"
			PaperProps={{ sx: { borderRadius: "1.25rem", p: 1 } }}
		>
			<Box p={2}>
				<Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
					<Avatar sx={{ bgcolor: "#16a34a", width: 40, height: 40 }}>
						<PersonAdd fontSize="small" />
					</Avatar>
					<Box>
						<Typography
							variant="h6"
							fontWeight={950}
							lineHeight={1.1}
						>
							Registro Express
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							fontWeight={700}
						>
							Añade y admite en 1 clic
						</Typography>
					</Box>
				</Stack>
				<Stack spacing={2.5}>
					<TextField
						label="Nombre Completo"
						variant="filled"
						fullWidth
						value={form.name}
						onChange={(e) =>
							setForm({ ...form, name: e.target.value })
						}
						InputProps={{
							sx: {
								borderRadius: "0.75rem",
								"&:before, &:after": { display: "none" },
							},
						}}
					/>
					<TextField
						label="Teléfono / Email"
						variant="filled"
						fullWidth
						value={form.contact}
						onChange={(e) =>
							setForm({ ...form, contact: e.target.value })
						}
						InputProps={{
							sx: {
								borderRadius: "0.75rem",
								"&:before, &:after": { display: "none" },
							},
						}}
					/>
					<TextField
						label="Asignar Dormitorio (Opcional)"
						variant="filled"
						fullWidth
						value={form.assignedGroup}
						onChange={(e) =>
							setForm({ ...form, assignedGroup: e.target.value })
						}
						InputProps={{
							sx: {
								borderRadius: "0.75rem",
								"&:before, &:after": { display: "none" },
							},
						}}
						helperText="Si lo dejas vacío, entrará sin dormitorio asignado."
					/>
					<Stack direction="row" spacing={1} mt={2}>
						<Button
							variant="text"
							color="inherit"
							fullWidth
							onClick={onClose}
							disabled={isSubmitting}
							sx={{ fontWeight: 800 }}
						>
							Cancelar
						</Button>
						<Button
							variant="contained"
							fullWidth
							onClick={handleAction}
							disabled={isSubmitting}
							sx={{
								py: 1.5,
								fontWeight: 900,
								borderRadius: "1rem",
								bgcolor: "#16a34a",
								"&:hover": { bgcolor: "#15803d" },
							}}
						>
							{isSubmitting ? (
								<CircularProgress size={24} color="inherit" />
							) : (
								"DAR ENTRADA"
							)}
						</Button>
					</Stack>
				</Stack>
			</Box>
		</Dialog>
	);
}

// ==========================================
// 3. COMPONENTE: TARJETA DE PARTICIPANTE
// ==========================================
function RegistrationCard({
	reg,
	loadingId,
	access,
	onCheckIn,
	onCancelCheckIn,
}: any) {
	const isAttended = reg.status === "ATTENDED";
	const [localNote, setLocalNote] = useState(reg.checkInNotes || "");

	const sorted = Object.values(reg.answers).sort(
		(a: any, b: any) => (a.order || 0) - (b.order || 0),
	);
	const primary = sorted[0] as any;
	const secondary = sorted[1] as any;
	const others = sorted.slice(2);

	return (
		<Card
			elevation={0}
			sx={{
				borderRadius: "1.25rem",
				border: isAttended ? "2px solid #16a34a" : "1px solid",
				borderColor: localNote ? "warning.main" : "divider",
				bgcolor: isAttended
					? "rgba(22, 163, 74, 0.05)"
					: "background.paper",
				transition: "0.2s",
			}}
		>
			<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
				<Stack spacing={2.5}>
					<Stack direction="row" spacing={2} alignItems="center">
						<Avatar
							sx={{
								bgcolor: isAttended
									? "#16a34a"
									: "primary.main",
								width: 55,
								height: 55,
							}}
						>
							{isAttended ? <CheckCircle /> : <Person />}
						</Avatar>
						<Box sx={{ flexGrow: 1, minWidth: 0 }}>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 950,
									fontSize: "1.2rem",
									lineHeight: 1.1,
								}}
							>
								{primary?.value || "---"}
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: "text.secondary",
									fontWeight: 700,
								}}
							>
								{secondary?.label}: {secondary?.value || ""}
							</Typography>
							<Chip
								size="small"
								label={`ID #${reg.id}`}
								sx={{ mt: 1, fontWeight: 800 }}
							/>
						</Box>
					</Stack>

					<Box>
						<TextField
							fullWidth
							multiline
							rows={2}
							variant="filled"
							label="Notas de Incidencia / Logística"
							placeholder="Ej: Pendiente de pago, sin tutor..."
							value={localNote}
							onChange={(e) => setLocalNote(e.target.value)}
							disabled={loadingId === reg.id || !access.canWrite}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<EditNote
											color={
												localNote
													? "warning"
													: "disabled"
											}
										/>
									</InputAdornment>
								),
								sx: {
									borderRadius: "0.75rem",
									fontSize: "0.85rem",
									bgcolor: localNote
										? "rgba(255, 152, 0, 0.08)"
										: "action.hover",
									"&:before, &:after": { display: "none" },
								},
							}}
							InputLabelProps={{
								sx: { fontWeight: 800, fontSize: "0.8rem" },
							}}
						/>
					</Box>

					<Divider sx={{ borderStyle: "dashed" }} />

					<Stack direction="row" spacing={2} flexWrap="wrap">
						{reg.contact.phone && (
							<Stack
								direction="row"
								spacing={0.5}
								alignItems="center"
							>
								<Phone
									sx={{
										fontSize: 16,
										color: "text.secondary",
									}}
								/>
								<Typography variant="body2" fontWeight={700}>
									{reg.contact.phone}
								</Typography>
								<Button
									size="small"
									sx={{
										minWidth: 0,
										p: 0,
										ml: 1,
										color: "#25d366",
									}}
									onClick={() =>
										window.open(
											`https://wa.me/${reg.contact.phone.replace(/\D/g, "")}`,
											"_blank",
										)
									}
								>
									<WhatsApp fontSize="small" />
								</Button>
							</Stack>
						)}
					</Stack>

					<Grid
						container
						spacing={1.5}
						sx={{
							p: 1.5,
							borderRadius: "0.75rem",
							bgcolor: "background.default",
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						{others.map((ans: any, i: number) => (
							<Grid item xs={6} key={i}>
								<Typography
									variant="caption"
									sx={{
										color: "text.secondary",
										fontWeight: 900,
										textTransform: "uppercase",
										display: "block",
										fontSize: "0.6rem",
									}}
								>
									{ans.label}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontWeight: 800,
										fontSize: "0.85rem",
									}}
								>
									{ans.value || "---"}
								</Typography>
							</Grid>
						))}
						{reg.assignedGroup && (
							<Grid item xs={12} mt={1}>
								<Chip
									icon={<MeetingRoom />}
									label={`DORMITORIO: ${reg.assignedGroup}`}
									color="primary"
									sx={{
										fontWeight: 900,
										width: "100%",
										py: 2.5,
										borderRadius: "0.5rem",
									}}
								/>
							</Grid>
						)}
					</Grid>

					{!isAttended ? (
						<Button
							variant="contained"
							fullWidth
							onClick={() => onCheckIn(reg.id, localNote)}
							disabled={loadingId === reg.id || !access.canWrite}
							sx={{
								borderRadius: "1rem",
								py: 1.8,
								fontWeight: 950,
								fontSize: "1.1rem",
							}}
						>
							{loadingId === reg.id ? (
								<CircularProgress size={26} color="inherit" />
							) : (
								"DAR ENTRADA"
							)}
						</Button>
					) : (
						<Stack spacing={1}>
							<Box
								sx={{
									py: 1.5,
									borderRadius: "1rem",
									bgcolor: "#16a34a",
									color: "white",
									textAlign: "center",
									fontWeight: 900,
								}}
							>
								✓ ADMITIDO
							</Box>
							{localNote !== reg.checkInNotes && (
								<Button
									size="small"
									variant="outlined"
									color="warning"
									onClick={() => onCheckIn(reg.id, localNote)}
									sx={{ fontWeight: 800, borderRadius: 2 }}
								>
									Guardar cambios en nota
								</Button>
							)}
							<Button
								variant="text"
								color="error"
								startIcon={<Undo />}
								onClick={() => onCancelCheckIn(reg.id)}
								disabled={loadingId === reg.id}
								sx={{ fontWeight: 800, alignSelf: "center" }}
							>
								Anular entrada
							</Button>
						</Stack>
					)}
				</Stack>
			</CardContent>
		</Card>
	);
}

// ==========================================
// 4. COMPONENTE: TARJETA DE ESTADÍSTICA MINI
// ==========================================
function StatCard({ label, value, color, icon }: any) {
	return (
		<Card
			variant="outlined"
			sx={{
				borderRadius: "1rem",
				borderLeft: `5px solid ${color}`,
				bgcolor: "background.paper",
			}}
		>
			<CardContent sx={{ py: "10px !important", px: 1.5 }}>
				<Stack direction="row" spacing={0.5} alignItems="center">
					<Box sx={{ color, display: "flex" }}>{icon}</Box>
					<Typography
						variant="caption"
						fontWeight={900}
						color="text.secondary"
						sx={{ textTransform: "uppercase", fontSize: "0.6rem" }}
					>
						{label}
					</Typography>
				</Stack>
				<Typography variant="h5" fontWeight={950} sx={{ mt: 0.5 }}>
					{value}
				</Typography>
			</CardContent>
		</Card>
	);
}

// ==========================================
// 5. COMPONENTE: ESCÁNER QR
// ==========================================
function QRScannerDialog({ open, onClose, onScan }: any) {
	useEffect(() => {
		if (!open) return;

		let scanner: Html5QrcodeScanner | null = null;

		const timeout = setTimeout(() => {
			if (!document.getElementById("reader")) return;

			scanner = new Html5QrcodeScanner(
				"reader",
				{ fps: 10, qrbox: { width: 250, height: 250 } },
				false,
			);

			scanner.render(
				(decodedText) => {
					if (scanner) {
						scanner.clear();
					}
					onScan(decodedText);
				},
				(error) => {
					console.log(error);
				},
			);
		}, 150);

		return () => {
			clearTimeout(timeout);
			if (scanner) {
				scanner
					.clear()
					.catch((err) =>
						console.error("Error al limpiar escáner", err),
					);
			}
		};
	}, [open, onScan]);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="xs"
			PaperProps={{ sx: { borderRadius: "1.25rem" } }}
		>
			<Box p={3} textAlign="center">
				<Typography variant="h6" fontWeight={900} mb={1}>
					Escanear Pase de Entrada
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={2}>
					Apunta la cámara al código QR del participante.
				</Typography>

				<Box
					id="reader"
					sx={{
						width: "100%",
						minHeight: 250,
						borderRadius: "1rem",
						overflow: "hidden",
						border: "2px solid #e2e8f0",
					}}
				/>

				<Stack mt={3}>
					<Button
						variant="outlined"
						color="error"
						fullWidth
						onClick={onClose}
						sx={{ fontWeight: 800, borderRadius: "1rem" }}
					>
						Cancelar Escaneo
					</Button>
				</Stack>
			</Box>
		</Dialog>
	);
}
