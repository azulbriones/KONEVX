export type UserRole = "SUPER_ADMIN" | "USER";

export interface User {
	id: number;
	username: string;
	email: string;
	role: UserRole;
	createdAt?: string;
}
