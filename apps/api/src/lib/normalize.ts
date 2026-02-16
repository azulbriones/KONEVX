export function normalizeEmail(raw?: string | null): string | null {
	if (!raw) return null;
	const v = raw.trim().toLowerCase();
	return v.length ? v : null;
}

export function normalizePhone(raw?: string | null): string | null {
	if (!raw) return null;

	const trimmed = raw.trim();
	if (!trimmed) return null;

	const hasPlus = trimmed.startsWith("+");
	const digits = trimmed.replace(/[^\d]/g, "");

	if (!digits) return null;

	if (hasPlus) return `+${digits}`;

	return digits.startsWith("52") ? `+${digits}` : `+52${digits}`;
}
