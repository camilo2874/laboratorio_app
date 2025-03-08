import { createTheme } from "@mui/material/styles";
import "@fontsource/work-sans"; // Importa la tipografía Work Sans

const theme = createTheme({
  palette: {
    primary: {
      main: "#39A900", // Verde corporativo
    },
    secondary: {
      main: "#00324D", // Azul oscuro
    },
    background: {
      default: "#F5F5F5", // Fondo general
    },
    text: {
      primary: "#000000", // Negro
      secondary: "#555555", // Gris oscuro
    },
  },
  typography: {
    fontFamily: "'Work Sans', 'Calibri', sans-serif", // Tipografía institucional
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
      color: "#39A900", // Verde corporativo
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 600,
      color: "#00324D", // Azul oscuro
    },
    body1: {
      fontSize: "1rem",
      color: "#000000", // Negro
    },
  },
});

export default theme;
