import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getUser, login, LoginInput, logout } from "../api/auth.service";
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
			navigate("/login");
		},
	});
};
