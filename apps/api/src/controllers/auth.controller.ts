import type { RequestHandler } from "express";
import { REFRESH_COOKIE } from "../lib/cookies.js";
import { HttpError } from "../lib/httpError.js";
import { clearAuthCookies, issueAuthCookies } from "../lib/authCookies.js";
import { LoginSchema, RegisterSchema } from "../schemas/auth.schema.js";
import {
	loginWithCredentials,
	registerUser,
	logoutSession,
	refreshSession
} from "../services/auth.service.js";

export const loginHandler: RequestHandler = async (req, res, next) => {
	try {
		const parsed = LoginSchema.safeParse(req.body);

		if (!parsed.success) {
			return next(
				new HttpError(400, "VALIDATION_ERROR", "Datos inválidos", parsed.error.flatten()),
			);
		}

		const { identifier, password } = parsed.data;
		const result = await loginWithCredentials(identifier, password);

		issueAuthCookies(res, {
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
		});

		res.json({ ok: true, data: { user: result.user } });
	} catch (err) {
		next(err);
	}
};

export const registerHandler: RequestHandler = async (req, res, next) => {
	try {
		const parsed = RegisterSchema.safeParse(req.body);

		if (!parsed.success) {
			return next(
				new HttpError(
					400,
					"VALIDATION_ERROR",
					"Datos inválidos",
					parsed.error.flatten().fieldErrors,
				),
			);
		}

		const user = await registerUser(parsed.data);

		return res.status(201).json({
			ok: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

export const refreshHandler: RequestHandler = async (req, res, next) => {
	try {
		const refresh = req.cookies?.[REFRESH_COOKIE];
		if (!refresh) {
			throw new HttpError(401, "NO_REFRESH", "No refresh token");
		}

		const result = await refreshSession(refresh);

		issueAuthCookies(res, {
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
		});

		res.json({ ok: true, data: { user: result.user } });
	} catch (err) {
		next(err);
	}
};

export const logoutHandler: RequestHandler = async (req, res, next) => {
	try {
		const refresh = req.cookies?.[REFRESH_COOKIE] ?? null;
		await logoutSession(refresh);
		clearAuthCookies(res);

		res.json({ ok: true });
	} catch (err) {
		next(err);
	}
};
