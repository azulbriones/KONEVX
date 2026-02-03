import type { RequestHandler } from "express";
import { registerPublicBySlug } from "../services/publicRegistration.service.js";

export const publicRegisterHandler: RequestHandler = async (
	req: { params: { slug: any }; body: any },
	res,
	next: (arg0: unknown) => void,
) => {
	try {
		const { slug } = req.params;
		const result = await registerPublicBySlug(slug, req.body);

		const httpStatus = result.status === "CREATED" ? 201 : 200;

		res.status(httpStatus).json({ ok: true, data: result });
	} catch (err) {
		next(err);
	}
};
