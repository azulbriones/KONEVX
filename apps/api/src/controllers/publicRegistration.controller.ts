import type { RequestHandler } from "express";
import type { PublicRegisterInput } from "../schemas/publicRegistration.schema.js";
import { registerPublicBySlug } from "../services/publicRegistration.service.js";

export const publicRegisterHandler: RequestHandler<{ slug: string }> = async (
	req,
	res,
	next,
) => {
	try {
		const { slug } = req.params;

		const input = req.body as PublicRegisterInput;

		const result = await registerPublicBySlug(slug, input);
		const httpStatus = result.status === "CREATED" ? 201 : 200;

		res.status(httpStatus).json({ ok: true, data: result });
	} catch (err) {
		next(err);
	}
};
