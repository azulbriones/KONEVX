import type { CookieOptions, Response } from "express";
import { authConfig } from "./authConfig.js";

export const ACCESS_COOKIE = "ep_access";
export const REFRESH_COOKIE = "ep_refresh";
export const CSRF_COOKIE = "ep_csrf";

const commonOptions: CookieOptions = {
	secure: authConfig.cookie.secure,
	sameSite: authConfig.cookie.sameSite,
	path: "/",
	domain: authConfig.cookie.domain,
};

export function baseCookieOptions(): CookieOptions {
	return {
		...commonOptions,
		httpOnly: true,
	};
}

export function csrfCookieOptions(): CookieOptions {
	return {
		...commonOptions,
		httpOnly: false,
	};
}

export function clearLegacyAndScopedCookies(res: Response) {
	const hostOnlyBase = { ...baseCookieOptions() };
	const hostOnlyCsrf = { ...csrfCookieOptions() };

	const scopedBase = { ...baseCookieOptions(), domain: ".konevx.com" };
	const scopedCsrf = { ...csrfCookieOptions(), domain: ".konevx.com" };

	res.clearCookie(ACCESS_COOKIE, hostOnlyBase);
	res.clearCookie(REFRESH_COOKIE, hostOnlyBase);
	res.clearCookie(CSRF_COOKIE, hostOnlyCsrf);

	res.clearCookie(ACCESS_COOKIE, scopedBase);
	res.clearCookie(REFRESH_COOKIE, scopedBase);
	res.clearCookie(CSRF_COOKIE, scopedCsrf);
}
