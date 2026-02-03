import { Router } from "express";
import { exportRegistrationsPdfHandler } from "../controllers/registrationsPdf.controller.js";

export const registrationsPdfRouter = Router({ mergeParams: true });

// GET /api/events/:eventId/registrations.pdf
registrationsPdfRouter.get("/registrations.pdf", exportRegistrationsPdfHandler);
