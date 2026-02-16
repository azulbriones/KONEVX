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
				name: "Demo EventPlanner",
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
