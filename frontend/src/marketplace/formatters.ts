import type { Locale } from "@/i18n/config";

/**
 * Human-readable formatters for natural fibre commodity enum values.
 * Strictly prevents internal enum identifiers (e.g. FIBRE_TECHNICAL, STRAW_RETTED)
 * from appearing in public-facing UI, with full EN / FR / NL localization support.
 */

const MATERIAL_MAP: Record<Locale, Record<string, string>> = {
  en: {
    HEMP: "Hemp",
    FLAX: "Flax",
    SISAL: "Sisal",
    JUTE: "Jute",
    COIR: "Coir",
    KENAF: "Kenaf",
    ABACA: "Abaca",
    WOOL: "Wool",
    NETTLE: "Nettle",
    RAMIE: "Ramie",
  },
  fr: {
    HEMP: "Chanvre",
    FLAX: "Lin",
    SISAL: "Sisal",
    JUTE: "Jute",
    COIR: "Fibre de coco",
    KENAF: "Kénaf",
    ABACA: "Abaca",
    WOOL: "Laine",
    NETTLE: "Ortie",
    RAMIE: "Ramie",
  },
  nl: {
    HEMP: "Hennep",
    FLAX: "Vlas",
    SISAL: "Sisal",
    JUTE: "Jute",
    COIR: "Kokosvezel",
    KENAF: "Kenaf",
    ABACA: "Abaca",
    WOOL: "Wol",
    NETTLE: "Brandnetel",
    RAMIE: "Ramie",
  },
};

const PRODUCT_FORM_MAP: Record<Locale, Record<string, string>> = {
  en: {
    STRAW_RETTED: "Retted Straw",
    STRAW_RAW: "Raw Straw",
    FIBRE_TECHNICAL: "Technical Fibre",
    TECHNICAL_FIBRE: "Technical Fibre",
    SCUTCHED_FLAX: "Scutched Flax",
    TOW: "Tow Fibre",
    SLIVER: "Combed Sliver",
    ROVING: "Roving",
    YARN: "Spun Yarn",
    HURDS: "Hemp Hurds (Shives)",
    SHIVES: "Hemp Hurds (Shives)",
    PELLETS: "Fibre Pellets",
    SHORT_FIBRE: "Short Cut Fibre",
  },
  fr: {
    STRAW_RETTED: "Paille rouie",
    STRAW_RAW: "Paille brute",
    FIBRE_TECHNICAL: "Fibre technique",
    TECHNICAL_FIBRE: "Fibre technique",
    SCUTCHED_FLAX: "Lin teillé",
    TOW: "Étoupe",
    SLIVER: "Ruban peigné",
    ROVING: "Mèche",
    YARN: "Filé",
    HURDS: "Chènevotte",
    SHIVES: "Chènevotte",
    PELLETS: "Granulés de fibre",
    SHORT_FIBRE: "Fibre courte coupée",
  },
  nl: {
    STRAW_RETTED: "Geroot stro",
    STRAW_RAW: "Ruw stro",
    FIBRE_TECHNICAL: "Technische vezel",
    TECHNICAL_FIBRE: "Technische vezel",
    SCUTCHED_FLAX: "Gezwingeld vlas",
    TOW: "Lokkenvezel (Tow)",
    SLIVER: "Gekamde lont",
    ROVING: "Voorgaren",
    YARN: "Gesponnen garen",
    HURDS: "Hennepscheven",
    SHIVES: "Hennepscheven",
    PELLETS: "Vezelpellets",
    SHORT_FIBRE: "Korte vezel",
  },
};

