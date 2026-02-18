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

		onMutate: async ({ registrationId, status }) => {
			await qc.cancelQueries({
				queryKey: registrationsKeys.all(eventId),
			});

			const previousData = qc.getQueriesData({
				queryKey: registrationsKeys.all(eventId),
			});

			qc.setQueriesData(
				{ queryKey: registrationsKeys.all(eventId) },
				(old: any) => {
					if (!old?.items) return old;
					return {
						...old,
						items: old.items.map((item: any) =>
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
			_err: any,
			_vars: any,
			context: { previousData: [any, any][] },
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
