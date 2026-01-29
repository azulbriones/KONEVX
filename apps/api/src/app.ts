import cors from "cors";
import express from "express";
import { errorMiddleware } from "./middlewares/error.js";
import { router } from "./routes/index.js";

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

app.use("/api", router);

app.use(errorMiddleware);
