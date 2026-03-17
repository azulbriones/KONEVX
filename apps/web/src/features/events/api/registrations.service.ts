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
	payload: { status: RegistrationStatus; assignedGroup?: string | null }
) {
	const { data } = await api.patch<
		ApiResponse<{ registrationId: number; status: RegistrationStatus; assignedGroup: string | null }>
	>(`/events/${eventId}/registrations/${registrationId}`, payload);

	if (!data.ok) throw data;
	return data.data;
}

export async function downloadRegistrationsExcel(
	eventId: number,
	query: Partial<ListRegistrationsQuery>,
) {
	const response = await api.get(`/events/${eventId}/registrations.xlsx`, {
		params: query,
		responseType: "blob",
	});

	const url = window.URL.createObjectURL(new Blob([response.data]));
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", `evento-${eventId}-registros.xlsx`);
	document.body.appendChild(link);
	link.click();

	link.remove();
	window.URL.revokeObjectURL(url);
}

export async function downloadRegistrationsPdf(
	eventId: number,
	query: Partial<ListRegistrationsQuery>,
) {
	const response = await api.get(`/events/${eventId}/registrations.pdf`, {
		params: query,
		responseType: "blob",
	});

	const url = window.URL.createObjectURL(
		new Blob([response.data], { type: "application/pdf" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", `evento-${eventId}-registros.pdf`);
	document.body.appendChild(link);
	link.click();

	link.remove();
	window.URL.revokeObjectURL(url);
}

export async function markAttendance(
	eventId: number,
	registrationId: number,
	checkInNotes?: string
) {
	const { data } = await api.patch<ApiResponse<{
		id: number;
		status: "ATTENDED";
		assignedGroup: string | null;
		checkInNotes: string | null;
	}>>(
		`/events/${eventId}/registrations/${registrationId}/check-in`,
		{ checkInNotes }
	);

	if (!data.ok) throw data;
	return data.data;
}
export async function cancelAttendance(eventId: number, registrationId: number) {
	const { data } = await api.delete<ApiResponse<any>>(
		`/events/${eventId}/registrations/${registrationId}/check-in`
	);
	if (!data.ok) throw data;
	return data.data;
}

export async function quickRegistration(
	eventId: number,
	payload: { name: string; contact: string; assignedGroup?: string }
) {
	const { data } = await api.post<ApiResponse<any>>(
		`/events/${eventId}/registrations/quick`,
		payload
	);
	if (!data.ok) throw data;
	return data.data;
}

export async function updateRegistrationData(
	eventId: number,
	registrationId: number,
	payload: { contact?: { email?: string; phone?: string }; answers?: Record<string, any> }
) {
	const { data } = await api.patch<ApiResponse<any>>(
		`/events/${eventId}/registrations/${registrationId}/data`,
		payload
	);
	if (!data.ok) throw data;
	return data.data;
}

export async function deleteRegistration(eventId: number, registrationId: number) {
	const { data } = await api.delete<ApiResponse<any>>(
		`/events/${eventId}/registrations/${registrationId}`
	);
	if (!data.ok) throw data;
	return data.data;
}
