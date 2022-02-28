import { useMediaQuery } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import React from "react";

import { darkTheme, lightTheme } from "../styles/theme";

type ThemeState = {
  themeType: string;
  setThemeType: (theme: string) => void;
};
type ThemeProviderProps = { children: React.ReactNode };

const ThemeContext = React.createContext<ThemeState | undefined>(undefined);

function ThemeContextProvider({ children }: ThemeProviderProps): JSX.Element {
  // get system preferred color scheme
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [themeType, setThemeType] = React.useState<string>(
    prefersDarkMode ? "dark" : "light"
  );

  const theme = themeType === "dark" ? darkTheme : lightTheme;

  const value = { themeType, setThemeType };
  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}

function useThemeContext(): ThemeState {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a CountProvider");
  }
  return context;
}

export { ThemeContextProvider, useThemeContext };
