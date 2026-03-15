import { Router } from "express";
import { updateRegistrationStatusHandler } from "../controllers/registrationStatus.controller.js";
import { requireEventAdmin } from "../lib/eventAccess.js";
import { requireCsrf } from "../middlewares/auth.js";
import { writeLimiter } from "../middlewares/rateLimiters.js";
import { validateBody } from "../middlewares/validate.js";
import { UpdateRegistrationStatusSchema } from "../schemas/registrationStatus.schema.js";

export const registrationStatusRouter = Router({ mergeParams: true });

registrationStatusRouter.patch(
	"/:registrationId",
	writeLimiter,
	requireCsrf,
	requireEventAdmin,
	validateBody(UpdateRegistrationStatusSchema),
	updateRegistrationStatusHandler,
);
