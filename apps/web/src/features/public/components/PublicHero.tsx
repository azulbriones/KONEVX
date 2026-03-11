import { env } from "@/config/env";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export function PublicHero({
	title,
	subtitle = "Completa tu registro para asegurar tu lugar.",
	tag = "EVENTO",
	ctaDisabled,
	ctaLabel = "¡Inscribirme!",
	backgroundImage,
	heroImage,
}: {
	title: string;
	subtitle?: string;
	tag?: string;
	ctaDisabled?: boolean;
	ctaLabel?: string;
	backgroundImage?: string | null;
	heroImage?: string | null;
}) {
	const bgUrl = backgroundImage
		? `${env.API_BASE_URL}${backgroundImage}`
		: null;
	const heroImgUrl = heroImage ? `${env.API_BASE_URL}${heroImage}` : null;

	return (
		<header
			className={`hero ${heroImgUrl ? "hero--with-image" : "hero--centered"}`}
			style={{
				backgroundImage: bgUrl
					? `linear-gradient(135deg, rgba(29, 78, 216, 0.85) 0%, rgba(37, 99, 235, 0.75) 50%, rgba(67, 56, 202, 0.95) 100%), url('${bgUrl}')`
					: "linear-gradient(135deg, rgba(29, 78, 216, 0.9) 0%, rgba(37, 99, 235, 0.9) 50%, rgba(67, 56, 202, 0.95) 100%)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundAttachment: "fixed",
			}}
		>
			<div className="hero-inner">
				<div className="hero-text">
					<div className="hero-tag">{tag}</div>

					<h1>{title}</h1>
					{subtitle ? <p>{subtitle}</p> : null}

					<div className="hero-actions">
						<a className="btn btn-secondary" href="#info">
							Saber más <ArrowForwardIcon fontSize="small" />
						</a>

						<a
							className={`btn btn-primary ${ctaDisabled ? "btn--disabled" : ""}`}
							href="#registro"
							aria-disabled={ctaDisabled ? "true" : undefined}
							tabIndex={ctaDisabled ? -1 : 0}
							onClick={(e) => {
								if (ctaDisabled) e.preventDefault();
							}}
							title={ctaDisabled ? "Cupo lleno" : undefined}
						>
							{ctaLabel} <ArrowForwardIcon fontSize="small" />
						</a>
					</div>
				</div>

				{heroImgUrl && (
					<div className="hero-image-wrapper">
						<div className="hero-image-card">
							<img
								src={heroImgUrl}
								alt="Imagen Principal del Evento"
								className="hero-floating-img"
							/>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
