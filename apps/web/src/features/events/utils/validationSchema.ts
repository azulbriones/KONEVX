import { mixed, number, object, string } from "yup";

export const schema = object({
	name: string().required().min(2).max(120),
	slug: string()
		.required()
		.matches(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"usa kebab-case: mi-evento-2026",
		),
	capacity: number().required().integer().min(1).max(1_000_000),
	contactRequirement: mixed<"EMAIL" | "PHONE">()
		.oneOf(["EMAIL", "PHONE"])
		.required(),
});
