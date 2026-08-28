export const SUPPORTED_LANGS = ["hy", "ru", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: Lang = "hy";
export const LANG_STORAGE_KEY = "lang";
export const LANG_COOKIE = "lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLang(value: string | null | undefined): value is Lang {
  return value === "hy" || value === "ru" || value === "en";
}

export function resolveLang(value: string | null | undefined): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}
