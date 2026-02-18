import { theme } from "@/config/theme";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import type { PropsWithChildren } from "react";

export function ThemeProvider({ children }: PropsWithChildren) {
	return (
		<MuiThemeProvider theme={theme}>
			<CssBaseline />
			<div>{children}</div>
		</MuiThemeProvider>
	);
}
