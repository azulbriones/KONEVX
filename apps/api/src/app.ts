import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";

import { errorMiddleware } from "./middlewares/error.js";
import { httpLogger } from "./middlewares/httpLogger.js";
import { requestId } from "./middlewares/requestId.js";
import { router } from "./routes/index.js";

export const app = express();

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";

if (process.env.TRUST_PROXY === "true") {
	app.set("trust proxy", 1);
}

app.use(
	helmet({
		contentSecurityPolicy: false,
		crossOriginResourcePolicy: { policy: "cross-origin" },
		crossOriginEmbedderPolicy: false,
	}),
);

app.use(requestId);
app.use(httpLogger);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	cors({
		origin: [WEB_ORIGIN],
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
		allowedHeaders: ["Content-Type", "X-CSRF-Token"],
		optionsSuccessStatus: 204,
	}),
);

const uploadsPath = path.resolve(process.cwd(), "public/uploads");

console.log("----------------------------------------");
console.log("📂 SERVIENDO ARCHIVOS DESDE:", uploadsPath);
console.log("----------------------------------------");

app.use("/api/uploads", express.static(uploadsPath));

app.use("/api", router);

app.use(errorMiddleware);
