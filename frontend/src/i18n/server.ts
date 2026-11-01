import { cookies } from "next/headers";

import { LOCALE_COOKIE_NAME, resolveLocale, type Locale } from "./config";

export async function resolveRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}
