import { Router } from "express";
import { demoLoginHandler } from "../controllers/demoAuth.controller";
import { demoLimiter } from "../middlewares/rateLimiters";

export const demoAuthRouter = Router();

demoAuthRouter.post("/demo", demoLimiter, demoLoginHandler);
