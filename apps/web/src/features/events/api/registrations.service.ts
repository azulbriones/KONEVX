import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
	ListRegistrationsQuery,
	RegistrationsListResponse,
	RegistrationStatus,
} from "../types";

export async function listRegistrations(
	eventId: number,
	query: ListRegistrationsQuery,
): Promise<RegistrationsListResponse> {
	const { data } = await api.get<ApiResponse<RegistrationsListResponse>>(
		`/events/${eventId}/registrations`,
		{ params: query },
	);

	if (!data.ok) throw data;
	return data.data;
}

export async function updateRegistrationStatus(
	eventId: number,
	registrationId: number,
	status: RegistrationStatus,
) {
	const { data } = await api.patch<
		ApiResponse<{ registrationId: number; status: RegistrationStatus }>
	>(`/events/${eventId}/registrations/${registrationId}`, { status });

	if (!data.ok) throw data;
	return data.data;
}
