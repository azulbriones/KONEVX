import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

type Props = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	eventName: string;
	isLoading: boolean;
};

export function DeleteEventDialog({
	open,
	onClose,
	onConfirm,
	eventName,
	isLoading,
}: Props) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			PaperProps={{ sx: { borderRadius: 3 } }}
		>
			<DialogTitle sx={{ fontWeight: 800 }}>
				¿Eliminar evento?
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Estás a punto de eliminar <strong>{eventName}</strong>. Esta
					acción borrará permanentemente todos los registros
					asociados.
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ p: 2, gap: 1 }}>
				<Button onClick={onClose} color="inherit" disabled={isLoading}>
					Cancelar
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color="error"
					disabled={isLoading}
					startIcon={
						isLoading && (
							<CircularProgress size={16} color="inherit" />
						)
					}
				>
					{isLoading ? "Eliminando..." : "Sí, eliminar"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
