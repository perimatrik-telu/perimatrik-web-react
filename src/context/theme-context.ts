import { createContext, useContext } from "react";

export type ThemePreference = "system" | "light" | "dark";

export interface ThemeContextType {
  toggleTheme: () => void;
  mode: "light" | "dark";
  themePreference: ThemePreference;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};
