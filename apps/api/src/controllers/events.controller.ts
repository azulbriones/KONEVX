import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import { SetPublishSchema } from "../schemas/eventPublish.schema.js";
import { CreateEventSchema, UpdateEventSchema } from "../schemas/events.schema.js";
import { QuickRegistrationSchema } from "../schemas/quickRegistration.schema.js";
import {
	createEvent,
	createQuickRegistration,
	deleteEvent,
	getEventDetailsForUser,
	listEventsForUser,
	publishEvent,
	updateEvent,
} from "../services/events.service.js";

function requireUser(req: { user?: { id: number; role: string } }) {
	if (!req.user) throw new HttpError(401, "UNAUTHENTICATED", "No autenticado");
	return req.user;
}

function buildMediaUrls(files: Record<string, Express.Multer.File[] | undefined>) {
	const promotionalImages = files.promotionalImages?.map((file) => `/uploads/${file.filename}`) ?? [];

	return {
		logo: files.logo?.[0] ? `/uploads/${files.logo[0].filename}` : null,
		promotionalVideo: files.promotionalVideo?.[0] ? `/uploads/${files.promotionalVideo[0].filename}` : null,
		promotionalImages: promotionalImages.length > 0 ? promotionalImages : null,
		backgroundImage: files.backgroundImage?.[0] ? `/uploads/${files.backgroundImage[0].filename}` : null,
		heroImage: files.heroImage?.[0] ? `/uploads/${files.heroImage[0].filename}` : null,
	};
}

export const createEventHandler: RequestHandler = async (req, res, next) => {
	try {
		const user = requireUser(req as { user?: { id: number; role: string } });
		const parsedBody = CreateEventSchema.safeParse(req.body);

		if (!parsedBody.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Datos inválidos", parsedBody.error.flatten().fieldErrors);
		}

		const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) ?? {};

		const created = await createEvent(
			{
				...parsedBody.data,
				...buildMediaUrls(files),
			},
			user.id,
		);

		res.status(201).json({ ok: true, data: created });
	} catch (err) {
		next(err);
	}
};

export const listEventsHandler: RequestHandler = async (req, res, next) => {
	try {
		const user = requireUser(req as { user?: { id: number; role: string } });
		const events = await listEventsForUser(user);
		res.json({ ok: true, data: { events } });
	} catch (e) {
		next(e);
	}
};

export const setPublishHandler: RequestHandler<{ eventId: string }> = async (req, res, next) => {
	try {
		const user = requireUser(req as { user?: { id: number; role: string } });
		const eventId = parseId(req.params.eventId);
		const parsed = SetPublishSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Datos inválidos", parsed.error.flatten().fieldErrors);
		}

		void user;
		const event = await publishEvent(eventId, parsed.data.isPublished);
		res.json({ ok: true, data: { event } });
	} catch (e) {
		next(e);
	}
};

export const getEventHandler: RequestHandler<{ eventId: string }> = async (req, res, next) => {
	try {
		const user = requireUser(req as { user?: { id: number; role: string; demo?: boolean } });
		const eventId = parseId(req.params.eventId);
		const data = await getEventDetailsForUser(eventId, user);
		res.json({ ok: true, data });
	} catch (e) {
		next(e);
	}
};

export const updateEventHandler: RequestHandler<{ eventId: string }> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const parsedBody = UpdateEventSchema.safeParse(req.body);

		if (!parsedBody.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Datos inválidos", parsedBody.error.flatten().fieldErrors);
		}

		const files = (req.files as { [fieldname: string]: Express.Multer.File[] } | undefined) ?? {};
		const mediaUrls = buildMediaUrls(files);
		const updated = await updateEvent(eventId, {
			...parsedBody.data,
			...mediaUrls,
		});
		res.json({ ok: true, data: updated });
	} catch (err) {
		next(err);
	}
};

export const deleteEventHandler: RequestHandler<{ eventId: string }> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		await deleteEvent(eventId);
		res.json({ ok: true, message: "Evento eliminado correctamente" });
	} catch (err) {
		next(err);
	}
};

export const quickRegistrationHandler: RequestHandler = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const parsed = QuickRegistrationSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Datos inválidos", parsed.error.flatten().fieldErrors);
		}

		const data = await createQuickRegistration(eventId, parsed.data);
		res.status(201).json({ ok: true, message: "Registro express completado con éxito", data });
	} catch (e) {
		next(e);
	}
};
