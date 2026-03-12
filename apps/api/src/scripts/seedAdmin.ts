import { prisma } from "../db/prisma.js";
import { hashPassword } from "../lib/crypto.js";

function requireEnv(name: string): string {
	const value = process.env[name]?.trim();

	if (!value) {
		throw new Error(`${name} is required`);
	}

	return value;
}

const isDemo = process.env.DEMO_MODE === "true";

const email = isDemo
	? process.env.SEED_ADMIN_EMAIL?.trim() ||
	process.env.DEMO_EDITOR_EMAIL?.trim() ||
	"admin@eventplanner.demo"
	: requireEnv("SEED_ADMIN_EMAIL");

const password = isDemo
	? process.env.SEED_ADMIN_PASSWORD?.trim() ||
	process.env.DEMO_EDITOR_PASSWORD?.trim() ||
	"ChangeMe123!"
	: requireEnv("SEED_ADMIN_PASSWORD");

async function main() {
	const emailNorm = email.toLowerCase();
	const passwordHash = await hashPassword(password);

	const user = await prisma.user.upsert({
		where: { email: emailNorm },
		update: {
			passwordHash,
			role: "SUPER_ADMIN",
		},
		create: {
			email: emailNorm,
			passwordHash,
			role: "SUPER_ADMIN",
		},
		select: { id: true, email: true, role: true },
	});

	console.log("✅ Admin ensured:", user);
}

main()
	.catch((e) => {
		console.error("❌ Failed to ensure admin:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
