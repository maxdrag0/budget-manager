import { useContext } from "react";
import { ThemeContext } from "@/contexts/ThemeContext";

/**
 * Hook para acceder al tema actual.
 *
 * @returns {{ theme: 'light'|'dark', colors: object, isDark: boolean, toggleTheme: () => void }}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un <ThemeProvider>");
  }
  return context;
}
