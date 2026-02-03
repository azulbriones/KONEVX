import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";
import { ListRegistrationsQuerySchema } from "../schemas/registrations.schema.js";
import { listRegistrationsByEvent } from "../services/registrations.service.js";

function parseEventId(raw: string): number {
	const id = Number(raw);
	if (!Number.isInteger(id) || id <= 0)
		throw new HttpError(400, "INVALID_EVENT_ID", "Invalid eventId");
	return id;
}

export const listRegistrationsHandler: RequestHandler = async (
	req,
	res,
	next,
) => {
	try {
		const eventId = parseEventId(req.params.eventId);

		const parsed = ListRegistrationsQuerySchema.safeParse(req.query);
		if (!parsed.success) return next(parsed.error);

		const result = await listRegistrationsByEvent(eventId, parsed.data);
		res.json({ ok: true, data: result });
	} catch (err) {
		next(err);
	}
};
