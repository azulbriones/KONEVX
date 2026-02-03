import { Router } from "express";
import { updateRegistrationStatusHandler } from "../controllers/registrationStatus.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { UpdateRegistrationStatusSchema } from "../schemas/registrationStatus.schema.js";

export const registrationStatusRouter = Router({ mergeParams: true });

registrationStatusRouter.patch(
	"/:registrationId",
	validateBody(UpdateRegistrationStatusSchema),
	updateRegistrationStatusHandler,
);
