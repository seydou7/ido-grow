import type { Catalog } from ".";

export const nlCatalog = {
  "action.back": "Terug",
  "action.cancel": "Annuleren",
  "action.continue": "Doorgaan",
  "action.save": "Opslaan",
  "app.name": "I Do Grow",
  "app.platform": "Platform",
  "navigation.home": "Start",
  "state.empty": "Niets om weer te geven",
  "state.error": "Er is iets misgegaan",
  "state.loading": "Laden…",
} as const satisfies Catalog;
