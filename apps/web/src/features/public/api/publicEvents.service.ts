import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
	GetPublicEventResponse,
	PublicRegisterInput,
	PublicRegisterResponse
} from "../types";

export async function getPublicEventBySlug(
	slug: string,
): Promise<GetPublicEventResponse> {
	const { data } = await api.get<ApiResponse<GetPublicEventResponse>>(
		`/public/events/${encodeURIComponent(slug)}`,
	);

	if (!data.ok) throw data;
	return data.data;
}

export async function publicRegister(
	slug: string,
	input: PublicRegisterInput,
): Promise<PublicRegisterResponse> {
	const { data } = await api.post<ApiResponse<PublicRegisterResponse>>(
		`/public/events/${encodeURIComponent(slug)}/register`,
		input,
	);

	if (!data.ok) throw data;
	return data.data;
}
