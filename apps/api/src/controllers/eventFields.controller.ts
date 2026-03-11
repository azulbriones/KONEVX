import type { RequestHandler } from "express";
import { z } from "zod";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import {
	ReplaceEventFieldsInput,
	ReplaceEventFieldsSchema,
} from "../schemas/eventFields.schema.js";
import {
	listEventFields,
	replaceEventFields,
} from "../services/eventFields.service.js";

const ReplaceEventFieldsBodySchema = ReplaceEventFieldsSchema;

type ReplaceEventFieldsBody = z.infer<typeof ReplaceEventFieldsBodySchema>;

// ==========================================
// HANDLERS
// ==========================================

export const listEventFieldsHandler: RequestHandler<{
	eventId: string;
}> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);

		const fields = await listEventFields(eventId);

		res.json({ ok: true, data: fields });
	} catch (err) {
		next(err);
	}
};

export const replaceEventFieldsHandler: RequestHandler<
	{ eventId: string },
	any,
	ReplaceEventFieldsInput
> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);

		const parsed = ReplaceEventFieldsSchema.safeParse(req.body);

		if (!parsed.success) {
			throw new HttpError(
				400,
				"VALIDATION_ERROR",
				"Invalid fields structure",
				{
					fieldErrors: parsed.error.flatten().fieldErrors,
					formErrors: parsed.error.flatten().formErrors,
					issues: parsed.error.issues,
				},
			);
		}

		const fields = await replaceEventFields(eventId, parsed.data);

		res.json({ ok: true, data: fields });
	} catch (err) {
		next(err);
	}
};
