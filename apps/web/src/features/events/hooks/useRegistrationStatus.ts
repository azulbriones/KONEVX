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
			assignedGroup?: string | null;
		}) =>
			updateRegistrationStatus(
				eventId,
				input.registrationId,
				{
					status: input.status,
					assignedGroup: input.assignedGroup
				}
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: registrationsKeys.all(eventId) });
			qc.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
		},
	});
}
