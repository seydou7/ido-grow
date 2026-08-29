export const SUPPORTED_LOCALES = ["en", "nl", "fr"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "ido_grow_locale";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function serializeLocalePreferenceCookie(locale: Locale): string {
  return `${LOCALE_COOKIE_NAME}=${locale}; Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}
