import { env } from "@/config/env";

type Props = {
	brand?: string;
	ctaDisabled?: boolean;
	logo?: string | null;
	slug: string;
};

export function PublicNav({
	brand = "Konevx",
	logo,
	slug,
	ctaDisabled,
}: Props) {
	const label = ctaDisabled ? "Cupo lleno" : "Inscribirme ahora";
	const placeholder = brand.trim().slice(0, 2).toUpperCase() || "KV";

	return (
		<nav className="public-nav" aria-label="Navegación">
			<div className="public-brand">
				<div className="public-logo">
					{logo ? (
						<img
							src={`${env.API_BASE_URL}${logo}`}
							alt={slug}
							className="public-logo-image"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display =
									"none";
							}}
							/>
					) : (
						<div className="public-logo-placeholder">{placeholder}</div>
					)}
				</div>
				<div>
					<span className="public-brand-name">{brand}</span>
					<div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
						{slug}
					</div>
				</div>
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
