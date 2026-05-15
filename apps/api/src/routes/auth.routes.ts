import { Router } from "express";
import {
	loginHandler,
	logoutHandler,
	refreshHandler,
	registerHandler,
} from "../controllers/auth.controller.js";
import { meHandler } from "../controllers/authMe.controller.js";
import { requireAuth, requireCsrf } from "../middlewares/auth.js";

export const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/refresh", refreshHandler);

authRouter.get("/me", requireAuth, meHandler);

authRouter.post("/logout", requireCsrf, logoutHandler);
