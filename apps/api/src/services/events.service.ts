import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import type { CreateEventInput } from "../schemas/events.schema.js";

export async function createEvent(input: CreateEventInput) {
	try {
		return await prisma.event.create({
			data: {
				name: input.name,
				slug: input.slug,
				capacity: input.capacity,
				contactRequirement: input.contactRequirement,
				isPublished: input.isPublished ?? false,
			},
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
	} catch (err: unknown) {
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			throw new HttpError(409, "SLUG_TAKEN", "Slug already exists");
		}
		throw err;
	}
}

export async function listEvents() {
	return prisma.event.findMany({
		orderBy: { createdAt: "desc" },
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
}
