import { Router } from "express";
import {
	loginHandler,
	logoutHandler,
	refreshHandler,
} from "../controllers/auth.controller.js";
import { requireCsrf } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimiters.js";

export const authRouter = Router();

authRouter.post("/login", authLimiter, loginHandler);
authRouter.post("/refresh", authLimiter, refreshHandler);

authRouter.post("/logout", requireCsrf, logoutHandler);
