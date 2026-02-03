import { z } from "zod";

export const ContactSchema = z
	.object({
		email: z.string().email().optional().nullable(),
		phone: z.string().min(6).max(30).optional().nullable(),
	})
	.refine((v: { email: any; phone: any }) => !!v.email || !!v.phone, {
		message: "Either email or phone is required",
		path: ["contact"],
	});

export const PublicRegisterSchema = z.object({
	contact: ContactSchema,
	answers: z.record(z.unknown()).default({}),
});

export type PublicRegisterInput = z.infer<typeof PublicRegisterSchema>;
