/* eslint-disable no-console */
import { setTimeout as sleep } from "node:timers/promises";

type RunOptions = {
	baseUrl: string;
	slug: string;
	concurrency: number;
	emailPrefix?: string;
};

type Result = {
	ok: boolean;
	status: number;
	bodyText: string;
	parsed?: ParsedResult;
	durationMs: number;
};

type RegisterPayload = {
	contact: { email: string; phone: null };
	answers: Record<string, never>;
};

type ParsedResult = {
	ok?: boolean;
	data?: { status?: string };
	error?: { code?: string };
};

function pickEnv(name: string, fallback?: string) {
	const v = process.env[name];
	return (v && v.trim()) || fallback;
}

async function postRegister(url: string, payload: RegisterPayload): Promise<Result> {
	let res: Response;
	const start = Date.now();

	try {
		res = await fetch(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-public-load-test": "1",
			},
			body: JSON.stringify(payload),
		});
	} catch (err: unknown) {
		return {
			ok: false,
			status: 0,
			bodyText: String(err instanceof Error ? err.message : err),
			durationMs: Date.now() - start,
		};
	}

	const durationMs = Date.now() - start;
	const bodyText = await res.text();
	let parsed: ParsedResult | undefined;

	try {
		parsed = JSON.parse(bodyText) as ParsedResult;
	} catch {
		parsed = undefined;
	}

	return { ok: res.ok, status: res.status, bodyText, parsed, durationMs };
}

function summarize(results: Result[]) {
	const byKey = new Map<string, number>();
	let totalTime = 0;
	let minTime = Infinity;
	let maxTime = 0;

	for (const r of results) {
		const apiStatus = r.parsed?.ok === true ? r.parsed?.data?.status : undefined;
		const key = apiStatus ?? r.parsed?.error?.code ?? `HTTP_${r.status || "NETWORK"}`;
		byKey.set(key, (byKey.get(key) ?? 0) + 1);

		totalTime += r.durationMs;
		if (r.durationMs < minTime) minTime = r.durationMs;
		if (r.durationMs > maxTime) maxTime = r.durationMs;
	}

	const sorted = [...byKey.entries()].sort((a, b) => b[1] - a[1]);
	const avgTime = Math.round(totalTime / results.length);

	console.log("\n📊 Resumen de Resultados:");
	for (const [k, n] of sorted) {
		console.log(`- ${k}: ${n}`);
	}

	console.log("\n⏱️  Métricas de Latencia (por petición):");
	console.log(`- Mínimo:   ${minTime} ms`);
	console.log(`- Máximo:   ${maxTime} ms`);
	console.log(`- Promedio: ${avgTime} ms`);
}

async function main(opts: RunOptions) {
	const url = `${opts.baseUrl.replace(/\/$/, "")}/public/events/${encodeURIComponent(opts.slug)}/register`;

	console.log("🚀 Iniciando Concurrencia public register");
	console.log(`URL: ${url}`);
	console.log(`Concurrency: ${opts.concurrency}`);

	const payloads = Array.from({ length: opts.concurrency }).map((_, i) => {
		const email = `${opts.emailPrefix ?? "load"}-${Date.now()}-${i}@example.com`;
		return { contact: { email, phone: null }, answers: {} } satisfies RegisterPayload;
	});

	const t0 = Date.now();
	const results = await Promise.all(payloads.map((p) => postRegister(url, p)));
	const ms = Date.now() - t0;

	console.log(`\n✅ Proceso completado en ${ms}ms (Tiempo total)`);
	summarize(results);

	const failures = results.filter((r) => !r.ok);
	if (failures.length) {
		console.log("\n❌ Ejemplos de fallos (máx 5):");
		for (const f of failures.slice(0, 5)) {
			console.log(`- HTTP ${f.status} [${f.durationMs}ms]: ${f.bodyText.slice(0, 250)}`);
		}
	}

	await sleep(50);
}

const baseUrl = pickEnv("PUBLIC_TEST_BASE_URL", "http://localhost:3001/api")!;
const slug = pickEnv("PUBLIC_TEST_SLUG", "")!;
const concurrencyRaw = pickEnv("PUBLIC_TEST_CONCURRENCY", "25");
const concurrency = Number(concurrencyRaw);

if (!slug) {
	console.error("❌ ERROR: Falta PUBLIC_TEST_SLUG (slug del evento publicado)");
	process.exit(1);
}

if (isNaN(concurrency) || concurrency <= 0) {
	console.error(`❌ ERROR: PUBLIC_TEST_CONCURRENCY debe ser un número válido mayor a 0. Recibido: "${concurrencyRaw}"`);
	process.exit(1);
}

main({ baseUrl, slug, concurrency }).catch((e) => {
	console.error(e);
	process.exit(1);
});
