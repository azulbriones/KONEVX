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
