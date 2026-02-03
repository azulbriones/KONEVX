import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { normalizeEmail, normalizePhone } from "../lib/normalize.js";
import type { PublicRegisterInput } from "../schemas/publicRegistration.schema.js";

function validateAndPickValues(
	fields: Array<{
		id: number;
		key: string;
		type:
			| "TEXT"
			| "NUMBER"
			| "DATE"
			| "SELECT"
			| "MULTI_SELECT"
			| "CHECKBOX";
		required: boolean;
		options: unknown;
	}>,
	answers: Record<string, unknown>,
) {
	const allowedKeys = new Set(fields.map((f) => f.key));

	for (const key of Object.keys(answers)) {
		if (!allowedKeys.has(key)) {
			throw new HttpError(400, "UNKNOWN_FIELD", `Unknown field: ${key}`);
		}
	}

	// 2) required
	for (const f of fields) {
		if (
			f.required &&
			(answers[f.key] === undefined ||
				answers[f.key] === null ||
				answers[f.key] === "")
		) {
			throw new HttpError(
				400,
				"MISSING_REQUIRED_FIELD",
				`Missing required field: ${f.key}`,
			);
		}
	}

	const values: Array<{ eventFieldId: number; value: unknown }> = [];

	for (const f of fields) {
		const v = answers[f.key];
		if (v === undefined) continue;

		switch (f.type) {
			case "TEXT": {
				if (typeof v !== "string")
					throw new HttpError(
						400,
						"INVALID_FIELD_VALUE",
						`${f.key} must be string`,
					);
				values.push({ eventFieldId: f.id, value: v });
				break;
			}
			case "NUMBER": {
				if (typeof v !== "number" || !Number.isFinite(v))
					throw new HttpError(
						400,
						"INVALID_FIELD_VALUE",
						`${f.key} must be number`,
					);
				values.push({ eventFieldId: f.id, value: v });
				break;
			}
			case "DATE": {
				if (typeof v !== "string")
					throw new HttpError(
						400,
						"INVALID_FIELD_VALUE",
						`${f.key} must be date string`,
					);
				const d = new Date(v);
				if (Number.isNaN(d.getTime()))
					throw new HttpError(
						400,
						"INVALID_FIELD_VALUE",
						`${f.key} invalid date`,
					);
				values.push({ eventFieldId: f.id, value: v });
				break;
			}
			case "CHECKBOX": {
				if (typeof v !== "boolean")
					throw new HttpError(
						400,
						"INVALID_FIELD_VALUE",
						`${f.key} must be boolean`,
					);
				values.push({ eventFieldId: f.id, value: v });
				break;
			}
			case "SELECT": {
				if (typeof v !== "string")
					throw new HttpError(
						400,
						"INVALID_FIELD_VALUE",
						`${f.key} must be string`,
					);
				const opts = Array.isArray(f.options) ? f.options : null;
				if (!opts || !opts.every((o) => typeof o === "string")) {
					throw new HttpError(
						500,
						"FIELD_OPTIONS_INVALID",
						`Field options misconfigured: ${f.key}`,
					);
				}
				if (!opts.includes(v))
					throw new HttpError(
						400,
						"INVALID_FIELD_VALUE",
						`${f.key} must be one of options`,
					);
				values.push({ eventFieldId: f.id, value: v });
				break;
			}
			case "MULTI_SELECT": {
				if (
					!Array.isArray(v) ||
					!v.every((x) => typeof x === "string")
				) {
					throw new HttpError(
						400,
						"INVALID_FIELD_VALUE",
						`${f.key} must be string[]`,
					);
				}
				const opts = Array.isArray(f.options) ? f.options : null;
				if (!opts || !opts.every((o) => typeof o === "string")) {
					throw new HttpError(
						500,
						"FIELD_OPTIONS_INVALID",
						`Field options misconfigured: ${f.key}`,
					);
				}
				for (const item of v) {
					if (!opts.includes(item))
						throw new HttpError(
							400,
							"INVALID_FIELD_VALUE",
							`${f.key} has invalid option`,
						);
				}
				values.push({ eventFieldId: f.id, value: v });
				break;
			}
			default:
				throw new HttpError(
					500,
					"FIELD_TYPE_INVALID",
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
				slug: true,
				name: true,
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
				type: true,
				required: true,
				options: true,
			},
		});

		const answerValues = validateAndPickValues(fields, input.answers ?? {});

		let participant =
			(emailNormalized
				? await tx.participant.findUnique({
						where: { emailNormalized },
					})
				: null) ??
			(phoneNormalized
				? await tx.participant.findUnique({
						where: { phoneNormalized },
					})
				: null);

		if (emailNormalized && phoneNormalized) {
			const pByEmail = await tx.participant.findUnique({
				where: { emailNormalized },
			});
			const pByPhone = await tx.participant.findUnique({
				where: { phoneNormalized },
			});
			if (pByEmail && pByPhone && pByEmail.id !== pByPhone.id) {
				throw new HttpError(
					409,
					"CONTACT_CONFLICT",
					"Email and phone belong to different participants",
				);
			}
			participant = pByEmail ?? pByPhone ?? participant;
		}

		if (!participant) {
			participant = await tx.participant.create({
				data: { emailNormalized, phoneNormalized },
			});
		} else {
			participant = await tx.participant.update({
				where: { id: participant.id },
				data: {
					emailNormalized:
						participant.emailNormalized ?? emailNormalized,
					phoneNormalized:
						participant.phoneNormalized ?? phoneNormalized,
				},
			});
		}

		const existing = await tx.registration.findUnique({
			where: {
				eventId_participantId: {
					eventId: event.id,
					participantId: participant.id,
				},
			},
			select: { id: true, status: true, createdAt: true },
		});

		if (existing) {
			return {
				status: "EXISTS" as const,
				registration: existing,
			};
		}

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
			},
			select: { id: true, status: true, createdAt: true },
		});

		if (answerValues.length > 0) {
			await tx.registrationFieldValue.createMany({
				data: answerValues.map((v) => ({
					registrationId: registration.id,
					eventFieldId: v.eventFieldId,
					value: v.value,
				})),
			});
		}

		return {
			status: "CREATED" as const,
			registration,
		};
	});
}
