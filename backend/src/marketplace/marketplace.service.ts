import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { OrganisationsRepository } from "../organisations/organisations.repository";
import type {
  MarketplaceListingCollection,
  MarketplaceListingDetail,
  MarketplaceListingSummary,
  MarketplaceQuery,
} from "./contracts";
import {
  type MarketplaceListingRecord,
  MarketplaceRepository,
} from "./marketplace.repository";

export const ALLOWED_MARKETPLACE_ORGANISATION_TYPES = new Set([
  "BUYER",
  "TRADER",
]);

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly repository: MarketplaceRepository,
    private readonly organisationsRepository: OrganisationsRepository,
  ) {}

  async listListings(
    userId: string,
    query: MarketplaceQuery,
  ): Promise<MarketplaceListingCollection> {
    await this.assertMarketplaceAccess(userId);

    const result = await this.repository.findPublishedListings(query);

    return {
      items: result.items.map((record) => this.toSummary(record)),
      total: result.total,
    };
  }

  async getListing(
    userId: string,
    listingId: string,
  ): Promise<MarketplaceListingDetail> {
    await this.assertMarketplaceAccess(userId);

    const record = await this.repository.findPublishedListingById(listingId);
    if (!record) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/marketplace/listing-not-found",
        title: "Listing Not Found",
        status: 404,
        detail:
          "The requested marketplace listing was not found or is not published.",
      });
    }

    return this.toDetail(record);
  }

  async assertMarketplaceAccess(userId: string): Promise<void> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    const hasAccess = memberships.some((m) =>
      ALLOWED_MARKETPLACE_ORGANISATION_TYPES.has(
        m.organisation.organisationType.toUpperCase(),
      ),
    );

    if (!hasAccess) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/marketplace/access-denied",
        title: "Marketplace Access Denied",
        status: 403,
        detail: "Marketplace access is reserved for Buyers and Traders.",
      });
    }
  }

  private toSummary(
    record: MarketplaceListingRecord,
  ): MarketplaceListingSummary {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      materialType: record.materialType,
      productForm: record.productForm,
      quantity: record.quantity,
      quantityUnit: record.quantityUnit,
      priceAmount: record.priceAmount,
      currency: record.currency,
      priceUnit: record.priceUnit,
      originCountry: record.originCountry,
      harvestYear: record.harvestYear,
      createdAt: record.createdAt.toISOString(),
      supplier: {
        id: record.organisation.id,
        name: record.organisation.name,
        country: record.organisation.country,
        verificationStatus: record.organisation.verificationStatus,
      },
    };
  }

  private toDetail(record: MarketplaceListingRecord): MarketplaceListingDetail {
    return {
      ...this.toSummary(record),
      site: record.site
        ? {
            name: record.site.name,
            facilityType: record.site.facilityType,
            country: record.site.country,
            city: record.site.city,
          }
        : null,
    };
  }
}
