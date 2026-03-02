import EventSeatIcon from "@mui/icons-material/EventSeat";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PeopleIcon from "@mui/icons-material/People";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";

import type { ContactRequirement } from "../types";

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
				<div className="stat-label">Lugares</div>
				<div className="stat-value">{remaining} disponibles</div>
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
