import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

interface AuthUser {
	id: number;
	role: string;
	demo?: boolean;
}

interface AuthenticatedRequest extends Request {
	user?: AuthUser;
}

export const meHandler: RequestHandler = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = req.user;
		if (!user?.id) {
			throw new HttpError(401, "UNAUTHENTICATED", "Not authenticated");
		}

		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				email: true,
				role: true,
				createdAt: true,
			},
		});

		if (!dbUser) {
			throw new HttpError(
				401,
				"USER_NOT_FOUND",
				"User account no longer exists",
			);
		}

		res.json({
			ok: true,
			data: {
				user: {
					...dbUser,
					isDemo: Boolean(user.demo),
				},
			},
		});
	} catch (e) {
		next(e);
	}
};
