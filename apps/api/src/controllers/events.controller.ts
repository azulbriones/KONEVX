import type { RequestHandler } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { createEvent } from "../services/events.service.js";

export const createEventHandler: RequestHandler = async (
	req: { body: any },
	res: any,
	next: (arg0: unknown) => void,
) => {
	try {
		const created = await createEvent(req.body);
		res.status(201).json({ ok: true, data: created });
	} catch (err) {
		next(err);
	}
};

export const listEventsHandler: RequestHandler = async (
	req: { user: any },
	res: { json: (arg0: { ok: boolean; data: { events: any } }) => void },
	next: (arg0: unknown) => void,
) => {
	try {
		const user = req.user;
		if (!user)
			throw new HttpError(401, "UNAUTHENTICATED", "Not authenticated");

		const events =
			user.role === "SUPER_ADMIN"
				? await prisma.event.findMany({
						orderBy: { createdAt: "desc" },
						select: {
							id: true,
							name: true,
							slug: true,
							isPublished: true,
							capacity: true,
							contactRequirement: true,
							createdAt: true,
						},
					})
				: await prisma.event.findMany({
						where: { eventMembers: { some: { userId: user.id } } },
						orderBy: { createdAt: "desc" },
						select: {
							id: true,
							name: true,
							slug: true,
							isPublished: true,
							capacity: true,
							contactRequirement: true,
							createdAt: true,
						},
					});

		res.json({ ok: true, data: { events } });
	} catch (e) {
		next(e);
	}
};