const COUNTRY_FLAG_MAP: Record<Locale, Record<string, string>> = {
  en: {
    FR: "🇫🇷 France",
    France: "🇫🇷 France",
    BE: "🇧🇪 Belgium",
    Belgium: "🇧🇪 Belgium",
    NL: "🇳🇱 Netherlands",
    Netherlands: "🇳🇱 Netherlands",
    ES: "🇪🇸 Spain",
    Spain: "🇪🇸 Spain",
    DE: "🇩🇪 Germany",
    Germany: "🇩🇪 Germany",
    IT: "🇮🇹 Italy",
    Italy: "🇮🇹 Italy",
    PL: "🇵🇱 Poland",
    Poland: "🇵🇱 Poland",
    KE: "🇰🇪 Kenya",
    Kenya: "🇰🇪 Kenya",
    LT: "🇱🇹 Lithuania",
    Lithuania: "🇱🇹 Lithuania",
  },
  fr: {
    FR: "🇫🇷 France",
    France: "🇫🇷 France",
    BE: "🇧🇪 Belgique",
    Belgium: "🇧🇪 Belgique",
    NL: "🇳🇱 Pays-Bas",
    Netherlands: "🇳🇱 Pays-Bas",
    ES: "🇪🇸 Espagne",
    Spain: "🇪🇸 Espagne",
    DE: "🇩🇪 Allemagne",
    Germany: "🇩🇪 Allemagne",
    IT: "🇮🇹 Italie",
    Italy: "🇮🇹 Italie",
    PL: "🇵🇱 Pologne",
    Poland: "🇵🇱 Pologne",
    KE: "🇰🇪 Kenya",
    Kenya: "🇰🇪 Kenya",
    LT: "🇱🇹 Lituanie",
    Lithuania: "🇱🇹 Lituanie",
  },
  nl: {
    FR: "🇫🇷 Frankrijk",
    France: "🇫🇷 Frankrijk",
    BE: "🇧🇪 België",
    Belgium: "🇧🇪 België",
    NL: "🇳🇱 Nederland",
    Netherlands: "🇳🇱 Nederland",
    ES: "🇪🇸 Spanje",
    Spain: "🇪🇸 Spanje",
    DE: "🇩🇪 Duitsland",
    Germany: "🇩🇪 Duitsland",
    IT: "🇮🇹 Italië",
    Italy: "🇮🇹 Italië",
    PL: "🇵🇱 Polen",
    Poland: "🇵🇱 Polen",
    KE: "🇰🇪 Kenia",
    Kenya: "🇰🇪 Kenia",
    LT: "🇱🇹 Litouwen",
    Lithuania: "🇱🇹 Litouwen",
  },
};

export function formatMaterialType(
  value: string | null | undefined,
  locale: Locale = "fr",
): string {
  if (!value) {
    return locale === "fr"
      ? "Fibre naturelle"
      : locale === "nl"
        ? "Natuurvezel"
        : "Natural Fibre";
  }
  const upper = value.trim().toUpperCase();
  return MATERIAL_MAP[locale]?.[upper] || MATERIAL_MAP.en[upper] || value;
}

