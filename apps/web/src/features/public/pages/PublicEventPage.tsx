import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { useNavigate } from "react-router-dom";
import { PublicAvailabilityBanner } from "../components/PublicAvailabilityBanner";
import { PublicChecklist } from "../components/PublicChecklist";
import { PublicFooter } from "../components/PublicFooter";
import { PublicGallery } from "../components/PublicGallery";
import { PublicHero } from "../components/PublicHero";
import { PublicNav } from "../components/PublicNav";
import { PublicRegisterForm } from "../components/PublicRegisterForm";
import { PublicStats } from "../components/PublicStats";
import { usePublicEvent } from "../hooks/usePublicEvent";

import "../styles/publicEvent.css";

export function PublicEventPage() {
	const { slug } = useParams<{ slug: string }>();
	const eventSlug = slug ?? "";
	const navigate = useNavigate();

	const { data, isLoading, isError, error } = usePublicEvent(eventSlug);

	if (!eventSlug || (isError && error?.response?.status === 404)) {
		return (
			<div className="main-bg">
				<div className="not-found-container">
					<SearchOffIcon
						className="error-icon"
						sx={{ fontSize: 80 }}
					/>
					<h2>Evento no encontrado</h2>
					<p className="subtitle">
						Lo sentimos, el evento que buscas no existe o el enlace
						es incorrecto.
					</p>
					<button
						className="btn-submit"
						onClick={() => navigate("/")}
					>
						<ArrowBackIcon fontSize="small" />
						Volver al inicio
					</button>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="main-bg">
				<div className="not-found-container">
					<CircularProgress
						size={60}
						thickness={5}
						sx={{ color: "var(--primary)", mb: 4 }}
					/>
					<h2>Cargando evento...</h2>
					<p className="subtitle">
						Preparando la experiencia para ti.
					</p>
				</div>
			</div>
		);
	}

	if (isError) {
		const rawError = getErrorMessage(error);
		let friendlyMessage = "Hubo un error al conectar con el servidor.";

		if (rawError.toLowerCase().includes("not found")) {
			friendlyMessage = "El evento no fue encontrado.";
		} else if (rawError.toLowerCase().includes("network error")) {
			friendlyMessage = "Error de red. Revisa tu conexión a internet.";
		}

		return (
			<div className="main-bg">
				<div className="not-found-container">
					<ErrorOutlineIcon
						className="error-icon"
						sx={{ fontSize: 80, color: "#ef4444" }}
					/>
					<h2>Algo salió mal</h2>
					<p className="subtitle">{friendlyMessage}</p>
					<button
						className="btn-submit"
						onClick={() => window.location.reload()}
					>
						<RefreshIcon fontSize="small" />
						Reintentar
					</button>
				</div>
			</div>
		);
	}

	if (!data) return null;

	const { event, fields } = data;

	const canRegister = event.remaining > 0;
	const isFull = event.remaining <= 0;
	console.log({ event });

	return (
		<div className="public-page">
			<PublicNav
				brand={event?.organizerName}
				logo={event?.logo}
				slug={event.slug}
				ctaDisabled={isFull}
			/>

			<PublicHero
				tag={event?.name}
				title={event?.slogan || event?.name || ""}
				subtitle={event?.description}
				ctaDisabled={isFull}
				ctaLabel={isFull ? "Cupo lleno" : "¡Inscribirme!"}
				backgroundImage={event.backgroundImage}
				heroImage={event.heroImage}
			/>

			<div className="section section-tight">
				<PublicAvailabilityBanner
					capacity={event.capacity}
					remaining={event.remaining}
				/>
			</div>

			<PublicStats
				startDate={event.startDate}
				endDate={event.endDate}
				location={event.location}
				entryTime={event.entryTime}
				cost={event.cost}
				minAge={event.minAge}
				remaining={event.remaining}
			/>

			<PublicGallery
				promotionalVideo={event.promotionalVideo}
				promotionalImages={event.promotionalImages}
			/>

			<PublicChecklist
				thingsToBring={event.thingsToBring}
				thingsNotToBring={event.thingsNotToBring}
				note={event.note}
			/>

			<PublicRegisterForm
				slug={event.slug}
				contactRequirement={event.contactRequirement}
				fields={fields}
				disabled={!canRegister}
			/>

			<PublicFooter
				footerDescription={event.footerDescription}
				contactInfo={event.contactInfo}
				socialMediaInfo={event.socialMediaInfo}
				hashtag={event.hashtag}
			/>
		</div>
	);
}
