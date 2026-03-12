import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/httpError.js";
import type { UpdateRegistrationStatusInput } from "../schemas/registrationStatus.schema.js";
import { getRecommendedGroup, type GroupingSettings } from "./groupAssignment.service.js";

export async function updateRegistrationStatus(
	eventId: number,
	registrationId: number,
	input: UpdateRegistrationStatusInput,
) {
	const reg = await prisma.registration.findUnique({
		where: { id: registrationId },
		select: {
			id: true,
			eventId: true,
			assignedGroup: true,
			event: {
				select: { groupingSettings: true }
			}
		},
	});

	if (!reg || reg.eventId !== eventId) {
		throw new HttpError(404, "REGISTRATION_NOT_FOUND", "Registration not found");
	}

	let finalGroup = reg.assignedGroup;

	if (input.assignedGroup !== undefined) {
		finalGroup = input.assignedGroup;
	}
	else if (input.status === "ATTENDED" && !finalGroup && reg.event.groupingSettings) {
		const settings = reg.event.groupingSettings as unknown as GroupingSettings;
		const recommended = await getRecommendedGroup(eventId, registrationId, settings);

		if (recommended) {
			finalGroup = recommended;
		}
	}

	return prisma.registration.update({
		where: { id: registrationId },
		data: {
			status: input.status,
			assignedGroup: finalGroup
		},
		select: {
			id: true,
			status: true,
			assignedGroup: true,
			updatedAt: true
		},
	});
}
