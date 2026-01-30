import type { RequestHandler } from "express";
import { createEvent, listEvents } from "../services/events.service.js";

export const createEventHandler: RequestHandler = async (req, res, next) => {
	try {
		const created = await createEvent(req.body);
		res.status(201).json({ ok: true, data: created });
	} catch (err) {
		next(err);
	}
};

export const listEventsHandler: RequestHandler = async (_req, res, next) => {
	try {
		const events = await listEvents();
		res.json({ ok: true, data: events });
	} catch (err) {
		next(err);
	}
};
