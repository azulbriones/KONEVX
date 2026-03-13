import { z } from "zod";

export const ListRegistrationsQuerySchema = z.object({
	status: z
		.enum(["REGISTERED", "CANCELLED", "CONFIRMED", "ATTENDED"])
		.optional(),
	skip: z.coerce.number().int().min(0).optional().default(0),
	take: z.coerce.number().int().min(1).max(100).optional().default(20),
	assignedGroup: z.string().nullable().optional(),
	checkInNotes: z.string().max(1000).nullable().optional(),
});

export type ListRegistrationsQuery = z.infer<
	typeof ListRegistrationsQuerySchema
>;
