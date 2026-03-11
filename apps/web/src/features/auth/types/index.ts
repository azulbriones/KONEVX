import { InferType } from "yup";
import { schema } from "../utils/validationSchema";

export type UserRole = "SUPER_ADMIN" | "EVENT_ADMIN";

export interface User {
	id: number;
	email: string;
	role: UserRole;
	createdAt?: string;
}

export type FormValues = InferType<typeof schema>;
