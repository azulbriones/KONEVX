import { Router } from "express";
import { demoResetHandler } from "../controllers/demoReset.controller.js";
import { requireAuth, requireCsrf, requireRole } from "../middlewares/auth.js";
import { writeLimiter } from "../middlewares/rateLimiters.js";

export const demoRouter = Router();

// POST /api/demo/reset
demoRouter.post(
	"/reset",
	writeLimiter,
	requireAuth,
	requireRole("SUPER_ADMIN"),
	requireCsrf,
	demoResetHandler,
);
