import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

const EVENT_DETAIL_SELECT = {
	id: true,
	name: true,
	slug: true,
	capacity: true,
	contactRequirement: true,
	isPublished: true,
	organizerName: true,
	slogan: true,
	description: true,
	footerDescription: true,
	location: true,
	startDate: true,
	endDate: true,
	entryTime: true,
	exitTime: true,
	cost: true,
	minAge: true,
	promotionalVideo: true,
	promotionalImages: true,
	contactInfo: true,
	socialMediaInfo: true,
	hashtag: true,
	logo: true,
	thingsToBring: true,
	thingsNotToBring: true,
	note: true,
	createdAt: true,
	updatedAt: true,
} as const;

export async function getPublicEventBySlug(slug: string) {
	const event = await prisma.event.findUnique({
		where: { slug },
		select: { ...EVENT_DETAIL_SELECT },
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
			...event,
			remaining,
		},
		fields,
	};
}
