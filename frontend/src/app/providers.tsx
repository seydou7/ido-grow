"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import type { Locale } from "@/i18n/config";
import { I18nProvider } from "@/i18n/i18n-provider";

export function Providers({
  children,
  locale,
}: Readonly<{ children: ReactNode; locale: Locale }>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </QueryClientProvider>
  );
}
