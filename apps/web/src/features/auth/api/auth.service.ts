import { api, isApiErrorPayload } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { User } from "../types";

export type LoginInput = {
	email: string;
	password: string;
};

export const getUser = async (): Promise<User | null> => {
	try {
		const { data } = await api.get<ApiResponse<{ user: User }>>("/auth/me");
		if (!data.ok) return null;
		return data.data.user;
	} catch (e: any) {
		if (
			(isApiErrorPayload(e) && e.error.code === "HTTP_401") ||
			e?.response?.status === 401
		) {
			return null;
		}
		throw e;
	}
};

export const login = async (credentials: LoginInput): Promise<User> => {
	const { data } = await api.post<ApiResponse<{ user: User }>>(
		"/auth/login",
		credentials,
	);
	if (!data.ok) throw data;
	return data.data.user;
};

export const logout = async (): Promise<void> => {
	await api.post("/auth/logout");
};
