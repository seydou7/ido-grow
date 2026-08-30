import type { CreateListingInput, UpdateListingInput } from "./contracts";

export interface ListingRecord {
  id: string;
  organisationId: string;
  siteId: string | null;
  site?: { id: string; name: string } | null;
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
}

export abstract class ListingsRepository {
  abstract findListingsByOrganisationId(
    organisationId: string,
  ): Promise<ListingRecord[]>;

  abstract findListingById(
    organisationId: string,
    listingId: string,
  ): Promise<ListingRecord | null>;

  abstract createListing(
    organisationId: string,
    input: CreateListingInput,
  ): Promise<ListingRecord>;

  abstract updateListing(
    organisationId: string,
    listingId: string,
    input: UpdateListingInput,
  ): Promise<ListingRecord | null>;
}
