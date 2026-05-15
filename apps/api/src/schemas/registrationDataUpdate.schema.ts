import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const RegistrationContactPatchSchema = z.object({
	email: z.preprocess(
		emptyToUndefined,
		z.string().email().optional().nullable(),
	).optional(),
	phone: z.preprocess(
		emptyToUndefined,
		z.string().min(6).max(30).optional().nullable(),
	).optional(),
});

export const RegistrationDataUpdateSchema = z.object({
	contact: RegistrationContactPatchSchema.optional(),
	answers: z.record(z.string(), z.unknown()).optional(),
});

export type RegistrationDataUpdateInput = z.infer<typeof RegistrationDataUpdateSchema>;
