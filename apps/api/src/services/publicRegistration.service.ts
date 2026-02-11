import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { normalizeEmail, normalizePhone } from "../lib/normalize.js";
import type { PublicRegisterInput } from "../schemas/publicRegistration.schema.js";

type FieldDefinition = {
	label: string;
	id: number;
	key: string;
	type: "TEXT" | "NUMBER" | "DATE" | "SELECT" | "MULTI_SELECT" | "CHECKBOX";
	required: boolean;
	options: unknown;
};

function validateAndPickValues(
	fields: FieldDefinition[],
	answers: Record<string, unknown>,
) {
	const allowedKeys = new Set(fields.map((f) => f.key));
	for (const key of Object.keys(answers)) {
		if (!allowedKeys.has(key)) {
			throw new HttpError(400, "UNKNOWN_FIELD", `Unknown field: ${key}`);
		}
	}

	const values: Array<{ eventFieldId: number; value: any }> = [];

	for (const f of fields) {
		const val = answers[f.key];

		const isEmpty = val === undefined || val === null || val === "";
		if (f.required && isEmpty) {
			throw new HttpError(
				400,
				"MISSING_REQUIRED_FIELD",
				`Missing required field: ${f.label || f.key}`,
			);
		}

		if (val === undefined || val === null) continue;

		switch (f.type) {
			case "TEXT":
				if (typeof val !== "string")
					throw new HttpError(
						400,
						"INVALID_VALUE",
						`${f.key} must be text`,
					);
				values.push({ eventFieldId: f.id, value: val });
				break;

			case "NUMBER":
				if (typeof val !== "number" || !Number.isFinite(val))
					throw new HttpError(
						400,
						"INVALID_VALUE",
						`${f.key} must be a number`,
					);
				values.push({ eventFieldId: f.id, value: val });
				break;

			case "DATE":
				if (typeof val !== "string" || Number.isNaN(Date.parse(val))) {
					throw new HttpError(
						400,
						"INVALID_VALUE",
						`${f.key} must be a valid date`,
					);
				}
				values.push({ eventFieldId: f.id, value: val });
				break;

			case "CHECKBOX":
				if (typeof val !== "boolean")
					throw new HttpError(
						400,
						"INVALID_VALUE",
						`${f.key} must be true/false`,
					);
				values.push({ eventFieldId: f.id, value: val });
				break;

			case "SELECT": {
				if (typeof val !== "string")
					throw new HttpError(
						400,
						"INVALID_VALUE",
						`${f.key} must be text`,
					);
				const opts = Array.isArray(f.options)
					? (f.options as string[])
					: [];
				if (!opts.includes(val))
					throw new HttpError(
						400,
						"INVALID_OPTION",
						`Invalid option for ${f.key}`,
					);
				values.push({ eventFieldId: f.id, value: val });
				break;
			}

			case "MULTI_SELECT": {
				if (
					!Array.isArray(val) ||
					!val.every((v) => typeof v === "string")
				) {
					throw new HttpError(
						400,
						"INVALID_VALUE",
						`${f.key} must be an array of strings`,
					);
				}
				const opts = Array.isArray(f.options)
					? (f.options as string[])
					: [];
				for (const item of val) {
					if (!opts.includes(item))
						throw new HttpError(
							400,
							"INVALID_OPTION",
							`Invalid option '${item}' for ${f.key}`,
						);
				}
				values.push({ eventFieldId: f.id, value: val });
				break;
			}

			default:
				throw new HttpError(
					500,
					"CONFIG_ERROR",
					`Unsupported field type: ${f.type}`,
				);
		}
	}

	return values;
}

export async function registerPublicBySlug(
	slug: string,
	input: PublicRegisterInput,
) {
	const emailNormalized = normalizeEmail(input.contact.email);
	const phoneNormalized = normalizePhone(input.contact.phone);

	if (!emailNormalized && !phoneNormalized) {
		throw new HttpError(
			400,
			"CONTACT_REQUIRED",
			"Either email or phone is required",
		);
	}

	return prisma.$transaction(async (tx) => {
		const event = await tx.event.findUnique({
			where: { slug },
			select: {
				id: true,
				capacity: true,
				contactRequirement: true,
				isPublished: true,
			},
		});

		if (!event || !event.isPublished) {
			throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");
		}

		if (event.contactRequirement === "EMAIL" && !emailNormalized) {
			throw new HttpError(
				400,
				"EMAIL_REQUIRED",
				"Email is required for this event",
			);
		}
		if (event.contactRequirement === "PHONE" && !phoneNormalized) {
			throw new HttpError(
				400,
				"PHONE_REQUIRED",
				"Phone is required for this event",
			);
		}

		const fields = await tx.eventField.findMany({
			where: { eventId: event.id },
			orderBy: { order: "asc" },
			select: {
				id: true,
				key: true,
				label: true,
				type: true,
				required: true,
				options: true,
			},
		});

		const answerValues = validateAndPickValues(fields, input.answers ?? {});

		let participant = null;

		const pByEmail = emailNormalized
			? await tx.participant.findUnique({ where: { emailNormalized } })
			: null;
		const pByPhone = phoneNormalized
			? await tx.participant.findUnique({ where: { phoneNormalized } })
			: null;

		if (pByEmail && pByPhone && pByEmail.id !== pByPhone.id) {
			throw new HttpError(
				409,
				"CONTACT_CONFLICT",
				"The provided email and phone belong to different users.",
			);
		}

		participant = pByEmail ?? pByPhone;

		if (!participant) {
			participant = await tx.participant.create({
				data: { emailNormalized, phoneNormalized },
			});
		} else {
			const needsUpdate =
				(emailNormalized && !participant.emailNormalized) ||
				(phoneNormalized && !participant.phoneNormalized);

			if (needsUpdate) {
				participant = await tx.participant.update({
					where: { id: participant.id },
					data: {
						emailNormalized:
							emailNormalized || participant.emailNormalized,
						phoneNormalized:
							phoneNormalized || participant.phoneNormalized,
					},
				});
			}
		}

		const existingRegistration = await tx.registration.findUnique({
			where: {
				eventId_participantId: {
					eventId: event.id,
					participantId: participant.id,
				},
			},
		});

		if (existingRegistration) {
			return {
				status: "EXISTS" as const,
				registration: existingRegistration,
			};
		}

		await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${event.id} FOR UPDATE`;

		const activeCount = await tx.registration.count({
			where: { eventId: event.id, status: { not: "CANCELLED" } },
		});

		if (activeCount >= event.capacity) {
			throw new HttpError(409, "EVENT_FULL", "Event capacity reached");
		}

		const registration = await tx.registration.create({
			data: {
				eventId: event.id,
				participantId: participant.id,
				status: "REGISTERED",
				fieldValues: {
					create: answerValues.map((v) => ({
						eventFieldId: v.eventFieldId,
						eventId: event.id,
						value: v.value,
					})),
				},
			},
			select: { id: true, status: true, createdAt: true },
		});

		return { status: "CREATED" as const, registration };
	});
}
