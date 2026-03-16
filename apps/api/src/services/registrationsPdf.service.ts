import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

export async function getRegistrationsForPdf(eventId: number, filters: {
	status?: string,
	groupBy?: string,
	pageBreak?: boolean
}) {
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true, name: true, contactRequirement: true },
	});

	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const orderBy: any = [];

	if (filters.groupBy === 'assignedGroup' || filters.groupBy === 'groupBase') {
		orderBy.push({ assignedGroup: 'asc' });
	} else if (filters.groupBy) {
		orderBy.push({ assignedGroup: 'asc' });
	}
	orderBy.push({ createdAt: 'asc' });

	const rows = await prisma.registration.findMany({
		where: {
			eventId,
			status: (filters.status as any) || undefined,
		},
		orderBy,
		select: {
			id: true,
			status: true,
			assignedGroup: true,
			checkInNotes: true,
			createdAt: true,
			participant: { select: { emailNormalized: true, phoneNormalized: true } },
			fieldValues: {
				select: {
					value: true,
					eventField: { select: { id: true, key: true, label: true, order: true } },
				},
			},
		},
	});

	const fieldMap = new Map<string, { label: string; order: number }>();
	for (const r of rows) {
		for (const fv of r.fieldValues) {
			if (!fieldMap.has(fv.eventField.key)) {
				fieldMap.set(fv.eventField.key, { label: fv.eventField.label, order: fv.eventField.order });
			}
		}
	}

	const dynamicFields = Array.from(fieldMap.entries())
		.sort((a, b) => a[1].order - b[1].order)
		.map(([key, val]) => [key, val.label] as [string, string]);

	return { eventName: event.name, contactRequirement: event.contactRequirement, rows, dynamicFields };
}
