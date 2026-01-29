import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../lib/httpError.js";
import { validateBody } from "../middlewares/validate.js";

export const router = Router();

router.get("/health", (_req, res) => {
	res.json({ ok: true, service: "api" });
});

const EchoSchema = z.object({
	message: z.string().min(1),
});

router.post("/echo", validateBody(EchoSchema), (req, res) => {
	res.json({ ok: true, data: req.body });
});
router.get("/demo/conflict", (_req, _res) => {
	throw new HttpError(409, "EVENT_FULL", "Event capacity reached");
});
