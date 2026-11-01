import { NotFoundException } from "@nestjs/common";
import { PublicMarketplaceService } from "./public-marketplace.service";
import { PrismaService } from "../database/prisma.service";

describe("PublicMarketplaceService", () => {
  let service: PublicMarketplaceService;
  let mockPrisma: {
    listing: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
    };
  };

  const mockListingRecord = {
    id: "listing-pub-1",
    organisationId: "org-supplier-1",
    siteId: "site-1",
    title: "Organic French Hemp Fibre",
    description: "High quality decorticated hemp fibre suitable for textile and technical non-wovens.",
    materialType: "HEMP",
    productForm: "TECHNICAL_FIBRE",
    quantity: 50,
    quantityUnit: "TONNES",
    priceAmount: 450,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "FR",
    harvestYear: 2026,
    status: "PUBLISHED",
    createdAt: new Date("2026-08-01T10:00:00Z"),
    updatedAt: new Date("2026-09-05T12:00:00Z"),
    organisation: {
      id: "org-supplier-1",
      country: "FR",
      verificationStatus: "VERIFIED",
      complianceDocuments: [
        { documentType: "ORGANIC_CERTIFICATE", status: "VERIFIED" },
        { documentType: "OEKO_TEX", status: "VERIFIED" },
      ],
      // Private data that MUST NOT leak:
      bankAccount: "FR761234567890",
      taxId: "FR99887766",
      internalNotes: "Sensitive supplier credit history",
    },
    site: {
      name: "Troyes Processing Facility",
      facilityType: "PROCESSING_MILL",
      city: "Troyes",
      country: "FR",
    },
    inspections: [
      {
        id: "insp-1",
        qualityResult: { decision: "APPROVED", classificationLabel: "Grade A" },
        certificate: { certificateNumber: "CERT-2026-001" },
      },
    ],
    lots: [
      {
        id: "lot-1",
        lotNumber: "LOT-2026-FR-09",
        dpp: {
          id: "dpp-1",
          passportNumber: "DPP-FR-2026-0001",
        },
      },
    ],
  };

  beforeEach(() => {
    mockPrisma = {
      listing: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    service = new PublicMarketplaceService(mockPrisma as unknown as PrismaService);
  });

  describe("listPublicListings", () => {
    it("should query ONLY listings with status PUBLISHED", async () => {
      mockPrisma.listing.findMany
        .mockResolvedValueOnce([mockListingRecord]) // main query
        .mockResolvedValueOnce([mockListingRecord]); // facet scan
      mockPrisma.listing.count.mockResolvedValueOnce(1);

      const result = await service.listPublicListings({});

      expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PUBLISHED",
          }),
        }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should never expose internal/private fields in public DTO", async () => {
      mockPrisma.listing.findMany
        .mockResolvedValueOnce([mockListingRecord])
        .mockResolvedValueOnce([mockListingRecord]);
      mockPrisma.listing.count.mockResolvedValueOnce(1);

      const result = await service.listPublicListings({});
      const item = result.items[0];

      // Assert public safe fields
      expect(item.id).toBe("listing-pub-1");
      expect(item.title).toBe("Organic French Hemp Fibre");
      expect(item.materialType).toBe("HEMP");
      expect(item.hasDpp).toBe(true);
      expect(item.dppNumber).toBe("DPP-FR-2026-0001");
      expect(item.supplier.country).toBe("FR");
      expect(item.supplier.isVerified).toBe(true);
      expect(item.quality.isApproved).toBe(true);
      expect(item.quality.classificationLabel).toBe("Grade A");
      expect(item.certifications).toHaveLength(2);

      // Assert private fields are strictly omitted from DTO
      const itemRecord = item as unknown as Record<string, unknown>;
      const supplierRecord = item.supplier as unknown as Record<string, unknown>;
      expect(itemRecord.organisationId).toBeUndefined();
      expect(itemRecord.bankAccount).toBeUndefined();
      expect(itemRecord.taxId).toBeUndefined();
      expect(itemRecord.internalNotes).toBeUndefined();
      expect(supplierRecord.bankAccount).toBeUndefined();
    });

    it("should apply search term to title, description, materialType, productForm, and originCountry", async () => {
      mockPrisma.listing.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.listing.count.mockResolvedValueOnce(0);

      await service.listPublicListings({ search: "textile hemp" });

      expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PUBLISHED",
            OR: [
              { title: { contains: "textile hemp", mode: "insensitive" } },
              { description: { contains: "textile hemp", mode: "insensitive" } },
              { materialType: { contains: "textile hemp", mode: "insensitive" } },
              { productForm: { contains: "textile hemp", mode: "insensitive" } },
              { originCountry: { contains: "textile hemp", mode: "insensitive" } },
            ],
          }),
        }),
      );
    });

    it("should apply structured filters safely (material, country, form, quantity, price, flags)", async () => {
      mockPrisma.listing.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.listing.count.mockResolvedValueOnce(0);

      await service.listPublicListings({
        materialType: "HEMP",
        originCountry: "FR",
        productForm: "TECHNICAL_FIBRE",
        minQuantity: 10,
        maxQuantity: 100,
        minPrice: 300,
        maxPrice: 600,
        hasDpp: true,
        hasQualityApproved: true,
        hasCertifications: true,
      });

      expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PUBLISHED",
            materialType: { equals: "HEMP", mode: "insensitive" },
            originCountry: { equals: "FR", mode: "insensitive" },
            productForm: { equals: "TECHNICAL_FIBRE", mode: "insensitive" },
            quantity: { gte: 10, lte: 100 },
            priceAmount: { gte: 300, lte: 600 },
            lots: { some: { dpp: { isNot: null } } },
            inspections: { some: { qualityResult: { decision: "APPROVED" } } },
            organisation: {
              complianceDocuments: {
                some: { status: "VERIFIED" },
              },
            },
          }),
        }),
      );
    });

    it("should validate and apply sorting correctly", async () => {
      mockPrisma.listing.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.listing.count.mockResolvedValueOnce(0);

      await service.listPublicListings({ sort: "PRICE_ASC" });

      expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ priceAmount: "asc" }, { id: "desc" }],
        }),
      );
    });

    it("should aggregate facets correctly", async () => {
      const secondListing = {
        ...mockListingRecord,
        id: "listing-2",
        materialType: "FLAX",
        productForm: "SCUTCHED_FLAX",
        originCountry: "BE",
        lots: [],
        inspections: [],
        organisation: {
          ...mockListingRecord.organisation,
          complianceDocuments: [],
        },
      };

      mockPrisma.listing.findMany
        .mockResolvedValueOnce([mockListingRecord]) // items
        .mockResolvedValueOnce([mockListingRecord, secondListing]); // facets
      mockPrisma.listing.count.mockResolvedValueOnce(1);

      const result = await service.listPublicListings({});

      expect(result.facets.materials).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ value: "HEMP", count: 1 }),
          expect.objectContaining({ value: "FLAX", count: 1 }),
        ]),
      );
      expect(result.facets.countries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ value: "FR", count: 1 }),
          expect.objectContaining({ value: "BE", count: 1 }),
        ]),
      );
      expect(result.facets.totalWithDpp).toBe(1);
      expect(result.facets.totalQualityApproved).toBe(1);
      expect(result.facets.totalWithCertifications).toBe(1);
    });
  });

  describe("getPublicListing", () => {
    it("should return detailed public listing for a published listing", async () => {
      mockPrisma.listing.findFirst.mockResolvedValueOnce(mockListingRecord);
      mockPrisma.listing.findMany.mockResolvedValueOnce([]); // related

      const detail = await service.getPublicListing("listing-pub-1");

      expect(detail.id).toBe("listing-pub-1");
      expect(detail.title).toBe("Organic French Hemp Fibre");
      expect(detail.quality.classificationLabel).toBe("Grade A");
      expect(detail.hasDpp).toBe(true);
      expect(detail.dppNumber).toBe("DPP-FR-2026-0001");

      // Verify no leak of private supplier data
      const detailRecord = detail as unknown as Record<string, unknown>;
      expect(detailRecord.organisationId).toBeUndefined();
      expect(detailRecord.bankAccount).toBeUndefined();
      expect(detailRecord.taxId).toBeUndefined();
    });

    it("should throw NotFoundException if listing does not exist or is NOT published", async () => {
      mockPrisma.listing.findFirst.mockResolvedValueOnce(null);

      await expect(service.getPublicListing("draft-listing-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
