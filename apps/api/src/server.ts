import express from "express";

const app = express();

app.use(express.json());

// Healthcheck básico para saber que el contenedor está vivo
app.get("/health", (_req, res) => {
	res.json({ ok: true, service: "api" });
});

const PORT = Number(process.env.PORT ?? 3001);

// Importante: escuchar en 0.0.0.0 dentro de Docker
app.listen(PORT, "0.0.0.0", () => {
	console.log(`API listening on http://0.0.0.0:${PORT}`);
});
