import { Router } from "express";
import {
	deleteRegistrationHandler,
	listRegistrationsHandler,
	markAttendanceHandler,
	undoAttendanceHandler,
	updateRegistrationDataHandler
} from "../controllers/registrations.controller.js";
import { updateRegistrationStatusHandler } from "../controllers/registrationStatus.controller.js";
import { requireEventAdmin, requireEventCheckin, requireEventView } from "../lib/eventAccess.js";
import { requireAuth, requireCsrf } from "../middlewares/auth.js";
import { writeLimiter } from "../middlewares/rateLimiters.js";
import { validateBody } from "../middlewares/validate.js";
import { UpdateRegistrationStatusSchema } from "../schemas/registrationStatus.schema.js";

export const registrationsRouter = Router({ mergeParams: true });

registrationsRouter.get(
	"/",
	requireAuth,
	requireEventView,
	listRegistrationsHandler
);

registrationsRouter.patch(
	"/:registrationId/check-in",
	requireAuth,
	requireEventCheckin,
	markAttendanceHandler
);

registrationsRouter.patch(
	"/:registrationId",
	writeLimiter,
	requireCsrf,
	requireEventAdmin,
	validateBody(UpdateRegistrationStatusSchema),
	updateRegistrationStatusHandler,
);

registrationsRouter.patch(
	"/:registrationId/data",
	writeLimiter,
	requireAuth,
	requireCsrf,
	requireEventAdmin,
	updateRegistrationDataHandler
);

registrationsRouter.delete(
	"/:registrationId/check-in",
	requireAuth,
	requireEventCheckin,
	undoAttendanceHandler
);

registrationsRouter.delete(
	"/:registrationId",
	requireAuth,
	requireEventAdmin,
	deleteRegistrationHandler
);
