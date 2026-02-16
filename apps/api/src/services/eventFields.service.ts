import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import type { ReplaceEventFieldsInput } from "../schemas/eventFields.schema.js";

export async function listEventFields(eventId: number) {
	const exists = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true },
	});
	if (!exists) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

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

export async function replaceEventFields(
	eventId: number,
	input: ReplaceEventFieldsInput,
) {
	return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		const exists = await tx.event.findUnique({
			where: { id: eventId },
			select: { id: true },
		});
		if (!exists)
			throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

		await tx.eventField.deleteMany({ where: { eventId } });

		if (input.fields.length === 0) return [];

		await tx.eventField.createMany({
			data: input.fields.map((f) => ({
				eventId,
				key: f.key,
				label: f.label,
				type: f.type,
				required: f.required ?? false,
				order: f.order,
				options: f.options ?? null,
			})),
		});

		return tx.eventField.findMany({
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
	});
}
