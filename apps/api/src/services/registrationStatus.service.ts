import { HttpError } from "../lib/httpError.js";
import type { UpdateRegistrationStatusInput } from "../schemas/registrationStatus.schema.js";
import { getRecommendedGroup, type GroupingSettings } from "./groupAssignment.service.js";
import {
	findRegistrationForListing,
	updateRegistrationStatusById,
	updateRegistrationStatusByIdIfNotAttended,
} from "../repositories/registrations.repository.js";

export async function updateRegistrationStatus(
	eventId: number,
	registrationId: number,
	input: UpdateRegistrationStatusInput,
) {
	const reg = await findRegistrationForListing(eventId, registrationId);

	if (!reg || reg.eventId !== eventId) {
		throw new HttpError(404, "REGISTRATION_NOT_FOUND", "Registration not found");
	}

	let finalGroup = reg.assignedGroup;

	if (input.assignedGroup !== undefined) {
		finalGroup = input.assignedGroup;
	} else if (input.status === "ATTENDED" && !finalGroup && reg.event.groupingSettings) {
		const settings = reg.event.groupingSettings as unknown as GroupingSettings;
		const recommended = await getRecommendedGroup(eventId, registrationId, settings);

		if (recommended) {
			finalGroup = recommended;
		}
	}

	if (input.status === "ATTENDED") {
		const result = await updateRegistrationStatusByIdIfNotAttended(registrationId, {
			status: input.status,
			assignedGroup: finalGroup,
		});

		if (result.count === 0) {
			throw new HttpError(409, "CONFLICT", "Error al actualizar el registro");
		}

		return { id: registrationId, status: input.status, assignedGroup: finalGroup };
	}

	return updateRegistrationStatusById(registrationId, {
		status: input.status,
		assignedGroup: finalGroup,
	});
}
