import { z } from "zod";

export const RegistrationsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	status: z
		.enum(["REGISTERED", "CANCELLED", "CONFIRMED", "ATTENDED"])
		.optional(),
	q: z.string().trim().min(1).max(200).optional(),
});
