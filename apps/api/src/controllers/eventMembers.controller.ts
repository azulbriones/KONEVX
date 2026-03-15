import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import {
	AddMemberSchema,
	UpdateMemberRoleSchema,
} from "../schemas/eventMembers.schema.js";

type AddMemberBody = z.infer<typeof AddMemberSchema>;
type UpdateMemberBody = z.infer<typeof UpdateMemberRoleSchema>;

// ==========================================
// HANDLERS
// ==========================================

export const listEventMembersHandler: RequestHandler<{
	eventId: string;
}> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId, "eventId");

		const members = await prisma.eventMember.findMany({
			where: { eventId },
			orderBy: { createdAt: "asc" },
			select: {
				role: true,
				createdAt: true,
				user: { select: { id: true, email: true, username: true, role: true } },
			},
		});

		const formattedMembers = members.map(
			(m: {
				user: { id: number; email: string; role: string };
				role: string;
				createdAt: Date;
			}) => ({
				userId: m.user.id,
				email: m.user.email,
				globalRole: m.user.role,
				eventRole: m.role,
				createdAt: m.createdAt,
			}),
		);

		res.json({
			ok: true,
			data: { members: formattedMembers },
		});
	} catch (e) {
		next(e);
	}
};

export const addEventMemberHandler: RequestHandler<
	{ eventId: string },
	any,
	AddMemberBody
> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId, "eventId");

		const parsed = AddMemberSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(
				400,
				"VALIDATION_ERROR",
				"Invalid data",
				parsed.error.flatten(),
			);
		}

		const { email, role } = parsed.data;

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true },
		});

		if (!user) throw new HttpError(404, "USER_NOT_FOUND", "User not found");

		const member = await prisma.eventMember.upsert({
			where: {
				eventId_userId: { eventId, userId: user.id },
			},
			update: { role },
			create: {
				eventId,
				userId: user.id,
				role,
			},
			select: {
				role: true,
				user: { select: { id: true, email: true } },
			},
		});

		res.status(200).json({
			ok: true,
			data: {
				userId: member.user.id,
				email: member.user.email,
				username: (member.user as any).username,
				eventRole: member.role,
			},
		});
	} catch (e) {
		next(e);
	}
};

export const updateEventMemberRoleHandler: RequestHandler<
	{ eventId: string; userId: string },
	any,
	UpdateMemberBody
> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId, "eventId");
		const userId = parseId(req.params.userId, "userId");

		const parsed = UpdateMemberRoleSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(
				400,
				"VALIDATION_ERROR",
				"Invalid data",
				parsed.error.flatten(),
			);
		}

		const updated = await prisma.eventMember.update({
			where: { eventId_userId: { eventId, userId } },
			data: { role: parsed.data.role },
			select: {
				role: true,
				user: { select: { id: true, email: true } },
			},
		});

		res.json({
			ok: true,
			data: {
				userId: updated.user.id,
				email: updated.user.email,
				username: (updated.user as any).username,
				eventRole: updated.role,
			},
		});
	} catch (e: unknown) {
		if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2025") {
			return next(
				new HttpError(
					404,
					"MEMBER_NOT_FOUND",
					"Member not found in this event",
				),
			);
		}
		next(e);
	}
};

export const removeEventMemberHandler: RequestHandler<{
	eventId: string;
	userId: string;
}> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId, "eventId");
		const userId = parseId(req.params.userId, "userId");

		const result = await prisma.eventMember.deleteMany({
			where: { eventId, userId },
		});

		if (result.count === 0) {
			throw new HttpError(
				404,
				"MEMBER_NOT_FOUND",
				"Member not found or already removed",
			);
		}

		res.json({ ok: true });
	} catch (e) {
		next(e);
	}
};
