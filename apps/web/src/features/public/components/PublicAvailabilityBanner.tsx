type Props = {
	capacity: number;
	remaining: number;
};

export function PublicAvailabilityBanner({ capacity, remaining }: Props) {
	const lowThreshold = Math.max(5, Math.ceil(capacity * 0.1));

	if (remaining <= 0) {
		return (
			<div className="banner banner--danger" role="status">
				<strong>Cupo lleno.</strong> Ya no hay lugares disponibles para
				este evento.
			</div>
		);
	}

	if (remaining <= lowThreshold) {
		return (
			<div className="banner banner--warn" role="status">
				<strong>Últimos lugares.</strong> Quedan {remaining}{" "}
				disponibles.
			</div>
		);
	}

	return null;
}
