"use client";
import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

/** Reads the theme the boot script put on <html data-theme>, and keeps it in sync. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (t === "light" || t === "dark") setThemeState(t);
  }, []);
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("doudjo-theme", t); } catch {}
  }, []);
  return { theme, setTheme };
}
