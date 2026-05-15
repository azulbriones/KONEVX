import type { Response } from "express";
import {
	ACCESS_COOKIE,
	CSRF_COOKIE,
	REFRESH_COOKIE,
	baseCookieOptions,
	clearLegacyAndScopedCookies,
	csrfCookieOptions,
} from "./cookies.js";
import { generateCsrfToken } from "./crypto.js";

const ACCESS_TOKEN_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function issueAuthCookies(
	res: Response,
	input: {
		accessToken: string;
		refreshToken: string;
		csrfToken?: string;
	},
) {
	clearLegacyAndScopedCookies(res);

	const csrfToken = input.csrfToken ?? generateCsrfToken();

	res.cookie(ACCESS_COOKIE, input.accessToken, {
		...baseCookieOptions(),
		maxAge: ACCESS_TOKEN_AGE_MS,
	});

	res.cookie(REFRESH_COOKIE, input.refreshToken, {
		...baseCookieOptions(),
		maxAge: REFRESH_TOKEN_AGE_MS,
	});

	res.cookie(CSRF_COOKIE, csrfToken, {
		...csrfCookieOptions(),
		maxAge: REFRESH_TOKEN_AGE_MS,
	});

	return { csrfToken };
}

export function clearAuthCookies(res: Response) {
	clearLegacyAndScopedCookies(res);
}
