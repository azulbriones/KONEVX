import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";
import { resetAndSeedDemo } from "../services/demoSeed.service.js";

export const demoResetHandler: RequestHandler = async (
	_req: any,
	res: { json: (arg0: { ok: boolean; data: any }) => void },
	next: (arg0: unknown) => void,
) => {
	try {
		if (process.env.DEMO_MODE !== "true") {
			throw new HttpError(404, "NOT_FOUND", "Not found");
		}

		const data = await resetAndSeedDemo({ reset: true });
		res.json({ ok: true, data });
	} catch (e) {
		next(e);
	}
};
