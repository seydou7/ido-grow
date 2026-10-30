import type { AuditEventDatabaseClient } from "../audit/audit-event.writer";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { QuotesService } from "./quotes.service";
import type { QuotesRepository, QuoteRecordWithRelations } from "./quotes.repository";
import type { OrganisationsRepository } from "../organisations/organisations.repository";
import type { AuditEventWriter } from "../audit";
import type { PrismaService } from "../database";
import { type CommercialBreakdown, QUOTE_STATUSES } from "./contracts";

describe("QuotesService", () => {
  let service: QuotesService;
  let prismaMock: { match: { findUnique: jest.Mock } };
  let quotesRepositoryMock: jest.Mocked<QuotesRepository>;
  let organisationsRepositoryMock: jest.Mocked<OrganisationsRepository>;
  let auditEventWriterMock: jest.Mocked<AuditEventWriter>;

  const traderUserId = "trader-user-uuid";
  const nonTraderUserId = "buyer-user-uuid";
  const matchId = "match-uuid-123";
  const quoteId = "quote-uuid-456";

  const sampleBreakdown: CommercialBreakdown = {
    productValue: 10000,
    idoGrowMarginCommission: 500,
    inspectionCost: 200,
    packagingCost: 150,
    inlandTransportCost: 300,
    internationalFreightCost: 600,
    customsCost: 200,
    insuranceCost: 100,
    storageCost: 50,
    taxAmount: 1200,
    otherServiceFees: 50,
  };

  const mockQuoteRecord: QuoteRecordWithRelations = {
    id: quoteId,
    quoteNumber: "QT-20260916-A1B2",
    matchId,
    buyOrderId: "bo-123",
    listingId: "lst-456",
    buyerOrganisationId: "org-buyer",
    supplierOrganisationId: "org-supplier",
    createdByUserId: traderUserId,
    createdByUser: { id: traderUserId, email: "trader@idogrow.com" },
    status: "DRAFT",
    currency: "EUR",
    currentVersionNumber: 1,
    sentAt: null,
    sentByUserId: null,
    sentVersionNumber: null,
    acceptedAt: null,
    acceptedByUserId: null,
    acceptedVersionNumber: null,
    rejectedAt: null,
    rejectedByUserId: null,
    rejectionReason: null,
    createdAt: new Date("2026-09-16T10:00:00Z"),
    updatedAt: new Date("2026-09-16T10:00:00Z"),
    buyerOrganisation: { id: "org-buyer", name: "Buyer Industries" },
    supplierOrganisation: { id: "org-supplier", name: "Recycle Supplier Co" },
    buyOrder: {
      id: "bo-123",
      materialType: "rPET",
      productForm: "FLAKES",
      quantity: 50,
      quantityUnit: "TONNES",
    },
    listing: {
      id: "lst-456",
      title: "Recycled PET Flakes",
      materialType: "rPET",
      productForm: "FLAKES",
    },
    versions: [
      {
        id: "qv-1",
        quoteId,
        versionNumber: 1,
        productValue: 10000,
        idoGrowMarginCommission: 500,
        inspectionCost: 200,
        packagingCost: 150,
        inlandTransportCost: 300,
        internationalFreightCost: 600,
        customsCost: 200,
        insuranceCost: 100,
        storageCost: 50,
        taxAmount: 1200,
        otherServiceFees: 50,
        totalAmount: 13350,
        currency: "EUR",
        incoterm: "FOB",
        paymentTerms: "30_DAYS_NET",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        commercialNotes: "Standard export quote",
        createdByUserId: traderUserId,
        createdAt: new Date("2026-09-16T10:00:00Z"),
        createdByUser: { id: traderUserId, email: "trader@idogrow.com" },
      },
    ],
  };

  beforeEach(() => {
    prismaMock = {
      match: {
        findUnique: jest.fn(),
      },
    };

    quotesRepositoryMock = {
      findQuoteById: jest.fn(),
      findQuoteByMatchId: jest.fn(),
      findQuoteByQuoteNumber: jest.fn(),
      findQuotes: jest.fn(),
      findQuotesByBuyer: jest.fn().mockResolvedValue([mockQuoteRecord]),
      createQuote: jest.fn(),
      createQuoteVersion: jest.fn(),
      updateQuoteStatus: jest.fn(),
      sendQuote: jest.fn().mockImplementation((id, sentByUserId, sentVersionNumber) =>
        Promise.resolve({
          ...mockQuoteRecord,
          status: "SENT",
          sentAt: new Date(),
          sentByUserId,
          sentVersionNumber,
        }),
      ),
      acceptQuote: jest.fn().mockImplementation(async (id, acceptedByUserId, acceptedVersionNumber, tradeData, onAtomicActions) => {
        if (onAtomicActions && tradeData) {
          await onAtomicActions(
            {} as unknown as AuditEventDatabaseClient,
            { trade: { id: "trd-1", tradeNumber: tradeData.tradeNumber }, isFirstAcceptance: true },
          );
        }
        return {
          ...mockQuoteRecord,
          status: "ACCEPTED",
          acceptedAt: new Date(),
          acceptedByUserId,
          acceptedVersionNumber,
          trade: tradeData
            ? {
                id: "trd-1",
                tradeNumber: tradeData.tradeNumber,
                quoteId: id,
                acceptedQuoteVersionNumber: acceptedVersionNumber,
                currency: tradeData.currency,
                acceptedTotalAmount: tradeData.acceptedTotalAmount,
                acceptedAt: new Date(),
                createdAt: new Date(),
              }
            : null,
        };
      }),
      rejectQuote: jest.fn().mockImplementation((id, rejectedByUserId, rejectionReason) =>
        Promise.resolve({
          ...mockQuoteRecord,
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectedByUserId,
          rejectionReason,
        }),
      ),
      createCounterOffer: jest.fn().mockImplementation((data) =>
        Promise.resolve({
          ...mockQuoteRecord,
          status: "COUNTERED",
          counterOffers: [
            {
              id: "co-1",
              quoteId: data.quoteId,
              sourceVersionNumber: data.sourceVersionNumber,
              buyerOrganisationId: data.buyerOrganisationId,
              createdByUserId: data.createdByUserId,
              proposedProductValue: data.proposedProductValue ?? null,
              proposedTotalAmount: data.proposedTotalAmount ?? null,
              proposedIncoterm: data.proposedIncoterm ?? null,
              proposedPaymentTerms: data.proposedPaymentTerms ?? null,
              buyerNote: data.buyerNote,
              createdAt: new Date(),
            },
          ],
        }),
      ),
    } as unknown as jest.Mocked<QuotesRepository>;

    organisationsRepositoryMock = {
      findMembershipsForUser: jest.fn().mockImplementation((uid) => {
        if (uid === traderUserId) {
          return Promise.resolve([
            {
              id: "m-trader",
              userId: traderUserId,
              organisationId: "org-trader",
              organisation: { organisationType: "TRADER" },
            },
          ]);
        }
        return Promise.resolve([
          {
            id: "m-buyer",
            userId: nonTraderUserId,
            organisationId: "org-buyer",
            organisation: { organisationType: "BUYER" },
          },
        ]);
      }),
      findOrganisationById: jest.fn(),
    } as unknown as jest.Mocked<OrganisationsRepository>;

    auditEventWriterMock = {
      append: jest.fn().mockResolvedValue(undefined),
      findEventsByTarget: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<AuditEventWriter>;

    service = new QuotesService(
      prismaMock as unknown as PrismaService,
      quotesRepositoryMock,
      organisationsRepositoryMock,
      auditEventWriterMock,
    );
  });

  describe("assertTraderAccess", () => {
    it("rejects non-trader users with 403 Forbidden", async () => {
      await expect(
        service.createQuote(nonTraderUserId, {
          matchId,
          commercialBreakdown: sampleBreakdown,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("QuoteStatus domain", () => {
    it("canonical QUOTE_STATUSES contains all 8 documented lifecycle statuses", () => {
      expect(QUOTE_STATUSES).toEqual([
        "DRAFT",
        "INTERNAL_REVIEW",
        "SENT",
        "COUNTERED",
        "ACCEPTED",
        "REJECTED",
        "EXPIRED",
        "CONVERTED_TO_CONTRACT",
      ]);
    });
  });

  describe("createQuote", () => {
    it("rejects when match is not found with 404", async () => {
      prismaMock.match.findUnique.mockResolvedValue(null);

      await expect(
        service.createQuote(traderUserId, {
          matchId,
          commercialBreakdown: sampleBreakdown,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("rejects when match is not APPROVED with 409 Conflict", async () => {
      prismaMock.match.findUnique.mockResolvedValue({
        id: matchId,
        status: "DRAFT",
        buyOrder: { buyerOrganisationId: "org-buyer" },
        listing: { organisationId: "org-supplier" },
      });

      await expect(
        service.createQuote(traderUserId, {
          matchId,
          commercialBreakdown: sampleBreakdown,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("rejects when quote already exists for match with 409 Conflict", async () => {
      prismaMock.match.findUnique.mockResolvedValue({
        id: matchId,
        status: "APPROVED",
        buyOrder: { buyerOrganisationId: "org-buyer" },
        listing: { organisationId: "org-supplier" },
      });
      quotesRepositoryMock.findQuoteByMatchId.mockResolvedValue(mockQuoteRecord);

      await expect(
        service.createQuote(traderUserId, {
          matchId,
          commercialBreakdown: sampleBreakdown,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("successfully creates quote and emits BOTH quote.created and quote.version.created for v1", async () => {
      prismaMock.match.findUnique.mockResolvedValue({
        id: matchId,
        status: "APPROVED",
        buyerOrganisationId: "org-buyer",
        supplierOrganisationId: "org-supplier",
        buyOrderId: "bo-123",
        listingId: "lst-456",
        buyOrder: { buyerOrganisationId: "org-buyer", materialType: "rPET", quantity: 50, currency: "EUR" },
        listing: { organisationId: "org-supplier", materialType: "rPET", currency: "EUR" },
      });
      quotesRepositoryMock.findQuoteByMatchId.mockResolvedValue(null);
      quotesRepositoryMock.createQuote.mockResolvedValue(mockQuoteRecord);

      const result = await service.createQuote(traderUserId, {
        matchId,
        commercialBreakdown: sampleBreakdown,
        incoterm: "FOB",
        paymentTerms: "30_DAYS_NET",
      });

      expect(result.id).toBe(quoteId);
      expect(result.status).toBe("DRAFT");
      expect(result.currentVersionNumber).toBe(1);
      expect(result.currentVersion.totalAmount).toBe(13350);

      // Must emit exactly 2 audit events on creation: quote.created AND quote.version.created for v1
      expect(auditEventWriterMock.append).toHaveBeenCalledTimes(2);
      expect(auditEventWriterMock.append).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          eventType: "quote.created",
          metadata: expect.objectContaining({
            versionNumber: "1",
            totalAmount: "13350",
            currency: "EUR",
          }),
        }),
      );
      expect(auditEventWriterMock.append).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          eventType: "quote.version.created",
          metadata: expect.objectContaining({
            versionNumber: "1",
            totalAmount: "13350",
            currency: "EUR",
          }),
        }),
      );
    });

    it("inherits matching USD currency from both BuyOrder and Listing", async () => {
      prismaMock.match.findUnique.mockResolvedValue({
        id: matchId,
        status: "APPROVED",
        buyerOrganisationId: "org-buyer",
        supplierOrganisationId: "org-supplier",
        buyOrderId: "bo-123",
        listingId: "lst-456",
        buyOrder: { buyerOrganisationId: "org-buyer", materialType: "rPET", quantity: 50, currency: "USD" },
        listing: { organisationId: "org-supplier", materialType: "rPET", currency: "USD" },
      });
      quotesRepositoryMock.findQuoteByMatchId.mockResolvedValue(null);
      quotesRepositoryMock.createQuote.mockResolvedValue({
        ...mockQuoteRecord,
        currency: "USD",
      });

      await service.createQuote(traderUserId, {
        matchId,
        commercialBreakdown: sampleBreakdown,
      });

      expect(quotesRepositoryMock.createQuote).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: "USD",
        }),
      );
    });

    it("rejects with 409 Conflict when BuyOrder and Listing currencies conflict without FX conversion", async () => {
      prismaMock.match.findUnique.mockResolvedValue({
        id: matchId,
        status: "APPROVED",
        buyerOrganisationId: "org-buyer",
        supplierOrganisationId: "org-supplier",
        buyOrderId: "bo-123",
        listingId: "lst-456",
        buyOrder: { buyerOrganisationId: "org-buyer", materialType: "rPET", quantity: 50, currency: "EUR" },
        listing: { organisationId: "org-supplier", materialType: "rPET", currency: "USD" },
      });
      quotesRepositoryMock.findQuoteByMatchId.mockResolvedValue(null);

      await expect(
        service.createQuote(traderUserId, {
          matchId,
          commercialBreakdown: sampleBreakdown,
        }),
      ).rejects.toThrow(ConflictException);

      try {
        await service.createQuote(traderUserId, {
          matchId,
          commercialBreakdown: sampleBreakdown,
        });
      } catch (err: unknown) {
        const error = err as ConflictException;
        const response = error.getResponse() as Record<string, unknown>;
        expect(response.title).toBe("PROJECT OWNER DECISION REQUIRED — QUOTE CURRENCY CONFLICT");
        expect(response.buyOrderCurrency).toBe("EUR");
        expect(response.listingCurrency).toBe("USD");
      }

      // Must NOT create quote when currency conflict exists
      expect(quotesRepositoryMock.createQuote).not.toHaveBeenCalled();
    });
  });

  describe("updateQuote", () => {
    it("rejects when quote is not found with 404", async () => {
      quotesRepositoryMock.findQuoteById.mockResolvedValue(null);

      await expect(
        service.updateQuote(traderUserId, quoteId, {
          commercialBreakdown: sampleBreakdown,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("rejects modifications when quote is not DRAFT with 400 BadRequest", async () => {
      quotesRepositoryMock.findQuoteById.mockResolvedValue({
        ...mockQuoteRecord,
        status: "INTERNAL_REVIEW",
      });

      await expect(
        service.updateQuote(traderUserId, quoteId, {
          commercialBreakdown: sampleBreakdown,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("creates a new sequential version and emits quote.version.created for v2", async () => {
      quotesRepositoryMock.findQuoteById.mockResolvedValue(mockQuoteRecord);

      const updatedRecord: QuoteRecordWithRelations = {
        ...mockQuoteRecord,
        currentVersionNumber: 2,
        versions: [
          ...mockQuoteRecord.versions,
          {
            ...mockQuoteRecord.versions[0],
            id: "qv-2",
            versionNumber: 2,
            packagingCost: 250,
            totalAmount: 13450,
          },
        ],
      };

      quotesRepositoryMock.createQuoteVersion.mockResolvedValue(updatedRecord);

      const result = await service.updateQuote(traderUserId, quoteId, {
        commercialBreakdown: {
          ...sampleBreakdown,
          packagingCost: 250,
        },
        commercialNotes: "Revised packaging specs",
      });

      expect(quotesRepositoryMock.createQuoteVersion).toHaveBeenCalledWith(
        quoteId,
        2,
        expect.objectContaining({
          versionNumber: 2,
          quoteId,
          currency: "EUR",
        }),
      );
      expect(result.currentVersionNumber).toBe(2);
      expect(auditEventWriterMock.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quote.version.created",
          metadata: expect.objectContaining({
            versionNumber: "2",
            currency: "EUR",
          }),
        }),
      );
    });
  });

  describe("status transitions", () => {
    it("submits DRAFT quote for internal review", async () => {
      quotesRepositoryMock.findQuoteById.mockResolvedValue(mockQuoteRecord);
      quotesRepositoryMock.updateQuoteStatus.mockResolvedValue({
        ...mockQuoteRecord,
        status: "INTERNAL_REVIEW",
      });

      const result = await service.submitForInternalReview(traderUserId, quoteId);

      expect(result.status).toBe("INTERNAL_REVIEW");
      expect(auditEventWriterMock.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quote.submitted_for_internal_review",
        }),
      );
    });

    it("rejects submitting non-DRAFT quote for review", async () => {
      quotesRepositoryMock.findQuoteById.mockResolvedValue({
        ...mockQuoteRecord,
        status: "INTERNAL_REVIEW",
      });

      await expect(
        service.submitForInternalReview(traderUserId, quoteId),
      ).rejects.toThrow(BadRequestException);
    });

    it("returns INTERNAL_REVIEW quote to DRAFT", async () => {
      quotesRepositoryMock.findQuoteById.mockResolvedValue({
        ...mockQuoteRecord,
        status: "INTERNAL_REVIEW",
      });
      quotesRepositoryMock.updateQuoteStatus.mockResolvedValue({
        ...mockQuoteRecord,
        status: "DRAFT",
      });

      const result = await service.returnToDraft(traderUserId, quoteId);

      expect(result.status).toBe("DRAFT");
      expect(auditEventWriterMock.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quote.returned_to_draft",
        }),
      );
    });

    it("rejects returning non-INTERNAL_REVIEW quote to draft", async () => {
      quotesRepositoryMock.findQuoteById.mockResolvedValue({
        ...mockQuoteRecord,
        status: "DRAFT",
      });

      await expect(
        service.returnToDraft(traderUserId, quoteId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Block 02: Quote Dispatch, Counter-Offer & Buyer Decisions", () => {
    const buyerUserId = "buyer-user-uuid";

    beforeEach(() => {
      organisationsRepositoryMock.findMembershipsForUser.mockImplementation(((userId: string) => {
        if (userId === traderUserId) {
          return Promise.resolve([
            {
              id: "mem-1",
              userId: traderUserId,
              organisationId: "org-trader",
              role: "ADMIN",
              createdAt: new Date(),
              updatedAt: new Date(),
              organisation: {
                id: "org-trader",
                name: "I Do Grow Trading",
                organisationType: "TRADER",
                country: "Netherlands",
              },
            },
          ]);
        }
        if (userId === buyerUserId) {
          return Promise.resolve([
            {
              id: "mem-2",
              userId: buyerUserId,
              organisationId: "org-buyer",
              role: "MEMBER",
              createdAt: new Date(),
              updatedAt: new Date(),
              organisation: {
                id: "org-buyer",
                name: "Buyer Industries",
                organisationType: "BUYER",
                country: "Germany",
              },
            },
          ]);
        }
        return Promise.resolve([]);
      }) as unknown as jest.MockedFunction<OrganisationsRepository["findMembershipsForUser"]>);
    });

    describe("sendQuote", () => {
      it("sends quote under INTERNAL_REVIEW to Buyer as SENT", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "INTERNAL_REVIEW",
        });

        const res = await service.sendQuote(traderUserId, quoteId);

        expect(res.status).toBe("SENT");
        expect(quotesRepositoryMock.sendQuote).toHaveBeenCalledWith(quoteId, traderUserId, 1);
        expect(auditEventWriterMock.append).toHaveBeenCalledWith(
          expect.objectContaining({
            eventType: "quote.sent",
            metadata: expect.objectContaining({ status: "SENT" }),
          }),
        );
      });

      it("rejects sendQuote if quote is still in DRAFT", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "DRAFT",
        });

        await expect(service.sendQuote(traderUserId, quoteId)).rejects.toThrow(
          BadRequestException,
        );
      });

      it("rejects non-traders from sending quote with 403", async () => {
        await expect(service.sendQuote(buyerUserId, quoteId)).rejects.toThrow(
          ForbiddenException,
        );
      });
    });

    describe("reviseCounter", () => {
      it("creates revised version v2 from COUNTERED quote and returns to DRAFT", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "COUNTERED",
          currentVersionNumber: 1,
        });

        quotesRepositoryMock.createQuoteVersion.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "DRAFT",
          currentVersionNumber: 2,
          versions: [
            mockQuoteRecord.versions[0],
            {
              ...mockQuoteRecord.versions[0],
              id: "qv-2",
              versionNumber: 2,
              productValue: 9800,
            },
          ],
        });

        const res = await service.reviseCounter(traderUserId, quoteId, {
          commercialBreakdown: {
            ...sampleBreakdown,
            productValue: 9800,
          },
        });

        expect(res.status).toBe("DRAFT");
        expect(res.currentVersionNumber).toBe(2);
        expect(auditEventWriterMock.append).toHaveBeenCalledWith(
          expect.objectContaining({ eventType: "quote.version.created" }),
        );
        expect(auditEventWriterMock.append).toHaveBeenCalledWith(
          expect.objectContaining({ eventType: "quote.counter.revised" }),
        );
      });

      it("creates revised version v2 with Trader's prospective commercial values (2475) while preserving v1 (2550) and counter-offer (2400)", async () => {
        const v1Version = {
          ...mockQuoteRecord.versions[0],
          productValue: 2550,
          totalAmount: 2850,
        };
        const counterOffer = {
          id: "co-1",
          quoteId,
          sourceVersionNumber: 1,
          buyerOrganisationId: "org-buyer",
          createdByUserId: "user-buyer",
          proposedProductValue: 2400,
          proposedTotalAmount: 2600,
          proposedIncoterm: "CIF",
          proposedPaymentTerms: "60_DAYS_NET",
          buyerNote: "We propose EUR 2,400 target procurement budget.",
          createdAt: new Date("2026-09-19T10:00:00Z"),
        };
        const counteredQuote = {
          ...mockQuoteRecord,
          status: "COUNTERED",
          currentVersionNumber: 1,
          versions: [v1Version],
          counterOffers: [counterOffer],
        };

        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce(counteredQuote);

        const v2Version = {
          ...v1Version,
          id: "qv-2",
          versionNumber: 2,
          productValue: 2475,
          totalAmount: 2775,
        };

        quotesRepositoryMock.createQuoteVersion.mockResolvedValueOnce({
          ...counteredQuote,
          status: "DRAFT",
          currentVersionNumber: 2,
          versions: [v1Version, v2Version],
          counterOffers: [counterOffer],
        });

        const res = await service.reviseCounter(traderUserId, quoteId, {
          commercialBreakdown: {
            ...sampleBreakdown,
            productValue: 2475,
          },
        });

        expect(res.status).toBe("DRAFT");
        expect(res.currentVersionNumber).toBe(2);
        expect(res.currentVersion?.productValue).toBe(2475);
        expect(res.versions.find((v) => v.versionNumber === 1)?.productValue).toBe(2550);
        expect(res.counterOffers[0].proposedProductValue).toBe(2400);
        expect(quotesRepositoryMock.createQuoteVersion).toHaveBeenCalledWith(
          quoteId,
          2,
          expect.objectContaining({
            breakdown: expect.objectContaining({
              productValue: 2475,
            }),
          }),
        );
      });

      it("rejects reviseCounter if quote is not in COUNTERED status", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
        });

        await expect(
          service.reviseCounter(traderUserId, quoteId, {
            commercialBreakdown: sampleBreakdown,
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe("buyer inbox & decisions", () => {
      it("getBuyerQuotes returns quotes for the buyer organisation", async () => {
        quotesRepositoryMock.findQuotesByBuyer.mockResolvedValueOnce([
          {
            ...mockQuoteRecord,
            status: "SENT",
          },
        ]);

        const res = await service.getBuyerQuotes(buyerUserId);
        expect(res).toHaveLength(1);
        expect(res[0].buyerOrganisationId).toBe("org-buyer");
      });

      it("getBuyerQuoteById returns detail if matching buyer organisation", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
        });

        const res = await service.getBuyerQuoteById(buyerUserId, quoteId);
        expect(res.id).toBe(quoteId);
        expect(res.buyerOrganisationId).toBe("org-buyer");
      });

      it("getBuyerQuoteById hides DRAFT quotes from Buyer with 404", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "DRAFT",
        });

        await expect(service.getBuyerQuoteById(buyerUserId, quoteId)).rejects.toThrow(
          NotFoundException,
        );
      });

      it("getBuyerQuoteById rejects other buyer organisation with 404", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          buyerOrganisationId: "other-buyer-org",
          status: "SENT",
        });

        await expect(service.getBuyerQuoteById(buyerUserId, quoteId)).rejects.toThrow(
          NotFoundException,
        );
      });

      it("A: acceptQuoteByBuyer atomically transitions SENT to ACCEPTED, binds sentVersionNumber, creates Trade, and appends audit events", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
          sentVersionNumber: 1,
          sentAt: new Date("2026-09-16T12:00:00Z"),
        });

        const res = await service.acceptQuoteByBuyer(buyerUserId, quoteId);
        expect(res.status).toBe("ACCEPTED");
        expect(res.trade).toBeDefined();
        expect(res.trade?.tradeNumber).toMatch(/^TRD-/);
        expect(quotesRepositoryMock.acceptQuote).toHaveBeenCalledWith(
          quoteId,
          buyerUserId,
          1,
          expect.objectContaining({
            tradeNumber: expect.stringMatching(/^TRD-/),
            acceptedTotalAmount: 13350,
            currency: "EUR",
          }),
          expect.any(Function),
        );
        expect(auditEventWriterMock.append).toHaveBeenCalledWith(
          expect.objectContaining({
            eventType: "quote.accepted",
            metadata: expect.objectContaining({ status: "ACCEPTED", versionNumber: "1" }),
          }),
          expect.anything(),
        );
        expect(auditEventWriterMock.append).toHaveBeenCalledWith(
          expect.objectContaining({
            eventType: "trade.created",
            metadata: expect.objectContaining({ acceptedVersionNumber: "1" }),
          }),
          expect.anything(),
        );
      });

      it("B: audit write failure inside transaction causes entire acceptance and trade creation to roll back", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
          sentVersionNumber: 1,
          sentAt: new Date("2026-09-16T12:00:00Z"),
        });

        // Simulate atomic action failure inside the transaction
        quotesRepositoryMock.acceptQuote.mockImplementationOnce(
          async (id, userId, version, tradeData, onAtomicActions) => {
            if (onAtomicActions && tradeData) {
              // Simulate audit write failure inside tx
              throw new Error("Simulated database audit write failure");
            }
            return mockQuoteRecord;
          },
        );

        await expect(service.acceptQuoteByBuyer(buyerUserId, quoteId)).rejects.toThrow(
          "Simulated database audit write failure",
        );
      });

      it("C: Trade creation failure causes transaction rollback and no success audit events persisted", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
          sentVersionNumber: 1,
          sentAt: new Date("2026-09-16T12:00:00Z"),
        });

        quotesRepositoryMock.acceptQuote.mockImplementationOnce(async () => {
          throw new Error("Simulated database constraint failure during Trade creation");
        });

        await expect(service.acceptQuoteByBuyer(buyerUserId, quoteId)).rejects.toThrow(
          "Simulated database constraint failure during Trade creation",
        );
      });

      it("D: concurrent / duplicate acceptance creates no duplicate Trade and no duplicate audits", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
          sentVersionNumber: 1,
          sentAt: new Date("2026-09-16T12:00:00Z"),
        });

        (auditEventWriterMock.append as jest.Mock).mockClear();

        // Simulate repository detecting concurrent acceptance: isFirstAcceptance = false
        quotesRepositoryMock.acceptQuote.mockImplementationOnce(
          async (id, userId, version, tradeData, onAtomicActions) => {
            if (onAtomicActions && tradeData) {
              await onAtomicActions({} as unknown as AuditEventDatabaseClient, {
                trade: { id: "trd-existing", tradeNumber: "TRD-20260917-EXIST" },
                isFirstAcceptance: false, // duplicate/concurrent call
              });
            }
            return {
              ...mockQuoteRecord,
              status: "ACCEPTED",
              acceptedVersionNumber: 1,
              trade: {
                id: "trd-existing",
                tradeNumber: "TRD-20260917-EXIST",
                quoteId: id,
                acceptedQuoteVersionNumber: 1,
                currency: "EUR",
                acceptedTotalAmount: 13350,
                acceptedAt: new Date(),
                createdAt: new Date(),
              },
            };
          },
        );

        const res = await service.acceptQuoteByBuyer(buyerUserId, quoteId);
        expect(res.status).toBe("ACCEPTED");
        // Must NOT append quote.accepted or trade.created when isFirstAcceptance is false
        expect(auditEventWriterMock.append).not.toHaveBeenCalledWith(
          expect.objectContaining({ eventType: "quote.accepted" }),
          expect.anything(),
        );
        expect(auditEventWriterMock.append).not.toHaveBeenCalledWith(
          expect.objectContaining({ eventType: "trade.created" }),
          expect.anything(),
        );
      });

      it("acceptQuoteByBuyer rejects if quote is not SENT", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "INTERNAL_REVIEW",
        });

        await expect(service.acceptQuoteByBuyer(buyerUserId, quoteId)).rejects.toThrow(
          BadRequestException,
        );
      });

      it("rejectQuoteByBuyer transitions SENT to REJECTED and records reason", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
          sentVersionNumber: 1,
          sentAt: new Date("2026-09-16T12:00:00Z"),
        });

        const res = await service.rejectQuoteByBuyer(buyerUserId, quoteId, {
          rejectionReason: "Price exceeds budget",
        });

        expect(res.status).toBe("REJECTED");
        expect(quotesRepositoryMock.rejectQuote).toHaveBeenCalledWith(
          quoteId,
          buyerUserId,
          "Price exceeds budget",
        );
        expect(auditEventWriterMock.append).toHaveBeenCalledWith(
          expect.objectContaining({
            eventType: "quote.rejected",
            metadata: expect.objectContaining({ status: "REJECTED", reason: "Price exceeds budget" }),
          }),
        );
      });

      it("counterQuoteByBuyer creates counter-offer and transitions to COUNTERED without mutating version", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
          sentVersionNumber: 1,
          sentAt: new Date("2026-09-16T12:00:00Z"),
        });

        const res = await service.counterQuoteByBuyer(buyerUserId, quoteId, {
          proposedProductValue: 9500,
          buyerNote: "Requesting discount for high volume",
        });

        expect(res.status).toBe("COUNTERED");
        expect(quotesRepositoryMock.createCounterOffer).toHaveBeenCalledWith(
          expect.objectContaining({
            quoteId,
            sourceVersionNumber: 1,
            buyerNote: "Requesting discount for high volume",
          }),
        );
        expect(auditEventWriterMock.append).toHaveBeenCalledWith(
          expect.objectContaining({
            eventType: "quote.countered",
            metadata: expect.objectContaining({ status: "COUNTERED" }),
          }),
        );
      });

      it("counterQuoteByBuyer rejects empty note with 400", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
          sentVersionNumber: 1,
          sentAt: new Date("2026-09-16T12:00:00Z"),
        });

        await expect(
          service.counterQuoteByBuyer(buyerUserId, quoteId, {
            buyerNote: "",
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe("Phase 0: Negotiation Timeline & Audit History Regression", () => {
      it("preserves multiple sent events from audit events (A & B)", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
          currentVersionNumber: 2,
          sentVersionNumber: 2,
          sentAt: new Date("2026-09-17T14:00:00Z"),
          versions: [
            mockQuoteRecord.versions[0],
            { ...mockQuoteRecord.versions[0], id: "v2", versionNumber: 2, totalAmount: 11000 },
          ],
        });

        (auditEventWriterMock.findEventsByTarget as jest.Mock).mockResolvedValueOnce([
          {
            id: "ae-1",
            eventType: "quote.created",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-16T10:00:00Z"),
            metadata: { versionNumber: "1", totalAmount: "10550", currency: "EUR" },
          },
          {
            id: "ae-2",
            eventType: "quote.submitted_for_internal_review",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-16T11:00:00Z"),
            metadata: { versionNumber: "1" },
          },
          {
            id: "ae-3",
            eventType: "quote.sent",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-16T12:00:00Z"),
            metadata: { versionNumber: "1", currency: "EUR" },
          },
          {
            id: "ae-4",
            eventType: "quote.countered",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-16T13:00:00Z"),
            metadata: { versionNumber: "1" },
          },
          {
            id: "ae-5",
            eventType: "quote.version.created",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-17T09:00:00Z"),
            metadata: { versionNumber: "2", totalAmount: "11000", currency: "EUR" },
          },
          {
            id: "ae-6",
            eventType: "quote.counter.revised",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-17T09:05:00Z"),
            metadata: { versionNumber: "2" },
          },
          {
            id: "ae-7",
            eventType: "quote.submitted_for_internal_review",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-17T10:00:00Z"),
            metadata: { versionNumber: "2" },
          },
          {
            id: "ae-8",
            eventType: "quote.sent",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-17T14:00:00Z"),
            metadata: { versionNumber: "2", currency: "EUR" },
          },
        ]);

        const detail = await service.getQuoteById(traderUserId, quoteId);

        expect(detail.timeline).toHaveLength(8);
        const sentEvents = detail.timeline.filter((e) => e.type === "sent");
        expect(sentEvents).toHaveLength(2);
        expect(sentEvents[0].versionNumber).toBe(1);
        expect(sentEvents[1].versionNumber).toBe(2);
      });

      it("does NOT automatically label normal DRAFT v2 revision as counter_revised (C & D)", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "DRAFT",
          currentVersionNumber: 2,
          versions: [
            mockQuoteRecord.versions[0],
            { ...mockQuoteRecord.versions[0], id: "v2", versionNumber: 2, totalAmount: 12000 },
          ],
        });

        (auditEventWriterMock.findEventsByTarget as jest.Mock).mockResolvedValueOnce([
          {
            id: "ae-1",
            eventType: "quote.created",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-16T10:00:00Z"),
            metadata: { versionNumber: "1", totalAmount: "10550", currency: "EUR" },
          },
          {
            id: "ae-2",
            eventType: "quote.submitted_for_internal_review",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-16T11:00:00Z"),
            metadata: { versionNumber: "1" },
          },
          {
            id: "ae-3",
            eventType: "quote.returned_to_draft",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-16T11:30:00Z"),
            metadata: { versionNumber: "1" },
          },
          {
            id: "ae-4",
            eventType: "quote.version.created",
            targetType: "quote",
            targetId: quoteId,
            occurredAt: new Date("2026-09-16T12:00:00Z"),
            metadata: { versionNumber: "2", totalAmount: "12000", currency: "EUR" },
          },
        ]);

        const detail = await service.getQuoteById(traderUserId, quoteId);

        expect(detail.timeline).toHaveLength(4);
        expect(detail.timeline[1].type).toBe("submitted_internal_review");
        expect(detail.timeline[2].type).toBe("returned_to_draft");
        expect(detail.timeline[3].type).toBe("version_created");
        expect(detail.timeline.some((e) => e.type === "counter_revised")).toBe(false);
      });

      it("accept binds to sentVersionNumber and validates expiration of sent QuoteVersion (E & G)", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
          sentVersionNumber: 1,
          versions: [
            {
              ...mockQuoteRecord.versions[0],
              versionNumber: 1,
              validUntil: new Date("2020-01-01T00:00:00Z"),
            },
          ],
        });

        await expect(
          service.acceptQuoteByBuyer(buyerUserId, quoteId),
        ).rejects.toThrow(BadRequestException);
      });

      it("counter binds to sentVersionNumber (F)", async () => {
        quotesRepositoryMock.findQuoteById.mockResolvedValueOnce({
          ...mockQuoteRecord,
          status: "SENT",
          sentVersionNumber: 1,
          currentVersionNumber: 2,
        });

        await service.counterQuoteByBuyer(buyerUserId, quoteId, {
          buyerNote: "Countering proposal",
        });

        expect(quotesRepositoryMock.createCounterOffer).toHaveBeenCalledWith(
          expect.objectContaining({
            sourceVersionNumber: 1,
          }),
        );
      });
    });
  });

});
