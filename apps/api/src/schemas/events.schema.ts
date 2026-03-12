import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const GroupDistributionSchema = z.object({
	prefix: z.string().min(1, "El prefijo es requerido"),
	subgroupsCount: z.number().int().min(1, "Debe haber al menos 1 subgrupo"),
});

export const GroupingSettingsSchema = z.object({
	enabled: z.boolean(),
	customFieldId: z.number().int().positive("Debe seleccionar un campo válido").nullable().optional(),
	hasSubgroups: z.boolean(),
	distribution: z.record(z.string(), GroupDistributionSchema).optional().default({}),
}).refine((data) => {
	if (data.enabled && !data.customFieldId) {
		return false;
	}
	return true;
}, {
	message: "Debe seleccionar un campo válido cuando la agrupación está activada",
	path: ["customFieldId"],
});

export const CreateEventSchema = z.object({
	name: z.string().min(2).max(200),
	slug: z
		.string()
		.min(3)
		.max(80)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
	capacity: z.coerce.number().int().min(0),
	contactRequirement: z.enum(["EMAIL", "PHONE"]),

	isPublished: z.preprocess((val) => {
		if (val === undefined || val === null || val === "") return undefined;
		if (typeof val === "string") return val === "true";
		return Boolean(val);
	}, z.boolean()).optional(),

	organizerName: z.string().min(2),
	slogan: z.string().optional(),
	description: z.string().min(10),
	footerDescription: z.string().optional(),
	location: z.string().min(3),

	startDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
	endDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),

	entryTime: z.string().optional(),
	exitTime: z.string().optional(),

	cost: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
	minAge: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).optional()),

	contactInfo: z.string().optional(),
	socialMediaInfo: z.string().optional(),
	hashtag: z.string().optional(),
	thingsToBring: z.string().optional(),
	thingsNotToBring: z.string().optional(),
	note: z.string().optional(),

	groupingSettings: z.preprocess((val) => {
		if (typeof val === "string") {
			try { return JSON.parse(val); } catch (e) { return val; }
		}
		return val;
	}, GroupingSettingsSchema.optional()),
});

export const UpdateEventSchema = CreateEventSchema.partial();
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
