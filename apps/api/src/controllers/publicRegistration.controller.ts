import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";
import {
	PublicRegisterSchema,
	type PublicRegisterInput,
} from "../schemas/publicRegistration.schema.js";
import { registerPublicBySlug } from "../services/publicRegistration.service.js";

export const publicRegisterHandler: RequestHandler<{ slug: string }> = async (
	req,
	res,
	next,
) => {
	try {
		const { slug } = req.params;

		const parsed = PublicRegisterSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(400, "VALIDATION_ERROR", "Invalid payload", {
				form: parsed.error.flatten(),
			});
		}

		const input: PublicRegisterInput = parsed.data;

		const result = await registerPublicBySlug(slug, input);
		const httpStatus = result.status === "CREATED" ? 201 : 200;

		res.status(httpStatus).json({ ok: true, data: result });
	} catch (err) {
		next(err);
	}
};
