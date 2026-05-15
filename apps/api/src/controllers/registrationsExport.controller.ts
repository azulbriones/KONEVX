import type { RequestHandler } from "express";
import { RegistrationStatus } from "@prisma/client";
import { z } from "zod";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import { getRegistrationsGrouped } from "../services/registrationsExport.service.js";
import { sendRegistrationsExcel } from "../services/registrationsExportPresentation.service.js";

const RegistrationsExportQuerySchema = z.object({
	status: z.nativeEnum(RegistrationStatus).optional(),
	groupBy: z.string().optional(),
	columns: z.preprocess((value) => {
		if (typeof value === "string") return value.split(",");
		return [];
	}, z.array(z.string()).default([])),
});

export const exportRegistrationsExcelHandler: RequestHandler<{
	eventId: string;
}> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const parsed = RegistrationsExportQuerySchema.safeParse(req.query);

		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Datos inválidos", parsed.error.flatten().fieldErrors);
		}

		const options = parsed.data;

		const { eventName, header, sheets } = await getRegistrationsGrouped(eventId, options);
		await sendRegistrationsExcel(res, eventName, header, sheets);
	} catch (err) {
		next(err);
	}
};
