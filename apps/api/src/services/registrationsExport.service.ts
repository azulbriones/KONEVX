import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

const STATUS_LABEL: Record<string, string> = {
	REGISTERED: "Registrado",
	CONFIRMED: "Confirmado",
	CANCELLED: "Cancelado",
	ATTENDED: "Asistió",
};

export async function exportRegistrationsCsv(eventId: number) {
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true, name: true, contactRequirement: true },
	});
	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const rows = await prisma.registration.findMany({
		where: { eventId },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			status: true,
			assignedGroup: true,
			createdAt: true,
			participant: {
				select: { emailNormalized: true, phoneNormalized: true },
			},
			fieldValues: {
				select: {
					value: true,
					eventField: { select: { key: true, label: true, order: true } },
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
		.map(([key, val]) => [key, val.label]);

	const header = [
		"ID",
		"Estado",
		"Grupo",
		"Fecha de Registro",
		event.contactRequirement === "PHONE" ? "Teléfono" : "Email",
		...dynamicFields.map(f => f[1]),
	];

	const records = rows.map((r) => {
		const answersByKey: Record<string, string> = {};
		for (const fv of r.fieldValues) {
			const v = fv.value;
			if (v === null || v === undefined) answersByKey[fv.eventField.key] = "";
			else if (typeof v === "boolean") answersByKey[fv.eventField.key] = v ? "Sí" : "No";
			else if (Array.isArray(v)) answersByKey[fv.eventField.key] = v.join(", ");
			else answersByKey[fv.eventField.key] = String(v);
		}

		const contactValue = event.contactRequirement === "PHONE"
			? (r.participant.phoneNormalized ?? "")
			: (r.participant.emailNormalized ?? "");

		return [
			r.id,
			STATUS_LABEL[r.status] || r.status,
			r.assignedGroup || "Sin asignar",
			r.createdAt.toISOString(),
			contactValue,
			...dynamicFields.map(f => answersByKey[f[0]] ?? ""),
		];
	});
	return { eventName: event.name, header, records };
}
