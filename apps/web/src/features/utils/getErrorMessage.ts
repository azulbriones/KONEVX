import type { ApiErr } from "@/types/api";

export function getErrorMessage(err: unknown): string {
	const maybe = err as ApiErr;
	if (maybe?.response?.data?.error?.message) {
		return maybe.response.data.error.message;
	}
	if (maybe?.error?.message) return maybe.error.message;

	if (err instanceof Error) return err.message;
	return "Ocurrió un error inesperado al iniciar sesión.";
}
