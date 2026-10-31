import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {useLiveContent} from "./LiveContent";
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

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  const {snapshot}=useLiveContent();
  const overrides=useMemo(()=>(snapshot?.records||[]).filter(r=>r.entity==="TextOverride"),[snapshot]);

  const refreshContent = useCallback(async () => {}, []);

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