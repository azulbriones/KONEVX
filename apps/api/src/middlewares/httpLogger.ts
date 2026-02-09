import type { RequestHandler } from "express";

export const httpLogger: RequestHandler = (
	req: { method: any; originalUrl: any },
	res: { on: (arg0: string, arg1: () => void) => void; statusCode: any },
	next: () => void,
) => {
	const start = Date.now();

	res.on("finish", () => {
		const ms = Date.now() - start;
		const rid = (req as any).requestId ?? "-";
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
