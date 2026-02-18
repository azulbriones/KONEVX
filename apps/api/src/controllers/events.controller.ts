import { Prisma } from "@prisma/client";
import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
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
	} catch (e: any) {
		if (e?.code === "P2025") {
			return next(
				new HttpError(404, "EVENT_NOT_FOUND", "Event not found"),
			);
		}
		next(e);
	}
};

const EVENT_DETAIL_SELECT = {
	id: true,
	name: true,
	slug: true,
	isPublished: true,
	capacity: true,
	contactRequirement: true,
	createdAt: true,
	updatedAt: true,
} as const;

export const getEventHandler: RequestHandler<{ eventId: string }> = async (
	req,
	res,
	next,
) => {
	try {
		const user = req.user as { id: number; role: string } | undefined;

		if (!user) {
			throw new HttpError(401, "UNAUTHENTICATED", "No autenticado");
		}

		const eventId = parseId(req.params.eventId);

		const whereClause: Prisma.EventWhereInput =
			user.role === "SUPER_ADMIN"
				? { id: eventId }
				: {
						id: eventId,
						eventMembers: { some: { userId: user.id } },
					};

		const event = await prisma.event.findFirst({
			where: whereClause,
			select: EVENT_DETAIL_SELECT,
		});
		console.log(event);
		if (!event) {
			throw new HttpError(
				404,
				"EVENT_NOT_FOUND",
				"Evento no encontrado o sin acceso",
			);
		}

		const [fieldsCount, registrationsCount] = await Promise.all([
			prisma.eventField.count({ where: { eventId } }),
			prisma.registration.count({ where: { eventId } }),
		]);

		res.json({
			ok: true,
			data: {
				event,
				stats: {
					fieldsCount,
					registrationsCount,
					occupancy: event.capacity
						? Math.round(
								(registrationsCount / event.capacity) * 100,
							)
						: null,
				},
			},
		});
	} catch (e) {
		next(e);
	}
};
