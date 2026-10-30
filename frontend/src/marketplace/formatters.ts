/**
 * Human-readable formatters for natural fibre commodity enum values.
 * Strictly prevents internal enum identifiers (e.g. FIBRE_TECHNICAL, STRAW_RETTED)
 * from appearing in public-facing UI.
 */

const MATERIAL_MAP: Record<string, string> = {
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
};

const PRODUCT_FORM_MAP: Record<string, string> = {
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
};

const COUNTRY_FLAG_MAP: Record<string, string> = {
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
};

export function formatMaterialType(value: string | null | undefined): string {
  if (!value) return "Natural Fibre";
  const upper = value.trim().toUpperCase();
  return MATERIAL_MAP[upper] || value;
}

export function formatProductForm(value: string | null | undefined): string {
  if (!value) return "Raw Natural Form";
  const upper = value.trim().toUpperCase();
  return PRODUCT_FORM_MAP[upper] || value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function formatOriginCountry(value: string | null | undefined): string {
  if (!value) return "European Union";
  return COUNTRY_FLAG_MAP[value] || value;
}

export function formatPriceUnit(unit: string | null | undefined): string {
  if (!unit) return "/ tonne";
  const cleaned = unit.replace("PER_", "").toLowerCase();
  return `/ ${cleaned}`;
}

const QUANTITY_UNIT_MAP: Record<string, [string, string]> = {
  TONNE: ["tonne", "tonnes"],
  TONNES: ["tonne", "tonnes"],
  T: ["tonne", "tonnes"],
  KG: ["kg", "kg"],
  KILOGRAMS: ["kg", "kg"],
  BALE: ["bale", "bales"],
  BALES: ["bale", "bales"],
};

export function formatQuantity(quantity: number, unit: string | null | undefined): string {
  const amount = quantity.toLocaleString("en-GB");
  if (!unit) return `${amount} tonnes`;
  const forms = QUANTITY_UNIT_MAP[unit.trim().toUpperCase()];
  if (!forms) return `${amount} ${unit.replace(/_/g, " ").toLowerCase()}`;
  return `${amount} ${quantity === 1 ? forms[0] : forms[1]}`;
}

const CERTIFICATION_MAP: Record<string, string> = {
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
};

export function formatCertification(value: string | null | undefined): string {
  if (!value) return "Certified";
  const upper = value.trim().toUpperCase();
  return (
    CERTIFICATION_MAP[upper] ||
    value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

