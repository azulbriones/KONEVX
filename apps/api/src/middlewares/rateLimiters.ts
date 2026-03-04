import type { Request } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const jsonMessage = (code: string, message: string) => ({
	ok: false,
	error: { code, message },
});

const keyByIp = (req: Request) => ipKeyGenerator(req.ip ?? "unknown");

// opcional: bypass para load test controlado
const skipPublicLoadTest = (req: Request) =>
	process.env.DISABLE_PUBLIC_RATE_LIMIT === "true" &&
	req.header("x-public-load-test") === "1";

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 30,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	keyGenerator: keyByIp,
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
	windowMs: 15 * 60 * 1000,
	limit: 30,
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
