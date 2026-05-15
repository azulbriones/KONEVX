import type { RequestHandler } from "express";
import { RegistrationStatus } from "@prisma/client";
import { z } from "zod";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import { getRegistrationsForPdf } from "../services/registrationsPdf.service.js";
import { sendRegistrationsPdf } from "../services/registrationsPdfPresentation.service.js";

const RegistrationsPdfQuerySchema = z.object({
	status: z.nativeEnum(RegistrationStatus).optional(),
	groupBy: z.string().optional(),
	pageBreak: z.preprocess((value) => value === "true", z.boolean().default(false)),
	columns: z.preprocess((value) => {
		if (typeof value === "string") return value.split(",");
		return [];
	}, z.array(z.string()).default([])),
});

export const exportRegistrationsPdfHandler: RequestHandler<{
	eventId: string;
}> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const parsed = RegistrationsPdfQuerySchema.safeParse(req.query);

		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Datos inválidos", parsed.error.flatten().fieldErrors);
		}

		const options = parsed.data;

		const { eventName, contactRequirement, rows, dynamicFields } = await getRegistrationsForPdf(eventId, options);
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${eventName.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase()}_registrations.pdf"`,
		);
		sendRegistrationsPdf(res, eventName, contactRequirement, rows, dynamicFields, options);
	} catch (err) {
		next(err);
	}
};
