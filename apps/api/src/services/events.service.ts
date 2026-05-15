import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/httpError.js";
import type { CreateEventInput } from "../schemas/events.schema.js";
import {
	createEventRecord,
	deleteEventById,
	findEventById,
	findEventForRead,
	listAllEvents,
	listUserEvents,
	updateEventById,
	updateEventPublish,
} from "../repositories/events.repository.js";
import { buildEventAccess } from "../lib/eventAccess.js";
import { normalizeEmail, normalizePhone } from "../lib/normalize.js";
import {
	countFieldValueOccupancy,
	countAllAssignedGroupOccupancy,
	countRegistrations,
	countRegistrationStatusByEvent,
	createQuickRegistrationRecord,
	findPrimaryEventField,
	upsertQuickParticipant,
} from "../repositories/registrations.repository.js";
import { countFieldsByEventId } from "../repositories/eventFields.repository.js";

type CreateEventServiceInput = Omit<CreateEventInput, "promotionalImages"> & {
	logo?: string | null;
	promotionalVideo?: string | null;
	promotionalImages?: string[] | null;
	backgroundImage?: string | null;
	heroImage?: string | null;
};

function mapSlugConflict(err: unknown) {
	if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
		throw new HttpError(409, "SLUG_TAKEN", "El slug ya está en uso");
	}
	throw err;
}

export async function listEventsForUser(user: { id: number; role: string }) {
	if (user.role === "SUPER_ADMIN") {
		const events = await listAllEvents();
		return events.map((event) => ({
			...event,
			access: { canWrite: true, canCheckIn: true, canView: true },
		}));
	}

	const events = await listUserEvents(user.id);

	return events.map((event) => {
		const memberRole = (event.eventMembers?.[0]?.role ?? null) as
			| "EDITOR"
			| "VIEWER"
			| "CHECKIN"
			| null;

		const { eventMembers, ...rest } = event;

		return {
			...rest,
			access: buildEventAccess({ memberRole }),
		};
	});
}

export async function getEventDetailsForUser(
	eventId: number,
	user: { id: number; role: string },
) {
	const isSuperAdmin = user.role === "SUPER_ADMIN";
	const event = await findEventForRead(eventId, user.id, isSuperAdmin);

	if (!event) {
		throw new HttpError(404, "EVENT_NOT_FOUND", "Evento no encontrado");
	}

	const stats = await buildEventStats(
		eventId,
		event.capacity,
		event.groupingSettings as { customFieldId?: number | null } | null,
	);

	const memberRole = isSuperAdmin
		? null
		: ((event as typeof event & { eventMembers?: { role: string }[] }).eventMembers?.[0]?.role ?? null);

	const { eventMembers, ...safeEvent } = event as typeof event & {
		eventMembers?: { role: string }[];
	};

	return {
		event: safeEvent,
		access: buildEventAccess({ isSuperAdmin, memberRole }),
		stats,
	};
}

export async function createEvent(input: CreateEventServiceInput, userId: number) {
	try {
		const { promotionalImages, ...restInput } = input;

		return await createEventRecord({
			...restInput,
			promotionalImages: promotionalImages ? promotionalImages : undefined,
			isPublished: input.isPublished ?? false,
			eventMembers: {
				create: {
					userId,
					role: "EDITOR",
				},
			},
		});
	} catch (err) {
		return mapSlugConflict(err);
	}
}

type UpdateEventInput = Omit<Prisma.EventUpdateInput, "promotionalImages"> & {
	promotionalImages?: Prisma.InputJsonValue | null;
};

export async function updateEvent(eventId: number, data: UpdateEventInput) {
	try {
		const { promotionalImages, ...rest } = data;

		return await updateEventById(eventId, {
			...rest,
			promotionalImages: promotionalImages ?? Prisma.DbNull,
		});
	} catch (err) {
		return mapSlugConflict(err);
	}
}

export async function publishEvent(eventId: number, isPublished: boolean) {
	return updateEventPublish(eventId, isPublished);
}

export async function deleteEvent(eventId: number) {
	return deleteEventById(eventId);
}

export async function buildEventStats(
	eventId: number,
	capacity: number,
	groupingSettings?: { customFieldId?: number | null } | null,
) {
	const [fieldsCount, registrationsCount, groupStatsRaw, statusStatsRaw] =
		await Promise.all([
			countFieldsByEventId(eventId),
			countRegistrations({ eventId, status: { not: "CANCELLED" } }),
			countAllAssignedGroupOccupancy(eventId),
			countRegistrationStatusByEvent(eventId),
		]);

	const statusCounts = {
		REGISTERED: 0,
		CONFIRMED: 0,
		ATTENDED: 0,
		CANCELLED: 0,
	};

	statusStatsRaw.forEach((curr) => {
		if (curr.status in statusCounts) {
			statusCounts[curr.status as keyof typeof statusCounts] = curr._count.status;
		}
	});

	const groupsOccupancy = groupStatsRaw.reduce((acc, curr) => {
		if (curr.assignedGroup !== null && curr.assignedGroup !== undefined) {
			acc[String(curr.assignedGroup)] = curr._count.assignedGroup;
		}
		return acc;
	}, {} as Record<string, number>);

	let fieldOccupancy: Record<string, number> = {};
	if (groupingSettings?.customFieldId) {
		const fieldStatsRaw = await countFieldValueOccupancy(eventId, groupingSettings.customFieldId);

		fieldOccupancy = fieldStatsRaw.reduce((acc, curr) => {
			if (curr.value !== null && curr.value !== undefined) {
				acc[String(curr.value)] = curr._count.value;
			}
			return acc;
		}, {} as Record<string, number>);
	}

	const occupancy =
		capacity > 0 ? Math.min(100, Math.round((registrationsCount / capacity) * 100)) : null;

	return {
		fieldsCount,
		registrationsCount,
		occupancy,
		statusCounts,
		groupsOccupancy,
		fieldOccupancy,
	};
}

export async function createQuickRegistration(
	eventId: number,
	payload: { name: string; contact: string; assignedGroup?: string },
) {
	const event = await findEventById(eventId);
	if (!event) throw new HttpError(404, "EVENT_NOT_FOUND", "Evento no encontrado");

	const primaryField = await findPrimaryEventField(eventId);

	if (!primaryField) {
		throw new HttpError(400, "NO_FIELDS_CONFIGURED", "El evento no tiene campos configurados.");
	}

	const emailNormalized = event.contactRequirement === "EMAIL" ? normalizeEmail(payload.contact) : null;
	const phoneNormalized = event.contactRequirement === "PHONE" ? normalizePhone(payload.contact) : null;

	if (event.contactRequirement === "EMAIL" && !emailNormalized) {
		throw new HttpError(400, "INVALID_CONTACT", "El contacto debe ser un email válido");
	}

	if (event.contactRequirement === "PHONE" && !phoneNormalized) {
		throw new HttpError(400, "INVALID_CONTACT", "El contacto debe ser un teléfono válido");
	}

	const contactData = event.contactRequirement === "PHONE"
		? { phoneNormalized }
		: { emailNormalized };

	const participant = await upsertQuickParticipant(contactData);

	return createQuickRegistrationRecord({
		eventId,
		participantId: participant.id,
		status: "ATTENDED",
		assignedGroup: payload.assignedGroup || null,
		checkInNotes: "Registro Express en puerta",
		fieldValues: [{ eventFieldId: primaryField.id, value: payload.name }],
	});
}
