import { prisma } from "../db/prisma.js";
import { hashPassword } from "../lib/crypto.js";

const email =
	process.env.SEED_ADMIN_EMAIL ??
	process.env.DEMO_EDITOR_EMAIL ?? // fallback en demo si quieres
	"admin@eventplanner.demo";

const password =
	process.env.SEED_ADMIN_PASSWORD ??
	process.env.DEMO_EDITOR_PASSWORD ?? // fallback en demo si quieres
	"ChangeMe123!";

async function main() {
	const emailNorm = email.trim().toLowerCase();
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
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
