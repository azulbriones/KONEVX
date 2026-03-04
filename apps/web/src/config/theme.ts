import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#ea580c",
		},
		background: {
			default: "#0f172a",
			paper: "#1e293b",
		},
	},
	typography: {
		fontFamily: "'Inter', sans-serif",
		h1: { fontWeight: 700 },
		h2: { fontWeight: 600 },
		button: { textTransform: "none", fontWeight: 500 },
	},
	shape: {
		borderRadius: 10,
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					boxShadow: "none",
					"&:hover": { boxShadow: "none" },
				},
			},
		},
	},
});

theme = responsiveFontSizes(theme);

export { theme };
