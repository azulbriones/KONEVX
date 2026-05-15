import * as z from "zod";
const ContactBase = z.object({
	email: z.string().email().optional().nullable(),
	phone: z.string().min(6).max(30).optional().nullable(),
});

export const ContactSchema = ContactBase.superRefine((data, ctx) => {
	if (!data.email && !data.phone) {
		ctx.addIssue({
			code: "custom",
			message: "Either email or phone is required",
			path: ["email"],
		});
	}
});

export const PublicRegisterSchema = z.object({
	contact: ContactSchema,
	answers: z.record(z.string(), z.unknown()).default({}),
});

export type PublicRegisterInput = z.infer<typeof PublicRegisterSchema>;
