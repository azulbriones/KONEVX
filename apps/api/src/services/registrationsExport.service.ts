import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

export async function exportRegistrationsCsv(eventId: number) {
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true, name: true },
	});
	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const rows = await prisma.registration.findMany({
		where: { eventId },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			status: true,
			createdAt: true,
			participant: {
				select: { emailNormalized: true, phoneNormalized: true },
			},
			fieldValues: {
				select: {
					value: true,
					eventField: { select: { key: true, label: true } },
				},
			},
		},
	});

	const keyToLabel = new Map<string, string>();
	for (const r of rows) {
		for (const fv of r.fieldValues) {
			keyToLabel.set(fv.eventField.key, fv.eventField.label);
		}
	}

	const dynamicKeys = Array.from(keyToLabel.entries())
		.sort((a, b) => a[1].localeCompare(b[1]))
		.map(([key]) => key);

	const header = [
		"registrationId",
		"status",
		"createdAt",
		"email",
		"phone",
		...dynamicKeys,
	];

	const records = rows.map((r) => {
		const answersByKey: Record<string, string> = {};

		for (const fv of r.fieldValues) {
			const v = fv.value;
			answersByKey[fv.eventField.key] =
				typeof v === "string" ? v : JSON.stringify(v);
		}

		return [
			r.id,
			r.status,
			r.createdAt.toISOString(),
			r.participant.emailNormalized ?? "",
			r.participant.phoneNormalized ?? "",
			...dynamicKeys.map((k) => answersByKey[k] ?? ""),
		];
	});

	return { eventName: event.name, header, records };
}
