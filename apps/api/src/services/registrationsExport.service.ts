import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

const STATUS_LABEL: Record<string, string> = {
	REGISTERED: "Registrado",
	CONFIRMED: "Confirmado",
	CANCELLED: "Cancelado",
	ATTENDED: "Asistió",
};

export async function getRegistrationsGrouped(eventId: number, options: {
	groupBy?: string,
	columns?: string[],
	status?: string
}) {
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true, name: true, contactRequirement: true },
	});
	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const rows = await prisma.registration.findMany({
		where: {
			eventId,
			status: options.status as any || undefined
		},
		include: {
			participant: true,
			fieldValues: { include: { eventField: true } }
		},
		orderBy: { createdAt: 'desc' }
	});

	const fieldMap = new Map();
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

	const sheets: Record<string, any[][]> = {};

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

		const answers: Record<string, any> = {};
		r.fieldValues.forEach(fv => {
			const val = fv.value;
			answers[fv.eventField.key] = Array.isArray(val) ? val.join(", ") : val;
		});

		const rowData = selectedKeys.map(key => {
			if (key === 'id') return r.id;
			if (key === 'status') return STATUS_LABEL[r.status] || r.status;
			if (key === 'assignedGroup') return r.assignedGroup || "-";
			if (key === 'createdAt') return r.createdAt;
			if (key === 'contact') return event.contactRequirement === "PHONE" ? r.participant.phoneNormalized : r.participant.emailNormalized;
			return answers[key] ?? "";
		});

		sheets[sheetName].push(rowData);
	});

	return { eventName: event.name, header, sheets };
}
