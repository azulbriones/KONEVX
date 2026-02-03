import type { RequestHandler } from "express";
import {
	listEventFields,
	replaceEventFields,
} from "../services/eventFields.service.js";

function parseEventId(raw: string): number {
	const id = Number(raw);
	if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid eventId");
	return id;
}

export const listEventFieldsHandler: RequestHandler = async (
	req: { params: { eventId: string } },
	res,
	next: (arg0: unknown) => void,
) => {
	try {
		const eventId = parseEventId(req.params.eventId);
		const fields = await listEventFields(eventId);
		res.json({ ok: true, data: fields });
	} catch (err) {
		next(err);
	}
};

export const replaceEventFieldsHandler: RequestHandler = async (
	req: { params: { eventId: string }; body: any },
	res,
	next: (arg0: unknown) => void,
) => {
	try {
		const eventId = parseEventId(req.params.eventId);
		const fields = await replaceEventFields(eventId, req.body);
		res.json({ ok: true, data: fields });
	} catch (err) {
		next(err);
	}
};
