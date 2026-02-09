import { Router } from "express";
import {
	createEventHandler,
	listEventsHandler,
} from "../controllers/events.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireEventRead } from "../middlewares/eventAccess.js";
import { validateBody } from "../middlewares/validate.js";
import { CreateEventSchema } from "../schemas/events.schema.js";
import { eventFieldsRouter } from "./eventFields.routes.js";
import { registrationStatusRouter } from "./registrationStatus.routes.js";
import { registrationsRouter } from "./registrations.routes.js";
import { registrationsExportRouter } from "./registrationsExport.routes.js";
import { registrationsPdfRouter } from "./registrationsPdf.routes.js";

export const eventsRouter = Router();

eventsRouter.get("/", listEventsHandler);
eventsRouter.post("/", validateBody(CreateEventSchema), createEventHandler);

// Fields (read for members, write protegido dentro del router con CSRF+write)
eventsRouter.use(
	"/:eventId/fields",
	requireAuth,
	requireEventRead,
	eventFieldsRouter,
);

// Registrations list (read)
eventsRouter.use(
	"/:eventId/registrations",
	requireAuth,
	requireEventRead,
	registrationsRouter,
);

// Registrations status update (write protegido dentro del router con CSRF+write)
eventsRouter.use(
	"/:eventId/registrations",
	requireAuth,
	requireEventRead,
	registrationStatusRouter,
);

// Reports (read)
eventsRouter.use(
	"/:eventId",
	requireAuth,
	requireEventRead,
	registrationsExportRouter,
);
eventsRouter.use(
	"/:eventId",
	requireAuth,
	requireEventRead,
	registrationsPdfRouter,
);
