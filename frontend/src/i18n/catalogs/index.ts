import type { Locale } from "../config";

import { enCatalog } from "./en";
import { frCatalog } from "./fr";
import { nlCatalog } from "./nl";

export const CATALOG_KEYS = [
  "action.back",
  "action.cancel",
  "action.continue",
  "action.save",
  "app.name",
  "app.platform",
  "navigation.home",
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
