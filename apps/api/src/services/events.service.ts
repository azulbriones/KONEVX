import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import type { CreateEventInput } from "../schemas/events.schema.js";

export async function createEvent(input: CreateEventInput, userId: number) {
	try {
		return await prisma.event.create({
			data: {
				name: input.name,
				slug: input.slug,
				capacity: input.capacity,
				contactRequirement: input.contactRequirement,
				isPublished: input.isPublished ?? false,
				organizerName: input.organizerName,
				slogan: input.slogan,
				description: input.description,
				footerDescription: input.footerDescription,
				location: input.location,
				startDate: input.startDate,
				endDate: input.endDate,
				entryTime: input.entryTime,
				exitTime: input.exitTime,
				cost: input.cost,
				minAge: input.minAge,
				contactInfo: input.contactInfo,
				socialMediaInfo: input.socialMediaInfo,
				hashtag: input.hashtag,

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
