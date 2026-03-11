import type { CookieOptions } from "express";
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
