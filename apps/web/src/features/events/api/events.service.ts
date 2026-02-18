import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
	CreateEventInput,
	EventDetail,
	EventListItem,
	EventStats,
} from "../types";

export const listEvents = async (): Promise<EventListItem[]> => {
	const { data } =
		await api.get<ApiResponse<{ events: EventListItem[] }>>("/events");
	if (!data.ok) throw data;
	return data.data.events;
};

export const getEventById = async (eventId: number) => {
	const { data } = await api.get<
		ApiResponse<{ event: EventDetail; stats: EventStats }>
	>(`/events/${eventId}`);

	if (!data.ok) throw data;
	return data.data;
};

export const createEvent = async (
	input: CreateEventInput,
): Promise<EventListItem> => {
	const { data } = await api.post<ApiResponse<EventListItem>>(
		"/events",
		input,
	);
	``;
	if (!data.ok) throw data;
	return data.data;
};

export const setPublish = async (eventId: number, isPublished: boolean) => {
	const { data } = await api.patch<
		ApiResponse<{
			event: Pick<
				EventDetail,
				"id" | "slug" | "name" | "isPublished" | "updatedAt"
			>;
		}>
	>(`/events/${eventId}/publish`, { isPublished });

	if (!data.ok) throw data;
	return data.data.event;
};
