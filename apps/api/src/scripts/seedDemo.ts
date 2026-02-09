import { prisma } from "../db/prisma.js";
import { hashPassword } from "../lib/crypto.js";

const slug = process.env.DEMO_EVENT_SLUG ?? "demo-event";
const email = process.env.DEMO_EDITOR_EMAIL ?? "demo_editor@eventplanner.demo";
const password = process.env.DEMO_EDITOR_PASSWORD ?? "ChangeMe123!";

async function main() {
	// 1) Usuario demo
	const existingUser = await prisma.user.findUnique({ where: { email } });
	const user =
		existingUser ??
		(await prisma.user.create({
			data: {
				email,
				passwordHash: await hashPassword(password),
				role: "EVENT_ADMIN",
			},
		}));

	// 2) Evento demo publicado
	const existingEvent = await prisma.event.findUnique({ where: { slug } });
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
		}));

	// 3) Membership por evento: EDITOR
	await prisma.eventMember.upsert({
		where: { eventId_userId: { eventId: event.id, userId: user.id } },
		update: { role: "EDITOR" },
		create: { eventId: event.id, userId: user.id, role: "EDITOR" },
	});

	// 4) Fields demo (si no existen)
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

	console.log("✅ Demo seeded");
	console.log("Demo editor:", { email, password });
	console.log("Demo event slug:", slug);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
