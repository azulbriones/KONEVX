import { Router } from "express";
import rateLimit from "express-rate-limit";
import { demoLoginHandler } from "../controllers/demoAuth.controller";

export const demoAuthRouter = Router();

const demoLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 20,
	standardHeaders: "draft-7",
	legacyHeaders: false,
});

demoAuthRouter.post("/demo", demoLimiter, demoLoginHandler);
