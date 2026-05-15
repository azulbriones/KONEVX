import bcrypt from "bcrypt";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import jwt, { SignOptions } from "jsonwebtoken";
import { assertAuthEnv, authConfig } from "../lib/authConfig.js";
import { hashToken, verifyPassword } from "../lib/crypto.js";
import { HttpError } from "../lib/httpError.js";
import {
	createSession,
	deleteSession,
	findSessionById,
	replaceSession,
} from "../repositories/session.repository.js";
import {
	createUser,
	findUserByEmailOrUsername,
	findUserByIdentifier,
} from "../repositories/user.repository.js";

const REFRESH_EXP_MS = 7 * 24 * 60 * 60 * 1000;

assertAuthEnv();

function signAccessToken(user: { id: number; role: string; demo?: boolean }) {
	const payload = {
		sub: String(user.id),
		role: user.role,
		demo: !!user.demo,
	};

	return jwt.sign(payload, authConfig.accessSecret, {
		expiresIn: authConfig.accessTtl as SignOptions["expiresIn"],
	});
}

function signRefreshToken(
	user: { id: number; role: string; demo?: boolean },
	sessionId: string,
) {
	const payload = {
		sub: String(user.id),
		role: user.role,
		sid: sessionId,
		demo: !!user.demo,
	};

	return jwt.sign(payload, authConfig.refreshSecret, {
		expiresIn: authConfig.refreshTtl as SignOptions["expiresIn"],
	});
}

function getRefreshExpiry(refreshToken: string) {
	const decoded = jwt.decode(refreshToken) as jwt.JwtPayload | null;
	return decoded?.exp
		? new Date(decoded.exp * 1000)
		: new Date(Date.now() + REFRESH_EXP_MS);
}

async function createSessionAndTokens(
	user: { id: number; role: string },
	demo = false,
) {
	const sessionId = crypto.randomUUID();
	const accessToken = signAccessToken({ id: user.id, role: user.role, demo });
	const refreshToken = signRefreshToken(
		{ id: user.id, role: user.role, demo },
		sessionId,
	);

	await createSession({
		id: sessionId,
		userId: user.id,
		refreshTokenHash: hashToken(refreshToken),
		expiresAt: getRefreshExpiry(refreshToken),
	});

	return { accessToken, refreshToken };
}

export async function registerUser(input: {
	username: string;
	email: string;
	password: string;
}) {
	const usernameNormalized = input.username.trim().toLowerCase();
	const emailNormalized = input.email.trim().toLowerCase();

	const existingUser = await findUserByEmailOrUsername(
		emailNormalized,
		usernameNormalized,
	);

	if (existingUser) {
		const isEmail = existingUser.email === emailNormalized;
		throw new HttpError(
			400,
			"USER_EXISTS",
			isEmail
				? "Este correo electrónico ya está registrado."
				: "Este nombre de usuario ya está en uso.",
		);
	}

	const passwordHash = await bcrypt.hash(input.password, 10);

	try {
		const newUser = await createUser({
			username: usernameNormalized,
			email: emailNormalized,
			passwordHash,
		});

		return {
			id: newUser.id,
			username: newUser.username,
			email: newUser.email,
			role: newUser.role,
		};
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2002"
		) {
			const target = Array.isArray(error.meta?.target)
				? error.meta?.target
				: [error.meta?.target].filter(Boolean);
			const isEmail = target.includes("email");

			throw new HttpError(
				400,
				"USER_EXISTS",
				isEmail
					? "Este correo electrónico ya está registrado."
					: "Este nombre de usuario ya está en uso.",
			);
		}

		throw error;
	}
}

export async function loginWithCredentials(identifier: string, password: string) {
	const user = await findUserByIdentifier(identifier);

	if (!user || !(await verifyPassword(password, user.passwordHash))) {
		throw new HttpError(401, "INVALID_CREDENTIALS", "Credenciales inválidas");
	}

	const { accessToken, refreshToken } = await createSessionAndTokens({
		id: user.id,
		role: user.role,
	});

	return {
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role,
		},
		accessToken,
		refreshToken,
	};
}

export async function refreshSession(refreshToken: string) {
	let payload: jwt.JwtPayload;

	try {
		payload = jwt.verify(refreshToken, authConfig.refreshSecret) as jwt.JwtPayload;
	} catch {
		throw new HttpError(401, "INVALID_REFRESH", "Invalid refresh token");
	}

	const userId = Number(payload.sub);
	const sessionId = String(payload.sid);

	const session = await findSessionById(sessionId);

	if (!session || session.userId !== userId) {
		throw new HttpError(401, "INVALID_REFRESH", "Invalid refresh token");
	}

	if (session.expiresAt.getTime() < Date.now()) {
		throw new HttpError(401, "REFRESH_EXPIRED", "Refresh expired");
	}

	if (hashToken(refreshToken) !== session.refreshTokenHash) {
		throw new HttpError(401, "INVALID_REFRESH", "Invalid refresh token");
	}

	const newSessionId = crypto.randomUUID();
	const accessToken = signAccessToken({
		id: userId,
		role: session.user.role,
	});
	const newRefreshToken = signRefreshToken(
		{ id: userId, role: session.user.role },
		newSessionId,
	);

	await replaceSession(session.id, {
		id: newSessionId,
		userId,
		refreshTokenHash: hashToken(newRefreshToken),
		expiresAt: getRefreshExpiry(newRefreshToken),
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

	let payload: jwt.JwtPayload;
	try {
		payload = jwt.verify(refreshToken, authConfig.refreshSecret) as jwt.JwtPayload;
	} catch {
		return;
	}

	const sessionId = String(payload.sid);
	await deleteSession(sessionId);
}

export async function issueTokensForUser(user: { id: number; role: string }, demo = false) {
	const { accessToken, refreshToken } = await createSessionAndTokens(
		{ id: user.id, role: user.role },
		demo,
	);

	return { accessToken, refreshToken };
}
