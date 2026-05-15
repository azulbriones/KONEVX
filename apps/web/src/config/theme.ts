import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import { esES as coreEsES } from "@mui/material/locale";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { esES as dataGridEsES } from "@mui/x-data-grid/locales";
import { designTokens } from "./designTokens";

const baseTheme = createTheme(
  {
    palette: {
      mode: "light",
      primary: {
        main: designTokens.colors.primary,
        light: "#2DD4BF",
        dark: designTokens.colors.primaryHover,
        contrastText: designTokens.colors.bgPanel,
      },
      secondary: {
        main: designTokens.colors.accent,
        light: "#F59E0B",
        dark: "#B45309",
      },
      background: {
        default: designTokens.colors.bgMain,
        paper: designTokens.colors.bgPanel,
      },
      text: {
        primary: designTokens.colors.textMain,
        secondary: designTokens.colors.textMuted,
      },
      divider: designTokens.colors.borderSoft,
      success: { main: designTokens.colors.success },
      warning: { main: designTokens.colors.warning },
      error: { main: designTokens.colors.danger },
      info: { main: designTokens.colors.bgSidebarCard },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 500 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${designTokens.colors.borderSoft}`,
            boxShadow: "0 10px 30px rgba(23, 32, 51, 0.06)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderColor: designTokens.colors.borderSoft,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(14px)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
    },
  },
  coreEsES,
  dataGridEsES,
);

const theme = responsiveFontSizes(baseTheme);

export { theme };
