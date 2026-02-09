import { Router } from "express";
import {
	listEventFieldsHandler,
	replaceEventFieldsHandler,
} from "../controllers/eventFields.controller.js";
import { requireCsrf } from "../middlewares/auth.js";
import { requireEventWrite } from "../middlewares/eventAccess.js";
import { writeLimiter } from "../middlewares/rateLimiters.js";
import { validateBody } from "../middlewares/validate.js";
import { ReplaceEventFieldsSchema } from "../schemas/eventFields.schema.js";

export const eventFieldsRouter = Router({ mergeParams: true });

eventFieldsRouter.get("/", listEventFieldsHandler);
eventFieldsRouter.put(
	"/",
	writeLimiter,
	requireCsrf,
	requireEventWrite,
	validateBody(ReplaceEventFieldsSchema),
	replaceEventFieldsHandler,
);
