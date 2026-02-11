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

	const fields = await prisma.eventField.findMany({
		where: { eventId: event.id },
		orderBy: { order: "asc" },
		select: {
			id: true,
			key: true,
			label: true,
			type: true,
			required: true,
			order: true,
			options: true,
		},
	});

	const activeCount = await prisma.registration.count({
		where: { eventId: event.id, status: { not: "CANCELLED" } },
	});

	const remaining = Math.max(0, event.capacity - activeCount);

	return {
		event: {
			id: event.id,
			name: event.name,
			slug: event.slug,
			capacity: event.capacity,
			remaining,
			contactRequirement: event.contactRequirement,
		},
		fields,
	};
}
