export interface MarketplaceQuery {
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
}

export interface MarketplaceSupplierSummary {
  id: string;
  name: string;
  country: string | null;
  verificationStatus: string;
}

export interface MarketplaceSiteSummary {
  name: string;
  facilityType: string | null;
  country: string | null;
  city: string | null;
}

export interface MarketplaceListingSummary {
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
}

export interface MarketplaceListingDetail extends MarketplaceListingSummary {
  site: MarketplaceSiteSummary | null;
}

export interface MarketplaceListingCollection {
  items: MarketplaceListingSummary[];
  total: number;
}
