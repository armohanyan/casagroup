import { createContext, useContext, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/translations-en";
import { translations } from "@/lib/translations-index";

export type Lang = "en" | "hy";

export type { Translations };

// ─── Context ────────────────────────────────────────────────────────────────

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nCtx>({
  lang: "hy",
  setLang: () => {},
  t: translations.hy as Translations,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem("lang");
      if (stored === "en" || stored === "hy") return stored;
    } catch {
      void 0;
    }
    return "hy";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {
      void 0;
    }
  };

  const t: Translations = translations[lang] as Translations;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
