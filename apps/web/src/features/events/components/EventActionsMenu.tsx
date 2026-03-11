import {
	Delete,
	Edit,
	Public,
	Unpublished,
	Visibility,
} from "@mui/icons-material";
import { Divider, ListItemIcon, Menu, MenuItem } from "@mui/material";

type Props = {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
	isPublished: boolean;
	onView: () => void;
	onEdit: () => void;
	onTogglePublish: () => void;
	onDelete: () => void;
};

export function EventActionsMenu({
	anchorEl,
	open,
	onClose,
	isPublished,
	onView,
	onEdit,
	onTogglePublish,
	onDelete,
}: Props) {
	return (
		<Menu
			anchorEl={anchorEl}
			open={open}
			onClose={onClose}
			transformOrigin={{ horizontal: "right", vertical: "top" }}
			anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
		>
			<MenuItem onClick={onView}>
				<ListItemIcon>
					<Visibility fontSize="small" />
				</ListItemIcon>
				Ver evento
			</MenuItem>
			<MenuItem onClick={onEdit}>
				<ListItemIcon>
					<Edit fontSize="small" />
				</ListItemIcon>
				Editar
			</MenuItem>
			<Divider />
			<MenuItem onClick={onTogglePublish}>
				<ListItemIcon>
					{isPublished ? (
						<Unpublished fontSize="small" />
					) : (
						<Public fontSize="small" />
					)}
				</ListItemIcon>
				{isPublished ? "Despublicar" : "Publicar"}
			</MenuItem>
			<MenuItem onClick={onDelete} sx={{ color: "error.main" }}>
				<ListItemIcon>
					<Delete fontSize="small" color="error" />
				</ListItemIcon>
				Eliminar
			</MenuItem>
		</Menu>
	);
}
