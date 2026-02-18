import { EventCard } from "@/features/events/components/EventCard";
import { useEvents } from "@/features/events/hooks/useEvents";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { Add } from "@mui/icons-material";
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

	return (
		<Stack spacing={3}>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
			>
				<Typography variant="h4" fontWeight={800}>
					Eventos
				</Typography>

				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={() => navigate("/events/new")}
				>
					Crear evento
				</Button>
			</Stack>

			{isLoading && (
				<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
					<CircularProgress />
				</Box>
			)}

			{isError && (
				<Typography color="error">{getErrorMessage(error)}</Typography>
			)}

			{data && data.length === 0 && (
				<Typography color="text.secondary">
					Aún no tienes eventos. Crea el primero.
				</Typography>
			)}

			{data && data.length > 0 && (
				<Grid container spacing={2}>
					{data.map((ev) => (
						<Grid key={ev.id} item xs={12} sm={6} md={4}>
							<EventCard
								event={ev}
								onClick={() => navigate(`/events/${ev.id}`)}
							/>
						</Grid>
					))}
				</Grid>
			)}
		</Stack>
	);
}
