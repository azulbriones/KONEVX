import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { normalizeEmail, normalizePhone } from "../lib/normalize.js";
import type { PublicRegisterInput } from "../schemas/publicRegistration.schema.js";

type ValidateArgs = {
	event: { contactRequirement: "EMAIL" | "PHONE" };
	fields: { id: number; key: string; type: string; required: boolean; options: any }[];
	payload: {
		contact: { email?: string | null; phone?: string | null };
		answers: Record<string, unknown>;
	};
};

export function validateAndPickValues(args: ValidateArgs) {
	const { event, fields, payload } = args;

	const email = (payload.contact?.email ?? "").trim();
	const phone = (payload.contact?.phone ?? "").trim();

	if (event.contactRequirement === "EMAIL" && !email) {
		throw new HttpError(400, "VALIDATION_ERROR", "Invalid registration payload", {
			contact: { email: "El email es requerido para este evento." },
		});
	}

	if (event.contactRequirement === "PHONE" && !phone) {
		throw new HttpError(400, "VALIDATION_ERROR", "Invalid registration payload", {
			contact: { phone: "El teléfono es requerido para este evento." },
		});
	}

	const allowedKeys = new Set(fields.map((f) => f.key));
	const unknownKeys = Object.keys(payload.answers ?? {}).filter((k) => !allowedKeys.has(k));

	if (unknownKeys.length > 0) {
		throw new HttpError(400, "VALIDATION_ERROR", "Invalid registration payload", {
			answers: Object.fromEntries(unknownKeys.map((k) => [k, "Campo desconocido no permitido."])),
		});
	}

	const answerErrors: Record<string, string> = {};
	const values: { eventFieldId: number; value: any }[] = [];

	const isEmpty = (v: unknown) => {
		if (v === null || v === undefined) return true;
		if (typeof v === "string") return v.trim().length === 0;
		if (Array.isArray(v)) return v.length === 0 || v.every((x) => typeof x === "string" && x.trim().length === 0);
		return false;
	};

	const toBool = (v: unknown) => {
		if (typeof v === "boolean") return v;
		if (typeof v === "number") return v === 1;
		if (typeof v === "string") {
			const s = v.trim().toLowerCase();
			if (["true", "1", "yes", "on"].includes(s)) return true;
			if (["false", "0", "no", "off"].includes(s)) return false;
		}
		return null;
	};

	const isValidYyyyMmDd = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

	for (const f of fields) {
		const raw = payload.answers?.[f.key];

		if (f.required && isEmpty(raw)) {
			answerErrors[f.key] = "Este campo es obligatorio.";
			continue;
		}

		if (!f.required && isEmpty(raw)) continue;

		switch (f.type) {
			case "TEXT": {
				if (typeof raw !== "string") {
					answerErrors[f.key] = "Se esperaba texto.";
					break;
				}
				const v = raw.trim();
				if (v.length > 2000) {
					answerErrors[f.key] = "El texto es demasiado largo (máx 2000 caracteres).";
					break;
				}
				values.push({ eventFieldId: f.id, value: v });
				break;
			}

			case "NUMBER": {
				let num: number | null = null;
				if (typeof raw === "number") num = raw;
				else if (typeof raw === "string" && raw.trim().length > 0) num = Number(raw.trim());

				if (num === null || !Number.isFinite(num)) {
					answerErrors[f.key] = "Se esperaba un número válido.";
					break;
				}
				values.push({ eventFieldId: f.id, value: num });
				break;
			}

			case "DATE": {
				if (typeof raw !== "string") {
					answerErrors[f.key] = "Se esperaba una fecha.";
					break;
				}
				const s = raw.trim();
				if (!isValidYyyyMmDd(s)) {
					answerErrors[f.key] = "Formato de fecha inválido. Usa AAAA-MM-DD.";
					break;
				}
				if (!Number.isFinite(Date.parse(s))) {
					answerErrors[f.key] = "Fecha inexistente.";
					break;
				}
				values.push({ eventFieldId: f.id, value: s });
				break;
			}

			case "CHECKBOX": {
				const b = toBool(raw);
				if (b === null) {
					answerErrors[f.key] = "Se esperaba verdadero/falso.";
					break;
				}
				values.push({ eventFieldId: f.id, value: b });
				break;
			}

			case "SELECT": {
				if (typeof raw !== "string") {
					answerErrors[f.key] = "Se esperaba texto.";
					break;
				}
				const v = raw.trim();
				const opts: string[] = Array.isArray(f.options) ? f.options : [];

				if (!opts.includes(v)) {
					answerErrors[f.key] = "Opción seleccionada inválida.";
					break;
				}
				values.push({ eventFieldId: f.id, value: v });
				break;
			}

			case "MULTI_SELECT": {
				let arr: string[] = [];
				if (Array.isArray(raw)) {
					arr = raw.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean);
				} else if (typeof raw === "string") {
					arr = raw.split(",").map((x) => x.trim()).filter(Boolean);
				}

				const opts: string[] = Array.isArray(f.options) ? f.options : [];
				const hasInvalidOptions = arr.some((v) => !opts.includes(v));

				if (hasInvalidOptions) {
					answerErrors[f.key] = "Una o más opciones seleccionadas son inválidas.";
					break;
				}

				values.push({ eventFieldId: f.id, value: Array.from(new Set(arr)) });
				break;
			}

			default:
				answerErrors[f.key] = "Tipo de campo no soportado.";
		}
	}

	if (Object.keys(answerErrors).length > 0) {
		throw new HttpError(400, "VALIDATION_ERROR", "Errores de validación en el formulario", {
			answers: answerErrors,
		});
	}

	return {
		contact: { email: email || null, phone: phone || null },
		values,
	};
}

export async function registerPublicBySlug(
	slug: string,
	input: PublicRegisterInput,
) {
	const emailNormalized = normalizeEmail(input.contact?.email);
	const phoneNormalized = normalizePhone(input.contact?.phone);

	return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

		const { values } = validateAndPickValues({
			event,
			fields,
			payload: input,
		});

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
					create: values.map((v) => ({
						eventFieldId: v.eventFieldId,
						eventId: event.id,
						value: v.value ?? Prisma.JsonNull,
					})),
				},
			},
			select: { id: true, status: true, createdAt: true },
		});

		return { status: "CREATED" as const, registration };
	});
}
