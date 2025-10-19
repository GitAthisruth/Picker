import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#4e54c8" },
    secondary: { main: "#8f94fb" },
    background: { default: "#f5f7fa" },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

export default theme;
