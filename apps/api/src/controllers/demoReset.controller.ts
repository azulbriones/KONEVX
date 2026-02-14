import type { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError } from "../lib/httpError.js";
import { resetAndSeedDemo } from "../services/demoSeed.service.js";

let isResetting = false;

export const demoResetHandler: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (process.env.DEMO_MODE !== "true") {
			throw new HttpError(404, "NOT_FOUND", "Not found");
		}

		if (isResetting) {
			throw new HttpError(
				429,
				"CONCURRENT_RESET",
				"A reset is already in progress. Please wait.",
			);
		}

		isResetting = true;

		try {
			const data = await resetAndSeedDemo();

			res.status(200).json({
				ok: true,
				message: "Demo environment reset successfully",
				data,
			});
		} finally {
			isResetting = false;
		}
	} catch (e) {
		next(e);
	}
};
