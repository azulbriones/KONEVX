import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import type { CreateEventInput } from "../schemas/events.schema.js";

type CreateEventServiceInput = Omit<CreateEventInput, "promotionalImages"> & {
	logo?: string | null;
	promotionalVideo?: string | null;
	promotionalImages?: string[] | null;
	backgroundImage?: string | null;
	heroImage?: string | null;
};

export async function createEvent(input: CreateEventServiceInput, userId: number) {
	try {
		const { promotionalImages, ...restInput } = input;

		return await prisma.event.create({
			data: {
				...restInput,
				promotionalImages: promotionalImages ? promotionalImages : undefined,

				isPublished: input.isPublished ?? false,

				eventMembers: {
					create: {
						userId: userId,
						role: "EDITOR",
					},
				},
			},
			select: {
				id: true,
				name: true,
				slug: true,
				createdAt: true,
			},
		});
	} catch (err: unknown) {
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === "P2002") {
				throw new HttpError(
					409,
					"SLUG_TAKEN",
					"El slug ya está en uso",
				);
			}
		}
		throw err;
	}
}

export async function updateEvent(eventId: number, data: Prisma.EventUpdateInput) {
	try {
		return await prisma.event.update({
			where: { id: eventId },
			data,
		});
	} catch (err: unknown) {
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === "P2002") {
				throw new HttpError(409, "SLUG_TAKEN", "El slug ya está en uso");
			}
		}
		throw err;
	}
}

export async function deleteEvent(eventId: number) {
	return await prisma.event.delete({
		where: { id: eventId },
	});
}

export async function createQuickRegistration(
	eventId: number,
	payload: { name: string; contact: string; assignedGroup?: string }
) {
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true, contactRequirement: true }
	});

	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Evento no encontrado");

	const primaryField = await prisma.eventField.findFirst({
		where: { eventId },
		orderBy: { order: 'asc' }
	});

	if (!primaryField) {
		throw new HttpError(400, "NO_FIELDS_CONFIGURED", "El evento no tiene campos configurados.");
	}

	const contactData = event.contactRequirement === "PHONE"
		? { phoneNormalized: payload.contact }
		: { emailNormalized: payload.contact };

	let participant = await prisma.participant.upsert({
		where: contactData,
		update: {},
		create: contactData
	});

	return await prisma.registration.create({
		data: {
			eventId,
			participantId: participant.id,
			status: "ATTENDED",
			assignedGroup: payload.assignedGroup || null,
			checkInNotes: "Registro Express en puerta",
			fieldValues: {
				create: {
					eventFieldId: primaryField.id,
					value: payload.name
				}
			}
		},
		select: { id: true, status: true, assignedGroup: true }
	});
}
