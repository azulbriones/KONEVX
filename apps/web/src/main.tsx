import React from "react";
import ReactDOM from "react-dom/client";

function App() {
	return (
		<main style={{ padding: 16, fontFamily: "system-ui" }}>
			<h1>EventPlanner</h1>
			<p>
				API Health:{" "}
				<a href="http://localhost:3001/health" target="_blank" rel="noreferrer">
					/health
				</a>
			</p>
		</main>
	);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);