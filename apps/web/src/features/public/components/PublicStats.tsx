import EventSeatIcon from "@mui/icons-material/EventSeat";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PeopleIcon from "@mui/icons-material/People";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";

import type { ContactRequirement } from "../types";

function getRemainingBadge(remaining: number) {
	if (remaining <= 0) return { text: "Cupo lleno", tone: "danger" as const };
	if (remaining <= 10)
		return { text: "Últimos lugares", tone: "warning" as const };
	return { text: `Quedan ${remaining} lugares`, tone: "success" as const };
}

export function PublicStats({
	capacity,
	remaining,
	contactRequirement,
}: {
	capacity: number;
	remaining: number;
	contactRequirement: ContactRequirement;
}) {
	const contactText =
		contactRequirement === "EMAIL"
			? "Email requerido"
			: "Teléfono requerido";

	const badge = getRemainingBadge(remaining);

	return (
		<section className="stats" aria-label="Detalles del evento">
			<div className="stat-card">
				<div style={{ display: "flex", justifyContent: "center" }}>
					<PeopleIcon htmlColor="#f97316" />
				</div>
				<div className="stat-label">Cupo</div>
				<div className="stat-value">{capacity}</div>
			</div>

			<div className="stat-card">
				<div style={{ display: "flex", justifyContent: "center" }}>
					<EventSeatIcon htmlColor="#f97316" />
				</div>
				<div className="stat-label">Disponibilidad</div>

				<div className="stat-value">
					<span className={`badge badge--${badge.tone}`}>
						{badge.text}
					</span>
				</div>

				<div className="stat-hint">
					{remaining <= 0
						? "Ya no hay lugares disponibles."
						: "¡Aparta tu lugar!"}
				</div>
			</div>

			<div className="stat-card">
				<div style={{ display: "flex", justifyContent: "center" }}>
					{contactRequirement === "EMAIL" ? (
						<MailOutlineIcon htmlColor="#f97316" />
					) : (
						<PhoneIphoneIcon htmlColor="#f97316" />
					)}
				</div>
				<div className="stat-label">Contacto</div>
				<div className="stat-value">{contactText}</div>
			</div>
		</section>
	);
}
