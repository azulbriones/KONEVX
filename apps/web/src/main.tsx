import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryProvider>
			<ThemeProvider>
				<App />
			</ThemeProvider>
		</QueryProvider>
	</StrictMode>,
);
