import { Add } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardActionArea,
	CardContent,
	Chip,
	CircularProgress,
	Grid,
	Stack,
	Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useEvents } from "@/features/events/hooks/useEvents";
import { getErrorMessage } from "@/features/utils/getErrorMessage";

export function DashboardPage() {
	const navigate = useNavigate();
	const { data, isLoading, isError, error } = useEvents();

	const goCreate = () => navigate("/events/new");

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

	const events = data ?? [];

	return (
		<Stack spacing={3}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				gap={2}
			>
				<Typography variant="h4" fontWeight={800}>
					Dashboard
				</Typography>

				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={goCreate}
				>
					Crear evento
				</Button>
			</Stack>

			<Grid container spacing={2}>
				{events.map((e) => (
					<Grid item xs={12} sm={6} md={4} key={e.id}>
						<Card variant="outlined" sx={{ borderRadius: 3 }}>
							<CardActionArea
								onClick={() => navigate(`/events/${e.id}`)}
							>
								<CardContent>
									<Stack spacing={1}>
										<Stack
											direction="row"
											alignItems="center"
											justifyContent="space-between"
											gap={1}
										>
											<Typography fontWeight={800} noWrap>
												{e.name}
											</Typography>
											<Chip
												size="small"
												label={
													e.isPublished
														? "Publicado"
														: "Borrador"
												}
												color={
													e.isPublished
														? "success"
														: "default"
												}
											/>
										</Stack>

										<Typography
											variant="body2"
											color="text.secondary"
										>
											slug: <b>{e.slug}</b>
										</Typography>

										<Typography
											variant="body2"
											color="text.secondary"
										>
											capacidad: <b>{e.capacity}</b> ·
											contacto:{" "}
											<b>{e.contactRequirement}</b>
										</Typography>
									</Stack>
								</CardContent>
							</CardActionArea>
						</Card>
					</Grid>
				))}
			</Grid>

			{events.length === 0 && (
				<Typography color="text.secondary">
					No tienes eventos aún. Crea tu primer evento.
				</Typography>
			)}
		</Stack>
	);
}
