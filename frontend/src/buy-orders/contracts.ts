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
  HEMP: "Industrial Hemp",
  SISAL: "Sisal",
  COIR: "Coir / Coconut Fibre",
  JUTE: "Jute",
  KENAF: "Kenaf",
  RAFFIA: "Raffia",
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
  STRAW_RAW: "Raw Straw / Stems",
  STRAW_RETTED: "Retted Straw / Stems",
  FIBRE_TECHNICAL: "Technical / Long Fibre",
  FIBRE_SHORT: "Short / Tow Fibre",
  HURD_SHIVES: "Hurd / Shives",
  DUST_PELLETS: "Pellets / Dust",
};

export const APPROVED_QUANTITY_UNITS = [
  "TONNES",
  "KILOGRAMS",
  "BALES",
] as const;

export type QuantityUnit = (typeof APPROVED_QUANTITY_UNITS)[number];

export const QUANTITY_UNIT_LABELS: Record<QuantityUnit, string> = {
  TONNES: "Metric Tonnes",
  KILOGRAMS: "Kilograms (kg)",
  BALES: "Standard Bales",
};

export const APPROVED_TARGET_PRICE_UNITS = [
  "PER_TONNE",
  "PER_KG",
] as const;

export type TargetPriceUnit = (typeof APPROVED_TARGET_PRICE_UNITS)[number];

export const TARGET_PRICE_UNIT_LABELS: Record<TargetPriceUnit, string> = {
  PER_TONNE: "€ / Tonne",
  PER_KG: "€ / kg",
};

export const APPROVED_BUY_ORDER_STATUSES = [
  "DRAFT",
  "OPEN",
  "CANCELLED",
] as const;

export type BuyOrderStatus = (typeof APPROVED_BUY_ORDER_STATUSES)[number];

export const BUY_ORDER_STATUS_LABELS: Record<BuyOrderStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Submitted (Open)",
  CANCELLED: "Cancelled",
};

export const BUY_ORDER_STATUS_COLORS: Record<
  BuyOrderStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  DRAFT: {
    bg: "bg-[#fef9ee]",
    text: "text-[#875908]",
    border: "border-[#fae3b4]",
    dot: "bg-[#e5b84b]",
  },
  OPEN: {
    bg: "bg-[#eaf5f0]",
    text: "text-[#1b6b47]",
    border: "border-[#bde5d2]",
    dot: "bg-[#287d55]",
  },
  CANCELLED: {
    bg: "bg-[#f5f5f5]",
    text: "text-[#666666]",
    border: "border-[#e0e0e0]",
    dot: "bg-[#999999]",
  },
};

export interface CreateBuyOrderInput {
  materialType: MaterialType;
  productForm?: ProductForm | null;
  quantity: number;
  quantityUnit?: QuantityUnit;
  deliveryCountry?: string | null;
  deliveryDestination?: string | null;
  requestedDeliveryDate?: string | null;
  targetPriceAmount?: number | null;
  currency?: string;
  targetPriceUnit?: TargetPriceUnit;
  acceptableOriginCountries?: string | null;
  qualityRequirements?: string | null;
  packagingRequirements?: string | null;
  certificationRequirements?: string | null;
  transportPreferences?: string | null;
  paymentTerms?: string | null;
  submitDirectly?: boolean;
}

export interface UpdateBuyOrderInput {
  materialType?: MaterialType;
  productForm?: ProductForm | null;
  quantity?: number;
  quantityUnit?: QuantityUnit;
  deliveryCountry?: string | null;
  deliveryDestination?: string | null;
  requestedDeliveryDate?: string | null;
  targetPriceAmount?: number | null;
  currency?: string;
  targetPriceUnit?: TargetPriceUnit;
  acceptableOriginCountries?: string | null;
  qualityRequirements?: string | null;
  packagingRequirements?: string | null;
  certificationRequirements?: string | null;
  transportPreferences?: string | null;
  paymentTerms?: string | null;
}

export interface BuyOrderSummary {
  id: string;
  buyerOrganisationId: string;
  buyerOrganisationName?: string;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  deliveryCountry: string | null;
  deliveryDestination: string | null;
  requestedDeliveryDate: string | null;
  targetPriceAmount: number | null;
  currency: string;
  targetPriceUnit: string;
  status: BuyOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BuyOrderDetail extends BuyOrderSummary {
  acceptableOriginCountries: string | null;
  qualityRequirements: string | null;
  packagingRequirements: string | null;
  certificationRequirements: string | null;
  transportPreferences: string | null;
  paymentTerms: string | null;
  createdByUserId: string | null;
}

export interface BuyOrderCollection {
  items: BuyOrderSummary[];
  total: number;
}

export interface TraderDemandSummary extends BuyOrderDetail {
  buyerOrganisation: {
    id: string;
    name: string;
    country: string | null;
    verificationStatus: string;
  };
}

export interface TraderDemandCollection {
  items: TraderDemandSummary[];
  total: number;
}

export interface BuyOrderQuery {
  status?: BuyOrderStatus;
  materialType?: string;
  deliveryCountry?: string;
  limit?: number;
  offset?: number;
}
