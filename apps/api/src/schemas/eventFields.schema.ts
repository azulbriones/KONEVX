import { z } from "zod";

type EventFieldInput = {
	key: string;
	type: string;
	options?: string[];
};

export const FieldTypeSchema = z.enum([
	"TEXT",
	"TEXTAREA",
	"NUMBER",
	"DATE",
	"SELECT",
	"MULTI_SELECT",
	"CHECKBOX",
]);

export const EventFieldInputSchema = z.object({
	key: z
		.string()
		.min(1)
		.max(80)
		.regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, "key must be snake_case"),
	label: z.string().min(1).max(200),
	type: FieldTypeSchema,
	required: z.boolean().default(false),
	order: z.number().int().min(0),
	options: z.array(z.string().min(1)).optional(),
});

export const ReplaceEventFieldsSchema = z
	.object({
		fields: z.array(EventFieldInputSchema).max(100),
	})
	.superRefine(
		(
			val: { fields: EventFieldInput[] },
			ctx: {
				addIssue: (arg0: {
					code: "custom";
					path: (string | number)[];
					message: string;
				}) => void;
			},
		) => {
			const keys = val.fields.map((f) => f.key);
			const dup = keys.find((k, i) => keys.indexOf(k) !== i);
			if (dup) {
				ctx.addIssue({
					code: "custom",
					path: ["fields"],
					message: `Duplicate key: ${dup}`,
				});
			}

			for (const [i, f] of val.fields.entries()) {
				const isSelect =
					f.type === "SELECT" || f.type === "MULTI_SELECT";
				if (isSelect) {
					const ok =
					Array.isArray(f.options) &&
					f.options.length > 0 &&
					f.options.every(
						(o: unknown) =>
							typeof o === "string" && o.length > 0,
					);
					if (!ok) {
						ctx.addIssue({
							code: "custom",
							path: ["fields", i, "options"],
							message:
								"options must be a non-empty string[] for SELECT/MULTI_SELECT",
						});
					}
				} else if (f.options !== undefined) {
					ctx.addIssue({
						code: "custom",
						path: ["fields", i, "options"],
						message:
							"options is only allowed for SELECT/MULTI_SELECT",
					});
				}
			}
		},
	);

export type ReplaceEventFieldsInput = z.infer<typeof ReplaceEventFieldsSchema>;
