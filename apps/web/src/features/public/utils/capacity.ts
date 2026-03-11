export type CapacityState = "FULL" | "LAST" | "AVAILABLE";

export function getCapacityState(
	capacity: number,
	remaining: number,
): CapacityState {
	if (remaining <= 0) return "FULL";

	const threshold = Math.ceil(capacity * 0.2);
	if (remaining <= threshold) return "LAST";

	return "AVAILABLE";
}

export function getCapacityLabel(capacity: number, remaining: number): string {
	const state = getCapacityState(capacity, remaining);

	if (state === "FULL") return "Cupo lleno";
	if (state === "LAST") return `Últimos lugares (${remaining})`;
	return `Quedan ${remaining} lugares`;
}
