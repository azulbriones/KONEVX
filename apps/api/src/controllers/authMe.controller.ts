import type { RequestHandler } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";

export const meHandler: RequestHandler = async (
	req: { user: any },
	res: { json: (arg0: { ok: boolean; data: { user: any } }) => void },
	next: (arg0: unknown) => void,
) => {
	try {
		const user = req.user;
		if (!user)
			throw new HttpError(401, "UNAUTHENTICATED", "Not authenticated");

		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { id: true, email: true, role: true },
		});
		if (!dbUser)
			throw new HttpError(401, "UNAUTHENTICATED", "User not found");

		res.json({
			ok: true,
			data: { user: { ...dbUser, demo: !!user.demo } },
		});
	} catch (e) {
		next(e);
	}
};
