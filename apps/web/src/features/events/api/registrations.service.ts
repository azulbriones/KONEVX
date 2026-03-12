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
