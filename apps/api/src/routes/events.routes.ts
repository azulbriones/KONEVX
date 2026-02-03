import { Router } from "express";
import {
	createEventHandler,
	listEventsHandler,
} from "../controllers/events.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { CreateEventSchema } from "../schemas/events.schema.js";
import { eventFieldsRouter } from "./eventFields.routes.js";
import { registrationStatusRouter } from "./registrationStatus.routes.js";

export const eventsRouter = Router();

eventsRouter.get("/", listEventsHandler);
eventsRouter.post("/", validateBody(CreateEventSchema), createEventHandler);

// /api/events/:eventId/fields
eventsRouter.use("/:eventId/fields", eventFieldsRouter);
eventsRouter.use("/:eventId/registrations", registrationStatusRouter);
