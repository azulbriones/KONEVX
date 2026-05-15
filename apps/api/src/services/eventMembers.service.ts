import { HttpError } from "../lib/httpError.js";
import { EventRole } from "@prisma/client";
import { findUserByEmail } from "../repositories/user.repository.js";
import {
	deleteEventMember,
	listMembersByEventId,
	upsertEventMember,
	updateEventMemberRole,
} from "../repositories/eventMembers.repository.js";
import { findEventById } from "../repositories/events.repository.js";

export async function listEventMembers(eventId: number) {
	const exists = await findEventById(eventId);
	if (!exists) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	return listMembersByEventId(eventId);
}

export async function addEventMember(
	eventId: number,
	email: string,
	role: EventRole,
) {
	const exists = await findEventById(eventId);
	if (!exists) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const user = await findUserByEmail(email);
	if (!user) throw new HttpError(404, "USER_NOT_FOUND", "User not found");

	return upsertEventMember(eventId, user.id, role);
}

export async function changeEventMemberRole(
	eventId: number,
	userId: number,
	role: EventRole,
) {
	const exists = await findEventById(eventId);
	if (!exists) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	try {
		return await updateEventMemberRole(eventId, userId, role);
	} catch (err) {
		if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "P2025") {
			throw new HttpError(404, "MEMBER_NOT_FOUND", "Member not found in this event");
		}
		throw err;
	}
}

export async function removeEventMember(eventId: number, userId: number) {
	const exists = await findEventById(eventId);
	if (!exists) throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");

	const result = await deleteEventMember(eventId, userId);
	if (result.count === 0) {
		throw new HttpError(404, "MEMBER_NOT_FOUND", "Member not found or already removed");
	}

	return result;
}
