import type { RequestHandler } from "express";
import { z } from "zod";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import { UpdateRegistrationStatusSchema } from "../schemas/registrationStatus.schema.js";
import { updateRegistrationStatus } from "../services/registrationStatus.service.js";

type UpdateStatusBody = z.infer<typeof UpdateRegistrationStatusSchema>;

// ==========================================
// HANDLER
// ==========================================

export const updateRegistrationStatusHandler: RequestHandler<
	{ eventId: string; registrationId: string },
	any,
	UpdateStatusBody
> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId, "event");
		const registrationId = parseId(
			req.params.registrationId,
			"registration",
		);

		const parsed = UpdateRegistrationStatusSchema.safeParse(req.body);

		if (!parsed.success) {
			throw new HttpError(
				400,
				"VALIDATION_ERROR",
				"Invalid status data",
				parsed.error.flatten().fieldErrors,
			);
		}

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
