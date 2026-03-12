import { Router } from "express";
import { exportRegistrationsExcelHandler } from "../controllers/registrationsExport.controller.js";

export const registrationsExportRouter = Router({ mergeParams: true });

// GET /api/events/:eventId/registrations.xlsx
registrationsExportRouter.get(
	"/registrations.xlsx",
	exportRegistrationsExcelHandler,
);
