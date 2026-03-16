import { Router } from "express";
import {
	listEventFieldsHandler,
	replaceEventFieldsHandler,
} from "../controllers/eventFields.controller.js";
import { requireEventAdmin } from "../lib/eventAccess.js";
import { requireCsrf } from "../middlewares/auth.js";
import { writeLimiter } from "../middlewares/rateLimiters.js";
import { validateBody } from "../middlewares/validate.js";
import { ReplaceEventFieldsSchema } from "../schemas/eventFields.schema.js";

export const eventFieldsRouter = Router({ mergeParams: true });

eventFieldsRouter.get("/", listEventFieldsHandler);

eventFieldsRouter.put(
	"/",
	writeLimiter,
	requireCsrf,
	requireEventAdmin,
	validateBody(ReplaceEventFieldsSchema),
	replaceEventFieldsHandler,
);
