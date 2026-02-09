import { Router } from "express";
import {
	loginHandler,
	logoutHandler,
	refreshHandler,
} from "../controllers/auth.controller.js";
import { meHandler } from "../controllers/authMe.controller.js";
import { requireAuth, requireCsrf } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimiters.js";

export const authRouter = Router();

authRouter.post("/login", authLimiter, loginHandler);
authRouter.post("/refresh", authLimiter, refreshHandler);

authRouter.get("/me", requireAuth, meHandler);

authRouter.post("/logout", requireCsrf, logoutHandler);
