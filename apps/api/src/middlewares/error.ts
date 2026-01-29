import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
	if (err instanceof ZodError) {
		return res.status(400).json({
			code: "VALIDATION_ERROR",
			message: "Invalid request body",
			details: err.issues,
		});
	}

	console.error(err);

	return res.status(500).json({
		code: "INTERNAL_ERROR",
		message: "Something went wrong",
	});
};
