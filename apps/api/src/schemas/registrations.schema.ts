import { z } from "zod";

export const ListRegistrationsQuerySchema = z.object({
	status: z
		.enum(["REGISTERED", "CANCELLED", "CONFIRMED", "ATTENDED"])
		.optional(),
	skip: z.coerce.number().int().min(0).optional().default(0),
	take: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListRegistrationsQuery = z.infer<
	typeof ListRegistrationsQuerySchema
>;
