import { Prisma } from "@prisma/client";
import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { hashPassword } from "../lib/crypto.js";
import { HttpError } from "../lib/httpError.js";
import { generateTempPassword } from "../lib/tempPassword.js";
import {
	CreateUserSchema,
	ListUsersQuerySchema,
} from "../schemas/users.schema.js";

type CreateUserBody = z.infer<typeof CreateUserSchema>;
// ==========================================
// CREATE USER HANDLER
// ==========================================

export const createUserHandler: RequestHandler<
	unknown,
	unknown,
	CreateUserBody
> = async (req, res, next) => {
	try {
		const parsed = CreateUserSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new HttpError(
				400,
				"VALIDATION_ERROR",
				"Invalid data",
				parsed.error.flatten().fieldErrors,
			);
		}

		const { email, role } = parsed.data;

		const tempPassword = generateTempPassword(16);
		const passwordHash = await hashPassword(tempPassword);
		const baseName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
		const autoUsername = `${baseName}_${Math.floor(Math.random() * 10000)}`;

		try {
			const user = await prisma.user.create({
				data: {
					username: autoUsername,
					email: email.toLowerCase(),
					role,
					passwordHash,
				},
				select: {
					id: true,
					email: true,
					role: true,
					createdAt: true,
				},
			});

			res.status(201).json({
				ok: true,
				data: { user, tempPassword },
			});
		} catch (dbError) {
			if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
				throw new HttpError(409, "USER_EXISTS", "User already exists");
			}
			throw dbError;
		}
	} catch (e) {
		next(e);
	}
};

// ==========================================
// LIST USERS HANDLER
// ==========================================

export const listUsersHandler: RequestHandler = async (req, res, next) => {
	try {
		const parsed = ListUsersQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new HttpError(
				400,
				"VALIDATION_ERROR",
				"Invalid query",
				parsed.error.flatten().fieldErrors,
			);
		}

		const { search, limit = 10, page = 1 } = parsed.data;

		const skip = (page - 1) * limit;

		const whereClause: Prisma.UserWhereInput = search
			? {
				email: {
					contains: search,
					mode: "insensitive",
				},
			}
			: {};

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where: whereClause,
				orderBy: { createdAt: "desc" },
				take: limit,
				skip: skip,
				select: {
					id: true,
					email: true,
					role: true,
					createdAt: true,
				},
			}),
			prisma.user.count({ where: whereClause }),
		]);

		res.json({
			ok: true,
			data: {
				users,
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
			},
		});
	} catch (e) {
		next(e);
	}
};
