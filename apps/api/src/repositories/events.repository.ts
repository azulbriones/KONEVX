import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export const EVENT_DETAIL_SELECT = {
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

export async function listAllEvents() {
	return prisma.event.findMany({
		orderBy: { createdAt: "desc" },
		take: 50,
		select: EVENT_DETAIL_SELECT,
	});
}

export async function listUserEvents(userId: number) {
	return prisma.event.findMany({
		where: { eventMembers: { some: { userId } } },
		orderBy: { createdAt: "desc" },
		take: 50,
		select: {
			...EVENT_DETAIL_SELECT,
			eventMembers: {
				where: { userId },
				select: { role: true },
				take: 1,
			},
		},
	});
}

export async function findEventForAdmin(eventId: number, userId: number, isSuperAdmin: boolean) {
	return prisma.event.findFirst({
		where: isSuperAdmin
			? { id: eventId }
			: {
				id: eventId,
				eventMembers: {
					some: { userId, role: "EDITOR" },
				},
			},
	});
}

export async function findEventForRead(eventId: number, userId: number, isSuperAdmin: boolean) {
	return prisma.event.findFirst({
		where: isSuperAdmin
			? { id: eventId }
			: { id: eventId, eventMembers: { some: { userId } } },
		select: {
			...EVENT_DETAIL_SELECT,
			eventMembers: isSuperAdmin
				? false
				: {
					where: { userId },
					select: { role: true },
				},
		},
	});
}

export async function updateEventPublish(eventId: number, isPublished: boolean) {
	return prisma.event.update({
		where: { id: eventId },
		data: { isPublished },
		select: {
			id: true,
			slug: true,
			name: true,
			isPublished: true,
			updatedAt: true,
		},
	});
}

export async function deleteEventById(eventId: number) {
	return prisma.event.delete({ where: { id: eventId } });
}

export async function updateEventById(
	eventId: number,
	data: Prisma.EventUpdateInput,
) {
	return prisma.event.update({ where: { id: eventId }, data });
}

export async function createEventRecord(
	input: Prisma.EventCreateInput,
) {
	return prisma.event.create({ data: input, select: { id: true, name: true, slug: true, createdAt: true } });
}

export async function findEventById(eventId: number) {
	return prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true, contactRequirement: true, capacity: true, groupingSettings: true },
	});
}
