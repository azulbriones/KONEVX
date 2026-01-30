import type { RequestHandler } from "express";
import { getPublicEventBySlug } from "../services/public.service.js";

export const getPublicEventBySlugHandler: RequestHandler = async (
	req,
	res,
	next,
) => {
	try {
		const { slug } = req.params;
		const data = await getPublicEventBySlug(slug);
		res.json({ ok: true, data });
	} catch (err) {
		next(err);
	}
};
