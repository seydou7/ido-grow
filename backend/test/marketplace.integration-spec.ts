import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { PrismaService } from "../src/database";
import { MarketplaceService } from "../src/marketplace/marketplace.service";
import { PrismaMarketplaceRepository } from "../src/marketplace/prisma-marketplace.repository";
import { PrismaOrganisationsRepository } from "../src/organisations/prisma-organisations.repository";

describe("Marketplace persistence & service (integration)", () => {
  const prisma = new PrismaClient();
  const marketplaceRepo = new PrismaMarketplaceRepository(
    prisma as PrismaService,
  );
  const organisationsRepo = new PrismaOrganisationsRepository(
    prisma as PrismaService,
  );
  const service = new MarketplaceService(marketplaceRepo, organisationsRepo);

  const supplierUserId = randomUUID();
  const buyerUserId = randomUUID();
  const traderUserId = randomUUID();

  const supplierOrgId = randomUUID();
  const buyerOrgId = randomUUID();
  const traderOrgId = randomUUID();
  const supplierSiteId = randomUUID();

  let publishedListingId: string;
  let draftListingId: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Create users
    await prisma.user.createMany({
      data: [
        {
          id: supplierUserId,
          email: `supplier-${supplierUserId}@example.test`,
          passwordHash: "integration-test-hash",
        },
        {
          id: buyerUserId,
          email: `buyer-${buyerUserId}@example.test`,
          passwordHash: "integration-test-hash",
        },
        {
          id: traderUserId,
          email: `trader-${traderUserId}@example.test`,
          passwordHash: "integration-test-hash",
        },
      ],
    });

    // Create organisations
    await prisma.organisation.createMany({
      data: [
        {
          id: supplierOrgId,
          name: "Normandy Hemp Farm",
          legalName: "Normandy Hemp Farm SAS",
          organisationType: "SUPPLIER",
          country: "France",
          contactEmail: "pierre@private-supplier.com",
          contactPhone: "+33600000000",
          vatNumber: "FR12345678901",
          verificationStatus: "VERIFIED",
        },
        {
          id: buyerOrgId,
          name: "Dutch Textile Mill",
          legalName: "Dutch Textile Mill BV",
          organisationType: "BUYER",
          country: "Netherlands",
          verificationStatus: "VERIFIED",
        },
        {
          id: traderOrgId,
          name: "I Do Grow Desk",
          legalName: "I Do Grow Desk BV",
          organisationType: "TRADER",
          country: "Netherlands",
          verificationStatus: "VERIFIED",
        },
      ],
    });

    // Create memberships
    await prisma.membership.createMany({
      data: [
        { userId: supplierUserId, organisationId: supplierOrgId },
        { userId: buyerUserId, organisationId: buyerOrgId },
        { userId: traderUserId, organisationId: traderOrgId },
      ],
    });

    // Create site for supplier
    await prisma.site.create({
      data: {
        id: supplierSiteId,
        organisationId: supplierOrgId,
        name: "Plot 4B Normandie",
        facilityType: "FARM",
        country: "France",
        city: "Rouen",
      },
    });

    // Create listings (1 published, 1 draft)
    const pub = await prisma.listing.create({
      data: {
        organisationId: supplierOrgId,
        siteId: supplierSiteId,
        title: "Certified Dew Retted Hemp Straw",
        description: "Industrial grade hemp straw retted in Normandy fields.",
        materialType: "HEMP",
        productForm: "STRAW_RETTED",
        quantity: 150,
        quantityUnit: "TONNES",
        priceAmount: 320,
        currency: "EUR",
        priceUnit: "PER_TONNE",
        originCountry: "France",
        harvestYear: 2026,
        status: "PUBLISHED",
      },
    });
    publishedListingId = pub.id;

    const draft = await prisma.listing.create({
      data: {
        organisationId: supplierOrgId,
        siteId: supplierSiteId,
        title: "Draft Sisal Fibre Lot",
        description: "Internal draft listing not ready for buyers.",
        materialType: "SISAL",
        productForm: "FIBRE_TECHNICAL",
        quantity: 50,
        quantityUnit: "TONNES",
        priceAmount: null,
        currency: "EUR",
        priceUnit: "PER_TONNE",
        originCountry: "Kenya",
        harvestYear: 2026,
        status: "DRAFT",
      },
    });
    draftListingId = draft.id;
  });

  afterAll(async () => {
    await prisma.listing.deleteMany({
      where: { organisationId: supplierOrgId },
    });
    await prisma.site.deleteMany({
      where: { organisationId: supplierOrgId },
    });
    await prisma.membership.deleteMany({
      where: {
        userId: { in: [supplierUserId, buyerUserId, traderUserId] },
      },
    });
    await prisma.organisation.deleteMany({
      where: { id: { in: [supplierOrgId, buyerOrgId, traderOrgId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [supplierUserId, buyerUserId, traderUserId] } },
    });
    await prisma.$disconnect();
  });

  describe("Role Enforcement", () => {
    it("denies Supplier user with 403 Forbidden", async () => {
      await expect(service.listListings(supplierUserId, {})).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("allows Buyer user to query marketplace", async () => {
      const result = await service.listListings(buyerUserId, {});
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe(publishedListingId);
    });

    it("allows Trader user to query marketplace", async () => {
      const result = await service.listListings(traderUserId, {});
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe(publishedListingId);
    });
  });

  describe("Marketplace Visibility & DRAFT Exclusion", () => {
    it("exposes ONLY PUBLISHED listings and excludes DRAFT listings", async () => {
      const result = await service.listListings(buyerUserId, {});
      const ids = result.items.map((i) => i.id);
      expect(ids).toContain(publishedListingId);
      expect(ids).not.toContain(draftListingId);
    });

    it("returns single published listing detail", async () => {
      const detail = await service.getListing(buyerUserId, publishedListingId);
      expect(detail.id).toBe(publishedListingId);
      expect(detail.title).toBe("Certified Dew Retted Hemp Straw");
      expect(detail.materialType).toBe("HEMP");
      expect(detail.supplier.name).toBe("Normandy Hemp Farm");
      expect(detail.site?.name).toBe("Plot 4B Normandie");
    });

    it("returns 404 NotFoundException when trying to access a DRAFT listing detail via marketplace", async () => {
      await expect(
        service.getListing(buyerUserId, draftListingId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("Search and Filters", () => {
    it("finds listings matching search keyword", async () => {
      const result = await service.listListings(buyerUserId, {
        search: "Normandy",
      });
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe(publishedListingId);

      const noMatch = await service.listListings(buyerUserId, {
        search: "NonexistentKeyword999",
      });
      expect(noMatch.total).toBe(0);
    });

    it("filters by materialType and productForm", async () => {
      const hempMatch = await service.listListings(buyerUserId, {
        materialType: "HEMP",
        productForm: "STRAW_RETTED",
      });
      expect(hempMatch.total).toBe(1);

      const coirMatch = await service.listListings(buyerUserId, {
        materialType: "COIR",
      });
      expect(coirMatch.total).toBe(0);
    });

    it("filters by quantity range", async () => {
      const inRange = await service.listListings(buyerUserId, {
        minQuantity: 100,
        maxQuantity: 200,
      });
      expect(inRange.total).toBe(1);

      const outOfRange = await service.listListings(buyerUserId, {
        minQuantity: 200,
      });
      expect(outOfRange.total).toBe(0);
    });

    it("filters by price presence and price range", async () => {
      const hasPrice = await service.listListings(buyerUserId, {
        hasPrice: true,
        minPrice: 300,
        maxPrice: 350,
      });
      expect(hasPrice.total).toBe(1);

      const tooExpensive = await service.listListings(buyerUserId, {
        maxPrice: 200,
      });
      expect(tooExpensive.total).toBe(0);
    });
  });

  describe("Supplier Privacy / Data Withholding", () => {
    it("does not expose private supplier emails, phone numbers, or tax IDs in marketplace responses", async () => {
      const result = await service.listListings(buyerUserId, {});
      const supplierRecord = result.items[0].supplier as Record<string, unknown>;

      expect(supplierRecord.name).toBe("Normandy Hemp Farm");
      expect(supplierRecord.country).toBe("France");
      expect(supplierRecord.verificationStatus).toBe("VERIFIED");

      // Verify withheld fields
      expect(supplierRecord.contactEmail).toBeUndefined();
      expect(supplierRecord.contactPhone).toBeUndefined();
      expect(supplierRecord.vatNumber).toBeUndefined();
      expect(supplierRecord.registrationNumber).toBeUndefined();
      expect(supplierRecord.legalName).toBeUndefined();
    });
  });
});
