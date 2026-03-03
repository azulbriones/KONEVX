import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export function PublicHero({
	title,
	subtitle,
	tag = "EVENTO",
	ctaDisabled,
	ctaLabel = "¡Inscribirme!",
}: {
	title: string;
	subtitle?: string;
	tag?: string;
	ctaDisabled?: boolean;
	ctaLabel?: string;
}) {
	return (
		<header className="hero">
			<div className="hero-inner">
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
		</header>
	);
}
