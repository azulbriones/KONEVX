import { object, string } from "yup";

export const loginSchema = object({
	identifier: string().required("Usuario o correo requerido"),
	password: string().required("Contraseña requerida"),
});

export const registerSchema = object({
	username: string()
		.required("Nombre de usuario requerido")
		.min(3, "Mínimo 3 caracteres")
		.matches(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos (sin espacios)"),
	email: string().email("Email inválido").required("Email requerido"),
	password: string().min(8, "Mínimo 8 caracteres").required("Contraseña requerida"),
});

export type LoginFormValues = import("yup").InferType<typeof loginSchema>;
export type RegisterFormValues = import("yup").InferType<typeof registerSchema>;
