import { prisma } from "../db/prisma.js";
import { hashPassword } from "../lib/crypto.js";

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@eventplanner.dev";
const password = process.env.SEED_ADMIN_PASSWORD ?? "12345!";
const role = "SUPER_ADMIN" as const;

async function main() {
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		console.log("Admin already exists:", email);
		return;
	}

	const passwordHash = await hashPassword(password);

	await prisma.user.create({
		data: { email, passwordHash, role },
	});

	console.log("Seeded admin:", { email, password });
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
