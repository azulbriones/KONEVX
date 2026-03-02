import BackpackIcon from "@mui/icons-material/Backpack";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export function PublicChecklist() {
	return (
		<section className="section" aria-label="Checklist">
			<div className="checklists">
				<div className="check-card good">
					<div className="check-head">
						<BackpackIcon htmlColor="#16a34a" />
						<span>¿Qué llevar?</span>
					</div>

					<ul className="list">
						{[
							"Identificación / comprobante",
							"Ropa y calzado cómodo",
							"Artículos de higiene personal",
							"Agua y/o snack ligero",
						].map((x) => (
							<li key={x}>
								<CheckCircleIcon
									fontSize="small"
									htmlColor="#16a34a"
								/>
								<span>{x}</span>
							</li>
						))}
					</ul>
				</div>

				<div className="check-card bad">
					<div className="check-head">
						<BlockIcon htmlColor="#ef4444" />
						<span>Evita traer</span>
					</div>

					<ul className="list">
						{[
							"Objetos de valor",
							"Alcohol u objetos prohibidos",
							"Cosas frágiles innecesarias",
						].map((x) => (
							<li key={x}>
								<ErrorOutlineIcon
									fontSize="small"
									htmlColor="#ef4444"
								/>
								<span>{x}</span>
							</li>
						))}
					</ul>

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
						<span>Revisa la info del evento antes de asistir.</span>
					</div>
				</div>
			</div>
		</section>
	);
}
