import express from "express";
import cors from "cors";

const app = express();

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";

app.use(
	cors({
		origin: [WEB_ORIGIN],
		methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		credentials: false
	})
);

app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ ok: true, service: "api" });
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, "0.0.0.0", () => {
	console.log(`API listening on http://0.0.0.0:${PORT}`);
});