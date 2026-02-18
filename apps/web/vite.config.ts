import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { OPTIMIZE_DEPS } from "./src/config/optimize-deps";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: "0.0.0.0",
		port: 5173,
		open: false,
		allow: [".."],
	},
	preview: {
		host: "0.0.0.0",
		port: 5173,
	},
	build: {
		target: "esnext",
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	optimizeDeps: {
		include: OPTIMIZE_DEPS,
	},
});
