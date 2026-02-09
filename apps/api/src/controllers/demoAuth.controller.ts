import type { RequestHandler, Response } from "express";
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

function setAuthCookies(
	res: Response,
	accessToken: string,
	refreshToken: string,
) {
	const csrf = generateCsrfToken();

	res.cookie(ACCESS_COOKIE, accessToken, {
		...baseCookieOptions(),
		maxAge: ACCESS_TOKEN_AGE_MS,
	});
	res.cookie(REFRESH_COOKIE, refreshToken, {
		...baseCookieOptions(),
		maxAge: REFRESH_TOKEN_AGE_MS,
	});
	res.cookie(CSRF_COOKIE, csrf, {
		...csrfCookieOptions(),
		maxAge: REFRESH_TOKEN_AGE_MS,
	});
}

export const demoLoginHandler: RequestHandler = async (
	req: { query: { as: any } },
	res: {
		json: (arg0: {
			ok: boolean;
			data: { user: { id: any; email: any; role: any }; mode: string };
		}) => void;
	},
	next: (arg0: unknown) => void,
) => {
	try {
		if (process.env.DEMO_MODE !== "true") {
			throw new HttpError(404, "NOT_FOUND", "Not found");
		}

		const as = String(req.query.as ?? "editor").toLowerCase();
		if (as !== "editor") {
			throw new HttpError(
				400,
				"INVALID_DEMO_ROLE",
				"Only editor demo is enabled in MVP",
			);
		}

		const email =
			process.env.DEMO_EDITOR_EMAIL ?? "demo_editor@eventplanner.demo";

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true, role: true },
		});
		if (!user)
			throw new HttpError(
				500,
				"DEMO_USER_MISSING",
				"Demo user not seeded",
			);

		const tokens = await issueTokensForUser(user, true);
		setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

		res.json({ ok: true, data: { user, mode: "demo" } });
	} catch (err) {
		next(err);
	}
};
