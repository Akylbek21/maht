import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6C5CE7' },     // violet
    secondary: { main: '#FFD166' },   // warm yellow
    success: { main: '#00C853' },
    background: { default: '#FBFBFD', paper: '#FFFFFF' },
    text: { primary: '#1C1B1F', secondary: '#5F6368' }
  },
  typography: {
    fontFamily: 'DM Sans Variable, Barlow, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: -0.5 },
    h2: { fontWeight: 800, letterSpacing: -0.4 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 20 } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12 } } }
  }
})
