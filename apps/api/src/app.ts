import cors from "cors";
import express from "express";

export const app = express();

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";

app.use(
	cors({
		origin: [WEB_ORIGIN],
		methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		credentials: false,
	}),
);

app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ ok: true, service: "api" });
});
