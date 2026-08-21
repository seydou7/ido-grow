import type { Catalog } from ".";

export const frCatalog = {
  "action.back": "Retour",
  "action.cancel": "Annuler",
  "action.continue": "Continuer",
  "action.save": "Enregistrer",
  "app.name": "I Do Grow",
  "app.platform": "Plateforme",
  "navigation.home": "Accueil",
  "state.empty": "Rien à afficher",
  "state.error": "Une erreur est survenue",
  "state.loading": "Chargement…",
} as const satisfies Catalog;
