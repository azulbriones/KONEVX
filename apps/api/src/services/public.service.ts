import { HttpError } from "../lib/httpError.js";
import {
	countActiveRegistrations,
	findPublishedEventBySlug,
	listPublicEventFields,
} from "../repositories/public.repository.js";

export async function getPublicEventBySlug(slug: string) {
	const event = await findPublishedEventBySlug(slug);

	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	if (!event.isPublished)
		throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const fields = await listPublicEventFields(event.id);

	const activeCount = await countActiveRegistrations(event.id);

	const remaining = Math.max(0, event.capacity - activeCount);

	return {
		event: {
			...event,
			remaining,
		},
		fields,
	};
}
