import crypto from "crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { assertAuthEnv, authConfig } from "../lib/authConfig.js";
import { ACCESS_COOKIE, CSRF_COOKIE } from "../lib/cookies.js";
import { HttpError } from "../lib/httpError.js";

assertAuthEnv();

export type AuthUser = { id: number; role: string };

declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}

export const requireAuth: RequestHandler = (
	req: Request & { cookies?: Record<string, any>; user?: AuthUser },
	_res: Response,
	next: NextFunction,
) => {
	const token = req.cookies?.[ACCESS_COOKIE];
	if (!token)
		return next(
			new HttpError(401, "UNAUTHENTICATED", "Missing access token"),
		);

	try {
		const payload: any = jwt.verify(token, authConfig.accessSecret);
		req.user = { id: Number(payload.sub), role: String(payload.role) };
		return next();
	} catch {
		return next(
			new HttpError(
				401,
				"UNAUTHENTICATED",
				"Invalid or expired access token",
			),
		);
	}
};

export const requireCsrf: RequestHandler = (req, _res, next) => {
	const csrfCookie = req.cookies?.[CSRF_COOKIE];
	const csrfHeader = req.header("x-csrf-token");

	if (!csrfCookie || !csrfHeader) {
		return next(new HttpError(403, "CSRF_INVALID", "CSRF token missing"));
	}

	const a = Buffer.from(csrfCookie);
	const b = Buffer.from(csrfHeader);

	if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
		return next(new HttpError(403, "CSRF_INVALID", "CSRF token invalid"));
	}

	return next();
};

export const requireRole =
	(...roles: string[]): RequestHandler =>
	(
		req: Request & { user?: AuthUser },
		_res: Response,
		next: NextFunction,
	) => {
		const role = req.user?.role;
		if (!role)
			return next(
				new HttpError(401, "UNAUTHENTICATED", "Not authenticated"),
			);
		if (!roles.includes(role))
			return next(
				new HttpError(403, "FORBIDDEN", "Insufficient permissions"),
			);
		return next();
	};
