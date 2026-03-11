import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { EventField } from "../types";

export const listEventFields = async (
	eventId: number,
): Promise<EventField[]> => {
	const { data } = await api.get<ApiResponse<EventField[]>>(
		`/events/${eventId}/fields`,
	);
	if (!data.ok) throw data;
	return data.data;
};

export const replaceEventFields = async (
	eventId: number,
	fields: Omit<EventField, "id">[],
): Promise<EventField[]> => {
	const { data } = await api.put<ApiResponse<EventField[]>>(
		`/events/${eventId}/fields`,
		{ fields },
	);
	if (!data.ok) throw data;
	return data.data;
};
