import { prisma } from "../db/prisma.js";
import { resetAndSeedDemo } from "../services/demoSeed.service.js";

async function main() {
	const reset = process.argv.includes("--reset");
	const r = await resetAndSeedDemo({ reset });

	console.log("✅ Demo seeded:", {
		slug: r.slug,
		eventId: r.eventId,
		resetPerformed: r.resetPerformed,
	});
	console.log("Demo editor:", {
		email: r.demoEditorEmail,
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
