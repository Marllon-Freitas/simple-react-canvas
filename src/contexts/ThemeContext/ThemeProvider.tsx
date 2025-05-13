import { ReactNode } from "react";
import { useThemeMode } from "../../hooks/useThemeMode";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { isDarkMode, toggleTheme } = useThemeMode();

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
