import { EventRole, FieldType, Prisma, RegistrationStatus, UserRole } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export async function resetDemoEventData(eventId: number) {
	return prisma.$transaction([
		prisma.registrationFieldValue.deleteMany({ where: { eventId } }),
		prisma.registration.deleteMany({ where: { eventId } }),
		prisma.eventField.deleteMany({ where: { eventId } }),
		prisma.eventMember.deleteMany({ where: { eventId } }),
	]);
}

export async function findDemoEventBySlug(slug: string) {
	return prisma.event.findUnique({ where: { slug }, select: { id: true } });
}

export async function upsertDemoEvent(slug: string) {
	return prisma.event.upsert({
		where: { slug },
		update: {},
		create: {
			name: "Retiro de preparación para la pascua 2026-demo",
			slug,
			capacity: 200,
			contactRequirement: "PHONE",
			isPublished: true,
			organizerName: "Pastoral Juvenil San Francisco de Asís Huixtla",
			slogan: "CRISTO ¡VIVE! Con Él somos esperanza",
			description: '"Caminamos en la esperanza que transforma y la paz que renueva."',
			footerDescription: "Parroquia San Francisco de Asís. Una juventud que camina con fe y esperanza.",
			location: "Instituto Huixtla",
			startDate: new Date("2026-03-31T00:00:00.000Z"),
			endDate: new Date("2026-04-01T00:00:00.000Z"),
			entryTime: "08:00",
			exitTime: "13:00",
			cost: 100,
			minAge: 14,
			promotionalVideo: "/uploads/promotionalVideo-1773363484886-579026103.mp4",
			promotionalImages: [
				"/uploads/promotionalImages-1773365832022-837491470.jpeg",
				"/uploads/promotionalImages-1773365832726-472874578.jpeg",
				"/uploads/promotionalImages-1773365832774-897921478.jpeg",
				"/uploads/promotionalImages-1773365833402-914370234.jpeg",
			],
			contactInfo: "964 623 0830\r\n‪964 138 0255‬",
			socialMediaInfo:
				"https://www.facebook.com/p/Pastoral-Juvenil-San-Francisco-de-As%C3%ADs-Huixtla-100064480789821/",
			hashtag: "pasosqueinspiran",
			logo: "/uploads/logo-1773361135040-784813352.png",
			backgroundImage: "/uploads/backgroundImage-1773362465719-497646436.jpeg",
			heroImage: "/uploads/heroImage-1773362382669-544104265.png",
			thingsToBring: "Biblia, cuaderno, lápiz/lapicero...",
			thingsNotToBring: "Celulares, alhajas...",
			note: "Tiendita disponible...",
			groupingSettings: {
				enabled: true,
				distribution: {
					Femenino: { prefix: "F", subgroupsCount: 2 },
					Masculino: { prefix: "M", subgroupsCount: 2 },
				},
				hasSubgroups: true,
				customFieldId: null,
			},
		},
	});
}

export async function upsertDemoUser(input: {
	email: string;
	username: string;
	passwordHash: string;
	role: UserRole;
}) {
	return prisma.user.upsert({
		where: { email: input.email },
		update: { username: input.username },
		create: {
			username: input.username,
			email: input.email,
			passwordHash: input.passwordHash,
			role: input.role,
		},
	});
}

export async function upsertDemoEventMember(input: {
	eventId: number;
	userId: number;
	role: EventRole;
}) {
	return prisma.eventMember.upsert({
		where: { eventId_userId: { eventId: input.eventId, userId: input.userId } },
		update: { role: input.role },
		create: { eventId: input.eventId, userId: input.userId, role: input.role },
	});
}

export async function upsertDemoEventField(input: {
	eventId: number;
	key: string;
	label: string;
	type: FieldType;
	required: boolean;
	order: number;
	options?: string[] | null;
}) {
	return prisma.eventField.upsert({
		where: { eventId_key: { eventId: input.eventId, key: input.key } },
		update: {
			label: input.label,
			type: input.type,
			required: input.required,
			order: input.order,
			options: input.options ? input.options : Prisma.DbNull,
		},
		create: {
			eventId: input.eventId,
			key: input.key,
			label: input.label,
			type: input.type,
			required: input.required,
			order: input.order,
			options: input.options ? input.options : Prisma.DbNull,
		},
	});
}

export async function findDemoEventField(eventId: number, key: string) {
	return prisma.eventField.findFirst({ where: { eventId, key } });
}

export async function updateDemoEventGroupingSettings(
	eventId: number,
	groupingSettings: Prisma.JsonObject,
) {
	return prisma.event.update({ where: { id: eventId }, data: { groupingSettings } });
}

export async function countDemoRegistrations(eventId: number) {
	return prisma.registration.count({ where: { eventId } });
}

export async function listDemoEventFields(eventId: number) {
	return prisma.eventField.findMany({ where: { eventId } });
}

export async function upsertDemoParticipant(phoneNormalized: string) {
	return prisma.participant.upsert({
		where: { phoneNormalized },
		update: {},
		create: { phoneNormalized },
	});
}

export async function createDemoRegistration(input: { eventId: number; participantId: number; status: RegistrationStatus }) {
	return prisma.registration.create({
		data: {
			eventId: input.eventId,
			participantId: input.participantId,
			status: input.status,
		},
	});
}

export async function createDemoRegistrationFieldValues(
	rows: Array<{ registrationId: number; eventFieldId: number; eventId: number; value: string }>,
) {
	return prisma.registrationFieldValue.createMany({ data: rows });
}
