import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getUser, login, LoginInput, logout, register, RegisterInput } from "../api/auth.service";
import type { User } from "../types";

export const authKeys = {
	all: ["auth"] as const,
	user: () => [...authKeys.all, "user"] as const,
};

export const useUser = () =>
	useQuery<User | null>({
		queryKey: authKeys.user(),
		queryFn: getUser,
		retry: false,
		staleTime: 1000 * 60 * 15,
	});

export function useRegister() {
	return useMutation({
		mutationFn: (data: RegisterInput) => register(data),
	});
}

export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: LoginInput) => login(data),
		onSuccess: (user: User) => {
			queryClient.setQueryData(authKeys.user(), user);
		},
	});
};

export const useLogout = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: logout,
		onSuccess: () => {
			queryClient.setQueryData(authKeys.user(), null);
			queryClient.clear();
			navigate("/login", { replace: true });
		},
	});
};
