import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

export async function getPublicEventBySlug(slug: string) {
	const event = await prisma.event.findUnique({
		where: { slug },
		select: {
			id: true,
			name: true,
			slug: true,
			capacity: true,
			contactRequirement: true,
			isPublished: true,
			createdAt: true,
		},
	});

	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	if (!event.isPublished)
		throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	return {
		event,
		fields: [] as Array<unknown>,
	};
}
