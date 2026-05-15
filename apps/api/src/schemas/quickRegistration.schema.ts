import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const QuickRegistrationSchema = z.object({
	name: z.string().trim().min(1, "El nombre es requerido").max(200),
	contact: z.string().trim().min(3, "El contacto es requerido").max(200),
	assignedGroup: z.preprocess(
		emptyToUndefined,
		z.string().trim().min(1).max(120).optional(),
	).optional(),
});

export type QuickRegistrationInput = z.infer<typeof QuickRegistrationSchema>;
