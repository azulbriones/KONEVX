const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Props = {
	brand?: string;
	ctaDisabled?: boolean;
	logo?: string | null;
	slug: string;
};

export function PublicNav({
	brand = "EventPlanner",
	logo,
	slug,
	ctaDisabled,
}: Props) {
	const label = ctaDisabled ? "Cupo lleno" : "Inscribirme ahora";

	return (
		<nav className="public-nav" aria-label="Navegación">
			<div className="public-brand">
				<div className="public-logo">
					{logo ? (
						<img
							src={`${API_URL}${logo}`}
							alt={slug}
							className="public-logo-image"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display =
									"none";
							}}
						/>
					) : (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: "100%",
								height: "100%",
								fontWeight: "bold",
								color: "var(--primary-color, #f97316)",
								backgroundColor:
									"var(--surface-color, #fef3c7)",
							}}
						>
							EP
						</div>
					)}
				</div>
				<span className="public-brand-name">{brand}</span>
			</div>

			<a
				className={`public-cta ${ctaDisabled ? "public-cta--disabled" : ""}`}
				href="#registro"
				aria-disabled={ctaDisabled ? "true" : undefined}
				tabIndex={ctaDisabled ? -1 : 0}
				onClick={(e) => {
					if (ctaDisabled) e.preventDefault();
				}}
				title={ctaDisabled ? "Cupo lleno" : undefined}
			>
				{label}
			</a>
		</nav>
	);
}
