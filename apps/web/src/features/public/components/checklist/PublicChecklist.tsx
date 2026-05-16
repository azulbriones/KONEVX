import BackpackIcon from "@mui/icons-material/Backpack";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Paper, Stack, Typography } from "@mui/material";

export function PublicChecklist({
	thingsToBring,
	thingsNotToBring,
	note,
}: {
	thingsToBring?: string | null;
	thingsNotToBring?: string | null;
	note?: string | null;
}) {
	const bringList = thingsToBring
		? thingsToBring
				.split("\n")
				.map((item) => item.trim())
				.filter(Boolean)
		: [
				"Identificación / comprobante",
				"Ropa y calzado cómodo",
				"Agua y/o snack ligero",
			];

	const avoidList = thingsNotToBring
		? thingsNotToBring
				.split("\n")
				.map((item) => item.trim())
				.filter(Boolean)
		: ["Objetos de valor", "Alcohol u objetos prohibidos"];

	return (
		<section className="section" aria-label="Checklist">
			<Box className="checklists">
				<Paper variant="outlined" className="check-card good" sx={{ p: 3, borderRadius: 4 }}>
					<Stack direction="row" alignItems="center" spacing={1.25} mb={2}>
						<BackpackIcon htmlColor="#16a34a" />
						<Typography variant="h6" fontWeight={900}>
							¿Qué llevar?
						</Typography>
					</Stack>

					<ul className="list">
						{bringList.length > 0 ? (
							bringList.map((item, index) => (
								<li key={index}>
									<CheckCircleIcon fontSize="small" htmlColor="#16a34a" />
									<span>{item}</span>
								</li>
							))
						) : (
							<li>
								<span>No hay indicaciones específicas.</span>
							</li>
						)}
					</ul>
				</Paper>

				<Paper variant="outlined" className="check-card bad" sx={{ p: 3, borderRadius: 4 }}>
					<Stack direction="row" alignItems="center" spacing={1.25} mb={2}>
						<BlockIcon htmlColor="#ef4444" />
						<Typography variant="h6" fontWeight={900}>
							Evita traer
						</Typography>
					</Stack>

					<ul className="list">
						{avoidList.length > 0 ? (
							avoidList.map((item, index) => (
								<li key={index}>
									<ErrorOutlineIcon fontSize="small" htmlColor="#ef4444" />
									<span>{item}</span>
								</li>
							))
						) : (
							<li>
								<span>No hay restricciones específicas.</span>
							</li>
						)}
					</ul>

					{note && (
						<Box
							sx={{
								mt: 2,
								background: "#fffbeb",
								p: 2,
								borderRadius: 3,
								border: "1px solid #fef3c7",
								display: "flex",
								gap: 1,
								alignItems: "center",
								color: "#92400e",
								fontWeight: 800,
							}}
						>
							<InfoOutlinedIcon htmlColor="#92400e" />
							<span>{note}</span>
						</Box>
					)}
				</Paper>
			</Box>
		</section>
	);
}
