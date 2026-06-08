import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "@/constants";

const THEME_STORAGE_KEY = "@budget_manager_theme";

export const ThemeContext = createContext(null);

/**
 * Provee el tema global (light/dark) a toda la aplicación.
 * Persiste la preferencia en AsyncStorage.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [isThemeReady, setIsThemeReady] = useState(false);

  // Carga la preferencia guardada al iniciar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "dark" || saved === "light") {
          setTheme(saved);
        }
      } catch (error) {
        console.warn("Error cargando tema:", error);
      } finally {
        setIsThemeReady(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (error) {
      console.warn("Error guardando tema:", error);
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      colors: COLORS[theme],
      isDark: theme === "dark",
      toggleTheme,
      isThemeReady,
    }),
    [theme, toggleTheme, isThemeReady],
  );

  if (!isThemeReady) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
