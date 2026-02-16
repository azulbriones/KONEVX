import { Router } from "express";
import { getPublicEventBySlugHandler } from "../controllers/public.controller.js";
import { publicRegisterHandler } from "../controllers/publicRegistration.controller.js";
import { publicRegisterLimiter } from "../middlewares/rateLimiters.js";
import { validateBody } from "../middlewares/validate.js";
import { PublicRegisterSchema } from "../schemas/publicRegistration.schema.js";

export const publicRouter = Router();

// GET /api/public/events/:slug
publicRouter.get("/events/:slug", getPublicEventBySlugHandler);

// POST /api/public/events/:slug/register
publicRouter.post(
	"/events/:slug/register",
	publicRegisterLimiter,
	validateBody(PublicRegisterSchema),
	publicRegisterHandler,
);
