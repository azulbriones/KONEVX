import { Box, Button, Dialog, Stack, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export function QRScannerDialog({ open, onClose, onScan }: any) {
	useEffect(() => {
		if (!open) return;

		const scanner = new Html5QrcodeScanner(
			"reader",
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			/* verbose= */ false,
		);

		scanner.render(
			(decodedText) => {
				scanner.clear();
				onScan(decodedText);
			},
			(error) => {
				console.log(error);
			},
		);

		return () => {
			scanner
				.clear()
				.catch((error) =>
					console.error("Error al limpiar el escáner", error),
				);
		};
	}, [open, onScan]);

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
			<Box p={3} textAlign="center">
				<Typography variant="h6" fontWeight={900} mb={2}>
					Escanear Pase de Entrada
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={2}>
					Apunta la cámara al código QR del participante.
				</Typography>

				<Box
					id="reader"
					sx={{
						width: "100%",
						borderRadius: "1rem",
						overflow: "hidden",
					}}
				/>

				<Stack mt={3}>
					<Button
						variant="outlined"
						color="error"
						fullWidth
						onClick={onClose}
						sx={{ fontWeight: 800 }}
					>
						Cancelar Escaneo
					</Button>
				</Stack>
			</Box>
		</Dialog>
	);
}
