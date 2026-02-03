import { Router } from "express";
import {
	listEventFieldsHandler,
	replaceEventFieldsHandler,
} from "../controllers/eventFields.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { ReplaceEventFieldsSchema } from "../schemas/eventFields.schema.js";

export const eventFieldsRouter = Router({ mergeParams: true });

eventFieldsRouter.get("/", listEventFieldsHandler);
eventFieldsRouter.put(
	"/",
	validateBody(ReplaceEventFieldsSchema),
	replaceEventFieldsHandler,
);
