import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	Chip,
	CircularProgress,
	IconButton,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteEvent, useSetPublish } from "../hooks/useEvents";
import { EventListItem } from "../types";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { EventActionsMenu } from "./EventActionsMenu";

export function EventCard({ event }: { event: EventListItem }) {
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const setPublishMutation = useSetPublish(event.id);
	const deleteMutation = useDeleteEvent();

	const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		setAnchorEl(e.currentTarget);
	};

	const handleConfirmDelete = () => {
		deleteMutation.mutate(event.id, {
			onSuccess: () => setShowDeleteModal(false),
		});
	};

	const isPending = setPublishMutation.isPending || deleteMutation.isPending;

	return (
		<Card sx={{ opacity: isPending ? 0.7 : 1 }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					p: 2,
					pb: 0,
				}}
			>
				<Chip
					label={event.isPublished ? "Publicado" : "Borrador"}
					color={event.isPublished ? "success" : "default"}
				/>
				<IconButton onClick={handleMenuOpen} disabled={isPending}>
					{isPending ? (
						<CircularProgress size={20} />
					) : (
						<MoreVertIcon />
					)}
				</IconButton>
			</Box>

			<CardActionArea onClick={() => navigate(`/events/${event.id}`)}>
				<CardContent>
					<Typography variant="h6" fontWeight={800}>
						{event.name}
					</Typography>
				</CardContent>
			</CardActionArea>

			<EventActionsMenu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				isPublished={event.isPublished}
				onView={() => navigate(`/events/${event.id}`)}
				onEdit={() => navigate(`/events/${event.id}/edit`)}
				onTogglePublish={() =>
					setPublishMutation.mutate(!event.isPublished)
				}
				onDelete={() => {
					setAnchorEl(null);
					setShowDeleteModal(true);
				}}
			/>

			<DeleteEventDialog
				open={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleConfirmDelete}
				eventName={event.name}
				isLoading={deleteMutation.isPending}
			/>
		</Card>
	);
}
