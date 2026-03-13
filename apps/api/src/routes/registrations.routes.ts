import { Router } from "express";
import { listRegistrationsHandler, markAttendanceHandler, undoAttendanceHandler } from "../controllers/registrations.controller.js";

export const registrationsRouter = Router({ mergeParams: true });

registrationsRouter.get("/", listRegistrationsHandler);

registrationsRouter.patch("/:registrationId/check-in", markAttendanceHandler);
registrationsRouter.delete("/:registrationId/check-in", undoAttendanceHandler);
