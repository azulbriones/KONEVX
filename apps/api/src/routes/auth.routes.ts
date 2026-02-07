import { Router } from "express";
import {
	loginHandler,
	logoutHandler,
	refreshHandler,
} from "../controllers/auth.controller.js";
import { requireCsrf } from "../middlewares/auth.js";

export const authRouter = Router();

authRouter.post("/login", loginHandler);
authRouter.post("/refresh", refreshHandler);

authRouter.post("/logout", requireCsrf, logoutHandler);
