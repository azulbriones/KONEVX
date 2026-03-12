import { prisma } from "../db/prisma.js";
import { hashPassword } from "../lib/crypto.js";

const slug = process.env.DEMO_EVENT_SLUG ?? "demo-event";
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

type ResetAndSeedOptions = {
	reset?: boolean;
};

export async function resetAndSeedDemo(options: ResetAndSeedOptions = {}) {
	const reset = options.reset ?? true;

	const existingEvent = await prisma.event.findUnique({
		where: { slug },
		select: { id: true },
	});

	let resetPerformed = false;
	if (reset && existingEvent) {
		await resetDemoEvent(existingEvent.id);
		resetPerformed = true;
	}

	const existingUser = await prisma.user.findUnique({ where: { email } });
	const user =
		existingUser ??
		(await prisma.user.create({
			data: {
				email,
				passwordHash: await hashPassword(password),
				role: "EVENT_ADMIN",
			},
			select: { id: true, email: true, role: true },
		}));

	const event =
		(await prisma.event.findUnique({
			where: { slug },
			select: { id: true, slug: true, name: true },
		})) ??
		(await prisma.event.create({
			data: {
				name: "Demo Konevx",
				slug,
				capacity: 200,
				contactRequirement: "EMAIL",
				isPublished: true,
			},
			select: { id: true, slug: true, name: true },
		}));

	await prisma.eventMember.upsert({
		where: { eventId_userId: { eventId: event.id, userId: user.id } },
		update: { role: "EDITOR" },
		create: { eventId: event.id, userId: user.id, role: "EDITOR" },
	});

	const countFields = await prisma.eventField.count({
		where: { eventId: event.id },
	});

	if (countFields === 0) {
		await prisma.eventField.createMany({
			data: [
				{
					eventId: event.id,
					key: "empresa",
					label: "Empresa",
					type: "TEXT",
					required: false,
					order: 0,
				},
				{
					eventId: event.id,
					key: "rol",
					label: "Rol",
					type: "TEXT",
					required: false,
					order: 1,
				},
				{
					eventId: event.id,
					key: "talla",
					label: "Talla",
					type: "SELECT",
					required: false,
					order: 2,
					options: ["S", "M", "L", "XL"],
				},
			],
		});
	}

	// ==========================================
	// 💡 NUEVO: GENERACIÓN DE 100 REGISTROS FALSOS
	// ==========================================
	const countRegistrations = await prisma.registration.count({
		where: { eventId: event.id },
	});

	if (countRegistrations === 0) {
		console.log("⏳ Generando 100 registros de prueba...");

		// Obtenemos los campos recién creados para saber sus IDs
		const fields = await prisma.eventField.findMany({ where: { eventId: event.id } });
		const empresaFieldId = fields.find(f => f.key === "empresa")?.id;
		const rolFieldId = fields.find(f => f.key === "rol")?.id;
		const tallaFieldId = fields.find(f => f.key === "talla")?.id;

		// Datos falsos para variar los registros
		const sizes = ["S", "M", "L", "XL"];
		const roles = ["Desarrollador", "Diseñador", "Gerente", "Analista", "Director"];
		const companies = ["Tech Solutions", "Innovatech", "Acme Corp", "Global Dynamics", "Stark Industries"];
		const statuses = ["REGISTERED", "CONFIRMED", "ATTENDED", "CANCELLED"];

		for (let i = 1; i <= 100; i++) {
			const emailNormalized = `participante${i}@demo.com`;
			const phoneNormalized = `555000${i.toString().padStart(3, '0')}`; // Ej: 555000001

			// 1. Crear o encontrar el Participante (persona física)
			const participant = await prisma.participant.upsert({
				where: { emailNormalized },
				update: {},
				create: { emailNormalized, phoneNormalized },
			});

			// 2. Crear el Registro (ticket para este evento)
			const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

			const registration = await prisma.registration.create({
				data: {
					eventId: event.id,
					participantId: participant.id,
					status: randomStatus as any,
				},
			});

			// 3. Llenar las respuestas del formulario
			const valuesToCreate = [];

			if (empresaFieldId) {
				valuesToCreate.push({
					registrationId: registration.id,
					eventFieldId: empresaFieldId,
					eventId: event.id,
					value: companies[Math.floor(Math.random() * companies.length)]
				});
			}
			if (rolFieldId) {
				valuesToCreate.push({
					registrationId: registration.id,
					eventFieldId: rolFieldId,
					eventId: event.id,
					value: roles[Math.floor(Math.random() * roles.length)]
				});
			}
			if (tallaFieldId) {
				valuesToCreate.push({
					registrationId: registration.id,
					eventFieldId: tallaFieldId,
					eventId: event.id,
					value: sizes[Math.floor(Math.random() * sizes.length)]
				});
			}

			if (valuesToCreate.length > 0) {
				await prisma.registrationFieldValue.createMany({ data: valuesToCreate });
			}
		}
		console.log("✅ 100 Registros de prueba creados exitosamente.");
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
