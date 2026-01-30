import { Router } from "express";
import {
	createEventHandler,
	listEventsHandler,
} from "../controllers/events.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { CreateEventSchema } from "../schemas/events.schema.js";

export const eventsRouter = Router();

eventsRouter.get("/", listEventsHandler);
eventsRouter.post("/", validateBody(CreateEventSchema), createEventHandler);
