import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createEvent,
	getEventById,
	listEvents,
	setPublish,
} from "../api/events.service";
import type {
	CreateEventInput,
	EventDetailResponse,
	EventListItem,
} from "../types";

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

		onMutate: async (newStatus: boolean) => {
			await qc.cancelQueries({ queryKey: eventsKeys.detail(eventId) });

			const previous = qc.getQueryData<EventDetailResponse>(
				eventsKeys.detail(eventId),
			);

			qc.setQueryData<EventDetailResponse | undefined>(
				eventsKeys.detail(eventId),
				(old) => {
					if (!old) return old;
					return {
						...old,
						event: { ...old.event, isPublished: newStatus },
					};
				},
			);

			qc.setQueryData<EventListItem[] | undefined>(
				eventsKeys.list(),
				(oldList: any[]) => {
					if (!oldList) return oldList;
					return oldList.map((ev) =>
						ev.id === eventId
							? { ...ev, isPublished: newStatus }
							: ev,
					);
				},
			);

			return { previous };
		},

		onError: (_err: any, _newStatus: any, ctx: { previous: any }) => {
			if (ctx?.previous) {
				qc.setQueryData(eventsKeys.detail(eventId), ctx.previous);
			}
		},

		onSettled: async () => {
			await qc.invalidateQueries({
				queryKey: eventsKeys.detail(eventId),
			});
			await qc.invalidateQueries({ queryKey: eventsKeys.list() });
		},
	});
};
