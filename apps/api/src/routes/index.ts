import { Router } from "express";
import { prisma } from "../db/prisma.js";

export const router = Router();

router.get("/health", (_req, res) => {
	res.json({ ok: true, service: "api" });
});

router.get("/events", async (_req, res, next) => {
	try {
		const events = await prisma.event.findMany({
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				slug: true,
				capacity: true,
				contactRequirement: true,
				isPublished: true,
				createdAt: true,
			},
		});

		res.json({ ok: true, data: events });
	} catch (err) {
		next(err);
	}
});
