import { Router } from "express";
import {
	listRegistrationsHandler,
	markAttendanceHandler,
	undoAttendanceHandler
} from "../controllers/registrations.controller.js";
import { requireEventCheckin, requireEventView } from "../lib/eventAccess.js";
import { requireAuth } from "../middlewares/auth.js";

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

registrationsRouter.delete(
	"/:registrationId/check-in",
	requireAuth,
	requireEventCheckin,
	undoAttendanceHandler
);
