import type { Metadata } from "next";
import type { ReactNode } from "react";

import { resolveRequestLocale } from "@/i18n/server";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "I Do Grow",
  description: "I Do Grow platform foundation",
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await resolveRequestLocale();

  return (
    <html lang={locale}>
      <body>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
