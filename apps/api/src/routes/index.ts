import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { demoAuthRouter } from "./demoAuth.routes.js";
import { eventsRouter } from "./events.routes.js";
import { publicRouter } from "./public.routes.js";
import { registrationsRouter } from "./registrations.routes.js";

export const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "api" }));

router.use("/auth", authRouter);
router.use("/auth", demoAuthRouter);

router.use("/events", eventsRouter);
router.use("/public", publicRouter);
eventsRouter.use("/:eventId/registrations", registrationsRouter);
