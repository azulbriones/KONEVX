import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import { assertAuthEnv, authConfig } from "../lib/authConfig.js";
import { hashToken, verifyPassword } from "../lib/crypto.js";
import { HttpError } from "../lib/httpError.js";

const REFRESH_EXP_MS = 7 * 24 * 60 * 60 * 1000;

assertAuthEnv();

function signAccessToken(user: { id: number; role: string }) {
	const payload: JwtPayload = { sub: String(user.id), role: user.role };
	return jwt.sign(payload, authConfig.accessSecret, {
		expiresIn: authConfig.accessTtl,
	});
}

function signRefreshToken(
	user: { id: number; role: string },
	sessionId: string,
) {
	const payload = { sub: String(user.id), role: user.role, sid: sessionId };
	return jwt.sign(payload, authConfig.refreshSecret, {
		expiresIn: authConfig.refreshTtl,
	});
}

export async function loginWithEmailPassword(email: string, password: string) {
	const user = await prisma.user.findUnique({
		where: { email },
		select: { id: true, email: true, passwordHash: true, role: true },
	});

	if (!user || !(await verifyPassword(password, user.passwordHash))) {
		throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
	}

	const sessionId = crypto.randomUUID();

	const accessToken = signAccessToken({ id: user.id, role: user.role });
	const refreshToken = signRefreshToken(
		{ id: user.id, role: user.role },
		sessionId,
	);

	const decoded = jwt.decode(refreshToken) as any;
	const expiresAt = decoded?.exp
		? new Date(decoded.exp * 1000)
		: new Date(Date.now() + REFRESH_EXP_MS);

	await prisma.session.create({
		data: {
			id: sessionId,
			userId: user.id,
			refreshTokenHash: hashToken(refreshToken),
			expiresAt: expiresAt,
		},
	});

	return {
		user: { id: user.id, email: user.email, role: user.role },
		accessToken,
		refreshToken,
	};
}

export async function refreshSession(refreshToken: string) {
	let payload: any;
	try {
		payload = jwt.verify(refreshToken, authConfig.refreshSecret);
	} catch {
		throw new HttpError(401, "INVALID_REFRESH", "Invalid refresh token");
	}

	const userId = Number(payload.sub);
	const sessionId = String(payload.sid);

	const session = await prisma.session.findUnique({
		where: { id: sessionId },
		select: {
			id: true,
			userId: true,
			refreshTokenHash: true,
			expiresAt: true,
			user: { select: { role: true, email: true } },
		},
	});

	if (!session || session.userId !== userId) {
		throw new HttpError(401, "INVALID_REFRESH", "Invalid refresh token");
	}

	if (session.expiresAt.getTime() < Date.now()) {
		throw new HttpError(401, "REFRESH_EXPIRED", "Refresh expired");
	}

	if (hashToken(refreshToken) !== session.refreshTokenHash) {
		throw new HttpError(401, "INVALID_REFRESH", "Invalid refresh token");
	}

	await prisma.session.delete({ where: { id: session.id } });

	const newSessionId = crypto.randomUUID();

	const accessToken = signAccessToken({
		id: userId,
		role: session.user.role,
	});
	const newRefreshToken = signRefreshToken(
		{ id: userId, role: session.user.role },
		newSessionId,
	);

	const decoded = jwt.decode(newRefreshToken) as any;
	const expiresAt = decoded?.exp
		? new Date(decoded.exp * 1000)
		: new Date(Date.now() + REFRESH_EXP_MS);

	await prisma.session.create({
		data: {
			id: newSessionId,
			userId: userId,
			refreshTokenHash: hashToken(newRefreshToken),
			expiresAt: expiresAt,
		},
	});

	return {
		user: {
			id: userId,
			email: session.user.email,
			role: session.user.role,
		},
		accessToken,
		refreshToken: newRefreshToken,
	};
}

export async function logoutSession(refreshToken: string | null) {
	if (!refreshToken) return;

	try {
		const payload: any = jwt.verify(refreshToken, authConfig.refreshSecret);
		const sessionId = String(payload.sid);

		await prisma.session
			.delete({ where: { id: sessionId } })
			.catch(() => {});
	} catch {}
}
