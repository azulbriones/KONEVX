import type { Request } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const jsonMessage = (code: string, message: string) => ({
	ok: false,
	error: { code, message },
});

const isDev = process.env.NODE_ENV === "development";

const keyByIp = (req: Request) => ipKeyGenerator(req.ip ?? "unknown");

const skipPublicLoadTest = (req: Request) =>
	process.env.DISABLE_PUBLIC_RATE_LIMIT === "true" &&
	req.header("x-public-load-test") === "1";

const devLimit = 1000;

export const authLimiter = rateLimit({
	windowMs: isDev ? 1 * 60 * 1000 : 15 * 60 * 1000,
	limit: isDev ? devLimit : 60,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	keyGenerator: keyByIp,
	message: jsonMessage("RATE_LIMITED", "Demasiados intentos. Intenta de nuevo en un momento."),
});

export const demoLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	limit: 60,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	keyGenerator: keyByIp,
	message: jsonMessage("RATE_LIMITED", "Too many auth requests"),
});

export const writeLimiter = rateLimit({
	windowMs: isDev ? 1 * 60 * 1000 : 15 * 60 * 1000,
	limit: isDev ? devLimit : 60,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	keyGenerator: keyByIp,
	message: jsonMessage("RATE_LIMITED", "Too many requests"),
});

export const publicRegisterLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	limit: 60,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	keyGenerator: keyByIp,
	skip: skipPublicLoadTest,
	message: jsonMessage("RATE_LIMITED", "Too many requests"),
});
