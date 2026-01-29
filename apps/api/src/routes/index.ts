import { Router } from "express";
import { z } from "zod";
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
