import { Router } from "express";
import { eventsRouter } from "./events.routes.js";

export const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "api" }));

router.use("/events", eventsRouter);
