import { FieldType, Prisma, RegistrationStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { hashPassword } from "../lib/crypto.js";

const slug = "pj-huixtla-demo";
const email = process.env.DEMO_EDITOR_EMAIL ?? "demo_editor@eventplanner.demo";
const password = process.env.DEMO_EDITOR_PASSWORD ?? "ChangeMe123!";

async function resetDemoEvent(eventId: number) {
	await prisma.$transaction([
		prisma.registrationFieldValue.deleteMany({ where: { eventId } }),
		prisma.registration.deleteMany({ where: { eventId } }),
		prisma.eventField.deleteMany({ where: { eventId } }),
		prisma.eventMember.deleteMany({ where: { eventId } }),
	]);
}

export async function resetAndSeedDemo(options: { reset?: boolean } = {}) {
	const reset = options.reset ?? true;
	let resetPerformed = false;

	const existingEvent = await prisma.event.findUnique({
		where: { slug },
		select: { id: true },
	});

	if (reset && existingEvent) {
		await resetDemoEvent(existingEvent.id);
		resetPerformed = true;
	}

	const existingUser = await prisma.user.findUnique({ where: { email } });
	const user = existingUser ?? await prisma.user.create({
		data: {
			email,
			passwordHash: await hashPassword(password),
			role: "EVENT_ADMIN",
		},
	});

	const event = await prisma.event.upsert({
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
				"/uploads/promotionalImages-1773365833402-914370234.jpeg"
			],
			contactInfo: "964 623 0830\r\n‪964 138 0255‬",
			socialMediaInfo: "https://www.instagram.com/pj.huixtla?igsh=MXdvZmtyb3h2MHo5Nw==\r\nhttps://www.facebook.com/p/Pastoral-Juvenil-San-Francisco-de-As%C3%ADs-Huixtla-100064480789821/",
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
					"Femenino": { "prefix": "F", "subgroupsCount": 2 },
					"Masculino": { "prefix": "M", "subgroupsCount": 2 }
				},
				hasSubgroups: true,
				customFieldId: null
			},
		},
	});

	await prisma.eventMember.upsert({
		where: { eventId_userId: { eventId: event.id, userId: user.id } },
		update: { role: "EDITOR" },
		create: { eventId: event.id, userId: user.id, role: "EDITOR" },
	});

	const fieldConfigs = [
		{ key: "nombre_joven", label: "Nombre(s) del joven", type: FieldType.TEXT, required: true, order: 0 },
		{ key: "apellido_joven", label: "Apellido(s) del joven", type: FieldType.TEXT, required: true, order: 1 },
		{ key: "genero", label: "Género", type: FieldType.SELECT, required: true, order: 2, options: ["Masculino", "Femenino"] },
		{ key: "fecha_nacimiento", label: "Fecha de nacimiento", type: FieldType.TEXT, required: true, order: 3 },
		{ key: "edad", label: "Edad", type: FieldType.NUMBER, required: true, order: 4 },
		{ key: "comunidad", label: "Comunidad / Barrio", type: FieldType.TEXT, required: true, order: 5 },
		{ key: "enfermedad", label: "Enfermedad/Alergias", type: FieldType.TEXTAREA, required: false, order: 6 },
		{ key: "tratamiento", label: "Tratamiento", type: FieldType.TEXTAREA, required: false, order: 7 },
		{ key: "nombre_tutor", label: "Nombre(s) del tutor", type: FieldType.TEXT, required: true, order: 8 },
		{ key: "apellido_tutor", label: "Apellido(s) del tutor", type: FieldType.TEXT, required: true, order: 9 },
		{ key: "telefono_tutor", label: "Número de Teléfono del tutor", type: FieldType.TEXT, required: true, order: 10 },
		{ key: "observaciones", label: "Observaciones", type: FieldType.TEXTAREA, required: false, order: 11 },
	];

	for (const f of fieldConfigs) {
		const jsonOptions = f.options ? f.options : Prisma.DbNull;

		await prisma.eventField.upsert({
			where: { eventId_key: { eventId: event.id, key: f.key } },
			update: {
				label: f.label,
				type: f.type,
				required: f.required,
				order: f.order,
				options: jsonOptions
			},
			create: {
				eventId: event.id,
				key: f.key,
				label: f.label,
				type: f.type,
				required: f.required,
				order: f.order,
				options: jsonOptions
			},
		});
	}

	const generoField = await prisma.eventField.findFirst({ where: { eventId: event.id, key: "genero" } });
	if (generoField) {
		const newSettings = { ...(event.groupingSettings as any), customFieldId: generoField.id };
		await prisma.event.update({ where: { id: event.id }, data: { groupingSettings: newSettings } });
	}

	const currentRegs = await prisma.registration.count({ where: { eventId: event.id } });
	if (currentRegs < 190) {
		console.log(`⏳ Generando ${190 - currentRegs} registros adicionales...`);
		const fields = await prisma.eventField.findMany({ where: { eventId: event.id } });
		const names = ["Juan", "Maria", "Pedro", "Ana", "Luis", "Carla", "Diego", "Sofia", "Mateo", "Elena"];
		const lastnames = ["Hernandez", "Garcia", "Lopez", "Martinez", "Perez", "Rodriguez", "Sanchez", "Ramirez"];

		for (let i = currentRegs + 1; i <= 190; i++) {
			const phone = `964${Math.floor(1000000 + Math.random() * 9000000)}`;
			const participant = await prisma.participant.upsert({
				where: { phoneNormalized: phone },
				update: {},
				create: { phoneNormalized: phone },
			});

			const registration = await prisma.registration.create({
				data: {
					eventId: event.id,
					participantId: participant.id,
					status: RegistrationStatus.REGISTERED,
				},
			});

			const answers = [
				{ key: "nombre_joven", value: names[Math.floor(Math.random() * names.length)] },
				{ key: "apellido_joven", value: lastnames[Math.floor(Math.random() * lastnames.length)] },
				{ key: "genero", value: Math.random() > 0.5 ? "Masculino" : "Femenino" },
				{ key: "fecha_nacimiento", value: "2008-05-15" },
				{ key: "edad", value: String(Math.floor(14 + Math.random() * 6)) },
				{ key: "comunidad", value: "Barrio Centro" },
				{ key: "nombre_tutor", value: names[Math.floor(Math.random() * names.length)] },
				{ key: "apellido_tutor", value: lastnames[Math.floor(Math.random() * lastnames.length)] },
				{ key: "telefono_tutor", value: "9640000000" },
				{ key: "enfermedad", value: "NA" },
				{ key: "tratamiento", value: "NA" },
				{ key: "observaciones", value: "NA" },
			];

			const valuesToCreate = answers.map(ans => {
				const f = fields.find(field => field.key === ans.key);
				return f ? {
					registrationId: registration.id,
					eventFieldId: f.id,
					eventId: event.id,
					value: ans.value
				} : null;
			}).filter((v): v is any => v !== null);

			await prisma.registrationFieldValue.createMany({ data: valuesToCreate });
		}
	}

	return {
		slug: event.slug,
		eventId: event.id,
		resetPerformed,
		demoEditorEmail: email,
		demoEditor: {
			email,
			password,
			role: user.role,
		},
	};
}
