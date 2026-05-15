import { HttpError } from "../lib/httpError.js";
import type { ReplaceEventFieldsInput } from "../schemas/eventFields.schema.js";
import {
	listFieldsByEventId,
	replaceFieldsForEvent,
} from "../repositories/eventFields.repository.js";
import { findEventById } from "../repositories/events.repository.js";

export async function listEventFields(eventId: number) {
	const exists = await findEventById(eventId);
	if (!exists) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	return listFieldsByEventId(eventId);
}

export async function replaceEventFields(
	eventId: number,
	input: ReplaceEventFieldsInput,
) {
	const exists = await findEventById(eventId);
	if (!exists) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	return replaceFieldsForEvent(
		eventId,
		input.fields.map((f) => ({
			key: f.key,
			label: f.label,
			type: f.type,
			required: f.required ?? false,
			order: f.order,
			options: f.options ?? null,
		})),
	);
}
