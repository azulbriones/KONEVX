import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publicRegister } from "../api/publicEvents.service";
import type { PublicRegisterInput, PublicRegisterResponse } from "../types";
import { publicEventKeys } from "./usePublicEvent";

type ApiError = {
	ok: false;
	error: { code: string; message: string; details?: any; rid?: string };
};

export function usePublicRegister(slug: string) {
	const queryClient = useQueryClient();

	return useMutation<PublicRegisterResponse, ApiError, PublicRegisterInput>({
		mutationFn: (input: PublicRegisterInput) => publicRegister(slug, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: publicEventKeys.detail(slug),
			});
		},
	});
}
