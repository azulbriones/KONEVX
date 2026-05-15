import { FieldType, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export async function listFieldsByEventId(eventId: number) {
	return prisma.eventField.findMany({
		where: { eventId },
		orderBy: { order: "asc" },
	});
}

export async function countFieldsByEventId(eventId: number) {
	return prisma.eventField.count({ where: { eventId } });
}

export async function replaceFieldsForEvent(
	eventId: number,
	fields: Array<{ key: string; label: string; type: FieldType; required: boolean; order: number; options?: string[] | null }>,
) {
	return prisma.$transaction(async (tx) => {
		await tx.eventField.deleteMany({ where: { eventId } });
		if (fields.length === 0) return [];
		await tx.eventField.createMany({
			data: fields.map((field) => ({
				...field,
				eventId,
				options: field.options ? field.options : Prisma.DbNull,
			})),
		});
		return tx.eventField.findMany({
			where: { eventId },
			orderBy: { order: "asc" },
		});
	});
}
