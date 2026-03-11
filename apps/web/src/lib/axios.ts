import { env } from "@/config/env";
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

export type ApiErrorPayload = {
	ok: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
		rid?: string;
	};
};

export function isApiErrorPayload(x: unknown): x is ApiErrorPayload {
	const payload = x as Record<string, unknown>;
	if (!payload || typeof payload !== "object") return false;

	const error = payload.error as Record<string, unknown>;
	return (
		payload.ok === false &&
		!!error &&
		typeof error.code === "string" &&
		typeof error.message === "string"
	);
}

// --- Utilidad para leer Cookies (CSRF) ---
function readCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : null;
}

const CSRF_COOKIE_NAME = "ep_csrf";

// --- Instancia de Axios ---
export const api = axios.create({
	baseURL: env.API_BASE_URL,
	withCredentials: true,
	timeout: 10000,
});

// --- Interceptor de Request (CSRF Token) ---
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const method = config.method?.toUpperCase() || "GET";
	const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

	if (isMutation) {
		const csrfToken = readCookie(CSRF_COOKIE_NAME);
		if (csrfToken) {
			config.headers.set("x-csrf-token", csrfToken);
		}
	}

	return config;
});

// --- Interceptor de Response (Manejo de Errores) ---
api.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error: AxiosError) => {
		if (!error.response) {
			return Promise.reject({
				ok: false,
				error: {
					code: "NETWORK_ERROR",
					message:
						"No se pudo conectar con el servidor. Verifica tu conexión.",
				},
			} as ApiErrorPayload);
		}

		if (error.response.status === 401) {
			const isAuthRequest =
				error.config?.url?.includes("/login") ||
				error.config?.url?.includes("/register");

			const isAuthPage =
				window.location.pathname.includes("/login") ||
				window.location.pathname.includes("/register");

			if (!isAuthRequest && !isAuthPage) {
				window.location.href = "/login";
				return new Promise(() => { });
			}
		}

		if (error.response.status === 403) {
			console.warn(
				"Acceso denegado (posible CSRF o falta de permisos):",
				error.config?.url,
			);
		}

		const errorData = error.response.data;

		if (isApiErrorPayload(errorData)) {
			return Promise.reject(errorData);
		}

		return Promise.reject({
			ok: false,
			error: {
				code: `HTTP_${error.response.status}`,
				message: error.message || "Ocurrió un error inesperado",
			},
		} as ApiErrorPayload);
	},
);
