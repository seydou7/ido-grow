export const APPROVED_MATERIAL_TYPES = [
  "HEMP",
  "SISAL",
  "COIR",
  "JUTE",
  "KENAF",
  "RAFFIA",
] as const;

export type MaterialType = (typeof APPROVED_MATERIAL_TYPES)[number];

export const APPROVED_PRODUCT_FORMS = [
  "STRAW_RAW",
  "STRAW_RETTED",
  "FIBRE_TECHNICAL",
  "FIBRE_SHORT",
  "HURD_SHIVES",
  "DUST_PELLETS",
] as const;

export type ProductForm = (typeof APPROVED_PRODUCT_FORMS)[number];

export const APPROVED_QUANTITY_UNITS = [
  "TONNES",
  "KILOGRAMS",
  "BALES",
] as const;

export type QuantityUnit = (typeof APPROVED_QUANTITY_UNITS)[number];

export const APPROVED_TARGET_PRICE_UNITS = [
  "PER_TONNE",
  "PER_KG",
] as const;

export type TargetPriceUnit = (typeof APPROVED_TARGET_PRICE_UNITS)[number];

export const APPROVED_BUY_ORDER_STATUSES = [
  "DRAFT",
  "OPEN",
  "CANCELLED",
] as const;

export type BuyOrderStatus = (typeof APPROVED_BUY_ORDER_STATUSES)[number];

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
