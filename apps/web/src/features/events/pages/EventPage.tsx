import { useEvent, useSetPublish } from "@/features/events/hooks/useEvents";
import { getErrorMessage } from "@/features/utils/getErrorMessage";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Divider,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export function EventPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();

	const id = Number(eventId);
	const { data, isLoading, isError, error } = useEvent(id);
	const publishMutation = useSetPublish(id);

	if (!Number.isFinite(id)) {
		return <Typography color="error">EventId inválido</Typography>;
	}

	if (isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return <Typography color="error">{getErrorMessage(error)}</Typography>;
	}

	if (!data) return null;

	const { event, stats } = data;

	const togglePublish = () => {
		publishMutation.mutate(!event.isPublished);
	};

	const go = (path: string) => navigate(path);

	return (
		<Stack spacing={2.5}>
			{/* Header */}
			<Stack
				direction="row"
				alignItems="center"
				spacing={1}
				justifyContent="space-between"
			>
				<Stack direction="row" alignItems="center" spacing={1}>
					<Typography variant="h4" fontWeight={800}>
						{event.name}
					</Typography>
					<Chip
						size="small"
						label={event.isPublished ? "Publicado" : "Borrador"}
						color={event.isPublished ? "success" : "default"}
					/>
				</Stack>

				<Button
					variant="contained"
					onClick={togglePublish}
					disabled={publishMutation.isPending}
				>
					{publishMutation.isPending
						? "Guardando..."
						: event.isPublished
							? "Pasar a borrador"
							: "Publicar"}
				</Button>
			</Stack>

			{publishMutation.isError && (
				<Typography color="error">
					{getErrorMessage(publishMutation.error)}
				</Typography>
			)}

			<Typography color="text.secondary">
				slug: <b>{event.slug}</b> · capacidad: <b>{event.capacity}</b> ·
				contacto: <b>{event.contactRequirement}</b>
			</Typography>

			<Divider />

			{/* Quick actions / navigation */}
			<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
				<Stack spacing={1.5}>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						spacing={1.5}
					>
						<Button
							variant="outlined"
							onClick={() =>
								go(`/events/${event.id}/registrations`)
							}
						>
							Ver registros
						</Button>

						<Button
							variant="outlined"
							onClick={() => go(`/events/${event.id}/fields`)}
						>
							Configurar campos
						</Button>

						<Button
							variant="outlined"
							onClick={() => go(`/events/${event.id}/members`)}
						>
							Administrar miembros
						</Button>
					</Stack>
				</Stack>
			</Paper>

			{/* Summary */}
			<Typography variant="h6" fontWeight={700}>
				Resumen
			</Typography>

			<Typography color="text.secondary">
				Fields: <b>{stats.fieldsCount}</b> · Registrations:{" "}
				<b>{stats.registrationsCount}</b> · Occupancy:{" "}
				<b>{stats.occupancy ?? "-"}</b>
				{stats.occupancy != null ? "%" : ""}
			</Typography>
		</Stack>
	);
}
