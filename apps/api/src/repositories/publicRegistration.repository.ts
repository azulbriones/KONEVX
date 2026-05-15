import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export async function withPublicRegistrationTransaction<T>(
	work: (tx: Prisma.TransactionClient) => Promise<T>,
) {
	return prisma.$transaction(work);
}

export async function findPublicEventBySlugTx(
	tx: Prisma.TransactionClient,
	slug: string,
) {
	return tx.event.findUnique({
		where: { slug },
		select: {
			id: true,
			capacity: true,
			contactRequirement: true,
			isPublished: true,
		},
	});
}

export async function lockEventTx(tx: Prisma.TransactionClient, eventId: number) {
	return tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;
}

export async function listPublicFieldsTx(tx: Prisma.TransactionClient, eventId: number) {
	return tx.eventField.findMany({
		where: { eventId },
		orderBy: { order: "asc" },
		select: {
			id: true,
			key: true,
			label: true,
			type: true,
			required: true,
			order: true,
			options: true,
		},
	});
}

export async function countActiveRegistrationsTx(
	tx: Prisma.TransactionClient,
	eventId: number,
) {
	return tx.registration.count({
		where: { eventId, status: { not: "CANCELLED" } },
	});
}

export async function findParticipantByEmailTx(
	tx: Prisma.TransactionClient,
	emailNormalized: string,
) {
	return tx.participant.findUnique({ where: { emailNormalized } });
}

export async function findParticipantByPhoneTx(
	tx: Prisma.TransactionClient,
	phoneNormalized: string,
) {
	return tx.participant.findUnique({ where: { phoneNormalized } });
}

export async function createParticipantTx(
	tx: Prisma.TransactionClient,
	data: { emailNormalized: string | null; phoneNormalized: string | null },
) {
	return tx.participant.create({ data });
}

export async function updateParticipantTx(
	tx: Prisma.TransactionClient,
	participantId: number,
	data: { emailNormalized?: string | null; phoneNormalized?: string | null },
) {
	return tx.participant.update({ where: { id: participantId }, data });
}

export async function findExistingRegistrationTx(
	tx: Prisma.TransactionClient,
	eventId: number,
	participantId: number,
) {
	return tx.registration.findUnique({
		where: {
			eventId_participantId: { eventId, participantId },
		},
		select: { id: true, status: true, createdAt: true },
	});
}

export async function createRegistrationTx(
	tx: Prisma.TransactionClient,
	data: {
		eventId: number;
		participantId: number;
		status: "REGISTERED" | "CANCELLED" | "CONFIRMED" | "ATTENDED";
		fieldValues: Array<{ eventFieldId: number; eventId: number; value: Prisma.InputJsonValue }>;
	},
) {
	return tx.registration.create({
		data: {
			eventId: data.eventId,
			participantId: data.participantId,
			status: data.status,
			fieldValues: {
				create: data.fieldValues.map((fv) => ({
					eventField: { connect: { id: fv.eventFieldId } },
					value: fv.value,
				})),
			},
		},
		select: { id: true, status: true, createdAt: true },
	});
}
