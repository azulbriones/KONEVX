import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import type { ListRegistrationsQuery } from "../schemas/registrations.schema.js";
import { getRecommendedGroup, type GroupingSettings } from "./groupAssignment.service.js";

export async function listRegistrationsByEvent(
	eventId: number,
	query: ListRegistrationsQuery,
) {
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true },
	});

	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const where: any = {
		eventId,
		...(query.status ? { status: query.status } : {}),
	};

	if (query.q) {
		const search = query.q.toLowerCase();
		where.OR = [
			{ participant: { emailNormalized: { contains: search } } },
			{ participant: { phoneNormalized: { contains: search } } },
			{ fieldValues: { some: { value: { contains: search } } } }
		];
	}

	const orderByField = query.orderBy || "createdAt";
	const orderDirection = query.orderDir || "asc";

	const [total, rows] = await prisma.$transaction([
		prisma.registration.count({ where }),
		prisma.registration.findMany({
			where,
			orderBy: { [orderByField]: orderDirection },
			skip: query.skip,
			take: query.take,
			select: {
				id: true,
				status: true,
				assignedGroup: true,
				checkInNotes: true,
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
							select: { key: true, label: true, type: true, order: true },
						},
					},
				},
			},
		}),
	]);

	const items = rows.map((r) => ({
		id: r.id,
		status: r.status,
		assignedGroup: r.assignedGroup,
		checkInNotes: r.checkInNotes,
		createdAt: r.createdAt,
		contact: {
			email: r.participant.emailNormalized,
			phone: r.participant.phoneNormalized,
		},
		answers: Object.fromEntries(
			r.fieldValues
				.sort((a, b) => (a.eventField.order || 0) - (b.eventField.order || 0))
				.map((fv) => [
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

export async function checkInRegistration(eventId: number, registrationId: number, notes?: string) {
	const registration = await prisma.registration.findFirst({
		where: { id: registrationId, eventId },
		include: { event: { select: { groupingSettings: true } } }
	});

	if (!registration) throw new HttpError(404, "REGISTRATION_NOT_FOUND", "Registro no encontrado");
	if (registration.status === "ATTENDED") throw new HttpError(409, "ALREADY_ATTENDED", "Ya asistió");

	let groupToAssign = registration.assignedGroup;
	const settings = registration.event.groupingSettings as unknown as GroupingSettings;

	if (!groupToAssign && settings?.enabled) {
		groupToAssign = await getRecommendedGroup(eventId, registrationId, settings);
	}

	const result = await prisma.registration.updateMany({
		where: { id: registrationId, status: { not: "ATTENDED" } },
		data: {
			status: "ATTENDED",
			assignedGroup: groupToAssign,
			checkInNotes: notes,
			updatedAt: new Date()
		}
	});

	if (result.count === 0) throw new HttpError(409, "CONFLICT", "Error al procesar check-in");

	return { id: registrationId, status: "ATTENDED", assignedGroup: groupToAssign };
}

export async function undoCheckInRegistration(eventId: number, registrationId: number) {
	const registration = await prisma.registration.findFirst({
		where: { id: registrationId, eventId },
	});

	if (!registration) throw new HttpError(404, "REGISTRATION_NOT_FOUND", "Registro no encontrado");

	return await prisma.registration.update({
		where: { id: registrationId },
		data: {
			status: "REGISTERED",
			updatedAt: new Date()
		}
	});
}

export async function updateRegistrationData(
	eventId: number,
	registrationId: number,
	data: { contact?: { email?: string; phone?: string }; answers?: Record<string, any> }
) {
	const registration = await prisma.registration.findFirst({
		where: { id: registrationId, eventId },
		include: { participant: true }
	});

	if (!registration) {
		throw new HttpError(404, "REGISTRATION_NOT_FOUND", "Registro no encontrado");
	}

	await prisma.$transaction(async (tx) => {
		if (data.contact) {
			await tx.participant.update({
				where: { id: registration.participantId },
				data: {
					emailNormalized: data.contact.email || registration.participant.emailNormalized,
					phoneNormalized: data.contact.phone || registration.participant.phoneNormalized,
				}
			});
		}

		if (data.answers) {
			const fields = await tx.eventField.findMany({ where: { eventId } });

			await tx.registrationFieldValue.deleteMany({
				where: { registrationId }
			});

			const newValues = [];
			for (const field of fields) {
				const val = data.answers[field.key];
				if (val !== undefined && val !== null && val !== "") {
					newValues.push({
						registrationId,
						eventId,
						eventFieldId: field.id,
						value: val
					});
				}
			}

			if (newValues.length > 0) {
				await tx.registrationFieldValue.createMany({ data: newValues });
			}
		}
	});

	return { id: registrationId };
}

export async function deleteRegistration(eventId: number, registrationId: number) {
	const registration = await prisma.registration.findFirst({
		where: { id: registrationId, eventId },
	});

	if (!registration) {
		throw new HttpError(404, "REGISTRATION_NOT_FOUND", "Registro no encontrado");
	}

	await prisma.$transaction([
		prisma.registrationFieldValue.deleteMany({ where: { registrationId } }),
		prisma.registration.delete({ where: { id: registrationId } })
	]);

	return { id: registrationId };
}