export function formatProductForm(
  value: string | null | undefined,
  locale: Locale = "fr",
): string {
  if (!value) {
    return locale === "fr"
      ? "Matière brute"
      : locale === "nl"
        ? "Ruwe vorm"
        : "Raw Natural Form";
  }
  const upper = value.trim().toUpperCase();
  return (
    PRODUCT_FORM_MAP[locale]?.[upper] ||
    PRODUCT_FORM_MAP.en[upper] ||
    value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}

export function formatOriginCountry(
  value: string | null | undefined,
  locale: Locale = "fr",
): string {
  if (!value) {
    return locale === "fr"
      ? "Union européenne"
      : locale === "nl"
        ? "Europese Unie"
        : "European Union";
  }
  return COUNTRY_FLAG_MAP[locale]?.[value] || COUNTRY_FLAG_MAP.en[value] || value;
}

export function formatPriceUnit(
  unit: string | null | undefined,
  locale: Locale = "fr",
): string {
  if (!unit) return "/ tonne";
  const cleaned = unit.replace("PER_", "").toLowerCase();
  if (cleaned === "tonne" && locale === "nl") return "/ ton";
  return `/ ${cleaned}`;
}

const QUANTITY_UNIT_MAP: Record<Locale, Record<string, [string, string]>> = {
  en: {
    TONNE: ["tonne", "tonnes"],
    TONNES: ["tonne", "tonnes"],
    T: ["tonne", "tonnes"],
    KG: ["kg", "kg"],
    KILOGRAMS: ["kg", "kg"],
    BALE: ["bale", "bales"],
    BALES: ["bale", "bales"],
  },
  fr: {
    TONNE: ["tonne", "tonnes"],
    TONNES: ["tonne", "tonnes"],
    T: ["tonne", "tonnes"],
    KG: ["kg", "kg"],
    KILOGRAMS: ["kg", "kg"],
    BALE: ["balle", "balles"],
    BALES: ["balle", "balles"],
  },
  nl: {
    TONNE: ["ton", "ton"],
    TONNES: ["ton", "ton"],
    T: ["ton", "ton"],
    KG: ["kg", "kg"],
    KILOGRAMS: ["kg", "kg"],
    BALE: ["baal", "balen"],
    BALES: ["baal", "balen"],
  },
};

export function formatQuantity(
  quantity: number,
  unit: string | null | undefined,
  locale: Locale = "fr",
): string {
  const numLocale = locale === "fr" ? "fr-FR" : locale === "nl" ? "nl-NL" : "en-GB";
  const amount = quantity.toLocaleString(numLocale);
  if (!unit) return `${amount} ${locale === "nl" ? "ton" : "tonnes"}`;
  const forms =
    QUANTITY_UNIT_MAP[locale]?.[unit.trim().toUpperCase()] ||
    QUANTITY_UNIT_MAP.en[unit.trim().toUpperCase()];
  if (!forms) return `${amount} ${unit.replace(/_/g, " ").toLowerCase()}`;
  return `${amount} ${quantity === 1 ? forms[0] : forms[1]}`;
}

const CERTIFICATION_MAP: Record<Locale, Record<string, string>> = {
  en: {
    ORGANIC_CERTIFICATE: "Organic",
    ORGANIC: "Organic",
    OEKO_TEX: "OEKO-TEX",
    FSC: "FSC",
    GOTS: "GOTS",
    ISO_9001: "ISO 9001",
    ISO_14001: "ISO 14001",
    EUROPEAN_FLAX: "European Flax",
    MASTERS_OF_LINEN: "Masters of Linen",
    PHYTOSANITARY_CERTIFICATE: "Phytosanitary",
  },
  fr: {
    ORGANIC_CERTIFICATE: "Biologique",
    ORGANIC: "Biologique",
    OEKO_TEX: "OEKO-TEX",
    FSC: "FSC",
    GOTS: "GOTS",
    ISO_9001: "ISO 9001",
    ISO_14001: "ISO 14001",
    EUROPEAN_FLAX: "European Flax",
    MASTERS_OF_LINEN: "Masters of Linen",
    PHYTOSANITARY_CERTIFICATE: "Phytosanitaire",
  },
  nl: {
    ORGANIC_CERTIFICATE: "Biologisch",
    ORGANIC: "Biologisch",
    OEKO_TEX: "OEKO-TEX",
    FSC: "FSC",
    GOTS: "GOTS",
    ISO_9001: "ISO 9001",
    ISO_14001: "ISO 14001",
    EUROPEAN_FLAX: "European Flax",
    MASTERS_OF_LINEN: "Masters of Linen",
    PHYTOSANITARY_CERTIFICATE: "Fytosanitair",
  },
};

export function formatCertification(
  value: string | null | undefined,
  locale: Locale = "fr",
): string {
  if (!value) {
    return locale === "fr" ? "Certifié" : locale === "nl" ? "Gecertificeerd" : "Certified";
  }
  const upper = value.trim().toUpperCase();
  return (
    CERTIFICATION_MAP[locale]?.[upper] ||
    CERTIFICATION_MAP.en[upper] ||
    value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
