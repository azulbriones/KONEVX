import type { RequestHandler, Response } from "express";
import {
	ACCESS_COOKIE,
	CSRF_COOKIE,
	REFRESH_COOKIE,
	baseCookieOptions,
	csrfCookieOptions,
} from "../lib/cookies.js";
import { generateCsrfToken } from "../lib/crypto.js";
import { HttpError } from "../lib/httpError.js";
import { LoginSchema } from "../schemas/auth.schema.js";
import {
	loginWithEmailPassword,
	logoutSession,
	refreshSession,
} from "../services/auth.service.js";

const ACCESS_TOKEN_AGE_MS = 15 * 60 * 1000; // 15 minutos
const REFRESH_TOKEN_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

/**
 * Helper para establecer todas las cookies de autenticación de una sola vez.
 * Esto evita repetir código y asegura consistencia en los flags de seguridad.
 */
const setAuthCookies = (
	res: Response,
	accessToken: string,
	refreshToken: string,
) => {
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
};

export const loginHandler: RequestHandler = async (req, res, next) => {
	try {
		const parsed = LoginSchema.safeParse(req.body);

		if (!parsed.success) {
			return next(
				new HttpError(
					400,
					"VALIDATION_ERROR",
					"Datos inválidos",
					parsed.error,
				),
			);
		}

		const { email, password } = parsed.data;
		const result = await loginWithEmailPassword(email, password);

		setAuthCookies(res, result.accessToken, result.refreshToken);

		res.json({ ok: true, data: { user: result.user } });
	} catch (err) {
		next(err);
	}
};

export const refreshHandler: RequestHandler = async (req, res, next) => {
	try {
		const refresh = req.cookies?.[REFRESH_COOKIE];
		if (!refresh) {
			throw new HttpError(401, "NO_REFRESH", "No refresh token");
		}

		const result = await refreshSession(refresh);

		setAuthCookies(res, result.accessToken, result.refreshToken);

		res.json({ ok: true, data: { user: result.user } });
	} catch (err) {
		next(err);
	}
};

export const logoutHandler: RequestHandler = async (req, res, next) => {
	try {
		const refresh = req.cookies?.[REFRESH_COOKIE] ?? null;
		await logoutSession(refresh);

		res.clearCookie(ACCESS_COOKIE, baseCookieOptions());
		res.clearCookie(REFRESH_COOKIE, baseCookieOptions());
		res.clearCookie(CSRF_COOKIE, csrfCookieOptions());

		res.json({ ok: true });
	} catch (err) {
		next(err);
	}
};
