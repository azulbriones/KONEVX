import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	listEventFields,
	replaceEventFields,
} from "../api/eventFields.service";
import type { EventField } from "../types";

export const eventFieldsKeys = {
	all: (eventId: number) => ["eventFields", eventId] as const,
};

export const useEventFields = (eventId: number) =>
	useQuery({
		queryKey: eventFieldsKeys.all(eventId),
		queryFn: () => listEventFields(eventId),
		enabled: Number.isFinite(eventId) && eventId > 0,
		staleTime: 30_000,
	});

export const useReplaceEventFields = (eventId: number) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (fields: Omit<EventField, "id">[]) =>
			replaceEventFields(eventId, fields),
		onSuccess: (newFields: EventField[]) => {
			qc.setQueryData(eventFieldsKeys.all(eventId), newFields);
		},
	});
};
