import {
	Card,
	CardActionArea,
	CardContent,
	Chip,
	Stack,
	Typography,
} from "@mui/material";
import type { EventListItem } from "../types";

type Props = {
	event: EventListItem;
	onClick: () => void;
};

export function EventCard({ event, onClick }: Props) {
	return (
		<Card variant="outlined">
			<CardActionArea onClick={onClick}>
				<CardContent>
					<Stack spacing={1}>
						<Stack direction="row" spacing={1} alignItems="center">
							<Typography
								variant="h6"
								fontWeight={700}
								sx={{ flexGrow: 1 }}
							>
								{event.name}
							</Typography>

							<Chip
								size="small"
								label={
									event.isPublished ? "Publicado" : "Borrador"
								}
								color={
									event.isPublished ? "success" : "default"
								}
							/>
						</Stack>

						<Typography variant="body2" color="text.secondary">
							slug: <b>{event.slug}</b>
						</Typography>

						<Typography variant="body2" color="text.secondary">
							capacidad: <b>{event.capacity}</b> · contacto:{" "}
							<b>{event.contactRequirement}</b>
						</Typography>

						<Typography variant="caption" color="text.secondary">
							creado: {new Date(event.createdAt).toLocaleString()}
						</Typography>
					</Stack>
				</CardContent>
			</CardActionArea>
		</Card>
	);
}
