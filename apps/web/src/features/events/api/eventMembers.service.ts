import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
	AddEventMemberInput,
	EventMember,
	EventMemberRole,
	ListEventMembersResponse,
	UpdateEventMemberRoleInput,
} from "../types";

export async function listEventMembers(
	eventId: number,
): Promise<EventMember[]> {
	const { data } = await api.get<ApiResponse<ListEventMembersResponse>>(
		`/events/${eventId}/members`,
	);

	if (!data.ok) throw data;
	return data.data.members;
}

export async function addEventMember(
	eventId: number,
	input: AddEventMemberInput,
): Promise<{ userId: number; email: string; eventRole: EventMemberRole }> {
	const { data } = await api.post<ApiResponse<any>>(
		`/events/${eventId}/members`,
		input,
	);

	if (!data.ok) throw data;
	return data.data;
}

export async function updateEventMemberRole(
	eventId: number,
	userId: number,
	input: UpdateEventMemberRoleInput,
): Promise<{ userId: number; email: string; eventRole: EventMemberRole }> {
	const { data } = await api.patch<ApiResponse<any>>(
		`/events/${eventId}/members/${userId}`,
		input,
	);

	if (!data.ok) throw data;
	return data.data;
}

export async function removeEventMember(
	eventId: number,
	userId: number,
): Promise<void> {
	const { data } = await api.delete<ApiResponse<any>>(
		`/events/${eventId}/members/${userId}`,
	);

	if (!data.ok) throw data;
}
