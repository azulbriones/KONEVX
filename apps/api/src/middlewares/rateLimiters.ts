import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 10, // 10 requests per minute
	standardHeaders: "draft-7",
	legacyHeaders: false,
});

export const demoLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 20,
	standardHeaders: "draft-7",
	legacyHeaders: false,
});

export const writeLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 60, // 60 requests per minute
	standardHeaders: "draft-7",
	legacyHeaders: false,
});
