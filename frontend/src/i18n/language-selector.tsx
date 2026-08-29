"use client";

import { useRouter } from "next/navigation";

import {
  isLocale,
  serializeLocalePreferenceCookie,
  SUPPORTED_LOCALES,
  type Locale,
} from "./config";
import { useI18n } from "./i18n-provider";

const LANGUAGE_LABELS: Readonly<Record<Locale, string>> = {
  en: "English",
  nl: "Nederlands",
  fr: "Français",
};

export function LanguageSelector() {
  const { locale, t } = useI18n();
  const router = useRouter();

  function selectLocale(value: string) {
    if (!isLocale(value) || value === locale) {
      return;
    }

    document.cookie = serializeLocalePreferenceCookie(value);
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-[#53625d]">
      <span>{t("language.label")}</span>
      <select
        aria-label={t("language.label")}
        className="h-9 rounded-lg border border-[#d4cdbc] bg-white px-2.5 text-sm font-medium text-[#284f41] outline-none transition focus:border-[#356a57] focus-visible:ring-2 focus-visible:ring-[#356a57]/25"
        defaultValue={locale}
        key={locale}
        onChange={(event) => selectLocale(event.target.value)}
      >
        {SUPPORTED_LOCALES.map((supportedLocale) => (
          <option key={supportedLocale} value={supportedLocale}>
            {LANGUAGE_LABELS[supportedLocale]}
          </option>
        ))}
      </select>
    </label>
  );
}
