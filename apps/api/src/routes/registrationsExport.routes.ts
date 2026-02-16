import { Router } from "express";
import { exportRegistrationsCsvHandler } from "../controllers/registrationsExport.controller.js";

export const registrationsExportRouter = Router({ mergeParams: true });

// GET /api/events/:eventId/registrations.csv
registrationsExportRouter.get(
	"/registrations.csv",
	exportRegistrationsCsvHandler,
);
