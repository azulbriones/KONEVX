import { Prisma, RegistrationStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";

type RegistrationListRow = Prisma.RegistrationGetPayload<{
	select: {
		id: true;
		status: true;
		assignedGroup: true;
		checkInNotes: true;
		createdAt: true;
		participant: { select: { id: true; emailNormalized: true; phoneNormalized: true } };
		fieldValues: { select: { value: true; eventField: { select: { key: true; label: true; type: true; order: true } } } };
	};
}>;

type RegistrationWithDetails = Prisma.RegistrationGetPayload<{
	include: {
		participant: true;
		fieldValues: { include: { eventField: true } };
	};
}>;

type RegistrationForPdf = Prisma.RegistrationGetPayload<{
	select: {
		id: true;
		status: true;
		assignedGroup: true;
		checkInNotes: true;
		createdAt: true;
		participant: { select: { emailNormalized: true; phoneNormalized: true } };
		fieldValues: { select: { value: true; eventField: { select: { id: true; key: true; label: true; order: true } } } };
	};
}>;

type RegistrationForCheckIn = Prisma.RegistrationGetPayload<{
	include: { event: { select: { groupingSettings: true } }; participant: true };
}>;

type RegistrationForDataUpdate = Prisma.RegistrationGetPayload<{
	include: { participant: true };
}>;

type RegistrationForListing = Prisma.RegistrationGetPayload<{
	select: {
		id: true;
		eventId: true;
		assignedGroup: true;
		event: { select: { groupingSettings: true } };
	};
}>;

export async function countRegistrations(where: Prisma.RegistrationWhereInput) {
	return prisma.registration.count({ where });
}

export async function listRegistrations(
	where: Prisma.RegistrationWhereInput,
	skip: number,
	take: number,
) : Promise<RegistrationListRow[]> {
	return prisma.registration.findMany({
		where,
		orderBy: { createdAt: "desc" },
		skip,
		take,
		select: {
			id: true,
			status: true,
			assignedGroup: true,
			checkInNotes: true,
			createdAt: true,
			participant: { select: { id: true, emailNormalized: true, phoneNormalized: true } },
			fieldValues: {
				select: {
					value: true,
					eventField: { select: { key: true, label: true, type: true, order: true } },
				},
			},
		},
	});
}

export async function listRegistrationsWithDetails(
	eventId: number,
	status?: RegistrationStatus,
): Promise<RegistrationWithDetails[]> {
	return prisma.registration.findMany({
		where: {
			eventId,
			status: status || undefined,
		},
		include: {
			participant: true,
			fieldValues: { include: { eventField: true } },
		},
		orderBy: { createdAt: "asc" },
	});
}

export async function listRegistrationsForPdf(eventId: number, status?: RegistrationStatus, groupBy?: string): Promise<RegistrationForPdf[]> {
	const orderBy: Prisma.RegistrationOrderByWithRelationInput[] = [];
	if (groupBy === "assignedGroup" || groupBy === "groupBase" || groupBy) {
		orderBy.push({ assignedGroup: "asc" });
	}
	orderBy.push({ createdAt: "asc" });

	return prisma.registration.findMany({
		where: {
			eventId,
			status: status || undefined,
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
}

export async function findEventRegistrationInfo(eventId: number) {
	return prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true, name: true, contactRequirement: true },
	});
}

export async function findRegistrationGroupAnswer(
	registrationId: number,
	eventFieldId: number,
) {
	return prisma.registrationFieldValue.findUnique({
		where: {
			registrationId_eventFieldId: {
				registrationId,
				eventFieldId,
			},
		},
		select: { value: true },
	});
}

export async function countRegistrationGroupOccupancy(
	eventId: number,
	possibleGroups: string[],
) {
	return prisma.registration.groupBy({
		by: ["assignedGroup"],
		where: {
			eventId,
			status: { not: "CANCELLED" },
			assignedGroup: { in: possibleGroups },
		},
		_count: { assignedGroup: true },
	});
}

export async function countAllAssignedGroupOccupancy(eventId: number) {
	return prisma.registration.groupBy({
		by: ["assignedGroup"],
		where: {
			eventId,
			status: { not: "CANCELLED" },
			assignedGroup: { not: null },
		},
		_count: { assignedGroup: true },
	});
}

export async function countRegistrationStatusByEvent(eventId: number) {
	return prisma.registration.groupBy({
		by: ["status"],
		where: { eventId },
		_count: { status: true },
	});
}

export async function countFieldValueOccupancy(eventId: number, eventFieldId: number) {
	return prisma.registrationFieldValue.groupBy({
		by: ["value"],
		where: {
			eventFieldId,
			registration: { eventId, status: { not: "CANCELLED" } },
		},
		_count: { value: true },
	});
}

export async function findPrimaryEventField(eventId: number) {
	return prisma.eventField.findFirst({
		where: { eventId },
		orderBy: { order: "asc" },
	});
}

export async function upsertQuickParticipant(contactData: { emailNormalized?: string | null; phoneNormalized?: string | null }) {
	return prisma.participant.upsert({
		where: contactData.emailNormalized
			? { emailNormalized: contactData.emailNormalized }
			: { phoneNormalized: contactData.phoneNormalized as string },
		update: {},
		create: contactData,
	});
}

export async function createQuickRegistrationRecord(input: {
	eventId: number;
	participantId: number;
	status: "ATTENDED" | "REGISTERED" | "CONFIRMED" | "CANCELLED";
	assignedGroup?: string | null;
	checkInNotes?: string | null;
	fieldValues: Array<{ eventFieldId: number; value: Prisma.InputJsonValue }>;
}) {
	return prisma.registration.create({
		data: {
			eventId: input.eventId,
			participantId: input.participantId,
			status: input.status,
			assignedGroup: input.assignedGroup || null,
			checkInNotes: input.checkInNotes,
			fieldValues: {
				create: input.fieldValues.map((fv) => ({
					eventFieldId: fv.eventFieldId,
					eventId: input.eventId,
					value: fv.value,
				})),
			},
		},
		select: { id: true, status: true, assignedGroup: true },
	});
}

export async function findRegistrationByEventAndId(eventId: number, registrationId: number): Promise<RegistrationForCheckIn | null> {
	return prisma.registration.findFirst({
		where: { id: registrationId, eventId },
		include: { event: { select: { groupingSettings: true } }, participant: true },
	});
}

export async function findRegistrationForListing(eventId: number, registrationId: number): Promise<RegistrationForListing | null> {
	return prisma.registration.findFirst({
		where: { id: registrationId, eventId },
		select: {
			id: true,
			eventId: true,
			assignedGroup: true,
			event: { select: { groupingSettings: true } },
		},
	});
}

export async function updateRegistrationStatusById(
	registrationId: number,
	data: { status: RegistrationStatus; assignedGroup: string | null },
) {
	return prisma.registration.update({
		where: { id: registrationId },
		data,
		select: { id: true, status: true, assignedGroup: true, updatedAt: true },
	});
}

export async function updateRegistrationStatusByIdIfNotAttended(
	registrationId: number,
	data: { status: RegistrationStatus; assignedGroup: string | null; checkInNotes?: string | null },
) {
	return prisma.registration.updateMany({
		where: { id: registrationId, status: { not: "ATTENDED" } },
		data: {
			status: data.status,
			assignedGroup: data.assignedGroup,
			checkInNotes: data.checkInNotes,
			updatedAt: new Date(),
		},
	});
}

export async function updateParticipantContact(
	participantId: number,
	data: { emailNormalized?: string | null; phoneNormalized?: string | null },
) {
	return prisma.participant.update({
		where: { id: participantId },
		data,
	});
}

export async function deleteRegistrationFieldValues(registrationId: number) {
	return prisma.registrationFieldValue.deleteMany({ where: { registrationId } });
}

export async function createRegistrationFieldValues(
	rows: Array<{ registrationId: number; eventId: number; eventFieldId: number; value: Prisma.InputJsonValue }>,
) {
	return prisma.registrationFieldValue.createMany({ data: rows });
}

export async function deleteRegistrationById(registrationId: number) {
	return prisma.registration.delete({ where: { id: registrationId } });
}

export async function findRegistrationForDataUpdate(eventId: number, registrationId: number): Promise<RegistrationForDataUpdate | null> {
	return prisma.registration.findFirst({
		where: { id: registrationId, eventId },
		include: { participant: true },
	});
}
