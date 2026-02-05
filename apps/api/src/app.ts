import cookieParser from "cookie-parser";
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
		credentials: true,
	}),
);

app.use(cookieParser());
app.use(express.json());

app.use("/api", router);

app.use(errorMiddleware);
