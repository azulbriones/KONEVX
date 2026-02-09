import crypto from "crypto";
import type { RequestHandler } from "express";

export const requestId: RequestHandler = (
	req: { header: (arg0: string) => any },
	res: { setHeader: (arg0: string, arg1: any) => void },
	next: () => void,
) => {
	const incoming = req.header("x-request-id");
	const id =
		incoming && incoming.length <= 200 ? incoming : crypto.randomUUID();

	res.setHeader("x-request-id", id);
	(req as any).requestId = id;

	next();
};
