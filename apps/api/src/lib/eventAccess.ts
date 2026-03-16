import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

enum UserRole {
	SUPER_ADMIN = "SUPER_ADMIN",
	USER = "USER",
}

export enum EventRole {
	EDITOR = "EDITOR",
	VIEWER = "VIEWER",
	CHECKIN = "CHECKIN",
}

interface AuthenticatedRequest extends Request {
	params: Record<string, string>;
	user?: {
		demo?: boolean;
		id: number;
		role: string;
	};
}

function parseEventId(raw?: string): number {
	const id = Number(raw);
	if (!raw || !Number.isSafeInteger(id) || id <= 0) {
		throw new HttpError(400, "INVALID_EVENT_ID", "Invalid eventId");
	}
	return id;
}

async function enforceDemoScope(user: { demo?: boolean }, eventId: number) {
	if (!user.demo) return;

	const demoSlug = process.env.DEMO_EVENT_SLUG ?? "demo-event";
	const ev = await prisma.event.findUnique({
		where: { id: eventId },
		select: { slug: true },
	});

	if (!ev || ev.slug !== demoSlug) {
		throw new HttpError(
			403,
			"DEMO_SCOPE",
			"Demo user can only access demo event",
		);
	}
}

const requireEventRole = (allowedRoles: EventRole[]): RequestHandler => {
	return async (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const user = req.user;

			if (!user) {
				throw new HttpError(401, "UNAUTHENTICATED", "Not authenticated");
			}

			const eventId = parseEventId(req.params.eventId);
			await enforceDemoScope(user, eventId);

			if (user.role === UserRole.SUPER_ADMIN) {
				res.locals.eventRole = "SUPER_ADMIN";
				res.locals.eventId = eventId;
				return next();
			}

			const member = await prisma.eventMember.findUnique({
				where: {
					eventId_userId: { eventId, userId: user.id },
				},
				select: { role: true },
			});

			if (!member?.role) {
				throw new HttpError(403, "FORBIDDEN", "No access to this event");
			}

			if (!allowedRoles.includes(member.role as EventRole)) {
				throw new HttpError(403, "FORBIDDEN", "Insufficient permissions for this action");
			}

			res.locals.eventId = eventId;
			res.locals.eventRole = member.role;

			return next();
		} catch (e) {
			next(e);
		}
	};
};

export function buildEventAccess({
	isSuperAdmin,
	memberRole,
}: {
	isSuperAdmin?: boolean;
	memberRole?: string | null;
}) {
	return {
		canWrite: Boolean(isSuperAdmin || memberRole === "EDITOR"),
		canCheckIn: Boolean(isSuperAdmin || memberRole === "EDITOR" || memberRole === "CHECKIN"),
		canView: Boolean(isSuperAdmin || memberRole === "EDITOR" || memberRole === "VIEWER" || memberRole === "CHECKIN"),
	};
}

export const requireEventAdmin = requireEventRole([EventRole.EDITOR]);

export const requireEventCheckin = requireEventRole([EventRole.EDITOR, EventRole.CHECKIN]);

export const requireEventView = requireEventRole([EventRole.EDITOR, EventRole.VIEWER, EventRole.CHECKIN]);
