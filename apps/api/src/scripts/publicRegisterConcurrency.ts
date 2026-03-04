/* eslint-disable no-console */
import { setTimeout as sleep } from "node:timers/promises";

type RunOptions = {
	baseUrl: string; // e.g. http://localhost:3001/api
	slug: string;
	concurrency: number; // e.g. 25
	emailPrefix?: string; // e.g. "load"
};

type Result = {
	ok: boolean;
	status: number;
	bodyText: string;
	parsed?: any;
};

function pickEnv(name: string, fallback?: string) {
	const v = process.env[name];
	return (v && v.trim()) || fallback;
}

async function postRegister(
	url: string,
	payload: any,
): Promise<Result> {
	let res: Response;
	try {
		res = await fetch(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-public-load-test": "1",
			},
			body: JSON.stringify(payload),
		});
	} catch (err: any) {
		return {
			ok: false,
			status: 0,
			bodyText: String(err?.message ?? err),
		};
	}

	const bodyText = await res.text();
	let parsed: any = undefined;
	try {
		parsed = JSON.parse(bodyText);
	} catch {
		parsed = undefined;
	}

	return { ok: res.ok, status: res.status, bodyText, parsed };
}

function summarize(results: Result[]) {
	const byKey = new Map<string, number>();

	for (const r of results) {
		const apiStatus =
			r.parsed?.ok === true ? r.parsed?.data?.status : undefined;

		const key =
			apiStatus ??
			r.parsed?.error?.code ??
			`HTTP_${r.status || "NETWORK"}`;

		byKey.set(key, (byKey.get(key) ?? 0) + 1);
	}

	const sorted = [...byKey.entries()].sort((a, b) => b[1] - a[1]);

	console.log("\nResumen:");
	for (const [k, n] of sorted) {
		console.log(`- ${k}: ${n}`);
	}
}

async function main(opts: RunOptions) {
	const url = `${opts.baseUrl.replace(/\/$/, "")}/public/events/${encodeURIComponent(
		opts.slug,
	)}/register`;

	console.log("Concurrencia public register");
	console.log(`URL: ${url}`);
	console.log(`concurrency: ${opts.concurrency}`);

	const payloads = Array.from({ length: opts.concurrency }).map((_, i) => {
		const email = `${opts.emailPrefix ?? "load"}-${Date.now()}-${i}@example.com`;
		return {
			contact: { email, phone: null },
			answers: {},
		};
	});

	const t0 = Date.now();
	const results = await Promise.all(payloads.map((p) => postRegister(url, p)));
	const ms = Date.now() - t0;

	console.log(`\nListo en ${ms}ms`);
	summarize(results);

	const failures = results.filter((r) => !r.ok);
	if (failures.length) {
		console.log("\nEjemplos de fallos (máx 5):");
		for (const f of failures.slice(0, 5)) {
			console.log(`- HTTP ${f.status}: ${f.bodyText.slice(0, 250)}`);
		}
	}

	await sleep(50);
}

const baseUrl = pickEnv("PUBLIC_TEST_BASE_URL", "http://localhost:3001/api")!;
const slug = pickEnv("PUBLIC_TEST_SLUG", "")!;
const concurrency = Number(pickEnv("PUBLIC_TEST_CONCURRENCY", "25"));

if (!slug) {
	console.error("Falta PUBLIC_TEST_SLUG (slug del evento publicado)");
	process.exit(1);
}

main({ baseUrl, slug, concurrency }).catch((e) => {
	console.error(e);
	process.exit(1);
});
