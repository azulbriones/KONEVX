import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";
import { UpdateRegistrationStatusSchema } from "../schemas/registrationStatus.schema.js";
import { updateRegistrationStatus } from "../services/registrationStatus.service.js";

function parseId(raw: string, code: string) {
	const n = Number(raw);
	if (!Number.isInteger(n) || n <= 0)
		throw new HttpError(400, code, "Invalid id");
	return n;
}

export const updateRegistrationStatusHandler: RequestHandler = async (
	req: { params: { eventId: string; registrationId: string }; body: any },
	res,
	next: (arg0: unknown) => void,
) => {
	try {
		const eventId = parseId(req.params.eventId, "INVALID_EVENT_ID");
		const registrationId = parseId(
			req.params.registrationId,
			"INVALID_REGISTRATION_ID",
		);

		const parsed = UpdateRegistrationStatusSchema.safeParse(req.body);
		if (!parsed.success) return next(parsed.error);

		const updated = await updateRegistrationStatus(
			eventId,
			registrationId,
			parsed.data,
		);
		res.json({ ok: true, data: updated });
	} catch (err) {
		next(err);
	}
};
