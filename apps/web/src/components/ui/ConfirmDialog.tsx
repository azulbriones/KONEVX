import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from "@mui/material";

type Props = {
	open: boolean;
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	loading?: boolean;
	onConfirm: () => void;
	onClose: () => void;
};

export function ConfirmDialog({
	open,
	title,
	description,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	loading,
	onConfirm,
	onClose,
}: Props) {
	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle fontWeight={800}>{title}</DialogTitle>
			<DialogContent>
				{description && (
					<Typography color="text.secondary">
						{description}
					</Typography>
				)}
			</DialogContent>
			<DialogActions sx={{ p: 2, pt: 0 }}>
				<Button onClick={onClose} disabled={loading}>
					{cancelText}
				</Button>
				<Button
					variant="contained"
					onClick={onConfirm}
					disabled={loading}
				>
					{loading ? "Procesando..." : confirmText}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
