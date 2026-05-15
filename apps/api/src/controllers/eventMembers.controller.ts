import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import { AddMemberSchema, UpdateMemberRoleSchema } from "../schemas/eventMembers.schema.js";
import {
	addEventMember,
	changeEventMemberRole,
	listEventMembers,
	removeEventMember,
} from "../services/eventMembers.service.js";

export const listEventMembersHandler: RequestHandler<{ eventId: string }> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId, "eventId");
		const members = await listEventMembers(eventId);
		const formattedMembers = members.map((m) => ({
			userId: m.user.id,
			email: m.user.email,
			globalRole: m.user.role,
			eventRole: m.role,
			createdAt: m.createdAt,
		}));
		res.json({ ok: true, data: { members: formattedMembers } });
	} catch (e) {
		next(e);
	}
};

export const addEventMemberHandler: RequestHandler<{ eventId: string }> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId, "eventId");
		const parsed = AddMemberSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Invalid data", parsed.error.flatten());
		}

		const { email, role } = parsed.data;
		const member = await addEventMember(eventId, email, role);

		res.status(200).json({
			ok: true,
			data: {
				userId: member.user.id,
				email: member.user.email,
				username: member.user.username,
				eventRole: member.role,
			},
		});
	} catch (e) {
		next(e);
	}
};

export const updateEventMemberRoleHandler: RequestHandler<{ eventId: string; userId: string }> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId, "eventId");
		const userId = parseId(req.params.userId, "userId");
		const parsed = UpdateMemberRoleSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Invalid data", parsed.error.flatten());
		}

		const updated = await changeEventMemberRole(eventId, userId, parsed.data.role);

		res.json({
			ok: true,
			data: {
				userId: updated.user.id,
				email: updated.user.email,
				username: updated.user.username,
				eventRole: updated.role,
			},
		});
	} catch (e) {
		next(e);
	}
};

export const removeEventMemberHandler: RequestHandler<{ eventId: string; userId: string }> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId, "eventId");
		const userId = parseId(req.params.userId, "userId");
		await removeEventMember(eventId, userId);
		res.json({ ok: true });
	} catch (e) {
		next(e);
	}
};
