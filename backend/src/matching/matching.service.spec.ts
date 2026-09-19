import type { PrismaService } from "../database";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { MatchingService } from "./matching.service";
import type { MatchingRepository, MatchRecord } from "./matching.repository";
import type { BuyOrdersRepository } from "../buy-orders/buy-orders.repository";
import type { OrganisationsRepository } from "../organisations/organisations.repository";
import type { AuditEventWriter } from "../audit";

describe("MatchingService", () => {
  let service: MatchingService;
  let prismaMock: { listing: { findMany: jest.Mock; findUnique: jest.Mock } };
  let matchingRepositoryMock: jest.Mocked<MatchingRepository>;
  let buyOrdersRepositoryMock: jest.Mocked<BuyOrdersRepository>;
  let organisationsRepositoryMock: jest.Mocked<OrganisationsRepository>;
  let auditEventWriterMock: jest.Mocked<AuditEventWriter>;

  const traderUserId = "trader-user-1";
  const nonTraderUserId = "buyer-user-1";
  const buyOrderId = "order-123";
  const listingId = "listing-456";
  const matchId = "match-789";

  beforeEach(() => {
    prismaMock = {
      listing: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    matchingRepositoryMock = {
      findMatchesForBuyOrder: jest.fn(),
      findApprovedMatchForBuyOrder: jest.fn(),
      findMatchById: jest.fn(),
      findMatchByBuyOrderAndListing: jest.fn(),
      createMatch: jest.fn(),
      updateMatchStatus: jest.fn(),
    } as unknown as unknown as never;

    buyOrdersRepositoryMock = {
      findBuyOrderById: jest.fn(),
      findBuyOrdersForOrganisation: jest.fn(),
      findTraderDemand: jest.fn(),
      findTraderDrafts: jest.fn(),
      createBuyOrder: jest.fn(),
      updateBuyOrder: jest.fn(),
      updateStatus: jest.fn(),
      deleteBuyOrder: jest.fn(),
    } as unknown as unknown as never;

    organisationsRepositoryMock = {
      findMembershipsForUser: jest.fn().mockImplementation((userId) => {
        if (userId === traderUserId) {
          return Promise.resolve([
            {
              id: "m-1",
              userId: traderUserId,
              organisationId: "org-trader",
              organisation: { organisationType: "TRADER" },
            },
          ]);
        }
        return Promise.resolve([
          {
            id: "m-2",
            userId: nonTraderUserId,
            organisationId: "org-buyer",
            organisation: { organisationType: "BUYER" },
          },
        ]);
      }),
      findOrganisationById: jest.fn(),
    } as unknown as unknown as never;

    auditEventWriterMock = {
      append: jest.fn().mockResolvedValue(undefined),
    } as unknown as unknown as never;

    service = new MatchingService(
      prismaMock as unknown as PrismaService,
      matchingRepositoryMock,
      buyOrdersRepositoryMock,
      organisationsRepositoryMock,
      auditEventWriterMock,
    );
  });

  describe("assertTraderAccess", () => {
    it("allows user with TRADER organisation membership", async () => {
      await expect(
        service.assertTraderAccess(traderUserId),
      ).resolves.toBeUndefined();
    });

    it("throws ForbiddenException for non-trader user", async () => {
      await expect(service.assertTraderAccess(nonTraderUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getMatchingWorkspace", () => {
    it("returns workspace with candidate listings and deterministic indicators", async () => {
      buyOrdersRepositoryMock.findBuyOrderById.mockResolvedValue({
        id: buyOrderId,
        buyerOrganisationId: "org-buyer",
        buyerOrganisation: { name: "Buyer Co", country: "FR" },
        materialType: "HEMP",
        productForm: "FIBRE_TECHNICAL",
        quantity: 100,
        quantityUnit: "TONNES",
        deliveryCountry: "FR",
        deliveryDestination: "Paris",
        requestedDeliveryDate: new Date(),
        targetPriceAmount: 1500,
        currency: "EUR",
        targetPriceUnit: "PER_TONNE",
        acceptableOriginCountries: "FR,BE",
        qualityRequirements: null,
        packagingRequirements: null,
        certificationRequirements: null,
        transportPreferences: null,
        paymentTerms: null,
        status: "OPEN",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as never);

      prismaMock.listing.findMany.mockResolvedValue([
        {
          id: listingId,
          title: "French Technical Hemp Fibre",
          description: "High quality technical hemp",
          materialType: "HEMP",
          productForm: "FIBRE_TECHNICAL",
          quantity: 150,
          quantityUnit: "TONNES",
          priceAmount: 1400,
          currency: "EUR",
          priceUnit: "PER_TONNE",
          originCountry: "FR",
          harvestYear: 2026,
          status: "PUBLISHED",
          organisation: {
            id: "org-supplier",
            name: "Normandy Hemp Coop",
            country: "FR",
            verificationStatus: "VERIFIED",
          },
          site: {
            id: "site-1",
            name: "Rouen Facility",
          },
        },
      ]);

      matchingRepositoryMock.findMatchesForBuyOrder.mockResolvedValue([]);

      const result = await service.getMatchingWorkspace(
        traderUserId,
        buyOrderId,
      );

      expect(result.buyOrder.id).toBe(buyOrderId);
      expect(result.candidates).toHaveLength(1);
      expect(result.candidates[0].compatibility.material).toBe("MATCH");
      expect(result.candidates[0].compatibility.productForm).toBe("MATCH");
      expect(result.candidates[0].compatibility.quantity).toBe("SUFFICIENT");
      expect(result.activeApprovedMatch).toBeNull();
    });

    it("throws NotFoundException if buy order does not exist", async () => {
      buyOrdersRepositoryMock.findBuyOrderById.mockResolvedValue(null);

      await expect(
        service.getMatchingWorkspace(traderUserId, "non-existent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("selectCandidateAsMatch", () => {
    it("creates DRAFT match and records buyer.buy_order.match.created audit event", async () => {
      buyOrdersRepositoryMock.findBuyOrderById.mockResolvedValue({
        id: buyOrderId,
        buyerOrganisationId: "org-buyer",
        status: "OPEN",
      } as unknown as never);

      prismaMock.listing.findUnique.mockResolvedValue({
        id: listingId,
        organisationId: "org-supplier",
        status: "PUBLISHED",
      });

      matchingRepositoryMock.findMatchByBuyOrderAndListing.mockResolvedValue(null);

      const mockRecord: MatchRecord = {
        id: matchId,
        buyOrderId,
        listingId,
        buyerOrganisationId: "org-buyer",
        supplierOrganisationId: "org-supplier",
        createdByUserId: traderUserId,
        status: "DRAFT",
        traderNotes: "Candidate selection",
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      matchingRepositoryMock.createMatch.mockResolvedValue(mockRecord);

      const result = await service.selectCandidateAsMatch(
        traderUserId,
        buyOrderId,
        {
          listingId,
          traderNotes: "Candidate selection",
        },
      );

      expect(result.id).toBe(matchId);
      expect(result.status).toBe("DRAFT");
      expect(auditEventWriterMock.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.match.created",
          actor: { type: "user", userId: traderUserId },
          target: { type: "match", id: matchId },
        }),
      );
    });

    it("updates existing draft match and refreshes status/notes when selecting already drafted candidate", async () => {
      buyOrdersRepositoryMock.findBuyOrderById.mockResolvedValue({
        id: buyOrderId,
        buyerOrganisationId: "org-buyer",
        status: "OPEN",
      } as unknown as never);

      prismaMock.listing.findUnique.mockResolvedValue({
        id: listingId,
        organisationId: "org-supplier",
        status: "PUBLISHED",
      });

      const existingRecord: MatchRecord = {
        id: matchId,
        buyOrderId,
        listingId,
        buyerOrganisationId: "org-buyer",
        supplierOrganisationId: "org-supplier",
        createdByUserId: traderUserId,
        status: "DRAFT",
        traderNotes: "Initial note",
        approvedAt: null,
        createdAt: new Date("2026-09-01T10:00:00.000Z"),
        updatedAt: new Date("2026-09-01T10:00:00.000Z"),
      };

      matchingRepositoryMock.findMatchByBuyOrderAndListing.mockResolvedValue(existingRecord);

      const refreshedRecord: MatchRecord = {
        ...existingRecord,
        updatedAt: new Date("2026-09-01T11:00:00.000Z"),
      };

      matchingRepositoryMock.updateMatchStatus.mockResolvedValue(refreshedRecord);

      const result = await service.selectCandidateAsMatch(
        traderUserId,
        buyOrderId,
        {
          listingId,
        },
      );

      expect(result.id).toBe(matchId);
      expect(matchingRepositoryMock.updateMatchStatus).toHaveBeenCalledWith(
        matchId,
        "DRAFT",
        null,
        "Initial note",
      );
    });

    it("rejects candidate selection if Buy Order is not OPEN", async () => {
      buyOrdersRepositoryMock.findBuyOrderById.mockResolvedValue({
        id: buyOrderId,
        status: "DRAFT",
      } as unknown as never);

      await expect(
        service.selectCandidateAsMatch(traderUserId, buyOrderId, {
          listingId,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("approveMatch & Single Approved Invariant", () => {
    it("approves match and records buyer.buy_order.match.approved audit event", async () => {
      const draftMatch: MatchRecord = {
        id: matchId,
        buyOrderId,
        listingId,
        buyerOrganisationId: "org-buyer",
        supplierOrganisationId: "org-supplier",
        createdByUserId: traderUserId,
        status: "DRAFT",
        traderNotes: null,
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      matchingRepositoryMock.findMatchById.mockResolvedValue(draftMatch);
      buyOrdersRepositoryMock.findBuyOrderById.mockResolvedValue({
        id: buyOrderId,
        status: "OPEN",
      } as unknown as never);
      matchingRepositoryMock.findApprovedMatchForBuyOrder.mockResolvedValue(null);

      const approvedMatch: MatchRecord = {
        ...draftMatch,
        status: "APPROVED",
        approvedAt: new Date(),
      };
      matchingRepositoryMock.updateMatchStatus.mockResolvedValue(approvedMatch);

      const result = await service.approveMatch(traderUserId, matchId, {});

      expect(result.status).toBe("APPROVED");
      expect(auditEventWriterMock.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.match.approved",
          actor: { type: "user", userId: traderUserId },
          target: { type: "match", id: matchId },
        }),
      );
    });

    it("rejects approval if another match is already APPROVED for the Buy Order", async () => {
      const matchToApprove: MatchRecord = {
        id: "match-new",
        buyOrderId,
        listingId: "listing-new",
        buyerOrganisationId: "org-buyer",
        supplierOrganisationId: "org-supplier",
        createdByUserId: traderUserId,
        status: "DRAFT",
        traderNotes: null,
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingApprovedMatch: MatchRecord = {
        id: "match-existing-approved",
        buyOrderId,
        listingId: "listing-old",
        buyerOrganisationId: "org-buyer",
        supplierOrganisationId: "org-supplier",
        createdByUserId: traderUserId,
        status: "APPROVED",
        traderNotes: null,
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      matchingRepositoryMock.findMatchById.mockResolvedValue(matchToApprove);
      buyOrdersRepositoryMock.findBuyOrderById.mockResolvedValue({
        id: buyOrderId,
        status: "OPEN",
      } as unknown as never);
      matchingRepositoryMock.findApprovedMatchForBuyOrder.mockResolvedValue(
        existingApprovedMatch,
      );

      await expect(
        service.approveMatch(traderUserId, "match-new", {}),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("cancelMatch", () => {
    it("cancels approved match and records buyer.buy_order.match.cancelled audit event", async () => {
      const approvedMatch: MatchRecord = {
        id: matchId,
        buyOrderId,
        listingId,
        buyerOrganisationId: "org-buyer",
        supplierOrganisationId: "org-supplier",
        createdByUserId: traderUserId,
        status: "APPROVED",
        traderNotes: null,
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      matchingRepositoryMock.findMatchById.mockResolvedValue(approvedMatch);
      buyOrdersRepositoryMock.findBuyOrderById.mockResolvedValue({
        id: buyOrderId,
        status: "OPEN",
      } as unknown as never);

      const cancelledMatch: MatchRecord = {
        ...approvedMatch,
        status: "CANCELLED",
        approvedAt: null,
      };
      matchingRepositoryMock.updateMatchStatus.mockResolvedValue(cancelledMatch);

      const result = await service.cancelMatch(traderUserId, matchId, {
        reason: "Supplier unavailable",
      });

      expect(result.status).toBe("CANCELLED");
      expect(auditEventWriterMock.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.match.cancelled",
          actor: { type: "user", userId: traderUserId },
          target: { type: "match", id: matchId },
        }),
      );
    });
  });
});
