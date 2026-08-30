import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { OrganisationsRepository } from "../organisations/organisations.repository";
import type { MarketplaceQuery } from "./contracts";
import {
  type MarketplaceListingRecord,
  MarketplaceRepository,
} from "./marketplace.repository";
import { MarketplaceService } from "./marketplace.service";

class MockMarketplaceRepository extends MarketplaceRepository {
  findPublishedListings = jest.fn();
  findPublishedListingById = jest.fn();
}

class MockOrganisationsRepository extends OrganisationsRepository {
  findMembershipsForUser = jest.fn();
  findMembership = jest.fn();
  findOrganisationById = jest.fn();
  createOrganisation = jest.fn();
  updateOrganisationProfile = jest.fn();
  findSitesByOrganisationId = jest.fn();
  createSite = jest.fn();
  updateSite = jest.fn();
  findSiteById = jest.fn();
  createComplianceDocument = jest.fn();
  findComplianceDocumentsByOrganisationId = jest.fn();
  findComplianceDocumentById = jest.fn();
  findMembersByOrganisationId = jest.fn();
}

describe("MarketplaceService", () => {
  let service: MarketplaceService;
  let repo: MockMarketplaceRepository;
  let orgRepo: MockOrganisationsRepository;

  const buyerUserId = "user-buyer-1";
  const traderUserId = "user-trader-1";
  const supplierUserId = "user-supplier-1";
  const unassociatedUserId = "user-none-1";

  const samplePublishedListingRecord: MarketplaceListingRecord = {
    id: "listing-1",
    organisationId: "org-supplier-1",
    siteId: "site-1",
    title: "Premium French Retted Hemp Straw",
    description: "High-grade dew-retted hemp straw in large rectangular bales.",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 120,
    quantityUnit: "TONNES",
    priceAmount: 340,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "FR",
    harvestYear: 2026,
    status: "PUBLISHED",
    createdAt: new Date("2026-08-30T10:00:00Z"),
    updatedAt: new Date("2026-08-30T10:00:00Z"),
    organisation: {
      id: "org-supplier-1",
      name: "Normandy Hemp Coop",
      country: "France",
      verificationStatus: "VERIFIED",
    },
    site: {
      name: "Facility Nord",
      facilityType: "PROCESSING_PLANT",
      country: "France",
      city: "Caen",
    },
  };

  beforeEach(() => {
    repo = new MockMarketplaceRepository();
    orgRepo = new MockOrganisationsRepository();
    service = new MarketplaceService(repo, orgRepo);

    orgRepo.findMembershipsForUser.mockImplementation(async (userId: string) => {
      if (userId === buyerUserId) {
        return [
          {
            id: "mem-buyer-1",
            userId: buyerUserId,
            organisationId: "org-buyer-1",
            createdAt: new Date(),
            updatedAt: new Date(),
            organisation: {
              id: "org-buyer-1",
              name: "Eco Textile Mill BV",
              legalName: "Eco Textile Mill BV",
              organisationType: "BUYER",
              businessType: "PROCESSOR",
              registrationNumber: "NL12345678",
              vatNumber: "NL123456789B01",
              address: "Fabrieksweg 1",
              city: "Enschede",
              postalCode: "7500AA",
              country: "Netherlands",
              contactName: "Jan de Vries",
              contactEmail: "jan@ecotextile.nl",
              contactPhone: "+31612345678",
              verificationStatus: "VERIFIED",
              completenessPercent: 100,
              missingFields: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              sites: [],
              complianceDocuments: [],
            },
          },
        ];
      }

      if (userId === traderUserId) {
        return [
          {
            id: "mem-trader-1",
            userId: traderUserId,
            organisationId: "org-trader-1",
            createdAt: new Date(),
            updatedAt: new Date(),
            organisation: {
              id: "org-trader-1",
              name: "I Do Grow Trading Desk",
              legalName: "I Do Grow B.V.",
              organisationType: "TRADER",
              businessType: "TRADER",
              registrationNumber: "NL87654321",
              vatNumber: "NL876543210B01",
              address: "Keizersgracht 100",
              city: "Amsterdam",
              postalCode: "1015AA",
              country: "Netherlands",
              contactName: "Trading Desk",
              contactEmail: "trader@idogrow.com",
              contactPhone: "+31201234567",
              verificationStatus: "VERIFIED",
              completenessPercent: 100,
              missingFields: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              sites: [],
              complianceDocuments: [],
            },
          },
        ];
      }

      if (userId === supplierUserId) {
        return [
          {
            id: "mem-supplier-1",
            userId: supplierUserId,
            organisationId: "org-supplier-1",
            createdAt: new Date(),
            updatedAt: new Date(),
            organisation: {
              id: "org-supplier-1",
              name: "Normandy Hemp Coop",
              legalName: "Normandy Hemp Coop SAS",
              organisationType: "SUPPLIER",
              businessType: "FARM_COOPERATIVE",
              registrationNumber: "FR987654321",
              vatNumber: "FR98765432100",
              address: "Route de Falaise",
              city: "Caen",
              postalCode: "14000",
              country: "France",
              contactName: "Pierre Dubois",
              contactEmail: "pierre@normandyhemp.fr",
              contactPhone: "+33612345678",
              verificationStatus: "VERIFIED",
              completenessPercent: 100,
              missingFields: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              sites: [],
              complianceDocuments: [],
            },
          },
        ];
      }

      return [];
    });
  });

  describe("Authorization Boundary", () => {
    it("allows access to Buyer organisation members", async () => {
      repo.findPublishedListings.mockResolvedValue({ items: [], total: 0 });

      const result = await service.listListings(buyerUserId, {});
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("allows access to Trader organisation members", async () => {
      repo.findPublishedListings.mockResolvedValue({ items: [], total: 0 });

      const result = await service.listListings(traderUserId, {});
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("denies access with 403 Forbidden to Supplier organisation members", async () => {
      await expect(service.listListings(supplierUserId, {})).rejects.toThrow(
        ForbiddenException,
      );
      expect(repo.findPublishedListings).not.toHaveBeenCalled();
    });

    it("denies access with 403 Forbidden to users without memberships", async () => {
      await expect(service.listListings(unassociatedUserId, {})).rejects.toThrow(
        ForbiddenException,
      );
      expect(repo.findPublishedListings).not.toHaveBeenCalled();
    });
  });

  describe("Marketplace Listing Queries & Visibility", () => {
    it("returns published listings with safe intermediated supplier information", async () => {
      repo.findPublishedListings.mockResolvedValue({
        items: [samplePublishedListingRecord],
        total: 1,
      });

      const result = await service.listListings(buyerUserId, {});

      expect(result.total).toBe(1);
      expect(result.items[0]).toEqual({
        id: "listing-1",
        title: "Premium French Retted Hemp Straw",
        description:
          "High-grade dew-retted hemp straw in large rectangular bales.",
        materialType: "HEMP",
        productForm: "STRAW_RETTED",
        quantity: 120,
        quantityUnit: "TONNES",
        priceAmount: 340,
        currency: "EUR",
        priceUnit: "PER_TONNE",
        originCountry: "FR",
        harvestYear: 2026,
        createdAt: "2026-08-30T10:00:00.000Z",
        supplier: {
          id: "org-supplier-1",
          name: "Normandy Hemp Coop",
          country: "France",
          verificationStatus: "VERIFIED",
        },
      });

      // Assert private fields are NOT present
      const supplierRecord = result.items[0].supplier as Record<string, unknown>;
      expect(supplierRecord.contactEmail).toBeUndefined();
      expect(supplierRecord.contactPhone).toBeUndefined();
      expect(supplierRecord.vatNumber).toBeUndefined();
      expect(supplierRecord.registrationNumber).toBeUndefined();
    });

    it("passes search and filter parameters through to repository", async () => {
      repo.findPublishedListings.mockResolvedValue({ items: [], total: 0 });

      const query: MarketplaceQuery = {
        search: "hemp",
        materialType: "HEMP",
        productForm: "STRAW_RETTED",
        originCountry: "FR",
        harvestYear: 2026,
        minQuantity: 50,
        maxQuantity: 200,
        quantityUnit: "TONNES",
        hasPrice: true,
        minPrice: 300,
        maxPrice: 400,
        priceUnit: "PER_TONNE",
      };

      await service.listListings(buyerUserId, query);

      expect(repo.findPublishedListings).toHaveBeenCalledWith(query);
    });

    it("returns single published listing detail with safe site information", async () => {
      repo.findPublishedListingById.mockResolvedValue(
        samplePublishedListingRecord,
      );

      const detail = await service.getListing(buyerUserId, "listing-1");

      expect(detail.id).toBe("listing-1");
      expect(detail.site).toEqual({
        name: "Facility Nord",
        facilityType: "PROCESSING_PLANT",
        country: "France",
        city: "Caen",
      });
      expect(detail.supplier).toEqual({
        id: "org-supplier-1",
        name: "Normandy Hemp Coop",
        country: "France",
        verificationStatus: "VERIFIED",
      });
    });

    it("throws 404 NotFoundException if listing does not exist or is DRAFT", async () => {
      repo.findPublishedListingById.mockResolvedValue(null);

      await expect(
        service.getListing(buyerUserId, "non-existent-or-draft"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
