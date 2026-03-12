import { Prisma } from "@prisma/client";
import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { buildEventAccess } from "../lib/eventAccess.js";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import { SetPublishSchema } from "../schemas/eventPublish.schema.js";
import { CreateEventSchema, UpdateEventSchema } from "../schemas/events.schema.js";
import { createEvent, deleteEvent, updateEvent } from "../services/events.service.js";


const EVENT_DETAIL_SELECT = {
	id: true,
	name: true,
	slug: true,
	capacity: true,
	contactRequirement: true,
	isPublished: true,
	organizerName: true,
	slogan: true,
	description: true,
	footerDescription: true,
	location: true,
	startDate: true,
	endDate: true,
	entryTime: true,
	exitTime: true,
	cost: true,
	minAge: true,
	promotionalVideo: true,
	promotionalImages: true,
	contactInfo: true,
	socialMediaInfo: true,
	hashtag: true,
	logo: true,
	backgroundImage: true,
	heroImage: true,
	thingsToBring: true,
	thingsNotToBring: true,
	note: true,
	groupingSettings: true,
	createdAt: true,
	updatedAt: true,
} as const;

type SetPublishBody = z.infer<typeof SetPublishSchema>;

// ==========================================
// HANDLERS
// ==========================================

export const createEventHandler: RequestHandler = async (req, res, next) => {
	try {
		const user = req.user as { id: number; role: string } | undefined;
		if (!user) throw new HttpError(401, "UNAUTHENTICATED", "No autenticado");

		const parsedBody = CreateEventSchema.parse(req.body);

		const files = req.files as { [fieldname: string]: Express.Multer.File[] };

		let logoUrl: string | null = null;
		let videoUrl: string | null = null;
		let imagesUrls: string[] = [];
		let backgroundUrl: string | null = null;
		let heroUrl: string | null = null;

		if (files?.logo?.[0]) {
			logoUrl = `/uploads/${files.logo[0].filename}`;
		}

		if (files?.promotionalVideo?.[0]) {
			videoUrl = `/uploads/${files.promotionalVideo[0].filename}`;
		}

		if (files?.promotionalImages) {
			imagesUrls = files.promotionalImages.map(file => `/uploads/${file.filename}`);
		}

		if (files?.backgroundImage?.[0]) {
			backgroundUrl = `/uploads/${files.backgroundImage[0].filename}`;
		}
		if (files?.heroImage?.[0]) {
			heroUrl = `/uploads/${files.heroImage[0].filename}`;
		}

		const eventData = {
			...parsedBody,
			logo: logoUrl,
			promotionalVideo: videoUrl,
			promotionalImages: imagesUrls.length > 0 ? imagesUrls : null,
			backgroundImage: backgroundUrl,
			heroImage: heroUrl,
		};

		const created = await createEvent(eventData, user.id);

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
				select: EVENT_DETAIL_SELECT,
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
				...EVENT_DETAIL_SELECT,
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

		const [fieldsCount, registrationsCount, groupStatsRaw] = await Promise.all([
			prisma.eventField.count({ where: { eventId } }),
			prisma.registration.count({ where: { eventId } }),
			prisma.registration.groupBy({
				by: ['assignedGroup'],
				where: {
					eventId,
					status: { not: "CANCELLED" },
					assignedGroup: { not: null }
				},
				_count: { assignedGroup: true }
			})
		]);

		const groupsOccupancy = groupStatsRaw.reduce((acc, curr) => {
			if (curr.assignedGroup) {
				acc[curr.assignedGroup] = curr._count.assignedGroup;
			}
			return acc;
		}, {} as Record<string, number>);

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
					groupsOccupancy,
				},
			},
		});
	} catch (e) {
		next(e);
	}
};

export const updateEventHandler: RequestHandler<{ eventId: string }> = async (req, res, next) => {
	try {
		const user = req.user as { id: number; role: string } | undefined;
		if (!user) throw new HttpError(401, "UNAUTHENTICATED", "No autenticado");

		const eventId = parseId(req.params.eventId);
		const isSuperAdmin = user.role === "SUPER_ADMIN";

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
			throw new HttpError(403, "FORBIDDEN", "No tienes permisos para modificar este evento o no existe");
		}

		const parsedBody = UpdateEventSchema.parse(req.body);
		const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

		const updateData: any = { ...parsedBody };

		if (files?.logo?.[0]) {
			updateData.logo = `/uploads/${files.logo[0].filename}`;
		}
		if (files?.promotionalVideo?.[0]) {
			updateData.promotionalVideo = `/uploads/${files.promotionalVideo[0].filename}`;
		}
		if (files?.promotionalImages) {
			updateData.promotionalImages = files.promotionalImages.map(f => `/uploads/${f.filename}`);
		}

		if (files?.backgroundImage?.[0]) {
			updateData.backgroundImage = `/uploads/${files.backgroundImage[0].filename}`;
		}
		if (files?.heroImage?.[0]) {
			updateData.heroImage = `/uploads/${files.heroImage[0].filename}`;
		}

		const updated = await updateEvent(eventId, updateData);

		res.json({ ok: true, data: updated });
	} catch (err) {
		next(err);
	}
};

export const deleteEventHandler: RequestHandler<{ eventId: string }> = async (req, res, next) => {
	try {
		const user = req.user as { id: number; role: string } | undefined;
		if (!user) throw new HttpError(401, "UNAUTHENTICATED", "No autenticado");

		const eventId = parseId(req.params.eventId);
		const isSuperAdmin = user.role === "SUPER_ADMIN";

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
			throw new HttpError(403, "FORBIDDEN", "No tienes permisos para eliminar este evento o no existe");
		}

		await deleteEvent(eventId);

		res.json({ ok: true, message: "Evento eliminado correctamente" });
	} catch (err) {
		next(err);
	}
};
