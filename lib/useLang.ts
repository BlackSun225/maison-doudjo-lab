"use client";
import { useCallback, useEffect, useState } from "react";
import type { Lang, T } from "./content";

/** FR/EN state, persisted per browser and mirrored on <html lang>. */
export function useLang() {
  const [lang, setLangState] = useState<Lang>("fr");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("doudjo-lang");
      if (saved === "fr" || saved === "en") setLangState(saved);
    } catch {}
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("doudjo-lang", l); } catch {}
  }, []);
  const t = useCallback((x: T) => x[lang], [lang]);
  return { lang, setLang, t };
}
