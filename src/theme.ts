// src/theme.ts
import "@fontsource-variable/montserrat"; // <-- правильный импорт
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6C5CE7" },
    secondary: { main: "#FFD166" },
    success: { main: "#00C853" },
    background: { default: "#FBFBFD", paper: "#FFFFFF" },
    text: { primary: "#1C1B1F", secondary: "#5F6368" },
  },
  typography: {
    fontFamily: [
      '"Montserrat Variable"',
      "Montserrat",
      "system-ui",
      "-apple-system",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(", "),
    h1: { fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15 },
    h2: { fontWeight: 800, letterSpacing: "-0.4px", lineHeight: 1.2 },
    h3: { fontWeight: 700, letterSpacing: "-0.2px" },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 5 },
  components: {
    // Жёстко применяем шрифт ко всему body, если где-то переопределён fontFamily
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily:
            '"Montserrat Variable", Montserrat, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      },
    },
    MuiCard: { styleOverrides: { root: { borderRadius: 6 } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 6 } } },
  },
});
