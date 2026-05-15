import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const RegistrationCheckInSchema = z.object({
	checkInNotes: z.preprocess(
		emptyToUndefined,
		z.string().trim().max(500).optional(),
	).optional(),
});

export type RegistrationCheckInInput = z.infer<typeof RegistrationCheckInSchema>;
