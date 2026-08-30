export type MarketplaceQuery = Readonly<{
  search?: string;
  materialType?: string;
  productForm?: string;
  originCountry?: string;
  harvestYear?: number;
  minQuantity?: number;
  maxQuantity?: number;
  quantityUnit?: string;
  hasPrice?: boolean;
  minPrice?: number;
  maxPrice?: number;
  priceUnit?: string;
}>;

export type MarketplaceSupplierSummary = Readonly<{
  id: string;
  name: string;
  country: string | null;
  verificationStatus: string;
}>;

export type MarketplaceSiteSummary = Readonly<{
  name: string;
  facilityType: string | null;
  country: string | null;
  city: string | null;
}>;

export type MarketplaceListingSummary = Readonly<{
  id: string;
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
  createdAt: string;
  supplier: MarketplaceSupplierSummary;
}>;

export type MarketplaceListingDetail = MarketplaceListingSummary &
  Readonly<{
    site: MarketplaceSiteSummary | null;
  }>;

export type MarketplaceListingCollection = Readonly<{
  items: readonly MarketplaceListingSummary[];
  total: number;
}>;
