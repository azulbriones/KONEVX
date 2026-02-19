import type { EventField, FieldType } from "../../types";

export const isSelectType = (t: FieldType) =>
	t === "SELECT" || t === "MULTI_SELECT";

export function normalizeOrder(fields: EventField[]): EventField[] {
	return [...fields]
		.sort((a, b) => a.order - b.order)
		.map((f, idx) => ({ ...f, order: idx }));
}

export function moveField(fields: EventField[], id: number, dir: -1 | 1) {
	const sorted = normalizeOrder(fields);

	const idx = sorted.findIndex((f) => f.id === id);
	if (idx === -1) return sorted;

	const next = idx + dir;
	if (next < 0 || next >= sorted.length) return sorted;

	const copy = [...sorted];
	const temp = copy[idx];
	copy[idx] = copy[next];
	copy[next] = temp;

	return copy.map((f, index) => ({ ...f, order: index }));
}

export function toOptionsArray(raw: string): string[] {
	const items = raw
		.split("\n")
		.map((x) => x.trim())
		.filter(Boolean);

	return Array.from(new Set(items));
}

export function optionsToText(options?: string[]) {
	return (options ?? []).join("\n");
}

export function isValidSnakeCaseKey(key: string) {
	return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(key);
}

export function isDuplicateKey(
	fields: EventField[],
	key: string,
	ignoreId?: number,
) {
	const k = key.trim().toLowerCase();
	return fields.some((f) => f.key.toLowerCase() === k && f.id !== ignoreId);
}
