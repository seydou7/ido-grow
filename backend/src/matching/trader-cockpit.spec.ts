import { ForbiddenException } from "@nestjs/common";
import { AuthenticationProblem } from "../authentication/authentication-problem";
import { MatchingService } from "./matching.service";
import { TraderCockpitController } from "./trader-cockpit.controller";
import type { MatchingRepository } from "./matching.repository";
import type { BuyOrdersRepository } from "../buy-orders/buy-orders.repository";
import type { OrganisationsRepository } from "../organisations/organisations.repository";
import type { AuditEventWriter } from "../audit";
import type { AuthenticationService } from "../authentication/authentication.service";
import type { PrismaService } from "../database";

describe("Trader Cockpit Read Model & Controller", () => {
  let service: MatchingService;
  let controller: TraderCockpitController;
  let prismaMock: {
    organisation: { count: jest.Mock; findMany: jest.Mock };
    listing: { count: jest.Mock; findMany: jest.Mock };
    buyOrder: { count: jest.Mock; findMany: jest.Mock };
    match: { count: jest.Mock; findMany: jest.Mock };
  };
  let matchingRepositoryMock: jest.Mocked<MatchingRepository>;
  let buyOrdersRepositoryMock: jest.Mocked<BuyOrdersRepository>;
  let organisationsRepositoryMock: jest.Mocked<OrganisationsRepository>;
  let auditEventWriterMock: jest.Mocked<AuditEventWriter>;
  let authenticationServiceMock: jest.Mocked<AuthenticationService>;

  const traderUserId = "user-trader-uuid";
  const traderToken = "T".repeat(43);
  const traderCookie = `ido_grow_session=${traderToken}`;
  const buyerUserId = "user-buyer-uuid";
  const supplierUserId = "user-supplier-uuid";

  beforeEach(() => {
    prismaMock = {
      organisation: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      listing: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      buyOrder: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      match: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    matchingRepositoryMock = {} as unknown as jest.Mocked<MatchingRepository>;
    buyOrdersRepositoryMock = {} as unknown as jest.Mocked<BuyOrdersRepository>;
    organisationsRepositoryMock = {
      findMembershipsForUser: jest.fn().mockImplementation((userId: string) => {
        if (userId === traderUserId) {
          return Promise.resolve([
            {
              id: "m-trader",
              userId: traderUserId,
              organisationId: "org-trader",
              organisation: { organisationType: "TRADER" },
            },
          ]);
        }
        if (userId === buyerUserId) {
          return Promise.resolve([
            {
              id: "m-buyer",
              userId: buyerUserId,
              organisationId: "org-buyer",
              organisation: { organisationType: "BUYER" },
            },
          ]);
        }
        if (userId === supplierUserId) {
          return Promise.resolve([
            {
              id: "m-supplier",
              userId: supplierUserId,
              organisationId: "org-supplier",
              organisation: { organisationType: "SUPPLIER" },
            },
          ]);
        }
        return Promise.resolve([]);
      }),
    } as unknown as jest.Mocked<OrganisationsRepository>;

    auditEventWriterMock = {
      append: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditEventWriter>;

    authenticationServiceMock = {
      resolveIdentity: jest.fn().mockImplementation((rawToken: string | null) => {
        if (!rawToken || rawToken === "invalid-token") {
          throw new AuthenticationProblem(
            401,
            "AUTHENTICATION_REQUIRED",
            "Authentication required",
            "A valid application session is required.",
          );
        }
        return Promise.resolve({
          userId: traderUserId,
          email: "trader@idogrow.com",
        });
      }),
    } as unknown as jest.Mocked<AuthenticationService>;

    service = new MatchingService(
      prismaMock as unknown as PrismaService,
      matchingRepositoryMock,
      buyOrdersRepositoryMock,
      organisationsRepositoryMock,
      auditEventWriterMock,
    );

    controller = new TraderCockpitController(
      authenticationServiceMock,
      service,
    );
  });

  describe("Security & Role Guard", () => {
    it("allows Trader access (200 equivalent)", async () => {
      prismaMock.organisation.count.mockResolvedValue(0);
      prismaMock.listing.count.mockResolvedValue(0);
      prismaMock.buyOrder.count.mockResolvedValue(0);
      prismaMock.match.count.mockResolvedValue(0);
      prismaMock.buyOrder.findMany.mockResolvedValue([]);
      prismaMock.match.findMany.mockResolvedValue([]);
      prismaMock.organisation.findMany.mockResolvedValue([]);
      prismaMock.listing.findMany.mockResolvedValue([]);

      const result = await service.getTraderCockpit(traderUserId);
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it("rejects Buyer with 403 ForbiddenException", async () => {
      await expect(service.getTraderCockpit(buyerUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("rejects Supplier with 403 ForbiddenException", async () => {
      await expect(service.getTraderCockpit(supplierUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("rejects user with no memberships with 403 ForbiddenException", async () => {
      await expect(
        service.getTraderCockpit("unknown-user-id"),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("Real Read Model & Operational Queue", () => {
    const now = new Date("2026-09-16T12:00:00.000Z");
    const olderDate = new Date("2026-09-10T08:00:00.000Z");
    const newerDate = new Date("2026-09-15T10:00:00.000Z");

    beforeEach(() => {
      prismaMock.organisation.count.mockResolvedValue(3);
      prismaMock.listing.count.mockImplementation((args: { where?: { status?: string } }) => {
        if (args?.where?.status === "DRAFT") return Promise.resolve(2);
        if (args?.where?.status === "PUBLISHED") return Promise.resolve(5);
        return Promise.resolve(0);
      });
      prismaMock.buyOrder.count.mockResolvedValue(4);
      prismaMock.match.count.mockResolvedValue(1);

      prismaMock.buyOrder.findMany.mockResolvedValue([
        {
          id: "bo-1-unmatched",
          buyerOrganisationId: "buyer-org-1",
          buyerOrganisation: { id: "buyer-org-1", name: "EcoTextile Corp", country: "France" },
          materialType: "HEMP",
          productForm: "FIBRE_TECHNICAL",
          quantity: 50,
          quantityUnit: "TONNES",
          deliveryCountry: "France",
          deliveryDestination: "Rouen Hub",
          requestedDeliveryDate: now,
          status: "OPEN",
          createdAt: olderDate,
          matches: [],
        },
        {
          id: "bo-2-draft-matched",
          buyerOrganisationId: "buyer-org-2",
          buyerOrganisation: { id: "buyer-org-2", name: "Nordic Composites", country: "Netherlands" },
          materialType: "FLAX",
          productForm: "STRAW_RETTED",
          quantity: 25,
          quantityUnit: "TONNES",
          deliveryCountry: "Netherlands",
          deliveryDestination: "Rotterdam Port",
          requestedDeliveryDate: null,
          status: "OPEN",
          createdAt: newerDate,
          matches: [
            {
              id: "match-draft-1",
              status: "DRAFT",
              listingId: "listing-1",
              createdAt: newerDate,
              approvedAt: null,
            },
          ],
        },
        {
          id: "bo-3-approved-matched",
          buyerOrganisationId: "buyer-org-1",
          buyerOrganisation: { id: "buyer-org-1", name: "EcoTextile Corp", country: "France" },
          materialType: "HEMP",
          productForm: "STRAW_RETTED",
          quantity: 100,
          quantityUnit: "TONNES",
          deliveryCountry: "France",
          deliveryDestination: "Lyon",
          requestedDeliveryDate: null,
          status: "OPEN",
          createdAt: olderDate,
          matches: [
            {
              id: "match-approved-1",
              status: "APPROVED",
              listingId: "listing-2",
              createdAt: olderDate,
              approvedAt: now,
            },
          ],
        },
      ]);

      prismaMock.match.findMany.mockResolvedValue([
        {
          id: "match-approved-1",
          buyOrderId: "bo-3-approved-matched",
          listingId: "listing-2",
          buyerOrganisationId: "buyer-org-1",
          buyerOrganisation: { id: "buyer-org-1", name: "EcoTextile Corp" },
          supplierOrganisationId: "supplier-org-1",
          supplierOrganisation: { id: "supplier-org-1", name: "Normandie Chanvre" },
          buyOrder: {
            id: "bo-3-approved-matched",
            quantity: 100,
            quantityUnit: "TONNES",
            materialType: "HEMP",
            productForm: "STRAW_RETTED",
            currency: "EUR",
          },
          listing: {
            id: "listing-2",
            title: "Normandie Retted Hemp Lot 1",
            materialType: "HEMP",
            productForm: "STRAW_RETTED",
          },
          status: "APPROVED",
          approvedAt: now,
          createdAt: olderDate,
          updatedAt: now,
        },
      ]);

      prismaMock.organisation.findMany.mockResolvedValue([
        {
          id: "supplier-pending-1",
          name: "Belgian Flax Farmers",
          verificationStatus: "UNDER_REVIEW",
          createdAt: olderDate,
          updatedAt: now,
        },
      ]);

      prismaMock.listing.findMany.mockResolvedValue([
        {
          id: "listing-draft-1",
          title: "Early Harvest Jute Test",
          materialType: "JUTE",
          quantity: 30,
          quantityUnit: "TONNES",
          organisation: { id: "supplier-org-2", name: "Iberian Fibres" },
          createdAt: newerDate,
          updatedAt: newerDate,
        },
      ]);
    });

    it("derives exact summary counts from real entity queries", async () => {
      const res = await service.getTraderCockpit(traderUserId);

      expect(res.summary).toEqual({
        supplierOnboardingCount: 3,
        pendingListingsCount: 2,
        publishedListingsCount: 5,
        openBuyOrdersCount: 4,
        approvedMatchesCount: 1,
      });
    });

    it("maps open BuyOrders with precise matchStatus and activeMatchId", async () => {
      const res = await service.getTraderCockpit(traderUserId);

      expect(res.openBuyOrders).toHaveLength(3);

      const unmatched = res.openBuyOrders.find((b) => b.id === "bo-1-unmatched");
      expect(unmatched).toBeDefined();
      expect(unmatched?.matchStatus).toBe("No Match");
      expect(unmatched?.activeMatchId).toBeNull();
      expect(unmatched?.buyerOrganisationName).toBe("EcoTextile Corp");

      const draftMatched = res.openBuyOrders.find((b) => b.id === "bo-2-draft-matched");
      expect(draftMatched).toBeDefined();
      expect(draftMatched?.matchStatus).toBe("Draft Match");
      expect(draftMatched?.activeMatchId).toBe("match-draft-1");

      const approvedMatched = res.openBuyOrders.find((b) => b.id === "bo-3-approved-matched");
      expect(approvedMatched).toBeDefined();
      expect(approvedMatched?.matchStatus).toBe("Approved Match");
      expect(approvedMatched?.activeMatchId).toBe("match-approved-1");
    });

    it("maps approved matches with Ready for Quotation passive badge", async () => {
      const res = await service.getTraderCockpit(traderUserId);

      expect(res.approvedMatches).toHaveLength(1);
      const match = res.approvedMatches[0];
      expect(match.id).toBe("match-approved-1");
      expect(match.buyerOrganisationName).toBe("EcoTextile Corp");
      expect(match.supplierOrganisationName).toBe("Normandie Chanvre");
      expect(match.status).toBe("APPROVED");
      expect(match.nextStep).toBe("Ready for Quotation");
    });

    it("assembles operational queue with deterministic urgency and date sorting", async () => {
      const res = await service.getTraderCockpit(traderUserId);

      expect(res.operationalQueue).toHaveLength(5);

      expect(res.operationalQueue[0].category).toBe("buyer_demand");
      expect(res.operationalQueue[0].currentStatus).toBe("OPEN");
      expect(res.operationalQueue[0].nextActionLabel).toBe("Find Match");

      expect(res.operationalQueue[1].category).toBe("buyer_demand");
      expect(res.operationalQueue[1].currentStatus).toBe("DRAFT_MATCH");
      expect(res.operationalQueue[1].nextActionLabel).toBe("Review Match");

      expect(res.operationalQueue[2].category).toBe("supplier_onboarding");
      expect(res.operationalQueue[2].referenceId).toBe("supplier-pending-1");

      expect(res.operationalQueue[3].category).toBe("listing_review");
      expect(res.operationalQueue[3].referenceId).toBe("listing-draft-1");

      expect(res.operationalQueue[4].category).toBe("approved_match");
      expect(res.operationalQueue[4].referenceId).toBe("match-approved-1");
    });

    it("controller resolves identity and returns cockpit response (200)", async () => {
      const response = await controller.getTraderCockpit(traderCookie);

      expect(authenticationServiceMock.resolveIdentity).toHaveBeenCalled();
      expect(response.summary.openBuyOrdersCount).toBe(4);
    });

    it("controller rejects unauthenticated request with 401 Unauthorized", async () => {
      await expect(controller.getTraderCockpit(undefined)).rejects.toThrow(
        AuthenticationProblem,
      );
      try {
        await controller.getTraderCockpit(undefined);
      } catch (err: unknown) {
        expect((err as AuthenticationProblem).getStatus()).toBe(401);
      }
    });
  });
});
