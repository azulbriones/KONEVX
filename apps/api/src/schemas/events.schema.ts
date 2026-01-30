import { z } from "zod";

export const CreateEventSchema = z.object({
	name: z.string().min(2).max(200),
	slug: z
		.string()
		.min(3)
		.max(80)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
	capacity: z.number().int().min(0),
	contactRequirement: z.enum(["EMAIL", "PHONE"]),
	isPublished: z.boolean().optional().default(false),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
