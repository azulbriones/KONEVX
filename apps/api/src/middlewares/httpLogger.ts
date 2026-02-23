import type { NextFunction, Request, RequestHandler, Response } from "express";

export const httpLogger: RequestHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const start = Date.now();

	res.on("finish", () => {
		const ms = Date.now() - start;
		const rid = (req as Request & { requestId?: string }).requestId ?? "-";
		console.log(
			JSON.stringify({
				level: "info",
				msg: "request",
				rid,
				method: req.method,
				path: req.originalUrl,
				status: res.statusCode,
				ms,
			}),
		);
	});

	next();
};
