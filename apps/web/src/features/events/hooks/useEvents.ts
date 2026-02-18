import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createEvent,
	getEventById,
	listEvents,
	setPublish,
} from "../api/events.service";
import type { CreateEventInput, EventDetail, EventStats } from "../types";

export const eventsKeys = {
	all: ["events"] as const,
	list: () => [...eventsKeys.all, "list"] as const,
	detail: (id: number) => [...eventsKeys.all, "detail", id] as const,
};

export const useEvents = () =>
	useQuery({
		queryKey: eventsKeys.list(),
		queryFn: listEvents,
		staleTime: 30_000,
	});

export const useEvent = (eventId: number) =>
	useQuery({
		queryKey: eventsKeys.detail(eventId),
		queryFn: () => getEventById(eventId),
		enabled: Number.isFinite(eventId) && eventId > 0,
		staleTime: 30_000,
	});

export const useCreateEvent = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateEventInput) => createEvent(input),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: eventsKeys.list() });
		},
	});
};

export const useSetPublish = (eventId: number) => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (isPublished: boolean) => setPublish(eventId, isPublished),

		onMutate: async (newStatus: any) => {
			await qc.cancelQueries({ queryKey: eventsKeys.detail(eventId) });
			const previousData = qc.getQueryData(eventsKeys.detail(eventId));

			qc.setQueryData(
				eventsKeys.detail(eventId),
				(
					old: { event: EventDetail; stats: EventStats } | undefined,
				) => {
					if (!old) return old;
					return {
						...old,
						event: {
							...old.event,
							isPublished: newStatus,
						},
					};
				},
			);
			qc.setQueryData(eventsKeys.list(), (oldList: any[] | undefined) => {
				if (!oldList) return oldList;
				return oldList.map((ev) =>
					ev.id === eventId ? { ...ev, isPublished: newStatus } : ev,
				);
			});
			return { previousData };
		},

		onError: (
			_err: any,
			_newStatus: any,
			context: { previousData: any },
		) => {
			if (context?.previousData) {
				qc.setQueryData(
					eventsKeys.detail(eventId),
					context.previousData,
				);
			}
		},

		onSettled: () => {
			qc.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
			qc.invalidateQueries({ queryKey: eventsKeys.list() });
		},
	});
};
