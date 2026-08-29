import { catalogs, type Catalog, type CatalogKey } from "./catalogs";
import { DEFAULT_LOCALE, type Locale } from "./config";

export type Translate = (key: CatalogKey) => string;

export function getCatalog(locale: Locale): Catalog {
  return catalogs[locale];
}

export function translate(locale: Locale, key: CatalogKey): string {
  return getCatalog(locale)[key] || catalogs[DEFAULT_LOCALE][key];
}

export function createTranslator(locale: Locale): Translate {
  return (key) => translate(locale, key);
}
