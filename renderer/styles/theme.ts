import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#243354",
      light: "#8C94AC",
      dark: "#162036",
      contrastText: "#FFF",
    },
    secondary: {
      main: "#616161",
      contrastText: "#d1713d",
    },
    text: {
      primary: "#0f1419",
      secondary: "#000",
    },
    background: {
      default: "#edf0f2",
      paper: "#fff",
    },
    divider: "#A4A6B3",
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#243354",
      light: "#8C94AC",
      dark: "#162036",
      contrastText: "#FFF",
    },
    secondary: {
      main: "#616161",
      contrastText: "#d1713d",
    },
    text: {
      primary: "#FFF",
      secondary: "#edf0f2",
    },
    background: {
      default: "#162036",
      paper: "#243354",
    },
    divider: "#A4A6B3",
  },
});

export const drawerWidth = 240;

export const rightDrawerWidth = 300;
