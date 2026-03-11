import { z } from "zod";

export const UpdateRegistrationStatusSchema = z.object({
	status: z.enum([
		"REGISTERED",
		"CANCELLED",
		"CONFIRMED",
		"ATTENDED",
	]),
});

export type UpdateRegistrationStatusInput = z.infer<
	typeof UpdateRegistrationStatusSchema
>;
