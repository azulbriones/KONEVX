import { Router } from "express";
import { getPublicEventBySlugHandler } from "../controllers/public.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { PublicRegisterSchema } from "../schemas/publicRegistration.schema.js";

export const publicRouter = Router();

// GET /api/public/events/:slug
publicRouter.get("/events/:slug", getPublicEventBySlugHandler);

// POST /api/public/events/:slug/register
publicRouter.post(
	"/events/:slug/register",
	validateBody(PublicRegisterSchema),
	(
		_req: any,
		res: {
			status: (arg0: number) => {
				(): any;
				new (): any;
				json: {
					(arg0: { ok: boolean; code: string }): void;
					new (): any;
				};
			};
		},
	) => {
		res.status(501).json({ ok: false, code: "NOT_IMPLEMENTED" });
	},
);
