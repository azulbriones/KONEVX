import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
	CreateEventInput,
	EventDetailResponse,
	EventListItem,
} from "../types";

export async function listEvents(): Promise<EventListItem[]> {
	const { data } =
		await api.get<ApiResponse<{ events: EventListItem[] }>>("/events");
	if (!data.ok) throw data;
	return data.data.events;
}

export async function getEventById(
	eventId: number,
): Promise<EventDetailResponse> {
	const { data } = await api.get<ApiResponse<EventDetailResponse>>(
		`/events/${eventId}`,
	);

	if (!data.ok) throw data;
	return data.data;
}

export async function createEvent(input: CreateEventInput) {
	const { data } = await api.post<ApiResponse<any>>("/events", input);
	if (!data.ok) throw data;
	return data.data;
}

export async function setPublish(eventId: number, isPublished: boolean) {
	const { data } = await api.patch<ApiResponse<{ event: any }>>(
		`/events/${eventId}/publish`,
		{ isPublished },
	);
	if (!data.ok) throw data;
	return data.data;
}
