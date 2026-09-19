import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { AuthenticationProblem } from "../authentication/authentication-problem";
import { MatchingService } from "./matching.service";
import { TraderCockpitController } from "./trader-cockpit.controller";
import type { MatchingRepository } from "./matching.repository";
import type { BuyOrdersRepository } from "../buy-orders/buy-orders.repository";
import type { OrganisationsRepository } from "../organisations/organisations.repository";
import type { AuditEventWriter } from "../audit";
import type { AuthenticationService } from "../authentication/authentication.service";
import type { PrismaService } from "../database";

describe("Trader Supplier & Buyer Management Read Models & Controller", () => {
  let service: MatchingService;
  let controller: TraderCockpitController;
  let prismaMock: {
    organisation: { count: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
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
  const buyerUserId = "user-buyer-uuid";
  const supplierUserId = "user-supplier-uuid";
  const traderToken = "T".repeat(43);
  const buyerToken = "B".repeat(43);
  const supplierToken = "S".repeat(43);
  const traderCookie = `ido_grow_session=${traderToken}`;
  const buyerCookie = `ido_grow_session=${buyerToken}`;
  const supplierCookie = `ido_grow_session=${supplierToken}`;

  beforeEach(() => {
    prismaMock = {
      organisation: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
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
        if (!rawToken) {
          throw new AuthenticationProblem(
            401,
            "AUTHENTICATION_REQUIRED",
            "Authentication required",
            "A valid application session is required.",
          );
        }
        if (rawToken === buyerToken) {
          return Promise.resolve({
            userId: buyerUserId,
            email: "buyer@idogrow.com",
          });
        }
        if (rawToken === supplierToken) {
          return Promise.resolve({
            userId: supplierUserId,
            email: "supplier@idogrow.com",
          });
        }
        if (rawToken === traderToken) {
          return Promise.resolve({
            userId: traderUserId,
            email: "trader@idogrow.com",
          });
        }
        throw new AuthenticationProblem(
          401,
          "AUTHENTICATION_REQUIRED",
          "Authentication required",
          "A valid application session is required.",
        );
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

  describe("Security Gateways (Role 403 & Unauthenticated 401)", () => {
    it("denies unauthenticated requests at controller layer with 401 Unauthorized", async () => {
      // No cookie header
      await expect(controller.getTraderCockpit(undefined)).rejects.toThrow(
        AuthenticationProblem,
      );
      await expect(controller.listSuppliers(undefined)).rejects.toThrow(
        AuthenticationProblem,
      );
      await expect(controller.getSupplierDetail(undefined, "sup-1")).rejects.toThrow(
        AuthenticationProblem,
      );
      await expect(controller.listBuyers(undefined)).rejects.toThrow(
        AuthenticationProblem,
      );
      await expect(controller.getBuyerDetail(undefined, "buy-1")).rejects.toThrow(
        AuthenticationProblem,
      );

      // Invalid session cookie
      await expect(
        controller.getTraderCockpit("idogrow-session=invalid-token"),
      ).rejects.toThrow(AuthenticationProblem);

      // Verify status code is exactly 401
      try {
        await controller.getTraderCockpit(undefined);
      } catch (err: unknown) {
        expect((err as AuthenticationProblem).getStatus()).toBe(401);
      }
    });

    it("denies Buyer role access to trader management with 403 Forbidden", async () => {
      await expect(
        controller.listSuppliers(buyerCookie),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.getSupplierDetail(buyerCookie, "sup-1"),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.getTraderCockpit(buyerCookie),
      ).rejects.toThrow(ForbiddenException);
      await expect(service.listSuppliersForTrader(buyerUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("denies Supplier role access to trader management with 403 Forbidden", async () => {
      await expect(
        controller.listBuyers(supplierCookie),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.getBuyerDetail(supplierCookie, "buy-1"),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.getTraderCockpit(supplierCookie),
      ).rejects.toThrow(ForbiddenException);
      await expect(service.listBuyersForTrader(supplierUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("grants authenticated Trader role full access (200)", async () => {
      prismaMock.organisation.findMany.mockResolvedValue([]);
      const supRes = await controller.listSuppliers(traderCookie);
      expect(supRes.total).toBe(0);

      const buyRes = await controller.listBuyers(traderCookie);
      expect(buyRes.total).toBe(0);
    });
  });

  describe("Supplier Management Read Model", () => {
    const timestamp = new Date("2026-09-01T10:00:00.000Z");

    it("lists real suppliers with derived listing and site counts", async () => {
      prismaMock.organisation.findMany.mockResolvedValue([
        {
          id: "sup-1",
          name: "Normandie Chanvre",
          legalName: "Normandie Chanvre SAS",
          country: "France",
          city: "Rouen",
          verificationStatus: "VERIFIED",
          createdAt: timestamp,
          _count: { sites: 2 },
          listings: [{ status: "PUBLISHED" }, { status: "DRAFT" }, { status: "PUBLISHED" }],
        },
      ]);

      const res = await service.listSuppliersForTrader(traderUserId, {
        search: "Normandie",
      });

      expect(res.items).toHaveLength(1);
      const supplier = res.items[0];
      expect(supplier.id).toBe("sup-1");
      expect(supplier.name).toBe("Normandie Chanvre");
      expect(supplier.siteCount).toBe(2);
      expect(supplier.publishedListingCount).toBe(2);
      expect(supplier.draftListingCount).toBe(1);

      // Verify no sensitive fields leaked
      expect((supplier as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
      expect((supplier as unknown as Record<string, unknown>).tokenHash).toBeUndefined();
    });

    it("retrieves supplier detail with sites, listings, and compliance documents", async () => {
      prismaMock.organisation.findUnique.mockResolvedValue({
        id: "sup-1",
        name: "Normandie Chanvre",
        legalName: "Normandie Chanvre SAS",
        businessType: "COOPERATIVE",
        registrationNumber: "FR12345678",
        vatNumber: "FR9912345678",
        address: "Route de la Ferme",
        city: "Rouen",
        postalCode: "76000",
        country: "France",
        contactName: "Jean Dupont",
        contactEmail: "jean@chanvre.fr",
        contactPhone: "+33235000000",
        verificationStatus: "VERIFIED",
        organisationType: "SUPPLIER",
        createdAt: timestamp,
        updatedAt: timestamp,
        sites: [
          {
            id: "site-1",
            name: "Facility Nord",
            facilityType: "PROCESSING_PLANT",
            address: "Z.I. Nord",
            city: "Rouen",
            postalCode: "76000",
            country: "France",
            landAreaHectares: 12.5,
            createdAt: timestamp,
          },
        ],
        listings: [
          {
            id: "lst-1",
            siteId: "site-1",
            site: { name: "Facility Nord" },
            title: "Premium Straw Lot A",
            description: "High tensile field retted straw",
            materialType: "HEMP",
            productForm: "STRAW_RETTED",
            quantity: 50,
            quantityUnit: "TONNES",
            priceAmount: 350,
            currency: "EUR",
            priceUnit: "PER_TONNE",
            originCountry: "France",
            harvestYear: 2026,
            status: "PUBLISHED",
            createdAt: timestamp,
          },
        ],
        complianceDocuments: [
          {
            id: "doc-1",
            documentType: "COMPANY_REGISTRATION",
            originalFilename: "kbis.pdf",
            mimeType: "application/pdf",
            fileSize: 102400,
            status: "VERIFIED",
            createdAt: timestamp,
          },
        ],
      });

      const res = await service.getSupplierDetailForTrader(traderUserId, "sup-1");

      expect(res.id).toBe("sup-1");
      expect(res.sites).toHaveLength(1);
      expect(res.listings).toHaveLength(1);
      expect(res.complianceDocuments).toHaveLength(1);
      expect(res.summary.publishedListingCount).toBe(1);
      expect(res.summary.siteCount).toBe(1);
      expect(res.summary.documentCount).toBe(1);
    });

    it("throws 404 when supplier does not exist or is not a supplier", async () => {
      prismaMock.organisation.findUnique.mockResolvedValue(null);

      await expect(
        service.getSupplierDetailForTrader(traderUserId, "non-existent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("Buyer Management Read Model", () => {
    const timestamp = new Date("2026-09-02T10:00:00.000Z");

    it("lists real buyers with buy order and approved match counts", async () => {
      prismaMock.organisation.findMany.mockResolvedValue([
        {
          id: "buy-1",
          name: "EcoTextile Corp",
          legalName: "EcoTextile Corp BV",
          country: "Netherlands",
          city: "Amsterdam",
          verificationStatus: "VERIFIED",
          createdAt: timestamp,
          buyOrders: [
            { id: "bo-1", status: "OPEN", createdAt: timestamp },
            { id: "bo-2", status: "DRAFT", createdAt: timestamp },
          ],
          buyerMatches: [{ id: "match-1" }],
        },
      ]);

      const res = await service.listBuyersForTrader(traderUserId);

      expect(res.items).toHaveLength(1);
      const buyer = res.items[0];
      expect(buyer.id).toBe("buy-1");
      expect(buyer.name).toBe("EcoTextile Corp");
      expect(buyer.totalBuyOrderCount).toBe(2);
      expect(buyer.openBuyOrderCount).toBe(1);
      expect(buyer.approvedMatchCount).toBe(1);
      expect(buyer.mostRecentDemandDate).toBe(timestamp.toISOString());
    });

    it("retrieves buyer detail with buy orders and approved matches", async () => {
      prismaMock.organisation.findUnique.mockResolvedValue({
        id: "buy-1",
        name: "EcoTextile Corp",
        legalName: "EcoTextile Corp BV",
        businessType: "MANUFACTURER",
        registrationNumber: "NL88888888",
        vatNumber: "NL888888888B01",
        address: "Keizersgracht 100",
        city: "Amsterdam",
        postalCode: "1015AA",
        country: "Netherlands",
        contactName: "Kees de Vries",
        contactEmail: "kees@ecotextile.nl",
        contactPhone: "+31201234567",
        verificationStatus: "VERIFIED",
        organisationType: "BUYER",
        createdAt: timestamp,
        updatedAt: timestamp,
        buyOrders: [
          {
            id: "bo-1",
            materialType: "HEMP",
            productForm: "FIBRE_TECHNICAL",
            quantity: 100,
            quantityUnit: "TONNES",
            deliveryCountry: "Netherlands",
            deliveryDestination: "Rotterdam Hub",
            requestedDeliveryDate: timestamp,
            targetPriceAmount: 1200,
            currency: "EUR",
            targetPriceUnit: "PER_TONNE",
            status: "OPEN",
            createdByUserId: traderUserId,
            createdAt: timestamp,
            matches: [
              {
                id: "match-1",
                status: "APPROVED",
              },
            ],
          },
        ],
        buyerMatches: [
          {
            id: "match-1",
            buyOrderId: "bo-1",
            listingId: "lst-1",
            supplierOrganisationId: "sup-1",
            supplierOrganisation: { id: "sup-1", name: "Normandie Chanvre" },
            buyOrder: { quantity: 100, quantityUnit: "TONNES" },
            listing: {
              id: "lst-1",
              title: "Technical Hemp Fibre Lot 1",
              materialType: "HEMP",
              productForm: "FIBRE_TECHNICAL",
            },
            approvedAt: timestamp,
            createdAt: timestamp,
          },
        ],
      });

      const res = await service.getBuyerDetailForTrader(traderUserId, "buy-1");

      expect(res.id).toBe("buy-1");
      expect(res.summary.totalBuyOrders).toBe(1);
      expect(res.summary.openBuyOrders).toBe(1);
      expect(res.summary.approvedMatchesCount).toBe(1);
      expect(res.buyOrders[0].createdByTrader).toBe(true);
      expect(res.buyOrders[0].matchStatus).toBe("Approved Match");
      expect(res.approvedMatches[0].supplierOrganisationName).toBe("Normandie Chanvre");
      expect(res.approvedMatches[0].nextStep).toBe("Ready for Quotation");
    });
  });

  describe("Controller Routing", () => {
    it("listSuppliers delegates to service with filters", async () => {
      prismaMock.organisation.findMany.mockResolvedValue([]);
      const res = await controller.listSuppliers(traderCookie, "Chanvre", "France");
      expect(authenticationServiceMock.resolveIdentity).toHaveBeenCalled();
      expect(res.total).toBe(0);
    });

    it("listBuyers delegates to service with search", async () => {
      prismaMock.organisation.findMany.mockResolvedValue([]);
      const res = await controller.listBuyers(traderCookie, "EcoTextile");
      expect(authenticationServiceMock.resolveIdentity).toHaveBeenCalled();
      expect(res.total).toBe(0);
    });
  });
});
