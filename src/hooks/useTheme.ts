import { useState, useEffect } from "react";
import { THEMES, type Theme } from "../themes";

export function useTheme() {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem("cheatsheet-theme") || "hacker";
  });

  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  useEffect(() => {
    const root = document.documentElement;

    // dark/light class (for scanlines + body::before)
    root.classList.remove("dark", "light");
    root.classList.add(theme.isDark ? "dark" : "light");

    // apply all css variables
    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(`--color-${key}`, value);
    }

    localStorage.setItem("cheatsheet-theme", theme.id);
  }, [theme]);

  return { theme, themes: THEMES, setTheme: setThemeId };
}

export type { Theme };
