import type { RequestHandler } from "express";
import { createUser, listUsers } from "../services/users.service.js";

export const createUserHandler: RequestHandler = async (req, res, next) => {
	try {
		const { user, tempPassword } = await createUser(req.body);
		res.status(201).json({ ok: true, data: { user, tempPassword } });
	} catch (e) {
		next(e);
	}
};

export const listUsersHandler: RequestHandler = async (req, res, next) => {
	try {
		const data = await listUsers(req.query);
		res.json({ ok: true, data });
	} catch (e) {
		next(e);
	}
};
