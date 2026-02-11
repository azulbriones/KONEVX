import type { RequestHandler } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import {
	AddMemberSchema,
	UpdateMemberRoleSchema,
} from "../schemas/eventMembers.schema.js";

function parseEventId(raw: string) {
	const id = Number(raw);
	if (!Number.isInteger(id) || id <= 0)
		throw new HttpError(400, "INVALID_EVENT_ID", "Invalid eventId");
	return id;
}

function parseUserId(raw: string) {
	const id = Number(raw);
	if (!Number.isInteger(id) || id <= 0)
		throw new HttpError(400, "INVALID_USER_ID", "Invalid userId");
	return id;
}

export const listEventMembersHandler: RequestHandler = async (
	req: { params: { eventId: string } },
	res: { json: (arg0: { ok: boolean; data: { members: any } }) => void },
	next: (arg0: unknown) => void,
) => {
	try {
		const eventId = parseEventId(req.params.eventId);

		const members = await prisma.eventMember.findMany({
			where: { eventId },
			orderBy: { createdAt: "asc" },
			select: {
				role: true,
				createdAt: true,
				user: { select: { id: true, email: true, role: true } },
			},
		});

		res.json({
			ok: true,
			data: {
				members: members.map(
					(m: {
						user: { id: any; email: any; role: any };
						role: any;
						createdAt: any;
					}) => ({
						userId: m.user.id,
						email: m.user.email,
						globalRole: m.user.role,
						eventRole: m.role,
						createdAt: m.createdAt,
					}),
				),
			},
		});
	} catch (e) {
		next(e);
	}
};

export const addEventMemberHandler: RequestHandler = async (
	req: { params: { eventId: string }; body: any },
	res: {
		status: (arg0: number) => {
			(): any;
			new (): any;
			json: {
				(arg0: {
					ok: boolean;
					data: { userId: any; email: any; eventRole: any };
				}): void;
				new (): any;
			};
		};
	},
	next: (arg0: unknown) => void,
) => {
	try {
		const eventId = parseEventId(req.params.eventId);
		const parsed = AddMemberSchema.safeParse(req.body);
		if (!parsed.success)
			throw new HttpError(
				400,
				"VALIDATION_ERROR",
				"Invalid data",
				parsed.error.flatten(),
			);

		const { email, role } = parsed.data;

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true },
		});
		if (!user) throw new HttpError(404, "USER_NOT_FOUND", "User not found");

		const existing = await prisma.eventMember.findUnique({
			where: { eventId_userId: { eventId, userId: user.id } },
			select: { role: true },
		});

		const member = existing
			? await prisma.eventMember.update({
					where: { eventId_userId: { eventId, userId: user.id } },
					data: { role },
					select: {
						role: true,
						user: { select: { id: true, email: true } },
					},
				})
			: await prisma.eventMember.create({
					data: { eventId, userId: user.id, role },
					select: {
						role: true,
						user: { select: { id: true, email: true } },
					},
				});

		res.status(existing ? 200 : 201).json({
			ok: true,
			data: {
				userId: member.user.id,
				email: member.user.email,
				eventRole: member.role,
			},
		});
	} catch (e) {
		next(e);
	}
};

export const updateEventMemberRoleHandler: RequestHandler = async (
	req: { params: { eventId: string; userId: string }; body: any },
	res: {
		json: (arg0: {
			ok: boolean;
			data: { userId: any; email: any; eventRole: any };
		}) => void;
	},
	next: (arg0: unknown) => void,
) => {
	try {
		const eventId = parseEventId(req.params.eventId);
		const userId = parseUserId(req.params.userId);

		const parsed = UpdateMemberRoleSchema.safeParse(req.body);
		if (!parsed.success)
			throw new HttpError(
				400,
				"VALIDATION_ERROR",
				"Invalid data",
				parsed.error.flatten(),
			);

		try {
			const updated = await prisma.eventMember.update({
				where: { eventId_userId: { eventId, userId } },
				data: { role: parsed.data.role },
				select: {
					role: true,
					user: { select: { id: true, email: true } },
				},
			});

			return res.json({
				ok: true,
				data: {
					userId: updated.user.id,
					email: updated.user.email,
					eventRole: updated.role,
				},
			});
		} catch (e: any) {
			if (e?.code === "P2025") {
				throw new HttpError(
					404,
					"MEMBER_NOT_FOUND",
					"Member not found",
				);
			}
			throw e;
		}
	} catch (e) {
		next(e);
	}
};

export const removeEventMemberHandler: RequestHandler = async (
	req: { params: { eventId: string; userId: string } },
	res: { json: (arg0: { ok: boolean }) => void },
	next: (arg0: unknown) => void,
) => {
	try {
		const eventId = parseEventId(req.params.eventId);
		const userId = parseUserId(req.params.userId);

		try {
			await prisma.eventMember.delete({
				where: { eventId_userId: { eventId, userId } },
			});
		} catch (e: any) {
			if (e?.code === "P2025") {
				throw new HttpError(
					404,
					"MEMBER_NOT_FOUND",
					"Member not found",
				);
			}
			throw e;
		}

		res.json({ ok: true });
	} catch (e) {
		next(e);
	}
};
