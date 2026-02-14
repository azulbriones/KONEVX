import { HttpError } from "./httpError.js";

export function parseId(raw: string, context: string = "event"): number {
	const id = Number(raw);
	if (!Number.isSafeInteger(id) || id <= 0) {
		throw new HttpError(
			400,
			`INVALID_${context.toUpperCase()}_ID`,
			`Invalid ${context} ID`,
		);
	}
	return id;
}
