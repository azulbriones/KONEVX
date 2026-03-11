import {
	BarChart,
	CalendarMonth,
	Description,
	LocationOn,
	OpenInNew,
	People,
	Person,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	Grid,
	Stack,
	Typography,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import InfoRow from "../components/InfoRow";
import StatCard from "../components/StatCard";
import type { Ctx } from "../types";

const CONTACT_LABELS: Record<string, string> = {
	EMAIL: "Correo electrónico",
	PHONE: "Teléfono",
};

export function EventOverviewPage() {
	const { event, stats } = useOutletContext<Ctx>();

	const formatDate = (dateString?: Date | string | null) => {
		if (!dateString) return "No definida";
		return new Intl.DateTimeFormat("es-MX", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(dateString));
	};

	return (
		<Stack spacing={4}>
			<Stack
				direction="row"
				justifyContent="flex-end"
				alignItems="center"
			>
				<Button
					variant="outlined"
					startIcon={<OpenInNew />}
					href={`/e/${event.slug}`}
					target="_blank"
					sx={{ borderRadius: 2, fontWeight: 600 }}
				>
					Ver página pública
				</Button>
			</Stack>

			<Grid container spacing={3}>
				<Grid item xs={12} sm={4}>
					<StatCard
						title="Registros"
						value={stats.registrationsCount}
						icon={<People sx={{ color: "#3b82f6" }} />}
						bgColor="#eff6ff"
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<StatCard
						title="Ocupación"
						value={`${stats.occupancy ?? 0}%`}
						icon={<BarChart sx={{ color: "#10b981" }} />}
						bgColor="#ecfdf5"
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<StatCard
						title="Campos Config."
						value={stats.fieldsCount}
						icon={<Description sx={{ color: "#f59e0b" }} />}
						bgColor="#fffbeb"
					/>
				</Grid>
			</Grid>

			<Grid container spacing={3}>
				<Grid item xs={12} md={7}>
					<Card
						variant="outlined"
						sx={{ height: "100%", borderRadius: 3 }}
					>
						<CardContent sx={{ p: 3 }}>
							<Typography
								variant="h6"
								fontWeight={800}
								gutterBottom
							>
								Información General
							</Typography>
							<Divider sx={{ mb: 3 }} />

							<Stack spacing={3}>
								<InfoRow
									icon={<Person color="action" />}
									label="Organizador"
									value={
										event.organizerName || "No especificado"
									}
								/>
								<InfoRow
									icon={<LocationOn color="action" />}
									label="Ubicación"
									value={event.location || "No especificada"}
								/>
								<InfoRow
									icon={<CalendarMonth color="action" />}
									label="Inicio del evento"
									value={formatDate(event.startDate)}
								/>
								<Box>
									<Typography
										variant="subtitle2"
										color="text.secondary"
										gutterBottom
									>
										Descripción corta
									</Typography>
									<Typography
										variant="body2"
										sx={{
											display: "-webkit-box",
											WebkitLineClamp: 3,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
										}}
									>
										{event.description ||
											"Sin descripción."}
									</Typography>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={5}>
					<Card
						variant="outlined"
						sx={{
							height: "100%",
							borderRadius: 3,
							bgcolor: "background.default",
						}}
					>
						<CardContent sx={{ p: 3 }}>
							<Typography
								variant="h6"
								fontWeight={800}
								gutterBottom
							>
								Configuración Técnica
							</Typography>
							<Divider sx={{ mb: 3 }} />

							<Stack spacing={3}>
								<Box>
									<Typography
										variant="subtitle2"
										color="text.secondary"
									>
										Slug (URL)
									</Typography>
									<Chip
										label={`/e/${event.slug}`}
										size="small"
										sx={{
											mt: 0.5,
											fontWeight: 600,
											fontFamily: "monospace",
										}}
									/>
								</Box>

								<Grid container spacing={2}>
									<Grid item xs={6}>
										<Typography
											variant="subtitle2"
											color="text.secondary"
										>
											Capacidad Máxima
										</Typography>
										<Typography
											variant="body1"
											fontWeight={600}
										>
											{event.capacity} personas
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography
											variant="subtitle2"
											color="text.secondary"
										>
											Requisito de Contacto
										</Typography>
										<Typography
											variant="body1"
											fontWeight={600}
											sx={{ textTransform: "capitalize" }}
										>
											{CONTACT_LABELS[
												event.contactRequirement
											] || event.contactRequirement}
										</Typography>
									</Grid>
								</Grid>

								<Box>
									<Typography
										variant="subtitle2"
										color="text.secondary"
									>
										ID Interno
									</Typography>
									<Typography
										variant="body2"
										color="text.disabled"
										sx={{ fontFamily: "monospace" }}
									>
										#{event.id}
									</Typography>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Stack>
	);
}
