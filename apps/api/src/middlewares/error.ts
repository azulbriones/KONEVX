import type { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
	console.error(err);
	res.status(500).json({
		code: "INTERNAL_ERROR",
		message: "Something went wrong",
	});
};
