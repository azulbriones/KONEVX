import BackpackIcon from "@mui/icons-material/Backpack";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

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
			<div className="checklists">
				<div className="check-card good">
					<div className="check-head">
						<BackpackIcon htmlColor="#16a34a" />
						<span>¿Qué llevar?</span>
					</div>

					<ul className="list">
						{bringList.length > 0 ? (
							bringList.map((item, index) => (
								<li key={index}>
									<CheckCircleIcon
										fontSize="small"
										htmlColor="#16a34a"
									/>
									<span>{item}</span>
								</li>
							))
						) : (
							<li>
								<span>No hay indicaciones específicas.</span>
							</li>
						)}
					</ul>
				</div>

				<div className="check-card bad">
					<div className="check-head">
						<BlockIcon htmlColor="#ef4444" />
						<span>Evita traer</span>
					</div>

					<ul className="list">
						{avoidList.length > 0 ? (
							avoidList.map((item, index) => (
								<li key={index}>
									<ErrorOutlineIcon
										fontSize="small"
										htmlColor="#ef4444"
									/>
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
						<div
							style={{
								marginTop: "1.25rem",
								background: "#fffbeb",
								padding: "1rem",
								borderRadius: "1rem",
								border: "1px solid #fef3c7",
								display: "flex",
								gap: "0.6rem",
								alignItems: "center",
								color: "#92400e",
								fontWeight: 800,
							}}
						>
							<InfoOutlinedIcon htmlColor="#92400e" />
							<span>{note}</span>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
