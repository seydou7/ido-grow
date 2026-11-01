"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Locale } from "./config";
import { createTranslator, type Translate } from "./runtime";

type I18nContextValue = Readonly<{
  locale: Locale;
  t: Translate;
}>;

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  locale,
}: Readonly<{ children: ReactNode; locale: Locale }>) {
  const value = useMemo<I18nContextValue>(
    () => ({ locale, t: createTranslator(locale) }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);

  if (!value) {
    throw new Error("useI18n must be used within I18nProvider.");
  }

  return value;
}
