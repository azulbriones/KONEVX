import { Prisma } from "@prisma/client";
import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { parseId } from "../lib/parser.js";
import { RegistrationsQuerySchema } from "../schemas/registrationsQuery.schema.js";

type RegistrationQuery = z.infer<typeof RegistrationsQuerySchema>;

export const listRegistrationsHandler: RequestHandler<
	{ eventId: string },
	any,
	any,
	RegistrationQuery
> = async (req, res, next) => {
	try {
		const eventId = parseId(req.params.eventId);
		const parsed = RegistrationsQuerySchema.safeParse(req.query);

		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Invalid query", parsed.error.flatten().fieldErrors);
		}

		const { page = 1, limit = 20, status, q } = parsed.data;
		const skip = (page - 1) * limit;

		const where: Prisma.RegistrationWhereInput = {
			eventId,
			status: status || undefined,
		};

		if (q) {
			const searchNormalized = q.trim();
			const phoneClean = q.replace(/\s+/g, "");
			where.OR = [
				{ participant: { emailNormalized: { contains: searchNormalized, mode: "insensitive" } } },
				{ participant: { phoneNormalized: { contains: phoneClean } } },
			];
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
					createdAt: true,
					participant: {
						select: {
							id: true,
							emailNormalized: true,
							phoneNormalized: true,
						},
					},

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
			createdAt: r.createdAt,
			contact: {
				id: r.participant.id,
				email: r.participant.emailNormalized,
				phone: r.participant.phoneNormalized,
			},
			answers: Object.fromEntries(
				r.fieldValues.map((fv) => [
					fv.eventField.key,
					{
						label: fv.eventField.label,
						type: fv.eventField.type,
						value: fv.value,
						order: fv.eventField.order,
					},
				])
			),
		}));

		const totalPages = Math.max(1, Math.ceil(total / limit));

		res.json({
			ok: true,
			data: {
				meta: { page, limit, total, totalPages },
				items,
			},
		});
	} catch (e) {
		next(e);
	}
};
