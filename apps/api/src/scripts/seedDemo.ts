import { prisma } from "../db/prisma.js";
import { resetAndSeedDemo } from "../services/demoSeed.service.js";

const shouldReset = process.argv.includes("--reset");

async function main() {
	const r = await resetAndSeedDemo({ reset: shouldReset });
	console.log("✅ Demo seeded:", {
		slug: r.slug,
		resetPerformed: r.resetPerformed,
	});
	console.log("Demo editor:", r.demoEditor);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
