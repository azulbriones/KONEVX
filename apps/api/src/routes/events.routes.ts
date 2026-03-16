import { Router } from "express";
import {
	createEventHandler,
	deleteEventHandler,
	getEventHandler,
	listEventsHandler,
	quickRegistrationHandler,
	setPublishHandler,
	updateEventHandler,
} from "../controllers/events.controller.js";
import { requireEventAdmin, requireEventCheckin, requireEventView } from "../lib/eventAccess.js";
import { upload } from "../lib/upload.js";
import { requireAuth, requireCsrf } from "../middlewares/auth.js";
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
	requireCsrf,
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
	requireEventAdmin,
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
	requireEventAdmin,
	deleteEventHandler,
);

eventsRouter.get("/:eventId", requireAuth, requireEventView, getEventHandler);

eventsRouter.use(
	"/:eventId/fields",
	requireAuth,
	requireEventView,
	eventFieldsRouter,
);

eventsRouter.use(
	"/:eventId/registrations",
	requireAuth,
	requireEventView,
	registrationsRouter,
);

eventsRouter.use(
	"/:eventId/registrations",
	requireAuth,
	requireEventView,
	registrationStatusRouter,
);

eventsRouter.use("/:eventId/members", eventMembersRouter);

eventsRouter.patch(
	"/:eventId/publish",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventAdmin,
	validateBody(SetPublishSchema),
	setPublishHandler,
);

eventsRouter.use(
	"/:eventId",
	requireAuth,
	requireEventView,
	registrationsExportRouter,
);
eventsRouter.use(
	"/:eventId",
	requireAuth,
	requireEventView,
	registrationsPdfRouter,
);

eventsRouter.post(
	"/:eventId/registrations/quick",
	requireAuth,
	requireEventCheckin,
	quickRegistrationHandler
);
