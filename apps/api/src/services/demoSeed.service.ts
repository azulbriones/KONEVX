import { prisma } from "../db/prisma.js";
import { hashPassword } from "../lib/crypto.js";

const slug = process.env.DEMO_EVENT_SLUG ?? "demo-event";
const email = process.env.DEMO_EDITOR_EMAIL ?? "demo_editor@eventplanner.demo";
const password = process.env.DEMO_EDITOR_PASSWORD ?? "ChangeMe123!";

export async function resetAndSeedDemo() {
	const existingEvent = await prisma.event.findUnique({
		where: { slug },
		select: { id: true },
	});

	if (existingEvent) {
		await prisma.$transaction([
			prisma.registrationFieldValue.deleteMany({
				where: { eventId: existingEvent.id },
			}),
			prisma.registration.deleteMany({
				where: { eventId: existingEvent.id },
			}),
			prisma.eventField.deleteMany({
				where: { eventId: existingEvent.id },
			}),
			prisma.eventMember.deleteMany({
				where: { eventId: existingEvent.id },
			}),
		]);
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
		existingEvent ??
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

	const eventFull =
		"id" in event
			? await prisma.event.findUnique({
					where: { slug },
					select: { id: true, slug: true, name: true },
				})
			: null;

	const finalEvent = eventFull ?? (event as any);

	await prisma.eventMember.upsert({
		where: { eventId_userId: { eventId: finalEvent.id, userId: user.id } },
		update: { role: "EDITOR" },
		create: { eventId: finalEvent.id, userId: user.id, role: "EDITOR" },
	});

	const countFields = await prisma.eventField.count({
		where: { eventId: finalEvent.id },
	});
	if (countFields === 0) {
		await prisma.eventField.createMany({
			data: [
				{
					eventId: finalEvent.id,
					key: "empresa",
					label: "Empresa",
					type: "TEXT",
					required: false,
					order: 0,
				},
				{
					eventId: finalEvent.id,
					key: "rol",
					label: "Rol",
					type: "TEXT",
					required: false,
					order: 1,
				},
				{
					eventId: finalEvent.id,
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
		slug,
		demoEditor: { email },
		event: finalEvent,
		resetPerformed: !!existingEvent,
	};
}
