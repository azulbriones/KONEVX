import { EventRole, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

type MemberWithUser = Prisma.EventMemberGetPayload<{
	select: {
		role: true;
		createdAt: true;
		user: { select: { id: true; email: true; username: true; role: true } };
	};
}>;

export async function listMembersByEventId(eventId: number): Promise<MemberWithUser[]> {
	return prisma.eventMember.findMany({
		where: { eventId },
		orderBy: { createdAt: "asc" },
		select: {
			role: true,
			createdAt: true,
			user: { select: { id: true, email: true, username: true, role: true } },
		},
	});
}

export async function upsertEventMember(
	eventId: number,
	userId: number,
	role: EventRole,
): Promise<Prisma.EventMemberGetPayload<{
	select: { role: true; user: { select: { id: true; email: true; username: true } } };
}>> {
	return prisma.eventMember.upsert({
		where: { eventId_userId: { eventId, userId } },
		update: { role },
		create: { eventId, userId, role },
		select: { role: true, user: { select: { id: true, email: true, username: true } } },
	});
}

export async function updateEventMemberRole(
	eventId: number,
	userId: number,
	role: EventRole,
): Promise<Prisma.EventMemberGetPayload<{
	select: { role: true; user: { select: { id: true; email: true; username: true } } };
}>> {
	return prisma.eventMember.update({
		where: { eventId_userId: { eventId, userId } },
		data: { role },
		select: { role: true, user: { select: { id: true, email: true, username: true } } },
	});
}

export async function deleteEventMember(eventId: number, userId: number) {
	return prisma.eventMember.deleteMany({ where: { eventId, userId } });
}
