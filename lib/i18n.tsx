import { createContext, useContext, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/translations-en";
import { translations } from "@/lib/translations-index";
import type { ProjectStatus, ApartmentStatus } from "@/types";

export const SUPPORTED_LANGS = ["hy", "ru", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export type { Translations };

export type StatusLabelKey = ProjectStatus | ApartmentStatus;

/** Localized label for project/apartment status badges and detail rows. */
export function getStatusLabel(t: Translations, status: StatusLabelKey): string {
  return t.status[status] ?? status;
}

export function isLang(value: string | null | undefined): value is Lang {
  return value === "hy" || value === "ru" || value === "en";
}

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
    if (typeof window === "undefined") return "hy";
    try {
      const stored = localStorage.getItem("lang");
      if (isLang(stored)) return stored;
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
