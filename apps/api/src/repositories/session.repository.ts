import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

type SessionCreateInput = {
	id: string;
	userId: number;
	refreshTokenHash: string;
	expiresAt: Date;
};

type SessionWithUser = {
	id: string;
	userId: number;
	refreshTokenHash: string;
	expiresAt: Date;
	user: {
		role: string;
		email: string;
	};
};

const sessionSelect = {
	id: true,
	userId: true,
	refreshTokenHash: true,
	expiresAt: true,
	user: {
		select: {
			role: true,
			email: true,
		},
	},
} as const;

export async function createSession(input: SessionCreateInput) {
	return prisma.session.create({ data: input });
}

export async function findSessionById(sessionId: string): Promise<SessionWithUser | null> {
	return prisma.session.findUnique({
		where: { id: sessionId },
		select: sessionSelect,
	});
}

export async function deleteSession(sessionId: string): Promise<boolean> {
	try {
		await prisma.session.delete({ where: { id: sessionId } });
		return true;
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
			return false;
		}
		throw err;
	}
}

export async function replaceSession(
	oldSessionId: string,
	input: SessionCreateInput,
) {
	return prisma.$transaction(async (tx) => {
		await tx.session.delete({ where: { id: oldSessionId } });
		return tx.session.create({ data: input });
	});
}
