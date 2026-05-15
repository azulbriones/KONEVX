import { prisma } from "../db/prisma.js";

export const PUBLIC_EVENT_SELECT = {
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
	backgroundImage: true,
	heroImage: true,
	thingsToBring: true,
	thingsNotToBring: true,
	note: true,
	groupingSettings: true,
	createdAt: true,
	updatedAt: true,
} as const;

export async function findPublishedEventBySlug(slug: string) {
	return prisma.event.findUnique({
		where: { slug },
		select: PUBLIC_EVENT_SELECT,
	});
}

export async function listPublicEventFields(eventId: number) {
	return prisma.eventField.findMany({
		where: { eventId },
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
}

export async function countActiveRegistrations(eventId: number) {
	return prisma.registration.count({
		where: { eventId, status: { not: "CANCELLED" } },
	});
}
