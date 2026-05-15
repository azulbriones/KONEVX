import { HttpError } from "../lib/httpError.js";
import type { RegistrationStatus } from "@prisma/client";
import { findEventRegistrationInfo, listRegistrationsForPdf } from "../repositories/registrations.repository.js";

export async function getRegistrationsForPdf(eventId: number, filters: {
	status?: RegistrationStatus,
	groupBy?: string,
	pageBreak?: boolean
}) {
	const event = await findEventRegistrationInfo(eventId);

	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const rows: Awaited<ReturnType<typeof listRegistrationsForPdf>> = await listRegistrationsForPdf(eventId, filters.status, filters.groupBy);

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
