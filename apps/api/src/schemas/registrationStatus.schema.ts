import { z } from "zod";

export const UpdateRegistrationStatusSchema = z.object({
	status: z.enum([
		"REGISTERED",
		"CANCELLED",
		"CONFIRMED",
		"ATTENDED",
		"NO_SHOW",
	]),
});

export type UpdateRegistrationStatusInput = z.infer<
	typeof UpdateRegistrationStatusSchema
>;
