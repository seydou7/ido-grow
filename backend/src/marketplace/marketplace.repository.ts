import type { MarketplaceQuery } from "./contracts";

export type MarketplaceListingRecord = Readonly<{
  id: string;
  organisationId: string;
  siteId: string | null;
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
  createdAt: Date;
  updatedAt: Date;
  organisation: Readonly<{
    id: string;
    name: string;
    country: string | null;
    verificationStatus: string;
  }>;
  site: Readonly<{
    name: string;
    facilityType: string | null;
    country: string | null;
    city: string | null;
  }> | null;
}>;

export abstract class MarketplaceRepository {
  abstract findPublishedListings(
    query: MarketplaceQuery,
  ): Promise<{ items: MarketplaceListingRecord[]; total: number }>;

  abstract findPublishedListingById(
    listingId: string,
  ): Promise<MarketplaceListingRecord | null>;
}
