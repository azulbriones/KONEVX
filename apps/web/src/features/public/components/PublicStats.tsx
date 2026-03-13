import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import FaceIcon from "@mui/icons-material/Face";
import PeopleIcon from "@mui/icons-material/People";
import PlaceIcon from "@mui/icons-material/Place";

function getRemainingBadge(remaining: number) {
	if (remaining <= 0) return { text: "Cupo lleno", tone: "danger" as const };
	if (remaining <= 10)
		return { text: "Últimos lugares", tone: "warning" as const };
	return { text: "¡Limitado!", tone: "success" as const };
}

function formatDate(dateString?: string | null) {
	if (!dateString) return "Por definir";

	const date = new Date(dateString);
	date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

	return new Intl.DateTimeFormat("es-MX", {
		day: "numeric",
		month: "long",
	}).format(date);
}

function formatTime(time?: string | null) {
	if (!time) return null;

	const [hours, minutes] = time.split(":").map(Number);

	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return null;
	}

	const date = new Date();
	date.setHours(hours, minutes, 0, 0);

	return new Intl.DateTimeFormat("es-MX", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	}).format(date);
}

function getDateTimeParts(dateString?: string | null, time?: string | null) {
	return {
		date: formatDate(dateString),
		time: formatTime(time) ?? "Por definir",
	};
}

export function PublicStats({
	startDate,
	endDate,
	location,
	entryTime,
	exitTime,
	cost,
	minAge,
	remaining,
}: {
	startDate?: string | null;
	endDate?: string | null;
	location?: string | null;
	entryTime?: string | null;
	exitTime?: string | null;
	cost?: number | null;
	minAge?: number | null;
	remaining: number;
}) {
	const badge = getRemainingBadge(remaining);

	const entry = getDateTimeParts(startDate, entryTime);
	const exit = getDateTimeParts(endDate, exitTime);

	return (
		<section className="stats" aria-label="Detalles del evento">
			<div className="stat-card">
				<div style={{ display: "flex", justifyContent: "center" }}>
					<AccessTimeIcon htmlColor="#f97316" />
				</div>
				<div className="stat-label">Fecha de entrada</div>
				<div className="stat-value stat-value--stacked">
					<span className="stat-date">{entry.date}</span>
					<span className="stat-time">{entry.time}</span>
				</div>
			</div>

			<div className="stat-card">
				<div style={{ display: "flex", justifyContent: "center" }}>
					<AccessTimeIcon htmlColor="#f97316" />
				</div>
				<div className="stat-label">Santa misa de clausura</div>
				<div className="stat-value stat-value--stacked">
					<span className="stat-date">{exit.date}</span>
					<span className="stat-time">{exit.time}</span>
				</div>
				<div className="stat-sub">
					Familiares invitados a acompañar a los jóvenes
				</div>
			</div>

			<div className="stat-card">
				<div style={{ display: "flex", justifyContent: "center" }}>
					<PlaceIcon htmlColor="#f97316" />
				</div>
				<div className="stat-label">Lugar</div>
				<div className="stat-value" style={{ fontSize: "1.1rem" }}>
					{location || "Por definir"}
				</div>
			</div>

			<div className="stat-card">
				<div style={{ display: "flex", justifyContent: "center" }}>
					<ConfirmationNumberIcon htmlColor="#f97316" />
				</div>
				<div className="stat-label">Donativo</div>
				<div className="stat-value">
					{cost ? `$${cost} MXN` : "Gratis"}
				</div>
				<div className="stat-sub">El pago se realiza al ingresar.</div>
			</div>

			<div className="stat-card">
				<div style={{ display: "flex", justifyContent: "center" }}>
					<FaceIcon htmlColor="#f97316" />
				</div>
				<div className="stat-label">Edad</div>
				<div className="stat-value">
					{minAge ? `${minAge} años +` : "Todas las edades"}
				</div>
			</div>

			<div className="stat-card">
				<div style={{ display: "flex", justifyContent: "center" }}>
					<PeopleIcon htmlColor="#f97316" />
				</div>
				<div className="stat-label">Cupo</div>
				<div className="stat-value">
					<span className={`badge badge--${badge.tone}`}>
						{badge.text}
					</span>
				</div>
			</div>
		</section>
	);
}
