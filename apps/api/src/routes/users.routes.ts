import { Router } from "express";
import {
	createUserHandler,
	listUsersHandler,
} from "../controllers/users.controller.js";
import { requireAuth, requireCsrf, requireRole } from "../middlewares/auth.js";
import { writeLimiter } from "../middlewares/rateLimiters.js";

export const usersRouter = Router();

usersRouter.get("/", requireAuth, requireRole("SUPER_ADMIN"), listUsersHandler);

usersRouter.post(
	"/",
	writeLimiter,
	requireAuth,
	requireRole("SUPER_ADMIN"),
	requireCsrf,
	createUserHandler,
);
