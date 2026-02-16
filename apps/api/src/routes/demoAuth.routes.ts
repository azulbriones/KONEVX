import { Router } from "express";
import { demoLoginHandler } from "../controllers/demoAuth.controller.js";
import { demoLimiter } from "../middlewares/rateLimiters.js";

export const demoAuthRouter = Router();

demoAuthRouter.post("/demo", demoLimiter, demoLoginHandler);
