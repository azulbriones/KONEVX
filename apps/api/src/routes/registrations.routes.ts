import { Router } from "express";
import { listRegistrationsHandler } from "../controllers/registrations.controller.js";

export const registrationsRouter = Router({ mergeParams: true });

registrationsRouter.get("/", listRegistrationsHandler);
