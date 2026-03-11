export const authConfig = {
	accessTtl: process.env.AUTH_ACCESS_TOKEN_TTL ?? "15m",
	refreshTtl: process.env.AUTH_REFRESH_TOKEN_TTL ?? "7d",
	accessSecret: process.env.AUTH_ACCESS_TOKEN_SECRET ?? "",
	refreshSecret: process.env.AUTH_REFRESH_TOKEN_SECRET ?? "",
	cookie: {
		secure: process.env.COOKIE_SECURE === "true",
		sameSite: (["lax", "strict", "none"].includes(
			process.env.COOKIE_SAMESITE || "",
		)
			? process.env.COOKIE_SAMESITE
			: "lax") as "lax" | "strict" | "none",
		domain: process.env.COOKIE_DOMAIN || undefined,
	},
};

export function assertAuthEnv() {
	if (!authConfig.accessSecret || !authConfig.refreshSecret) {
		throw new Error(
			"❌ FATAL: AUTH_ACCESS_TOKEN_SECRET and AUTH_REFRESH_TOKEN_SECRET are required.",
		);
	}

	if (authConfig.cookie.sameSite === "none" && !authConfig.cookie.secure) {
		throw new Error(
			"❌ CONFIG ERROR: SameSite 'none' requires Secure 'true'.",
		);
	}
}
