import { z } from "zod";

export const CreateEventSchema = z.object({
	name: z.string().min(2).max(200),
	slug: z
		.string()
		.min(3)
		.max(80)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
	capacity: z.coerce.number().int().min(0),
	contactRequirement: z.enum(["EMAIL", "PHONE"]),
	isPublished: z.boolean().optional().default(false),

	organizerName: z.string().min(2),
	slogan: z.string().optional(),
	description: z.string().min(10),
	footerDescription: z.string().optional(),
	location: z.string().min(3),

	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	entryTime: z.string().optional(),
	exitTime: z.string().optional(),

	cost: z.coerce.number().min(0).optional(),
	minAge: z.coerce.number().int().min(0).optional(),
	contactInfo: z.string().optional(),
	socialMediaInfo: z.string().optional(),
	hashtag: z.string().optional(),
	thingsToBring: z.string().optional(),
	thingsNotToBring: z.string().optional(),
	note: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
