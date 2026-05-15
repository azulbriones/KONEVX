import { prisma } from "../db/prisma.js";

type UserAuthRecord = {
	id: number;
	username: string;
	email: string;
	role: string;
	passwordHash: string;
};

type UserSummaryRecord = {
	id: number;
	username: string;
	email: string;
	role: string;
	createdAt: Date;
};

const userAuthSelect = {
	id: true,
	username: true,
	email: true,
	role: true,
	passwordHash: true,
} as const;

const userSummarySelect = {
	id: true,
	username: true,
	email: true,
	role: true,
	createdAt: true,
} as const;

function normalizeAuthIdentifier(value: string) {
	return value.trim().toLowerCase();
}

export async function findUserByIdentifier(
	identifier: string,
): Promise<UserAuthRecord | null> {
	const normalized = normalizeAuthIdentifier(identifier);

	return prisma.user.findFirst({
		where: {
			OR: [{ email: normalized }, { username: normalized }],
		},
		select: userAuthSelect,
	});
}

export async function findUserByEmail(email: string): Promise<UserSummaryRecord | null> {
	return prisma.user.findUnique({
		where: { email: normalizeAuthIdentifier(email) },
		select: userSummarySelect,
	});
}

export async function findUserById(userId: number): Promise<UserSummaryRecord | null> {
	return prisma.user.findUnique({
		where: { id: userId },
		select: userSummarySelect,
	});
}

export async function findUserByEmailOrUsername(
	email: string,
	username: string,
): Promise<Pick<UserAuthRecord, "id" | "email" | "username" | "role"> | null> {
	const normalizedEmail = normalizeAuthIdentifier(email);
	const normalizedUsername = normalizeAuthIdentifier(username);

	return prisma.user.findFirst({
		where: {
			OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
		},
		select: {
			id: true,
			email: true,
			username: true,
			role: true,
		},
	});
}

export async function createUser(input: {
	username: string;
	email: string;
	passwordHash: string;
}) {
	return prisma.user.create({
		data: {
			username: normalizeAuthIdentifier(input.username),
			email: normalizeAuthIdentifier(input.email),
			passwordHash: input.passwordHash,
		},
		select: userSummarySelect,
	});
}
