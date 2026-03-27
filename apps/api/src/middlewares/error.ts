import { Prisma } from "@prisma/client";
import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError.js";
import { logger } from "../lib/logger.js";

export const errorMiddleware: ErrorRequestHandler = (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction,
) => {

	if (res.headersSent) {
		return next(err);
	}

	const rid = (req as Request & { requestId?: string }).requestId ?? "-";

	if (err instanceof ZodError) {
		res.status(400).json({
			ok: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "Validation failed",
				details: err.flatten().fieldErrors,
				rid,
			},
		});
		return;
	}

	if (err instanceof HttpError) {
		res.status(err.status).json({
			ok: false,
			error: {
				code: err.code,
				message: err.message,
				details: err.details ?? null,
				rid,
			},
		});
		return;
	}

	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			res.status(409).json({
				ok: false,
				error: {
					code: "CONFLICT",
					message: "A record with this value already exists",
					details: err.meta,
					rid,
				},
			});
			return;
		}
	}

	logger.error("Unhandled error", {
		rid,
		type: err instanceof Error ? err.name : "UnknownError",
		message: err instanceof Error ? err.message : String(err),
		stack:
			process.env.NODE_ENV === "development" && err instanceof Error
				? err.stack
				: undefined,
	});

	return res.status(500).json({
		ok: false,
		error: {
			code: "INTERNAL_SERVER_ERROR",
			message: "Unexpected error",
			rid,
		},
	});
};
