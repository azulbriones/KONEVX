import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ ok: true, service: "api" });
});

const PORT = Number(process.env.PORT ?? 3001);

app.listen(PORT, "0.0.0.0", () => {
	console.log(`API listening on http://0.0.0.0:${PORT}`);
});
