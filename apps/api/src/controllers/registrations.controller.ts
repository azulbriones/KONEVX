import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import { RegistrationCheckInSchema } from "../schemas/registrationCheckIn.schema.js";
import { RegistrationDataUpdateSchema } from "../schemas/registrationDataUpdate.schema.js";
import { RegistrationsQuerySchema } from "../schemas/registrationsQuery.schema.js";
import {
	checkInRegistration,
	deleteRegistration,
	listRegistrationsByEvent,
	undoCheckInRegistration,
	updateRegistrationData,
} from "../services/registrations.service.js";

export const listRegistrationsHandler: RequestHandler<{ eventId: string }> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const parsed = RegistrationsQuerySchema.safeParse(req.query);

		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Consulta inválida", parsed.error.flatten().fieldErrors);
		}

		const data = await listRegistrationsByEvent(eventId, parsed.data);

		res.json({
			ok: true,
			data: {
				meta: {
					page: Math.floor(data.page.skip / data.page.take) + 1,
					limit: data.page.take,
					total: data.page.total,
					totalPages: Math.ceil(data.page.total / data.page.take),
				},
				items: data.items,
			},
		});
	} catch (e) {
		next(e);
	}
};

export const markAttendanceHandler: RequestHandler<{ eventId: string; registrationId: string }> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const registrationId = parseId(req.params.registrationId);
		const parsed = RegistrationCheckInSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Datos inválidos", parsed.error.flatten().fieldErrors);
		}

		const data = await checkInRegistration(eventId, registrationId, parsed.data.checkInNotes);

		res.json({
			ok: true,
			message: "Asistencia confirmada correctamente",
			data,
		});
	} catch (e) {
		next(e);
	}
};

export const undoAttendanceHandler: RequestHandler = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const registrationId = parseId(req.params.registrationId);

		await undoCheckInRegistration(eventId, registrationId);

		res.json({
			ok: true,
			message: "Entrada anulada. El participante vuelve a estar como 'Registrado'.",
		});
	} catch (e) {
		next(e);
	}
};

export const updateRegistrationDataHandler: RequestHandler = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const registrationId = parseId(req.params.registrationId);
		const parsed = RegistrationDataUpdateSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Datos inválidos", parsed.error.flatten().fieldErrors);
		}

		await updateRegistrationData(eventId, registrationId, parsed.data);

		res.json({
			ok: true,
			message: "Registro actualizado correctamente.",
		});
	} catch (e) {
		next(e);
	}
};

export const deleteRegistrationHandler: RequestHandler = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const registrationId = parseId(req.params.registrationId);

		await deleteRegistration(eventId, registrationId);

		res.json({
			ok: true,
			message: "Registro eliminado permanentemente.",
		});
	} catch (e) {
		next(e);
	}
};
