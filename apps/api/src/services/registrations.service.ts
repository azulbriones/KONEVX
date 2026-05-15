import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import { listFieldsByEventId } from "../repositories/eventFields.repository.js";
import { findEventById } from "../repositories/events.repository.js";
import {
	countRegistrations,
	createRegistrationFieldValues,
	deleteRegistrationById,
	deleteRegistrationFieldValues,
	findRegistrationByEventAndId,
	findRegistrationForDataUpdate,
	listRegistrations,
	updateParticipantContact,
	updateRegistrationStatusById,
	updateRegistrationStatusByIdIfNotAttended,
} from "../repositories/registrations.repository.js";
import { getRecommendedGroup, type GroupingSettings } from "./groupAssignment.service.js";

export async function listRegistrationsByEvent(
	eventId: number,
	query: { page: number; limit: number; status?: "REGISTERED" | "CANCELLED" | "CONFIRMED" | "ATTENDED"; q?: string; fieldId?: string },
) {
	const event = await findEventById(eventId);
	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const where: Prisma.RegistrationWhereInput = {
		eventId,
		...(query.status ? { status: query.status } : {}),
	};
	const fieldId = query.fieldId ? parseId(query.fieldId, "field") : undefined;

	if (query.q) {
		const search = query.q.toLowerCase();
		where.OR = [
			{ participant: { emailNormalized: { contains: search } } },
			{ participant: { phoneNormalized: { contains: search } } },
			{
				fieldValues: {
					some: {
						...(fieldId ? { eventFieldId: fieldId } : {}),
						value: { string_contains: search },
					},
				},
			},
		];
	}

	const skip = (query.page - 1) * query.limit;
	const take = query.limit;

	const [total, rows] = await Promise.all([
		countRegistrations(where),
		listRegistrations(where, skip, take),
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
		page: { skip, take, total },
	};
}

export async function checkInRegistration(eventId: number, registrationId: number, notes?: string) {
	const registration = await findRegistrationByEventAndId(eventId, registrationId);
	if (!registration) throw new HttpError(404, "REGISTRATION_NOT_FOUND", "Registro no encontrado");
	if (registration.status === "ATTENDED") throw new HttpError(409, "ALREADY_ATTENDED", "Ya asistió");

	let groupToAssign = registration.assignedGroup;
	const settings = registration.event.groupingSettings as unknown as GroupingSettings;

	if (!groupToAssign && settings?.enabled) {
		groupToAssign = await getRecommendedGroup(eventId, registrationId, settings);
	}

	const result = await updateRegistrationStatusByIdIfNotAttended(registrationId, {
		status: "ATTENDED",
		assignedGroup: groupToAssign,
		checkInNotes: notes,
	});

	if (result.count === 0) throw new HttpError(409, "CONFLICT", "Error al procesar check-in");

	return { id: registrationId, status: "ATTENDED", assignedGroup: groupToAssign };
}

export async function undoCheckInRegistration(eventId: number, registrationId: number) {
	const registration = await findRegistrationByEventAndId(eventId, registrationId);
	if (!registration) throw new HttpError(404, "REGISTRATION_NOT_FOUND", "Registro no encontrado");

	return await updateRegistrationStatusById(registrationId, {
		status: "REGISTERED",
		assignedGroup: registration.assignedGroup ?? null,
	});
}

export async function updateRegistrationData(
		eventId: number,
		registrationId: number,
		data: { contact?: { email?: string | null; phone?: string | null }; answers?: Record<string, unknown> },
) {
	const registration = await findRegistrationForDataUpdate(eventId, registrationId);

	if (!registration) {
		throw new HttpError(404, "REGISTRATION_NOT_FOUND", "Registro no encontrado");
	}

	if (data.contact) {
		await updateParticipantContact(registration.participantId, {
			emailNormalized: data.contact.email ?? registration.participant.emailNormalized,
			phoneNormalized: data.contact.phone ?? registration.participant.phoneNormalized,
		});
	}

	if (data.answers) {
		const fields = await listFieldsByEventId(eventId);
		await deleteRegistrationFieldValues(registrationId);

		const newValues: Array<{ registrationId: number; eventId: number; eventFieldId: number; value: Prisma.InputJsonValue }> = [];
		for (const field of fields) {
			const val = data.answers[field.key];
			if (val !== undefined && val !== null && val !== "") {
				newValues.push({ registrationId, eventId, eventFieldId: field.id, value: val as Prisma.InputJsonValue });
			}
		}

		if (newValues.length > 0) {
			await createRegistrationFieldValues(newValues);
		}
	}

	return { id: registrationId };
}

export async function deleteRegistration(eventId: number, registrationId: number) {
	const registration = await findRegistrationByEventAndId(eventId, registrationId);
	if (!registration) {
		throw new HttpError(404, "REGISTRATION_NOT_FOUND", "Registro no encontrado");
	}

	await deleteRegistrationFieldValues(registrationId);
	await deleteRegistrationById(registrationId);

	return { id: registrationId };
}
