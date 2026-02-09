import { Router } from "express";
import { demoResetHandler } from "../controllers/demoReset.controller.js";
import { requireAuth, requireCsrf, requireRole } from "../middlewares/auth.js";

export const demoRouter = Router();

// POST /api/demo/reset
demoRouter.post(
	"/reset",
	requireAuth,
	requireRole("SUPER_ADMIN"),
	requireCsrf,
	demoResetHandler,
);
