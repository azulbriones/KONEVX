import type { RequestHandler } from "express";
import { z } from "zod";
import { HttpError } from "../lib/httpError.js";
import { getPublicEventBySlug } from "../services/public.service.js";

const SlugSchema = z
	.string()
	.min(1)
	.regex(/^[a-zA-Z0-9-_]+$/, "Invalid slug format");

export const getPublicEventBySlugHandler: RequestHandler<{
	slug: string;
}> = async (req, res, next) => {
	try {
		const { slug } = req.params;
		const parsed = SlugSchema.safeParse(slug);
		if (!parsed.success) {
			throw new HttpError(400, "INVALID_SLUG", "Invalid slug format");
		}

		const event = await getPublicEventBySlug(parsed.data);
		if (!event) {
			throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");
		}
		res.set("Cache-Control", "public, max-age=60, s-maxage=60");

		res.json({ ok: true, data: event });
	} catch (err) {
		next(err);
	}
};
