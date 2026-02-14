import type { RequestHandler, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import {
	ACCESS_COOKIE,
	CSRF_COOKIE,
	REFRESH_COOKIE,
	baseCookieOptions,
	csrfCookieOptions,
} from "../lib/cookies.js";
import { generateCsrfToken } from "../lib/crypto.js";
import { HttpError } from "../lib/httpError.js";
import { issueTokensForUser } from "../services/auth.service.js";

const ACCESS_TOKEN_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const DemoLoginQuerySchema = z.object({
	as: z.enum(["editor", "admin", "viewer"]).default("editor"),
});

/**
 * Helper para setear cookies de Auth.
 */
export function setAuthCookies(
	res: Response,
	accessToken: string,
	refreshToken: string,
	csrfToken: string,
) {
	res.cookie(ACCESS_COOKIE, accessToken, {
		...baseCookieOptions(),
		maxAge: ACCESS_TOKEN_AGE_MS,
	});

	res.cookie(REFRESH_COOKIE, refreshToken, {
		...baseCookieOptions(),
		maxAge: REFRESH_TOKEN_AGE_MS,
	});

	res.cookie(CSRF_COOKIE, csrfToken, {
		...csrfCookieOptions(),
		maxAge: REFRESH_TOKEN_AGE_MS,
	});
}

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

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true, role: true },
		});

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
				email: user.email,
			},
			true,
		);

		const csrfToken = generateCsrfToken();

		setAuthCookies(res, tokens.accessToken, tokens.refreshToken, csrfToken);

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
