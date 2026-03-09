import { mixed, number, object, string } from "yup";

export const schema = object({
	name: string().required("El nombre del evento es requerido").min(2).max(120),
	slug: string()
		.required("El slug es obligatorio")
		.matches(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"usa kebab-case: mi-evento-2026",
		),
	capacity: number().required("La capacidad es obligatoria").integer().min(1).max(1_000_000),
	contactRequirement: mixed<"EMAIL" | "PHONE">()
		.oneOf(["EMAIL", "PHONE"])
		.required("Selecciona un método de contacto"),

	organizerName: string().required("El nombre del organizador es obligatorio").min(2),
	description: string().required("La descripción es obligatoria").min(10, "Mínimo 10 caracteres"),
	location: string().required("La ubicación es obligatoria").min(3),

	slogan: string().optional(),
	footerDescription: string().optional(),
	contactInfo: string().optional(),
	socialMediaInfo: string().optional(),
	hashtag: string().optional(),

	startDate: string().optional(),
	endDate: string().optional(),
	entryTime: string().optional(),
	exitTime: string().optional(),

	thingsToBring: string().optional(),
	thingsNotToBring: string().optional(),
	note: string().optional(),

	cost: number()
		.transform((value, originalValue) => (originalValue === "" ? undefined : value))
		.optional()
		.min(0, "El costo no puede ser negativo"),

	minAge: number()
		.transform((value, originalValue) => (originalValue === "" ? undefined : value))
		.optional()
		.integer("La edad debe ser un número entero")
		.min(0, "La edad mínima no puede ser negativa"),

	logo: mixed().optional(),
	promotionalVideo: mixed().optional(),
	promotionalImages: mixed().optional(),
});
