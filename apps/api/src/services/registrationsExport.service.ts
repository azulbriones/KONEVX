import { HttpError } from "../lib/httpError.js";
import type { RegistrationStatus } from "@prisma/client";
import { findEventRegistrationInfo, listRegistrationsWithDetails } from "../repositories/registrations.repository.js";

const STATUS_LABEL: Record<string, string> = {
	REGISTERED: "Registrado",
	CONFIRMED: "Confirmado",
	CANCELLED: "Cancelado",
	ATTENDED: "Asistió",
};

export async function getRegistrationsGrouped(eventId: number, options: {
	groupBy?: string,
	columns?: string[],
	status?: RegistrationStatus
}) {
	const event = await findEventRegistrationInfo(eventId);
	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const rows: Awaited<ReturnType<typeof listRegistrationsWithDetails>> = await listRegistrationsWithDetails(eventId, options.status);

	const fieldMap = new Map<string, { label: string; order: number }>();
	rows.forEach(r => r.fieldValues.forEach(fv => {
		if (!fieldMap.has(fv.eventField.key)) {
			fieldMap.set(fv.eventField.key, { label: fv.eventField.label, order: fv.eventField.order });
		}
	}));
	const dynamicFields = Array.from(fieldMap.entries()).sort((a, b) => a[1].order - b[1].order);

	const columnDefinitions: Record<string, string> = {
		id: "ID",
		status: "ESTADO",
		assignedGroup: "GRUPO",
		createdAt: "FECHA DE REGISTRO",
		contact: event.contactRequirement === "PHONE" ? "TELÉFONO" : "EMAIL",
	};
	dynamicFields.forEach(([key, info]) => {
		columnDefinitions[key] = info.label.toUpperCase();
	});

	const selectedKeys = options.columns && options.columns.length > 0
		? options.columns
		: Object.keys(columnDefinitions);

	const header = selectedKeys.map(key => columnDefinitions[key] || key);

  const sheets: Record<string, Array<Record<string, unknown>>> = {};

	rows.forEach(r => {
		let sheetName = "General";

		if (options.groupBy === 'assignedGroup') {
			sheetName = r.assignedGroup || "Sin asignar";
		} else if (options.groupBy === 'groupBase') {
			sheetName = r.assignedGroup ? r.assignedGroup.replace(/[0-9]/g, '') : "Sin asignar";
		} else if (options.groupBy) {
			const fv = r.fieldValues.find(f => f.eventField.key === options.groupBy);
			sheetName = String(fv?.value || "Otros");
		}

		if (!sheets[sheetName]) sheets[sheetName] = [];

		const answers: Record<string, unknown> = {};
		r.fieldValues.forEach(fv => {
			const val = fv.value;
			answers[fv.eventField.key] = Array.isArray(val) ? val.join(", ") : val;
		});

		const rowData = selectedKeys.reduce((acc, key) => {
			if (key === "id") acc[key] = r.id;
			else if (key === "status") acc[key] = STATUS_LABEL[r.status] || r.status;
			else if (key === "assignedGroup") acc[key] = r.assignedGroup || "-";
			else if (key === "createdAt") acc[key] = r.createdAt;
			else if (key === "contact") acc[key] = event.contactRequirement === "PHONE" ? r.participant.phoneNormalized : r.participant.emailNormalized;
			else acc[key] = answers[key] ?? "";
			return acc;
		}, {} as Record<string, unknown>);

		sheets[sheetName].push(rowData);
	});

	return { eventName: event.name, header, sheets };
}
