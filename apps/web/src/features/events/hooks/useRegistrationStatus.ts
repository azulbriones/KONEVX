import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRegistrationStatus } from "../api/registrations.service";
import type { RegistrationStatus } from "../types";
import { eventsKeys } from "./useEvents";
import { registrationsKeys } from "./useRegistrations";

export function useUpdateRegistrationStatus(eventId: number) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (input: {
			registrationId: number;
			status: RegistrationStatus;
		}) =>
			updateRegistrationStatus(
				eventId,
				input.registrationId,
				input.status,
			),

		onMutate: async ({ registrationId, status }: { registrationId: number; status: RegistrationStatus }) => {
			await qc.cancelQueries({
				queryKey: registrationsKeys.all(eventId),
			});

			const previousData = qc.getQueriesData({
				queryKey: registrationsKeys.all(eventId),
			});

			qc.setQueriesData(
				{ queryKey: registrationsKeys.all(eventId) },
				(old: { items?: Array<{ id: number; status: RegistrationStatus }> } | undefined) => {
					if (!old?.items) return old;
					return {
						...old,
						items: old.items.map((item) =>
							item.id === registrationId
								? { ...item, status }
								: item,
						),
					};
				},
			);

			return { previousData };
		},

		onError: (
			_err: Error,
			_vars: { registrationId: number; status: RegistrationStatus },
			context?: { previousData: [readonly unknown[], unknown][] },
		) => {
			if (context?.previousData) {
				context.previousData.forEach(([queryKey, data]) => {
					qc.setQueryData(queryKey, data);
				});
			}
		},

		onSuccess: () => {
			qc.invalidateQueries({ queryKey: registrationsKeys.all(eventId) });
			qc.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
		},
	});
}
