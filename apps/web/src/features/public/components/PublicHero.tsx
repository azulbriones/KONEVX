import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export function PublicHero({
	title,
	subtitle,
	tag = "EVENTO",
}: {
	title: string;
	subtitle?: string;
	tag?: string;
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
					<a className="btn btn-primary" href="#registro">
						¡Inscribirme! <ArrowForwardIcon fontSize="small" />
					</a>
				</div>
			</div>
		</header>
	);
}
