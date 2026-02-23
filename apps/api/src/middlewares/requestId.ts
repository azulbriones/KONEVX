import crypto from "crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";

export const requestId: RequestHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const incoming = req.header("x-request-id");
	const id =
		incoming && incoming.length <= 200 ? incoming : crypto.randomUUID();

	res.setHeader("x-request-id", id);
	(req as Request & { requestId?: string }).requestId = id;

	next();
};
