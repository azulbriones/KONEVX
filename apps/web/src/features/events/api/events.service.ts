import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
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

export async function createEvent(input: FormData) {
  const { data } = await api.post<ApiResponse<{ id: number; name: string; slug: string; createdAt: string }>>("/events", input);
  if (!data.ok) throw data;
  return data.data;
}

export async function setPublish(eventId: number, isPublished: boolean) {
  const { data } = await api.patch<ApiResponse<{ event: { id: number; slug: string; name: string; isPublished: boolean; updatedAt: string } }>>(
    `/events/${eventId}/publish`,
    { isPublished },
  );
  if (!data.ok) throw data;
  return data.data;
}

export async function updateEvent(eventId: number, input: FormData) {
  const { data } = await api.patch<ApiResponse<unknown>>(`/events/${eventId}`, input);
  if (!data.ok) throw data;
  return data.data;
}

export async function deleteEvent(eventId: number) {
  const { data } = await api.delete<ApiResponse<unknown>>(`/events/${eventId}`);
  if (!data.ok) throw data;
  return data;
}
