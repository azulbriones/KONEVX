import { EventCard } from "@/features/events/components/EventCard";
import { useEvents } from "@/features/events/hooks/useEvents";
import { getErrorMessage } from "@/features/utils/getErrorMessage";

import { Add } from "@mui/icons-material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import {
	Box,
	Button,
	CircularProgress,
	Grid,
	Stack,
	Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
	const navigate = useNavigate();
	const { data, isLoading, isError, error } = useEvents();

	const goCreate = () => navigate("/events/new");

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "50vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box
				sx={{
					p: 3,
					bgcolor: "#fee2e2",
					borderRadius: 2,
					color: "#991b1b",
				}}
			>
				<Typography fontWeight="bold">
					Error al cargar los eventos:
				</Typography>
				<Typography variant="body2">
					{getErrorMessage(error)}
				</Typography>
			</Box>
		);
	}

	const events = data ?? [];

	return (
		<Stack spacing={4}>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				justifyContent="space-between"
				alignItems={{ xs: "flex-start", sm: "center" }}
				gap={2}
			>
				<Box>
					<Typography
						variant="h4"
						fontWeight={800}
						color="text.primary"
					>
						Mis Eventos
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Administra y supervisa todos tus registros.
					</Typography>
				</Box>

				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={goCreate}
					sx={{
						borderRadius: 2,
						px: 3,
						py: 1,
						textTransform: "none",
						fontSize: "1rem",
					}}
				>
					Nuevo Evento
				</Button>
			</Stack>

			{events.length > 0 ? (
				<Grid container spacing={3}>
					{events.map((e) => (
						<Grid item xs={12} sm={6} md={4} key={e.id}>
							<EventCard event={e} />
						</Grid>
					))}
				</Grid>
			) : (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						textAlign: "center",
						p: 6,
						bgcolor: "background.paper",
						borderRadius: 4,
						border: "2px dashed",
						borderColor: "divider",
						minHeight: "40vh",
					}}
				>
					<EventNoteIcon
						sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
					/>
					<Typography variant="h6" fontWeight={700} gutterBottom>
						Aún no tienes eventos
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
						sx={{ mb: 3, maxWidth: 400 }}
					>
						Crea tu primer evento para empezar a recibir registros y
						organizar a tus participantes.
					</Typography>
					<Button
						variant="outlined"
						startIcon={<Add />}
						onClick={goCreate}
						sx={{ borderRadius: 2 }}
					>
						Crear mi primer evento
					</Button>
				</Box>
			)}
		</Stack>
	);
}
