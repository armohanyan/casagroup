"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/translations-en";
import { translations } from "@/lib/translations-index";
import type { ProjectStatus, ApartmentStatus } from "@/types";
import {
  DEFAULT_LANG,
  isLang,
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  LANG_STORAGE_KEY,
  SUPPORTED_LANGS,
  type Lang,
} from "@/lib/i18n-config";

export { DEFAULT_LANG, isLang, SUPPORTED_LANGS, type Lang };

export type { Translations };

export type StatusLabelKey = ProjectStatus | ApartmentStatus;

/** Localized label for project/apartment status badges and detail rows. */
export function getStatusLabel(t: Translations, status: StatusLabelKey): string {
  return t.status[status] ?? status;
}

function writeLangCookie(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=${LANG_COOKIE_MAX_AGE};SameSite=Lax`;
}

function hasLangCookie() {
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${LANG_COOKIE}=`));
}

// ─── Context ────────────────────────────────────────────────────────────────

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nCtx>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: translations.hy as Translations,
});

export function I18nProvider({
  children,
  initialLang = DEFAULT_LANG,
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (hasLangCookie()) return;

    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (isLang(stored)) {
        setLangState(stored);
        writeLangCookie(stored);
      }
    } catch {
      void 0;
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch {
      void 0;
    }
    writeLangCookie(l);
  };

  const t: Translations = translations[lang] as Translations;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}
export function useI18n() {
  return useContext(I18nContext);
}
