import { Prisma } from "@prisma/client";
import type { RequestHandler } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import { RegistrationsQuerySchema } from "../schemas/registrationsQuery.schema.js";
import { checkInRegistration, undoCheckInRegistration } from "../services/registrations.service.js";

export const listRegistrationsHandler: RequestHandler<{ eventId: string }> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const parsed = RegistrationsQuerySchema.safeParse(req.query);

		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Consulta inválida", parsed.error.flatten().fieldErrors);
		}

		const { page = 1, limit = 20, status, q, fieldId: rawFieldId } = parsed.data;
		const skip = (page - 1) * limit;
		const fieldId = rawFieldId ? parseId(rawFieldId) : undefined;

		const where: Prisma.RegistrationWhereInput = {
			eventId,
			status: status || undefined,
		};

		if (q) {
			const searchNormalized = q.trim();
			const searchAsNumber = parseInt(searchNormalized);

			const words = searchNormalized.split(/\s+/);

			const wordsConditions: Prisma.RegistrationWhereInput[] = words.map(word => {
				const wordLower = word.toLowerCase();
				const wordUpper = word.toUpperCase();
				const wordCap = wordLower.charAt(0).toUpperCase() + wordLower.slice(1);

				return {
					OR: [
						{ participant: { emailNormalized: { contains: word, mode: "insensitive" } } },
						{ participant: { phoneNormalized: { contains: word } } },
						{
							fieldValues: {
								some: {
									...(fieldId ? { eventFieldId: fieldId } : {}),
									OR: [
										{ value: { string_contains: word } },
										{ value: { string_contains: wordLower } },
										{ value: { string_contains: wordUpper } },
										{ value: { string_contains: wordCap } }
									]
								}
							}
						}
					]
				};
			});

			if (!isNaN(searchAsNumber) && words.length === 1) {
				where.OR = [
					{ id: searchAsNumber },
					...(wordsConditions[0].OR as Prisma.RegistrationWhereInput[])
				];
			} else {
				where.AND = wordsConditions;
			}
		}

		const [total, rows] = await prisma.$transaction([
			prisma.registration.count({ where }),
			prisma.registration.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
				select: {
					id: true,
					status: true,
					assignedGroup: true,
					checkInNotes: true,
					createdAt: true,
					participant: { select: { id: true, emailNormalized: true, phoneNormalized: true } },
					fieldValues: {
						select: {
							value: true,
							eventField: { select: { key: true, label: true, type: true, order: true } }
						}
					}
				},
			}),
		]);

		const items = rows.map((r) => ({
			id: r.id,
			status: r.status,
			assignedGroup: r.assignedGroup,
			checkInNotes: r.checkInNotes,
			createdAt: r.createdAt,
			contact: { id: r.participant.id, email: r.participant.emailNormalized, phone: r.participant.phoneNormalized },
			answers: Object.fromEntries(
				r.fieldValues.map((fv) => [
					fv.eventField.key,
					{ label: fv.eventField.label, type: fv.eventField.type, value: fv.value, order: fv.eventField.order },
				])
			),
		}));

		res.json({
			ok: true,
			data: {
				meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
				items,
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
		const { checkInNotes } = req.body;

		const data = await checkInRegistration(eventId, registrationId, checkInNotes);

		res.json({
			ok: true,
			message: "Asistencia confirmada correctamente",
			data
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
			message: "Entrada anulada. El participante vuelve a estar como 'Registrado'."
		});
	} catch (e) {
		next(e);
	}
};
