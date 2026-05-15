import {
	countRegistrationGroupOccupancy,
	findRegistrationGroupAnswer,
} from "../repositories/registrations.repository.js";

export interface GroupDistribution {
	prefix: string;
	subgroupsCount: number;
}

export interface GroupingSettings {
	enabled: boolean;
	customFieldId: number;
	hasSubgroups: boolean;
	distribution: Record<string, GroupDistribution>;
}

export async function getRecommendedGroup(
	eventId: number,
	registrationId: number,
	settings: GroupingSettings
): Promise<string | null> {

	if (!settings.enabled) return null;

	const answerRecord = await findRegistrationGroupAnswer(registrationId, settings.customFieldId);

	if (!answerRecord || !answerRecord.value) return null;

	const groupValue = String(answerRecord.value);

	const distribution = settings.distribution[groupValue];
	if (!distribution) return null;

	if (!settings.hasSubgroups) {
		return distribution.prefix;
	}

	const possibleGroups: string[] = [];
	for (let i = 1; i <= distribution.subgroupsCount; i++) {
		possibleGroups.push(`${distribution.prefix}${i}`);
	}

	const occupancy = await countRegistrationGroupOccupancy(eventId, possibleGroups);

	const currentCounts: Record<string, number> = {};
	possibleGroups.forEach(g => currentCounts[g] = 0);

	occupancy.forEach(data => {
		if (data.assignedGroup) {
			currentCounts[data.assignedGroup] = data._count.assignedGroup;
		}
	});

	let recommendedGroup = possibleGroups[0];
	let minCount = currentCounts[possibleGroups[0]];

	for (let i = 1; i < possibleGroups.length; i++) {
		const groupName = possibleGroups[i];
		const count = currentCounts[groupName];

		if (count < minCount) {
			minCount = count;
			recommendedGroup = groupName;
		}
	}

	return recommendedGroup;
}
