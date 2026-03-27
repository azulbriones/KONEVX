import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	deleteRegistration,
	listRegistrations,
	updateRegistrationData,
	updateRegistrationStatus,
} from "../api/registrations.service";
import type { ListRegistrationsQuery, RegistrationStatus } from "../types";
import { eventsKeys } from "./useEvents";

export const registrationsKeys = {
	all: (eventId: number) =>
		[...eventsKeys.detail(eventId), "registrations"] as const,
	list: (eventId: number, query: ListRegistrationsQuery) =>
		[...registrationsKeys.all(eventId), "list", query] as const,
};

export function useRegistrations(
	eventId: number,
	query: ListRegistrationsQuery,
) {
	return useQuery({
		queryKey: registrationsKeys.list(eventId, query),
		queryFn: () => listRegistrations(eventId, query),
		enabled: Number.isFinite(eventId) && eventId > 0,
		staleTime: 15_000,
		placeholderData: keepPreviousData,
	});
}

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
				{ status: input.status, assignedGroup: input.assignedGroup }
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: registrationsKeys.all(eventId) });
			qc.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
		},
	});
}

export function useUpdateRegistrationData(eventId: number) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (input: {
			registrationId: number;
			payload: { contact?: { email?: string; phone?: string }; answers?: Record<string, any> };
		}) => updateRegistrationData(eventId, input.registrationId, input.payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: registrationsKeys.all(eventId) });
			qc.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
		},
	});
}

export function useDeleteRegistration(eventId: number) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (registrationId: number) => deleteRegistration(eventId, registrationId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: registrationsKeys.all(eventId) });
			qc.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
		},
	});
}
