import { Prisma } from "@prisma/client";
import { z } from "zod";
import { hashPassword } from "../lib/crypto.js";
import { HttpError } from "../lib/httpError.js";
import { generateTempPassword } from "../lib/tempPassword.js";
import { CreateUserSchema, ListUsersQuerySchema } from "../schemas/users.schema.js";
import { countUsersRecord, createUserRecord, listUsersRecord } from "../repositories/users.repository.js";

type CreateUserBody = z.infer<typeof CreateUserSchema>;

export async function createUser(input: CreateUserBody) {
	const parsed = CreateUserSchema.safeParse(input);
	if (!parsed.success) {
		throw new HttpError(400, "VALIDATION_ERROR", "Invalid data", parsed.error.flatten().fieldErrors);
	}

	const { email, role } = parsed.data;
	const tempPassword = generateTempPassword(16);
	const passwordHash = await hashPassword(tempPassword);
	const baseName = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
	const autoUsername = `${baseName}_${Math.floor(Math.random() * 10000)}`;

	try {
		const user = await createUserRecord({
			username: autoUsername,
			email: email.toLowerCase(),
			role,
			passwordHash,
		});

		return { user, tempPassword };
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			throw new HttpError(409, "USER_EXISTS", "User already exists");
		}
		throw err;
	}
}

export async function listUsers(query: unknown) {
	const parsed = ListUsersQuerySchema.safeParse(query);
	if (!parsed.success) {
		throw new HttpError(400, "VALIDATION_ERROR", "Invalid query", parsed.error.flatten().fieldErrors);
	}

	const { search, limit = 10, page = 1 } = parsed.data;
	const skip = (page - 1) * limit;

	const whereClause: Prisma.UserWhereInput = search
		? {
			OR: [
				{ email: { contains: search, mode: "insensitive" } },
				{ username: { contains: search, mode: "insensitive" } },
			],
		}
		: {};

	const [users, total] = await Promise.all([
		listUsersRecord(whereClause, limit, skip),
		countUsersRecord(whereClause),
	]);

	return {
		users,
		meta: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
	};
}
