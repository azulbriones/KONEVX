import { useQuery } from "@tanstack/react-query";
import { listRegistrations } from "../api/registrations.service";
import type { ListRegistrationsQuery } from "../types";
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
	});
}
