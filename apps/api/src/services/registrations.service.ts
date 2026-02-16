import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import type { ListRegistrationsQuery } from "../schemas/registrations.schema.js";

export async function listRegistrationsByEvent(
	eventId: number,
	query: ListRegistrationsQuery,
) {
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true },
	});

	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const where = {
		eventId,
		...(query.status ? { status: query.status } : {}),
	} as const;

	const [total, rows] = await prisma.$transaction([
		prisma.registration.count({ where }),
		prisma.registration.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: query.skip,
			take: query.take,
			select: {
				id: true,
				status: true,
				createdAt: true,
				participant: {
					select: {
						emailNormalized: true,
						phoneNormalized: true,
					},
				},
				fieldValues: {
					select: {
						value: true,
						eventField: {
							select: { key: true, label: true, type: true },
						},
					},
				},
			},
		}),
	]);

	const items = rows.map((r) => ({
		id: r.id,
		status: r.status,
		createdAt: r.createdAt,
		contact: {
			email: r.participant.emailNormalized,
			phone: r.participant.phoneNormalized,
		},
		answers: Object.fromEntries(
			r.fieldValues.map((fv) => [
				fv.eventField.key,
				{
					label: fv.eventField.label,
					type: fv.eventField.type,
					value: fv.value,
				},
			]),
		),
	}));

	return {
		items,
		page: { skip: query.skip, take: query.take, total },
	};
}
