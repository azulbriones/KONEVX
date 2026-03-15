import { z } from "zod";

export const LoginSchema = z.object({
	identifier: z.string().min(3, "El usuario o correo es requerido").max(200),
	password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200),
});

export const RegisterSchema = z.object({
	username: z.string()
		.min(3, "El usuario debe tener al menos 3 caracteres")
		.max(50)
		.regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos (sin espacios)"),
	email: z.string().email("Correo electrónico inválido"),
	password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200),
});
