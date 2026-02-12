import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { SetPublishSchema } from "../schemas/eventPublish.schema.js";
import { createEvent } from "../services/events.service.js";

const EVENT_LIST_SELECT = {
	id: true,
	name: true,
	slug: true,
	isPublished: true,
	capacity: true,
	contactRequirement: true,
	createdAt: true,
} as const;

type SetPublishBody = z.infer<typeof SetPublishSchema>;

const parseId = (raw: string): number => {
	const id = Number(raw);
	if (!Number.isSafeInteger(id) || id <= 0)
		throw new HttpError(400, "INVALID_ID", "Invalid ID");
	return id;
};

// ==========================================
// HANDLERS
// ==========================================

export const createEventHandler: RequestHandler = async (req, res, next) => {
	try {
		const created = await createEvent(req.body);

		res.status(201).json({ ok: true, data: created });
	} catch (err) {
		next(err);
	}
};

export const listEventsHandler: RequestHandler = async (req, res, next) => {
	try {
		const user = req.user as { id: number; role: string } | undefined;

		if (!user) {
			throw new HttpError(401, "UNAUTHENTICATED", "Not authenticated");
		}

		const whereClause =
			user.role === "SUPER_ADMIN"
				? {}
				: { eventMembers: { some: { userId: user.id } } };

		const events = await prisma.event.findMany({
			where: whereClause,
			orderBy: { createdAt: "desc" },
			take: 50,
			select: EVENT_LIST_SELECT,
		});

		res.json({ ok: true, data: { events } });
	} catch (e) {
		next(e);
	}
};

export const setPublishHandler: RequestHandler<
	{ eventId: string },
	any,
	SetPublishBody
> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);

		const parsed = SetPublishSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(
				400,
				"VALIDATION_ERROR",
				"Invalid data",
				parsed.error.flatten().fieldErrors,
			);
		}

		const updated = await prisma.event.update({
			where: { id: eventId },
			data: { isPublished: parsed.data.isPublished },
			select: {
				id: true,
				slug: true,
				name: true,
				isPublished: true,
				updatedAt: true,
			},
		});

		res.json({ ok: true, data: { event: updated } });
	} catch (e) {
		if (e?.code === "P2025") {
			return next(
				new HttpError(404, "EVENT_NOT_FOUND", "Event not found"),
			);
		}
		next(e);
	}
};
