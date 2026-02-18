import { object, string } from "yup";

export const schema = object({
	email: string().email("Email inválido").required("Email requerido"),
	password: string().required("Contraseña requerida"),
});
