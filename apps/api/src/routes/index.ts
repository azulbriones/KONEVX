import { Router } from "express";
import { authLimiter } from "../middlewares/rateLimiters.js";
import { authRouter } from "./auth.routes.js";
import { demoRouter } from "./demo.routes.js";
import { demoAuthRouter } from "./demoAuth.routes.js";
import { eventsRouter } from "./events.routes.js";
import { publicRouter } from "./public.routes.js";
import { registrationsRouter } from "./registrations.routes.js";
import { usersRouter } from "./users.routes.js";

export const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "api" }));

router.use("/users", usersRouter);

router.use("/events", eventsRouter);
router.use("/public", publicRouter);
eventsRouter.use("/:eventId/registrations", registrationsRouter);

const demoEnabled = process.env.DEMO_MODE === "true";

router.use("/auth", authLimiter, authRouter);

if (demoEnabled) {
	router.use("/auth", authLimiter, demoAuthRouter);
	router.use("/demo", demoRouter);
}
