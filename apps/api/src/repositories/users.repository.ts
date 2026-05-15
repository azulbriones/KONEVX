import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../db/prisma.js";

const userSelect = {
	id: true,
	email: true,
	role: true,
	createdAt: true,
} as const;

export async function createUserRecord(input: {
	username: string;
	email: string;
	role: UserRole;
	passwordHash: string;
}) {
	return prisma.user.create({
		data: input,
		select: userSelect,
	});
}

export async function listUsersRecord(where: Prisma.UserWhereInput, limit: number, skip: number) {
	return prisma.user.findMany({
		where,
		orderBy: { createdAt: "desc" },
		take: limit,
		skip,
		select: userSelect,
	});
}

export async function countUsersRecord(where: Prisma.UserWhereInput) {
	return prisma.user.count({ where });
}
