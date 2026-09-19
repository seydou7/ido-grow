import { ConflictException } from "@nestjs/common";
import { MatchingService } from "./matching.service";
import { TraderCockpitController } from "./trader-cockpit.controller";
import type { MatchingRepository } from "./matching.repository";
import type { BuyOrdersRepository } from "../buy-orders/buy-orders.repository";
import type { OrganisationsRepository } from "../organisations/organisations.repository";
import type { AuditEventWriter } from "../audit";
import type { AuthenticationService } from "../authentication/authentication.service";
import type { PrismaService } from "../database";
import { AuthenticationProblem } from "../authentication/authentication-problem";

type MockMatch = {
  id: string;
  buyOrderId: string;
  listingId: string;
  buyerOrganisationId?: string | null;
  supplierOrganisationId?: string | null;
  createdByUserId?: string | null;
  status: string;
  traderNotes?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

describe("Integrated Sprint 05 Trader Journey", () => {
  let service: MatchingService;
  let controller: TraderCockpitController;
  let prismaMock: {
    organisation: { count: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
    listing: { count: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
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

  const buyerOrgId = "buyer-org-1";
  const supplierOrgId = "supplier-org-1";
  const buyOrderId = "bo-100";
  const listingIdA = "lst-201";
  const listingIdB = "lst-202";

  const now = new Date("2026-09-16T12:00:00.000Z");

  // In-memory state simulating database across the journey
  let activeMatches: MockMatch[] = [];

  beforeEach(() => {
    activeMatches = [];

    matchingRepositoryMock = {
      findApprovedMatchForBuyOrder: jest.fn().mockImplementation((boId: string) => {
        return Promise.resolve(activeMatches.find((m) => m.buyOrderId === boId && m.status === "APPROVED") || null);
      }),
      findMatchByBuyOrderAndListing: jest.fn().mockImplementation((boId: string, lstId: string) => {
        return Promise.resolve(activeMatches.find((m) => m.buyOrderId === boId && m.listingId === lstId) || null);
      }),
      createMatch: jest.fn().mockImplementation((data: Record<string, unknown>) => {
        const match = {
          id: `match-${activeMatches.length + 1}`,
          ...data,
          status: "DRAFT",
          approvedAt: null,
          createdAt: now,
          updatedAt: now,
        };
        activeMatches.push(match as unknown as MockMatch);
        return Promise.resolve(match);
      }),
      updateMatchStatus: jest.fn().mockImplementation((id: string, status: string, approvedAt: Date | null, notes?: string) => {
        const match = activeMatches.find((m) => m.id === id);
        if (match) {
          match.status = status;
          match.approvedAt = approvedAt;
          if (notes !== undefined) match.traderNotes = notes;
          match.updatedAt = now;
        }
        return Promise.resolve(match);
      }),
      findMatchById: jest.fn().mockImplementation((id: string) => {
        return Promise.resolve(activeMatches.find((m) => m.id === id) || null);
      }),
      findMatchesForBuyOrder: jest.fn().mockImplementation((boId: string) => {
        return Promise.resolve(activeMatches.filter((m) => m.buyOrderId === boId));
      }),
    } as unknown as jest.Mocked<MatchingRepository>;

    buyOrdersRepositoryMock = {
      findBuyOrderById: jest.fn().mockImplementation((id: string) => {
        if (id === buyOrderId) {
          return Promise.resolve({
            id: buyOrderId,
            buyerOrganisationId: buyerOrgId,
            buyerOrganisation: { id: buyerOrgId, name: "EcoTextile BV", country: "NL" },
            materialType: "HEMP",
            productForm: "FIBRE_TECHNICAL",
            quantity: 100,
            quantityUnit: "TONNES",
            deliveryCountry: "NL",
            deliveryDestination: "Rotterdam",
            requestedDeliveryDate: now,
            targetPriceAmount: 1450,
            currency: "EUR",
            targetPriceUnit: "PER_TONNE",
            acceptableOriginCountries: "FR,NL",
            qualityRequirements: null,
            packagingRequirements: null,
            certificationRequirements: null,
            transportPreferences: null,
            paymentTerms: null,
            status: "OPEN",
          });
        }
        return Promise.resolve(null);
      }),
    } as unknown as jest.Mocked<BuyOrdersRepository>;

    organisationsRepositoryMock = {
      findMembershipsForUser: jest.fn().mockResolvedValue([
        {
          id: "m-trader",
          userId: traderUserId,
          organisationId: "org-trader",
          organisation: { organisationType: "TRADER" },
        },
      ]),
      findOrganisationById: jest.fn().mockResolvedValue({
        id: supplierOrgId,
        organisationType: "SUPPLIER",
      }),
    } as unknown as jest.Mocked<OrganisationsRepository>;

    auditEventWriterMock = {
      append: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditEventWriter>;

    authenticationServiceMock = {
      resolveIdentity: jest.fn().mockImplementation((token: string | null) => {
        if (!token) throw new AuthenticationProblem(401, "AUTH_REQ", "Auth", "Required");
        return Promise.resolve({ userId: traderUserId, email: "trader@idogrow.com" });
      }),
    } as unknown as jest.Mocked<AuthenticationService>;

    prismaMock = {
      organisation: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockImplementation((args: { where?: { organisationType?: string; status?: string } }) => {
          if (args?.where?.organisationType === "BUYER") {
            return Promise.resolve([
              {
                id: buyerOrgId,
                name: "EcoTextile BV",
                legalName: "EcoTextile BV",
                country: "NL",
                city: "Rotterdam",
                verificationStatus: "VERIFIED",
                createdAt: now,
                buyOrders: [{ id: buyOrderId, status: "OPEN", createdAt: now }],
                buyerMatches: activeMatches.filter((m) => m.status === "APPROVED"),
              },
            ]);
          }
          if (args?.where?.organisationType === "SUPPLIER") {
            return Promise.resolve([
              {
                id: supplierOrgId,
                name: "Normandie Chanvre",
                legalName: "Normandie Chanvre SAS",
                country: "FR",
                city: "Rouen",
                verificationStatus: "VERIFIED",
                createdAt: now,
                updatedAt: now,
                _count: { sites: 1 },
                listings: [{ status: "PUBLISHED" }],
              },
            ]);
          }
          return Promise.resolve([]);
        }),
        findUnique: jest.fn().mockImplementation((args: { where?: { id?: string } }) => {
          if (args?.where?.id === supplierOrgId) {
            return Promise.resolve({
              id: supplierOrgId,
              name: "Normandie Chanvre",
              legalName: "Normandie Chanvre SAS",
              organisationType: "SUPPLIER",
              verificationStatus: "VERIFIED",
              country: "FR",
              sites: [],
              listings: [{ id: listingIdA, title: "Normandie Technical Hemp Lot A", status: "PUBLISHED", createdAt: now }],
              complianceDocuments: [],
              createdAt: now,
              updatedAt: now,
            });
          }
          return Promise.resolve(null);
        }),
      },
      listing: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockImplementation((args: { where?: { status?: string } }) => {
          if (args?.where?.status === "DRAFT") return Promise.resolve([]);
          return Promise.resolve([
          {
            id: listingIdA,
            organisationId: supplierOrgId,
            organisation: { id: supplierOrgId, name: "Normandie Chanvre", country: "FR", verificationStatus: "VERIFIED" },
            title: "Normandie Technical Hemp Lot A",
            materialType: "HEMP",
            productForm: "FIBRE_TECHNICAL",
            quantity: 120,
            quantityUnit: "TONNES",
            priceAmount: 1400,
            currency: "EUR",
            priceUnit: "PER_TONNE",
            originCountry: "FR",
            status: "PUBLISHED",
          },
          {
            id: listingIdB,
            organisationId: "supplier-org-2",
            organisation: { id: "supplier-org-2", name: "Flandres Fibres", country: "BE", verificationStatus: "VERIFIED" },
            title: "Belgian Technical Hemp Lot B",
            materialType: "HEMP",
            productForm: "FIBRE_TECHNICAL",
            quantity: 100,
            quantityUnit: "TONNES",
            priceAmount: 1480,
            currency: "EUR",
            priceUnit: "PER_TONNE",
            originCountry: "BE",
            status: "PUBLISHED",
          },
        ]);
        }),
        findUnique: jest.fn().mockImplementation((args: { where?: { id?: string } }) => {
          if (args?.where?.id === listingIdA) {
            return Promise.resolve({
              id: listingIdA,
              organisationId: supplierOrgId,
              organisation: { id: supplierOrgId, name: "Normandie Chanvre" },
              status: "PUBLISHED",
            });
          }
          if (args?.where?.id === listingIdB) {
            return Promise.resolve({
              id: listingIdB,
              organisationId: "supplier-org-2",
              organisation: { id: "supplier-org-2", name: "Flandres Fibres" },
              status: "PUBLISHED",
            });
          }
          return Promise.resolve(null);
        }),
      },
      buyOrder: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockImplementation(() => {
          const approved = activeMatches.find((m) => m.buyOrderId === buyOrderId && m.status === "APPROVED");
          return Promise.resolve([
            {
              id: buyOrderId,
              buyerOrganisationId: buyerOrgId,
              buyerOrganisation: { id: buyerOrgId, name: "EcoTextile BV", country: "NL" },
              materialType: "HEMP",
              productForm: "FIBRE_TECHNICAL",
              quantity: 100,
              quantityUnit: "TONNES",
              deliveryCountry: "NL",
              deliveryDestination: "Rotterdam",
              requestedDeliveryDate: now,
              status: "OPEN",
              createdAt: now,
              matches: approved ? [approved] : [],
            },
          ]);
        }),
      },
      match: {
        count: jest.fn().mockImplementation(() => {
          return Promise.resolve(activeMatches.filter((m) => m.status === "APPROVED").length);
        }),
        findMany: jest.fn().mockImplementation(() => {
          return Promise.resolve(
            activeMatches
              .filter((m) => m.status === "APPROVED")
              .map((m) => ({
                id: m.id,
                buyOrderId: m.buyOrderId,
                listingId: m.listingId,
                buyerOrganisation: { name: "EcoTextile BV" },
                supplierOrganisation: { name: "Normandie Chanvre" },
                buyOrder: { quantity: 100, quantityUnit: "TONNES", materialType: "HEMP", productForm: "FIBRE_TECHNICAL" },
                listing: { title: "Normandie Technical Hemp Lot A", materialType: "HEMP", productForm: "FIBRE_TECHNICAL" },
                status: "APPROVED",
                approvedAt: m.approvedAt,
                createdAt: m.createdAt,
                updatedAt: m.updatedAt,
              })),
          );
        }),
      },
    };

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

  it("executes the full end-to-end Trader operational journey seamlessly", async () => {
    // 1. Trader logs in and views initial Cockpit (0 approved matches)
    const initialCockpit = await controller.getTraderCockpit(traderCookie);
    expect(initialCockpit.summary.openBuyOrdersCount).toBe(1);
    expect(initialCockpit.summary.approvedMatchesCount).toBe(0);
    expect(initialCockpit.openBuyOrders[0].matchStatus).toBe("No Match");
    expect(initialCockpit.approvedMatches).toHaveLength(0);

    // 2. Trader accesses Buyers management and views buyer with open demand
    const buyersCollection = await controller.listBuyers(traderCookie);
    expect(buyersCollection.items).toHaveLength(1);
    expect(buyersCollection.items[0].openBuyOrderCount).toBe(1);
    expect(buyersCollection.items[0].approvedMatchCount).toBe(0);

    // 3. Trader navigates from Open Buyer Demand to Matching Workspace
    const workspace = await service.getMatchingWorkspace(traderUserId, buyOrderId);
    expect(workspace.buyOrder.id).toBe(buyOrderId);
    expect(workspace.candidates).toHaveLength(2);
    expect(workspace.activeApprovedMatch).toBeNull();

    // Verify candidate compatibility indicators
    const candidateA = workspace.candidates.find((c) => c.id === listingIdA);
    expect(candidateA?.compatibility.material).toBe("MATCH");
    expect(candidateA?.compatibility.productForm).toBe("MATCH");
    expect(candidateA?.compatibility.quantity).toBe("SUFFICIENT");

    // 4. Trader selects candidate A and approves it as the commercial Match
    const draftMatchA = await service.selectCandidateAsMatch(traderUserId, buyOrderId, { listingId: listingIdA });
    expect(draftMatchA.status).toBe("DRAFT");

    const matchA = await service.approveMatch(traderUserId, draftMatchA.id, {
      traderNotes: "Perfect technical fit and price under target",
    });
    expect(matchA.status).toBe("APPROVED");
    expect(matchA.listingId).toBe(listingIdA);

    // 5. Invariant check (DEC-007): Attempting to approve candidate B while A is approved -> 409 Conflict
    const draftMatchB = await service.selectCandidateAsMatch(traderUserId, buyOrderId, { listingId: listingIdB });
    await expect(
      service.approveMatch(traderUserId, draftMatchB.id, {
        traderNotes: "Attempting duplicate approval",
      }),
    ).rejects.toThrow(ConflictException);

    // 6. Trader returns to Cockpit: Approved matches is now 1, demand status is "Approved Match"
    const updatedCockpit = await controller.getTraderCockpit(traderCookie);
    expect(updatedCockpit.summary.approvedMatchesCount).toBe(1);
    expect(updatedCockpit.openBuyOrders[0].matchStatus).toBe("Approved Match");
    expect(updatedCockpit.approvedMatches).toHaveLength(1);
    expect(updatedCockpit.approvedMatches[0].nextStep).toBe("Ready for Quotation");
    expect(updatedCockpit.approvedMatches[0].supplierOrganisationName).toBe("Normandie Chanvre");

    // 7. Trader opens the matched Supplier
    const supplierDetail = await controller.getSupplierDetail(traderCookie, supplierOrgId);
    expect(supplierDetail.id).toBe(supplierOrgId);
    expect(supplierDetail.name).toBe("Normandie Chanvre");
    expect(supplierDetail.listings[0].id).toBe(listingIdA);

    // 8. Revocation workflow: Trader revokes match A
    const revokedMatch = await service.cancelMatch(traderUserId, matchA.id);
    expect(revokedMatch.status).toBe("CANCELLED");

    // 9. Now Trader can approve candidate B
    const matchB = await service.approveMatch(traderUserId, draftMatchB.id);
    expect(matchB.status).toBe("APPROVED");
    expect(matchB.listingId).toBe(listingIdB);
  });
});
