type Props = {
	brand?: string;
	ctaDisabled?: boolean;
};

export function PublicNav({ brand = "EventPlanner", ctaDisabled }: Props) {
	const label = ctaDisabled ? "Cupo lleno" : "Inscribirme ahora";

	return (
		<nav className="public-nav" aria-label="Navegación">
			<div className="public-brand">
				<div className="public-logo">EP</div>
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
