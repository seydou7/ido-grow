import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { TradesService } from "./trades.service";
import type { PrismaService } from "../database";
import type { OrganisationsRepository } from "../organisations/organisations.repository";

describe("TradesService", () => {
  let service: TradesService;
  let prismaMock: {
    trade: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let organisationsRepositoryMock: jest.Mocked<OrganisationsRepository>;

  const traderUserId = "user-trader-uuid";
  const buyerUserId = "user-buyer-uuid";
  const otherBuyerUserId = "user-other-buyer-uuid";
  const supplierUserId = "user-supplier-uuid";

  const tradeId = "trade-uuid-123";
  const quoteId = "quote-uuid-456";

  const mockTradeRecord = {
    id: tradeId,
    tradeNumber: "TRD-20260917-ABCD",
    quoteId,
    acceptedQuoteVersionNumber: 1,
    matchId: "match-uuid-789",
    buyOrderId: "bo-uuid-1",
    listingId: "lst-uuid-2",
    buyerOrganisationId: "org-buyer",
    supplierOrganisationId: "org-supplier",
    createdByUserId: buyerUserId,
    materialType: "HEMP",
    productForm: "FIBRE_TECHNICAL",
    quantity: 100,
    quantityUnit: "TONNES",
    currency: "EUR",
    acceptedTotalAmount: 25000,
    incoterm: "FOB",
    paymentTerms: "30_DAYS_NET",
    acceptedAt: new Date("2026-09-17T12:00:00Z"),
    createdAt: new Date("2026-09-17T12:00:00Z"),
    updatedAt: new Date("2026-09-17T12:00:00Z"),
    quote: {
      id: quoteId,
      quoteNumber: "QT-20260917-001",
      versions: [
        {
          id: "qv-1",
          quoteId,
          versionNumber: 1,
          productValue: 20000,
          idoGrowMarginCommission: 1000,
          inspectionCost: 500,
          packagingCost: 400,
          inlandTransportCost: 600,
          internationalFreightCost: 1500,
          customsCost: 300,
          insuranceCost: 200,
          storageCost: 100,
          taxAmount: 300,
          otherServiceFees: 100,
          totalAmount: 25000,
          currency: "EUR",
          incoterm: "FOB",
          paymentTerms: "30_DAYS_NET",
          validUntil: new Date("2026-10-17T12:00:00Z"),
          commercialNotes: "Baseline terms agreed",
        },
      ],
    },
    buyerOrganisation: {
      id: "org-buyer",
      name: "EcoTextile Corp",
      address: "10 Rue de la Paix",
      city: "Paris",
      country: "France",
    },
    supplierOrganisation: {
      id: "org-supplier",
      name: "Normandie Chanvre",
      address: "5 Route des Champs",
      city: "Rouen",
      country: "France",
    },
    listing: {
      id: "lst-uuid-2",
      title: "Premium French Hemp Technical Fibre",
    },
  };

  beforeEach(() => {
    prismaMock = {
      trade: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    organisationsRepositoryMock = {
      findMembershipsForUser: jest.fn().mockImplementation(async (userId: string) => {
        if (userId === traderUserId) {
          return [
            {
              id: "m-trader",
              userId: traderUserId,
              organisationId: "org-trader",
              organisation: { organisationType: "TRADER" },
            },
          ];
        }
        if (userId === buyerUserId) {
          return [
            {
              id: "m-buyer",
              userId: buyerUserId,
              organisationId: "org-buyer",
              organisation: { organisationType: "BUYER" },
            },
          ];
        }
        if (userId === otherBuyerUserId) {
          return [
            {
              id: "m-other-buyer",
              userId: otherBuyerUserId,
              organisationId: "org-other-buyer",
              organisation: { organisationType: "BUYER" },
            },
          ];
        }
        if (userId === supplierUserId) {
          return [
            {
              id: "m-supplier",
              userId: supplierUserId,
              organisationId: "org-supplier",
              organisation: { organisationType: "SUPPLIER" },
            },
          ];
        }
        return [];
      }),
    } as unknown as jest.Mocked<OrganisationsRepository>;

    service = new TradesService(
      prismaMock as unknown as PrismaService,
      organisationsRepositoryMock,
    );
  });

  describe("Trader Trades Access", () => {
    it("getTradesForTrader returns all platform trades for authorized Trader", async () => {
      prismaMock.trade.findMany.mockResolvedValueOnce([mockTradeRecord]);

      const res = await service.getTradesForTrader(traderUserId);
      expect(res.total).toBe(1);
      expect(res.items[0].tradeNumber).toBe("TRD-20260917-ABCD");
      expect(res.items[0].quoteNumber).toBe("QT-20260917-001");
      expect(res.items[0].acceptedTotalAmount).toBe(25000);
      expect(res.items[0].buyerOrganisationName).toBe("EcoTextile Corp");
      expect(res.items[0].supplierOrganisationName).toBe("Normandie Chanvre");
    });

    it("getTradesForTrader forbids non-trader users (Buyer 403, Supplier 403)", async () => {
      await expect(service.getTradesForTrader(buyerUserId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.getTradesForTrader(supplierUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("getTradeDetailForTrader returns full commercial baseline snapshot", async () => {
      prismaMock.trade.findUnique.mockResolvedValueOnce(mockTradeRecord);

      const res = await service.getTradeDetailForTrader(traderUserId, tradeId);
      expect(res.id).toBe(tradeId);
      expect(res.acceptedBreakdown.productValue).toBe(20000);
      expect(res.acceptedBreakdown.idoGrowMarginCommission).toBe(1000);
      expect(res.acceptedBreakdown.internationalFreightCost).toBe(1500);
      expect(res.commercialNotes).toBe("Baseline terms agreed");
      expect(res.buyerCity).toBe("Paris");
      expect(res.supplierCity).toBe("Rouen");
      expect(res.listingTitle).toBe("Premium French Hemp Technical Fibre");
    });

    it("getTradeDetailForTrader throws 404 for non-existent trade", async () => {
      prismaMock.trade.findUnique.mockResolvedValueOnce(null);

      await expect(service.getTradeDetailForTrader(traderUserId, "unknown-id")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("E: resolves exact accepted QuoteVersion for 11-line commercial breakdown", async () => {
      // Mock trade where acceptedQuoteVersionNumber = 2
      const tradeWithV2 = {
        ...mockTradeRecord,
        acceptedQuoteVersionNumber: 2,
        quote: {
          ...mockTradeRecord.quote,
          versions: [
            mockTradeRecord.quote.versions[0],
            {
              ...mockTradeRecord.quote.versions[0],
              id: "qv-2",
              versionNumber: 2,
              productValue: 22000,
              idoGrowMarginCommission: 1100,
              totalAmount: 27000,
            },
          ],
        },
      };
      prismaMock.trade.findUnique.mockResolvedValueOnce(tradeWithV2);

      const res = await service.getTradeDetailForTrader(traderUserId, tradeId);
      expect(res.acceptedQuoteVersionNumber).toBe(2);
      expect(res.acceptedBreakdown.productValue).toBe(22000);
      expect(res.acceptedBreakdown.idoGrowMarginCommission).toBe(1100);
    });

    it("F: throws explicit integrity error when exact accepted QuoteVersion is absent (NO versions[0] fallback, NO zero-filled breakdown)", async () => {
      // Trade has acceptedQuoteVersionNumber = 3, but quote only has version 1
      const tradeWithMissingVersion = {
        ...mockTradeRecord,
        acceptedQuoteVersionNumber: 3,
        quote: {
          ...mockTradeRecord.quote,
          versions: [
            mockTradeRecord.quote.versions[0], // version 1
          ],
        },
      };
      prismaMock.trade.findUnique.mockResolvedValueOnce(tradeWithMissingVersion);

      await expect(service.getTradeDetailForTrader(traderUserId, tradeId)).rejects.toThrow(
        NotFoundException,
      );
      try {
        prismaMock.trade.findUnique.mockResolvedValueOnce(tradeWithMissingVersion);
        await service.getTradeDetailForTrader(traderUserId, tradeId);
      } catch (err: unknown) {
        const error = err as { response?: { type?: string; detail?: string } };
        expect(error.response?.type).toBe("https://errors.idogrow.com/trades/accepted-version-not-found");
        expect(error.response?.detail).toContain("v3");
      }
    });
  });

  describe("Buyer Trades Access & Tenant Isolation", () => {
    it("getTradesForBuyer returns only trades belonging to buyer organization", async () => {
      prismaMock.trade.findMany.mockResolvedValueOnce([mockTradeRecord]);

      const res = await service.getTradesForBuyer(buyerUserId);
      expect(prismaMock.trade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { buyerOrganisationId: "org-buyer" },
        }),
      );
      expect(res.total).toBe(1);
    });

    it("getTradeDetailForBuyer allows buyer to view own trade record", async () => {
      prismaMock.trade.findUnique.mockResolvedValueOnce(mockTradeRecord);

      const res = await service.getTradeDetailForBuyer(buyerUserId, tradeId);
      expect(res.id).toBe(tradeId);
      expect(res.acceptedTotalAmount).toBe(25000);
    });

    it("getTradeDetailForBuyer denies cross-tenant buyer with 404 (privacy-safe)", async () => {
      prismaMock.trade.findUnique.mockResolvedValueOnce(mockTradeRecord);

      await expect(
        service.getTradeDetailForBuyer(otherBuyerUserId, tradeId),
      ).rejects.toThrow(NotFoundException);
    });

    it("getTradesForBuyer forbids non-buyer users (Trader 403, Supplier 403)", async () => {
      await expect(service.getTradesForBuyer(traderUserId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.getTradesForBuyer(supplierUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
