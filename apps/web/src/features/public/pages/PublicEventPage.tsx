import { getErrorMessage } from "@/features/utils/getErrorMessage";
import { CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";

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

	const { data, isLoading, isError, error } = usePublicEvent(eventSlug);

	if (!eventSlug) {
		return (
			<div className="public-page">
				<div className="section">
					<h2 style={{ fontWeight: 950 }}>Slug inválido</h2>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="public-page">
				<div
					className="section"
					style={{ display: "flex", justifyContent: "center" }}
				>
					<CircularProgress />
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="public-page">
				<div className="section">
					<h2 style={{ fontWeight: 950 }}>
						No pudimos cargar el evento
					</h2>
					<p
						style={{
							color: "#b91c1c",
							marginTop: "0.75rem",
							fontWeight: 800,
						}}
					>
						{getErrorMessage(error)}
					</p>
				</div>
			</div>
		);
	}

	if (!data) return null;

	const { event, fields } = data;

	const canRegister = event.remaining > 0;
	const isFull = event.remaining <= 0;

	return (
		<div className="public-page">
			<PublicNav brand="EventPlanner" ctaDisabled={isFull} />

			<PublicHero
				tag="EVENTO"
				title={event.name}
				subtitle="Completa tu registro para asegurar tu lugar."
				ctaDisabled={isFull}
				ctaLabel={isFull ? "Cupo lleno" : "¡Inscribirme!"}
			/>

			<div className="section section-tight">
				<PublicAvailabilityBanner
					capacity={event.capacity}
					remaining={event.remaining}
				/>
			</div>

			<PublicStats
				capacity={event.capacity}
				remaining={event.remaining}
				contactRequirement={event.contactRequirement}
			/>

			<PublicGallery />
			<PublicChecklist />

			<PublicRegisterForm
				slug={event.slug}
				contactRequirement={event.contactRequirement}
				fields={fields}
				disabled={!canRegister}
			/>

			<PublicFooter />
		</div>
	);
}
