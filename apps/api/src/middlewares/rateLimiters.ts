import type { Request } from "express";
import rateLimit from "express-rate-limit";

const jsonMessage = (code: string, message: string) => ({
	ok: false,
	error: { code, message },
});

const keyByIp = (req: Request) => {
	return req.ip ?? "unknown";
};

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	limit: 30, // 30 requests/15min por IP
	standardHeaders: "draft-7",
	legacyHeaders: false,
});

export const demoLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 min
	limit: 60, // 60 requests/10min por IP
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: jsonMessage("RATE_LIMITED", "Too many auth requests"),
});

export const writeLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	limit: 30, // 30 requests/15min por IP
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: jsonMessage("RATE_LIMITED", "Too many auth requests"),
});

export const publicRegisterLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 min
	limit: 60, // 60 requests/10min por IP
	standardHeaders: true,
	legacyHeaders: false,
	message: jsonMessage("RATE_LIMITED", "Too many auth requests"),
});
