export const APPROVED_MATERIAL_TYPES = [
  "HEMP",
  "SISAL",
  "COIR",
  "JUTE",
  "KENAF",
  "RAFFIA",
] as const;

export type MaterialType = (typeof APPROVED_MATERIAL_TYPES)[number];

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  HEMP: "Hemp (Cannabis sativa L.)",
  SISAL: "Sisal (Agave sisalana)",
  COIR: "Coir (Cocos nucifera)",
  JUTE: "Jute (Corchorus)",
  KENAF: "Kenaf (Hibiscus cannabinus)",
  RAFFIA: "Raffia (Raphia farinifera)",
};

export const APPROVED_PRODUCT_FORMS = [
  "STRAW_RAW",
  "STRAW_RETTED",
  "FIBRE_TECHNICAL",
  "FIBRE_SHORT",
  "HURD_SHIVES",
  "DUST_PELLETS",
] as const;

export type ProductForm = (typeof APPROVED_PRODUCT_FORMS)[number];

export const PRODUCT_FORM_LABELS: Record<ProductForm, string> = {
  STRAW_RAW: "Raw Straw (Field-dried)",
  STRAW_RETTED: "Retted Straw (Water/Dew-retted)",
  FIBRE_TECHNICAL: "Technical Long Fibre",
  FIBRE_SHORT: "Short / Non-woven Fibre",
  HURD_SHIVES: "Hurd / Shives (Wood core)",
  DUST_PELLETS: "Micro-fibres / Dust / Pellets",
};

export const APPROVED_QUANTITY_UNITS = [
  "TONNES",
  "KILOGRAMS",
  "BALES",
] as const;

export type QuantityUnit = (typeof APPROVED_QUANTITY_UNITS)[number];

export const QUANTITY_UNIT_LABELS: Record<QuantityUnit, string> = {
  TONNES: "Metric Tonnes (t)",
  KILOGRAMS: "Kilograms (kg)",
  BALES: "Rectangular Bales",
};

export const APPROVED_PRICE_UNITS = [
  "PER_TONNE",
  "PER_KG",
] as const;

export type PriceUnit = (typeof APPROVED_PRICE_UNITS)[number];

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  PER_TONNE: "€ / Tonne",
  PER_KG: "€ / kg",
};

export const APPROVED_LISTING_STATUSES = [
  "DRAFT",
  "PUBLISHED",
] as const;

export type ListingStatus = (typeof APPROVED_LISTING_STATUSES)[number];

export interface CreateListingInput {
  title: string;
  description?: string | null;
  materialType: MaterialType;
  productForm?: ProductForm | null;
  quantity: number;
  quantityUnit?: QuantityUnit;
  priceAmount?: number | null;
  currency?: string;
  priceUnit?: PriceUnit;
  originCountry?: string | null;
  harvestYear?: number | null;
  siteId?: string | null;
  status?: ListingStatus;
}

export interface UpdateListingInput {
  title?: string;
  description?: string | null;
  materialType?: MaterialType;
  productForm?: ProductForm | null;
  quantity?: number;
  quantityUnit?: QuantityUnit;
  priceAmount?: number | null;
  currency?: string;
  priceUnit?: PriceUnit;
  originCountry?: string | null;
  harvestYear?: number | null;
  siteId?: string | null;
  status?: ListingStatus;
}

export interface ListingSummary {
  id: string;
  organisationId: string;
  siteId: string | null;
  siteName?: string | null;
  title: string;
  description: string | null;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  priceAmount: number | null;
  currency: string;
  priceUnit: string;
  originCountry: string | null;
  harvestYear: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingCollection {
  items: ListingSummary[];
}
