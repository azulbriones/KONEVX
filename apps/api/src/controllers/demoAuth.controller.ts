import type { RequestHandler } from "express";
import { z } from "zod";
import { findUserByEmail } from "../repositories/user.repository.js";
import { issueAuthCookies } from "../lib/authCookies.js";
import { HttpError } from "../lib/httpError.js";
import { issueTokensForUser } from "../services/auth.service.js";

const DemoLoginQuerySchema = z.object({
	as: z.enum(["editor", "admin", "viewer"]).default("editor"),
});

export const demoLoginHandler: RequestHandler<
	unknown,
	unknown,
	unknown,
	unknown
> = async (req, res, next) => {
	try {
		if (process.env.DEMO_MODE !== "true") {
			throw new HttpError(404, "NOT_FOUND", "Not found");
		}

		const result = DemoLoginQuerySchema.safeParse(req.query);
		if (!result.success) {
			throw new HttpError(
				400,
				"INVALID_ROLE",
				"Invalid demo role requested",
			);
		}

		const { as } = result.data;

		if (as !== "editor") {
			throw new HttpError(
				501,
				"NOT_IMPLEMENTED",
				"Only editor role is implemented in MVP demo",
			);
		}

		const email =
			process.env.DEMO_EDITOR_EMAIL || "demo_editor@eventplanner.demo";

		const user = await findUserByEmail(email);

		if (!user) {
			console.error(
				`[DEMO] User ${email} not found. Did you run the seed?`,
			);
			throw new HttpError(
				500,
				"DEMO_CONFIGURATION_ERROR",
				"Demo user not initialized",
			);
		}

		const tokens = await issueTokensForUser(
			{
				id: user.id,
				role: user.role,
			},
			true,
		);

		const { csrfToken } = issueAuthCookies(res, {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
		});

		res.json({
			ok: true,
			data: {
				user: {
					id: user.id,
					email: user.email,
					role: user.role,
				},
				csrfToken,
				mode: "demo",
			},
		});
	} catch (err) {
		next(err);
	}
};
