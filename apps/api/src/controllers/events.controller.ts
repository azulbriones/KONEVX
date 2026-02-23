import { Prisma } from "@prisma/client";
import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { buildEventAccess } from "../lib/eventAccess.js";
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
		const user = req.user as { id: number; role: string } | undefined;
		if (!user) {
			throw new HttpError(401, "UNAUTHENTICATED", "No autenticado");
		}

		const created = await createEvent(req.body, user.id);

		res.status(201).json({ ok: true, data: created });
	} catch (err) {
		next(err);
	}
};
export const listEventsHandler: RequestHandler = async (req, res, next) => {
	try {
		const user = req.user as { id: number; role: string } | undefined;
		if (!user)
			throw new HttpError(401, "UNAUTHENTICATED", "Not authenticated");

		const isSuperAdmin = user.role === "SUPER_ADMIN";

		if (isSuperAdmin) {
			const events = await prisma.event.findMany({
				orderBy: { createdAt: "desc" },
				take: 50,
				select: EVENT_LIST_SELECT,
			});

			const withAccess = events.map((e) => ({
				...e,
				access: buildEventAccess({ isSuperAdmin: true }),
			}));

			return res.json({ ok: true, data: { events: withAccess } });
		}

		const events = await prisma.event.findMany({
			where: { eventMembers: { some: { userId: user.id } } },
			orderBy: { createdAt: "desc" },
			take: 50,
			select: {
				...EVENT_LIST_SELECT,
				eventMembers: {
					where: { userId: user.id },
					select: { role: true },
					take: 1,
				},
			},
		});

		const withAccess = events.map((e) => {
			const memberRole = (e.eventMembers[0]?.role ?? null) as
				| "EDITOR"
				| "VIEWER"
				| null;

			const { eventMembers, ...rest } = e;

			return {
				...rest,
				access: buildEventAccess({ isSuperAdmin: false, memberRole }),
			};
		});

		return res.json({ ok: true, data: { events: withAccess } });
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
		const user = req.user as { id: number; role: string } | undefined;
		if (!user) {
			throw new HttpError(401, "UNAUTHENTICATED", "No autenticado");
		}

		const eventId = parseId(req.params.eventId);
		const isSuperAdmin = user.role === "SUPER_ADMIN";

		const parsed = SetPublishSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(
				400,
				"VALIDATION_ERROR",
				"Datos inválidos",
				parsed.error.flatten().fieldErrors,
			);
		}

		const event = await prisma.event.findFirst({
			where: isSuperAdmin
				? { id: eventId }
				: {
						id: eventId,
						eventMembers: {
							some: { userId: user.id, role: "EDITOR" },
						},
					},
		});

		if (!event) {
			throw new HttpError(
				403,
				"FORBIDDEN",
				"No tienes permisos para modificar este evento o no existe",
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
	} catch (e: unknown) {
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
		if (!user)
			throw new HttpError(401, "UNAUTHENTICATED", "No autenticado");

		const eventId = parseId(req.params.eventId);
		const isSuperAdmin = user.role === "SUPER_ADMIN";

		const whereClause: Prisma.EventWhereInput = isSuperAdmin
			? { id: eventId }
			: { id: eventId, eventMembers: { some: { userId: user.id } } };

		const event = await prisma.event.findFirst({
			where: whereClause,
			select: {
				...EVENT_DETAIL_SELECT,
				...(isSuperAdmin
					? {}
					: {
							eventMembers: {
								where: { userId: user.id },
								select: { role: true },
								take: 1,
							},
						}),
			},
		});

		if (!event) {
			throw new HttpError(
				404,
				"EVENT_NOT_FOUND",
				"Evento no encontrado o sin acceso",
			);
		}

		const memberRole = isSuperAdmin
			? null
			: (((event as { eventMembers?: Array<{ role: string }> }).eventMembers?.[0]?.role ?? null) as
					| "EDITOR"
					| "VIEWER"
					| null);

		const safeEvent = isSuperAdmin
			? event
			: (() => {
					const { eventMembers, ...rest } = event as typeof event & { eventMembers?: unknown };
					return rest;
				})();

		const [fieldsCount, registrationsCount] = await Promise.all([
			prisma.eventField.count({ where: { eventId } }),
			prisma.registration.count({ where: { eventId } }),
		]);

		return res.json({
			ok: true,
			data: {
				event: safeEvent,
				access: buildEventAccess({ isSuperAdmin, memberRole }),
				stats: {
					fieldsCount,
					registrationsCount,
					occupancy: safeEvent.capacity
						? Math.round(
								(registrationsCount / safeEvent.capacity) * 100,
							)
						: null,
				},
			},
		});
	} catch (e) {
		next(e);
	}
};
