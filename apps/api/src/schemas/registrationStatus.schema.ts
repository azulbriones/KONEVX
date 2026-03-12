import { z } from "zod";

export const UpdateRegistrationStatusSchema = z.object({
	status: z.enum([
		"REGISTERED",
		"CANCELLED",
		"CONFIRMED",
		"ATTENDED",
	]),
	assignedGroup: z.string().nullable().optional(),
});

export type UpdateRegistrationStatusInput = z.infer<
	typeof UpdateRegistrationStatusSchema
>;
