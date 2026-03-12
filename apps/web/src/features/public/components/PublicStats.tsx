import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
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
		month: "short",
	}).format(date);
}

export function PublicStats({
	startDate,
	endDate,
	location,
	entryTime,
	cost,
	minAge,
	remaining,
}: {
	startDate?: string | null;
	endDate?: string | null;
	location?: string | null;
	entryTime?: string | null;
	cost?: number | null;
	minAge?: number | null;
	remaining: number;
}) {
	const badge = getRemainingBadge(remaining);

	const dateDisplay =
		startDate && endDate
			? `${formatDate(startDate)} - ${formatDate(endDate)}`
			: formatDate(startDate);

	return (
		<section className="stats" aria-label="Detalles del evento">
			<div className="stat-card">
				<div style={{ display: "flex", justifyContent: "center" }}>
					<CalendarTodayIcon htmlColor="#f97316" />
				</div>
				<div className="stat-label">Fecha</div>
				<div className="stat-value" style={{ fontSize: "1.1rem" }}>
					{/* Puedes reemplazar dateDisplay por "30, 31 de Mar y 1 de Abr" si prefieres el texto fijo */}
					{dateDisplay}
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
					<AccessTimeIcon htmlColor="#f97316" />
				</div>
				<div className="stat-label">Entrada</div>
				<div className="stat-value">
					{entryTime ? entryTime : "Por definir"}
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
