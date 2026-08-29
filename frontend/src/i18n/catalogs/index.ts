import type { Locale } from "../config";

import { enCatalog } from "./en";
import { frCatalog } from "./fr";
import { nlCatalog } from "./nl";

export const CATALOG_KEYS = [
  "action.back",
  "action.cancel",
  "action.continue",
  "action.save",
  "auth.authenticated",
  "auth.checkingSession",
  "auth.email",
  "auth.emailInvalid",
  "auth.emailPlaceholder",
  "auth.emailRequired",
  "auth.errorGeneric",
  "auth.loginDescription",
  "auth.loginHeading",
  "auth.logout",
  "auth.logoutPending",
  "auth.password",
  "auth.passwordRequired",
  "auth.sectionLabel",
  "auth.sessionActive",
  "auth.signIn",
  "auth.signInPending",
  "auth.signedInAs",
  "auth.welcomeBack",
  "app.name",
  "app.platform",
  "language.label",
  "navigation.home",
  "presentation.eyebrow",
  "presentation.intro",
  "state.empty",
  "state.error",
  "state.loading",
] as const;

export type CatalogKey = (typeof CATALOG_KEYS)[number];
export type Catalog = Readonly<Record<CatalogKey, string>>;

export const catalogs = {
  en: enCatalog,
  nl: nlCatalog,
  fr: frCatalog,
} as const satisfies Readonly<Record<Locale, Catalog>>;
