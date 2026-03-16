import { z } from "zod";

export const CreateUserSchema = z.object({
	email: z.string().email(),
	role: z.enum(["USER", "SUPER_ADMIN"]).default("USER"),
});

export const ListUsersQuerySchema = z.object({
	search: z.string().trim().min(1).max(200).optional(),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	page: z.coerce.number().int().min(1).default(1),
});
