import React from "react";
import ReactDOM from "react-dom/client";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

type Health = { ok: boolean; service?: string };

function App() {
	const [loading, setLoading] = React.useState(true);
	const [data, setData] = React.useState<Health | null>(null);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!API_URL) {
			setError("Falta VITE_API _URL en el entorno.");
			setLoading(false);
			return;
		}

		const controller = new AbortController();

		fetch(`${API_URL}/health`, { signal: controller.signal })
			.then(async (res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return (await res.json()) as Health;
			})
			.then((json) => setData(json))
			.catch((e: unknown) => {
				if (e instanceof Error && e.name === "AbortError") return;
				setError(e instanceof Error ? e.message : "Error desconocido");
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, []);

	return (
		<main style={{ padding: 16, fontFamily: "system-ui", lineHeight: 1.4 }}>
			<h1>EventPlanner</h1>

			<section style={{ marginTop: 12 }}>
				<h2 style={{ margin: "12px 0 6px" }}>API Health</h2>

				{!API_URL && <p>Config: VITE_API_URL no está definida.</p>}
				{loading && <p>Cargando…</p>}
				{error && (
					<p style={{ whiteSpace: "pre-wrap" }}>Error: {error}</p>
				)}

				{data && (
					<pre
						style={{
							padding: 12,
							border: "1px solid #ddd",
							borderRadius: 8,
						}}
					>
						{JSON.stringify(data, null, 2)}
					</pre>
				)}

				{API_URL && (
					<p style={{ marginTop: 8 }}>
						API base: <code>{API_URL}</code>
					</p>
				)}
			</section>
		</main>
	);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
