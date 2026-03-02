import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publicRegister } from "../api/publicEvents.service";
import type { PublicRegisterInput, PublicRegisterResponse } from "../types";
import { publicEventKeys } from "./usePublicEvent";

export function usePublicRegister(slug: string) {
	const queryClient = useQueryClient();

	return useMutation<
		PublicRegisterResponse,
		Error,
		PublicRegisterInput
	>({
		mutationFn: (input: PublicRegisterInput) => publicRegister(slug, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: publicEventKeys.detail(slug),
			});
		},
	});
}
