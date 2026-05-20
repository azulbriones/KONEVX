import { theme } from "@/config/theme";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import type { PropsWithChildren } from "react";

export const ThemeProvider = ({ children }: PropsWithChildren) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </MuiThemeProvider>
);
