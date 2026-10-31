import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { DICTIONARIES, mergeOverrides } from "@/lib/content-fields";

const STORAGE_KEY = "fn-lang";
const LangContext = createContext({
  lang: "en",
  setLang: () => {},
  c: DICTIONARIES.en,
  isRtl: false,
  overrides: [],
  refreshContent: async () => {},
});

// Every saved text override, all languages, paged through in one pass.
async function loadOverrides() {
  const rows = [];
  let cursor;
  for (let page = 0; page < 12; page += 1) {
    const result = await base44.entities.TextOverride.list({
      sort: "path",
      limit: 200,
      ...(cursor ? { cursor } : {}),
    });
    rows.push(...(result?.items ?? []));
    if (!result?.has_more) break;
    cursor = result.next_cursor;
  }
  return rows;
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  const [overrides, setOverrides] = useState([]);

  const refreshContent = useCallback(async () => {
    try {
      setOverrides(await loadOverrides());
    } catch {
      /* keep the built-in text if overrides cannot be read */
    }
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "ar") setLang("ar");
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang]);

  const value = useMemo(() => {
    const forLang = overrides.filter((row) => row.lang === lang);
    return {
      lang,
      setLang,
      isRtl: lang === "ar",
      overrides,
      refreshContent,
      c: mergeOverrides(lang === "ar" ? DICTIONARIES.ar : DICTIONARIES.en, forLang),
    };
  }, [lang, overrides, refreshContent]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}