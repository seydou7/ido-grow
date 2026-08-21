import type { Catalog } from ".";

export const enCatalog = {
  "action.back": "Back",
  "action.cancel": "Cancel",
  "action.continue": "Continue",
  "action.save": "Save",
  "app.name": "I Do Grow",
  "app.platform": "Platform",
  "navigation.home": "Home",
  "state.empty": "Nothing to show",
  "state.error": "Something went wrong",
  "state.loading": "Loading…",
} as const satisfies Catalog;
