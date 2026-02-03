import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import type { UpdateRegistrationStatusInput } from "../schemas/registrationStatus.schema.js";

export async function updateRegistrationStatus(
	eventId: number,
	registrationId: number,
	input: UpdateRegistrationStatusInput,
) {
	const reg = await prisma.registration.findUnique({
		where: { id: registrationId },
		select: { id: true, eventId: true },
	});

	if (!reg || reg.eventId !== eventId) {
		throw new HttpError(
			404,
			"REGISTRATION_NOT_FOUND",
			"Registration not found",
		);
	}

	return prisma.registration.update({
		where: { id: registrationId },
		data: { status: input.status },
		select: { id: true, status: true, updatedAt: true },
	});
}
