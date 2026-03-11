import { Router } from "express";
import {
	createEventHandler,
	deleteEventHandler,
	getEventHandler,
	listEventsHandler,
	setPublishHandler,
	updateEventHandler,
} from "../controllers/events.controller.js";
import { upload } from "../lib/upload.js";
import { requireAuth, requireCsrf } from "../middlewares/auth.js";
import {
	requireEventRead,
	requireEventWrite,
} from "../middlewares/eventAccess.js";
import { writeLimiter } from "../middlewares/rateLimiters.js";
import { validateBody } from "../middlewares/validate.js";
import { SetPublishSchema } from "../schemas/eventPublish.schema.js";
import { CreateEventSchema, UpdateEventSchema } from "../schemas/events.schema.js";
import { eventFieldsRouter } from "./eventFields.routes.js";
import { eventMembersRouter } from "./eventMembers.routes.js";
import { registrationStatusRouter } from "./registrationStatus.routes.js";
import { registrationsRouter } from "./registrations.routes.js";
import { registrationsExportRouter } from "./registrationsExport.routes.js";
import { registrationsPdfRouter } from "./registrationsPdf.routes.js";

export const eventsRouter = Router();

eventsRouter.get("/", requireAuth, listEventsHandler);
eventsRouter.post(
	"/",
	requireAuth,
	upload.fields([
		{ name: 'logo', maxCount: 1 },
		{ name: 'promotionalVideo', maxCount: 1 },
		{ name: 'promotionalImages', maxCount: 5 },
		{ name: 'backgroundImage', maxCount: 1 },
		{ name: 'heroImage', maxCount: 1 },
	]),
	validateBody(CreateEventSchema),
	createEventHandler,
);
eventsRouter.patch(
	"/:eventId",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventWrite,
	upload.fields([
		{ name: 'logo', maxCount: 1 },
		{ name: 'promotionalVideo', maxCount: 1 },
		{ name: 'promotionalImages', maxCount: 5 },
		{ name: 'backgroundImage', maxCount: 1 },
		{ name: 'heroImage', maxCount: 1 }
	]),
	validateBody(UpdateEventSchema),
	updateEventHandler,
);

eventsRouter.delete(
	"/:eventId",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventWrite,
	deleteEventHandler,
);

eventsRouter.get("/:eventId", requireAuth, requireEventRead, getEventHandler);

// Fields management (read/write)
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

// Registrations status update
eventsRouter.use(
	"/:eventId/registrations",
	requireAuth,
	requireEventRead,
	registrationStatusRouter,
);

eventsRouter.use("/:eventId/members", eventMembersRouter);

eventsRouter.patch(
	"/:eventId/publish",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventWrite,
	validateBody(SetPublishSchema),
	setPublishHandler,
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
