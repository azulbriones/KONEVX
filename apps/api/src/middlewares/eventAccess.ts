import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

enum UserRole {
	SUPER_ADMIN = "SUPER_ADMIN",
}

enum EventRole {
	EDITOR = "EDITOR",
	VIEWER = "VIEWER",
}

interface AuthenticatedRequest extends Request {
	params: any;
	user?: {
		demo: any;
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

/**
 * 3. Middleware Factory
 * Genera el middleware de validación basado en el rol mínimo requerido.
 */
const requireEventPermission = (
	requiredRole: "READ" | "WRITE",
): RequestHandler => {
	return async (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const user = req.user;

			if (!user) {
				throw new HttpError(
					401,
					"UNAUTHENTICATED",
					"Not authenticated",
				);
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
				throw new HttpError(
					403,
					"FORBIDDEN",
					"No access to this event",
				);
			}

			if (requiredRole === "WRITE" && member.role !== EventRole.EDITOR) {
				throw new HttpError(403, "FORBIDDEN", "Read-only access");
			}

			res.locals.eventId = eventId;
			res.locals.eventRole = member.role;

			return next();
		} catch (e) {
			next(e);
		}
	};
};

export const requireEventRead = requireEventPermission("READ");
export const requireEventWrite = requireEventPermission("WRITE");
