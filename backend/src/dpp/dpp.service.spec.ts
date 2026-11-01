/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { DppService, generateLotNumber, generatePassportNumber } from "./dpp.service";
import type { AuthenticatedUser } from "./dpp.contracts";

describe("DppService", () => {
  let service: DppService;
  let mockPrisma: any;
  let mockAuditWriter: any;

  const traderUser: AuthenticatedUser = {
    userId: "00000000-0000-0000-0000-000000000001",
    email: "trader@idogrow.com",
    role: "TRADER",
    organisationId: "00000000-0000-0000-0000-000000000010",
  };

  const supplierUser: AuthenticatedUser = {
    userId: "00000000-0000-0000-0000-000000000002",
    email: "supplier@hempfarms.eu",
    role: "SUPPLIER",
    organisationId: "00000000-0000-0000-0000-000000000020",
  };

  const otherSupplierUser: AuthenticatedUser = {
    userId: "00000000-0000-0000-0000-000000000003",
    email: "other@farms.eu",
    role: "SUPPLIER",
    organisationId: "00000000-0000-0000-0000-000000000021",
  };

  const buyerUser: AuthenticatedUser = {
    userId: "00000000-0000-0000-0000-000000000004",
    email: "buyer@textiles.fr",
    role: "BUYER",
    organisationId: "00000000-0000-0000-0000-000000000030",
  };

  const otherBuyerUser: AuthenticatedUser = {
    userId: "00000000-0000-0000-0000-000000000005",
    email: "other@textiles.fr",
    role: "BUYER",
    organisationId: "00000000-0000-0000-0000-000000000031",
  };

  const inspectorUser: AuthenticatedUser = {
    userId: "00000000-0000-0000-0000-000000000006",
    email: "inspector@quality.eu",
    role: "QUALITY_INSPECTOR",
    organisationId: null,
  };

  const mockListing = {
    id: "00000000-0000-0000-0000-000000000100",
    organisationId: supplierUser.organisationId,
    siteId: "00000000-0000-0000-0000-000000000200",
    title: "Organic Hemp Straw 2026",
    materialType: "HEMP",
    productForm: "STRAW",
    quantity: 50,
    quantityUnit: "TONNES",
    originCountry: "France",
    organisation: { id: supplierUser.organisationId, name: "Hemp Farms Normandy" },
    site: {
      id: "00000000-0000-0000-0000-000000000200",
      name: "Normandy Parcel 4",
      address: "Route de la Ferme",
      city: "Caen",
      country: "France",
    },
  };

  const mockLot = {
    id: "00000000-0000-0000-0000-000000000300",
    lotNumber: "LOT-20261002-A1B2C3D4",
    listingId: mockListing.id,
    supplierOrganisationId: supplierUser.organisationId,
    productionSiteId: mockListing.siteId,
    materialType: "HEMP",
    productForm: "STRAW",
    quantity: 50,
    quantityUnit: "TONNES",
    countryOfOrigin: "France",
    regionOfOrigin: "Normandy",
    productionDate: new Date("2026-09-01T08:00:00Z"),
    batchReference: "BATCH-2026-01",
    notes: "Prime harvest",
    createdAt: new Date("2026-09-10T10:00:00Z"),
    updatedAt: new Date("2026-09-10T10:00:00Z"),
    createdByUserId: traderUser.userId,
    listing: mockListing,
    supplierOrganisation: mockListing.organisation,
    productionSite: mockListing.site,
    dpp: null as any,
  };

  const mockInspection = {
    id: "00000000-0000-0000-0000-000000000400",
    inspectionReference: "INS-20260912-0001",
    listingId: mockListing.id,
    status: "COMPLETED",
    completedAt: new Date("2026-09-12T14:30:00Z"),
    assignedInspectorUserId: inspectorUser.userId,
    latitude: 49.1828,
    longitude: -0.3707,
    assessmentSummary: "Excellent straw quality and moisture",
    qualityResult: {
      id: "00000000-0000-0000-0000-000000000450",
      decision: "APPROVED",
      classificationLabel: "Premium Grade European Hemp",
      decidedAt: new Date("2026-09-12T16:00:00Z"),
      decidedByUserId: inspectorUser.userId,
      decisionNotes: "All criteria satisfied",
    },
    certificate: {
      certificateNumber: "QIC-20260912-88889999",
    },
  };

  const mockTrade = {
    id: "00000000-0000-0000-0000-000000000500",
    tradeNumber: "TRD-20260915-0001",
    listingId: mockListing.id,
    buyerOrganisationId: buyerUser.organisationId,
    supplierOrganisationId: supplierUser.organisationId,
    createdByUserId: traderUser.userId,
    materialType: "HEMP",
    quantity: 50,
    quantityUnit: "TONNES",
    acceptedAt: new Date("2026-09-15T11:00:00Z"),
    createdAt: new Date("2026-09-15T11:00:00Z"),
    buyerOrganisation: { id: buyerUser.organisationId, name: "EcoTextiles Paris" },
    contract: {
      id: "00000000-0000-0000-0000-000000000600",
      status: "CONFIRMED",
      confirmedAt: new Date("2026-09-16T09:00:00Z"),
      confirmedByUserId: traderUser.userId,
      createdByUserId: traderUser.userId,
      shipments: [
        {
          id: "00000000-0000-0000-0000-000000000700",
          shipmentNumber: "SHP-20260917-0001",
          status: "DELIVERED",
          origin: "Caen, France",
          destination: "Paris, France",
          actualPickupAt: new Date("2026-09-18T08:00:00Z"),
          deliveredAt: new Date("2026-09-19T15:00:00Z"),
          deliveredLocation: "Warehouse 2, Paris",
          createdAt: new Date("2026-09-17T10:00:00Z"),
          createdByUserId: traderUser.userId,
          selectedFreightQuotation: {
            providerUser: {
              email: "logistics@carrier.eu",
              memberships: [{ organisation: { id: "org-carrier", name: "FastFreight SA" } }],
            },
          },
          trackingEvents: [
            {
              id: "00000000-0000-0000-0000-000000000750",
              resultingStatus: "PICKED_UP",
              occurredAt: new Date("2026-09-18T08:00:00Z"),
              actorUserId: "user-carrier",
              location: "Caen, France",
              notes: "Picked up on time",
            },
            {
              id: "00000000-0000-0000-0000-000000000751",
              resultingStatus: "DELIVERED",
              occurredAt: new Date("2026-09-19T15:00:00Z"),
              actorUserId: "user-carrier",
              location: "Paris, France",
              notes: "Delivered intact",
            },
          ],
        },
      ],
    },
  };

  const mockComplianceDoc = {
    id: "00000000-0000-0000-0000-000000000800",
    documentType: "ORGANIC_CERTIFICATION",
    originalFilename: "ecocert_2026.pdf",
    status: "VERIFIED",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  };

  beforeEach(() => {
    mockPrisma = {
      listing: {
        findUnique: jest.fn(),
      },
      site: {
        findUnique: jest.fn(),
      },
      traceableLot: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      digitalProductPassport: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      dPPVersion: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      dPPEvent: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      dPPCustodyRecord: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      trade: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      inspection: {
        findMany: jest.fn(),
      },
      complianceDocument: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(async (cb: any) => cb(mockPrisma)),
    };

    mockAuditWriter = {
      append: jest.fn().mockResolvedValue(undefined),
    };

    service = new DppService(mockPrisma, mockAuditWriter);
  });

  // ── LOT TRACEABILITY TESTS ────────────────────────────────────

  describe("Lot Traceability", () => {
    it("should allow a Trader to create a traceable lot from valid listing context", async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.site.findUnique.mockResolvedValue(mockListing.site);
      mockPrisma.traceableLot.create.mockResolvedValue(mockLot);

      const result = await service.createLot(
        {
          listingId: mockListing.id,
          regionOfOrigin: "Normandy",
          productionDate: "2026-09-01T08:00:00Z",
          batchReference: "BATCH-2026-01",
        },
        traderUser,
      );

      expect(result).toBeDefined();
      expect(result.lotNumber).toBe(mockLot.lotNumber);
      expect(result.materialType).toBe("HEMP");
      expect(result.supplierOrganisationId).toBe(supplierUser.organisationId);
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "dpp.lot.created" }),
        expect.anything(),
      );
    });

    it("should reject lot creation by non-Trader roles (Buyer, Supplier, Inspector)", async () => {
      await expect(
        service.createLot({ listingId: mockListing.id }, buyerUser),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.createLot({ listingId: mockListing.id }, supplierUser),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.createLot({ listingId: mockListing.id }, inspectorUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should generate a stable lot reference with prefix LOT-YYYYMMDD-", () => {
      const lotRef = generateLotNumber();
      expect(lotRef).toMatch(/^LOT-\d{8}-[A-F0-9]{8}$/);
    });

    it("should keep unknown origin fields null without fabricating values", async () => {
      const minimalListing = {
        ...mockListing,
        originCountry: null,
        siteId: null,
      };
      mockPrisma.listing.findUnique.mockResolvedValue(minimalListing);

      const createdMinimalLot = {
        ...mockLot,
        countryOfOrigin: null,
        regionOfOrigin: null,
        productionDate: null,
        productionSiteId: null,
        batchReference: null,
      };
      mockPrisma.traceableLot.create.mockResolvedValue(createdMinimalLot);

      const result = await service.createLot(
        {
          listingId: minimalListing.id,
        },
        traderUser,
      );

      expect(result.countryOfOrigin).toBeNull();
      expect(result.regionOfOrigin).toBeNull();
      expect(result.productionDate).toBeNull();
      expect(result.productionSiteId).toBeNull();
      expect(result.batchReference).toBeNull();
    });

    it("should reject productionSiteId that does not belong to the supplier organisation", async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.site.findUnique.mockResolvedValue({
        id: "site-unrelated",
        organisationId: "other-org",
      });

      await expect(
        service.createLot(
          {
            listingId: mockListing.id,
            productionSiteId: "site-unrelated",
          },
          traderUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── DIGITAL PRODUCT PASSPORT CORE TESTS ───────────────────────

  describe("Digital Product Passport Core", () => {
    it("should create a DPP for a lot with version 1 and projected events", async () => {
      mockPrisma.traceableLot.findUnique.mockResolvedValue(mockLot);
      mockPrisma.trade.findMany.mockResolvedValue([mockTrade]);
      mockPrisma.inspection.findMany.mockResolvedValue([mockInspection]);
      mockPrisma.complianceDocument.findMany.mockResolvedValue([mockComplianceDoc]);

      const createdDpp = {
        id: "dpp-001",
        passportNumber: "DPP-20261002-8888AAAA",
        lotId: mockLot.id,
        status: "ACTIVE",
        currentVersionNumber: 1,
        currentVersionId: "ver-001",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: traderUser.userId,
      };

      const createdVersion = {
        id: "ver-001",
        dppId: createdDpp.id,
        versionNumber: 1,
        snapshot: {},
        createdAt: new Date(),
        createdByUserId: traderUser.userId,
      };

      mockPrisma.digitalProductPassport.create.mockResolvedValue(createdDpp);
      mockPrisma.dPPVersion.create.mockResolvedValue(createdVersion);
      mockPrisma.dPPEvent.create.mockResolvedValue({});
      mockPrisma.dPPCustodyRecord.create.mockResolvedValue({});

      // Mock getPassportById return
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue({
        ...createdDpp,
        lot: mockLot,
        versions: [{ snapshot: {} }],
        _count: { events: 7, versions: 1 },
      });

      const result = await service.createPassportForLot(mockLot.id, traderUser);

      expect(result).toBeDefined();
      expect(result.currentVersionNumber).toBe(1);
      expect(mockPrisma.digitalProductPassport.create).toHaveBeenCalled();
      expect(mockPrisma.dPPVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ versionNumber: 1 }),
        }),
      );
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "dpp.passport.created" }),
        expect.anything(),
      );
    });

    it("should prevent duplicate DPP creation for the same lot", async () => {
      const lotWithDpp = {
        ...mockLot,
        dpp: { id: "existing-dpp-id", passportNumber: "DPP-20261002-EXST" },
      };
      mockPrisma.traceableLot.findUnique.mockResolvedValue(lotWithDpp);

      await expect(
        service.createPassportForLot(lotWithDpp.id, traderUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should generate a stable DPP reference with prefix DPP-YYYYMMDD-", () => {
      const dppRef = generatePassportNumber();
      expect(dppRef).toMatch(/^DPP-\d{8}-[A-F0-9]{8}$/);
    });
  });

  // ── DPP EVENT PROJECTION & IMMUTABILITY ────────────────────────

  describe("Event Projection & Immutability", () => {
    it("should accurately project Inspection, Quality, Trade, Contract, and Shipment events with exact source timestamps", async () => {
      mockPrisma.traceableLot.findUnique.mockResolvedValue(mockLot);
      mockPrisma.trade.findMany.mockResolvedValue([mockTrade]);
      mockPrisma.inspection.findMany.mockResolvedValue([mockInspection]);
      mockPrisma.complianceDocument.findMany.mockResolvedValue([mockComplianceDoc]);

      const capturedEvents: any[] = [];
      mockPrisma.dPPEvent.create.mockImplementation((args: any) => {
        capturedEvents.push(args.data);
        return Promise.resolve(args.data);
      });

      mockPrisma.digitalProductPassport.create.mockResolvedValue({
        id: "dpp-001",
        passportNumber: "DPP-20261002-8888AAAA",
        lotId: mockLot.id,
      });
      mockPrisma.dPPVersion.create.mockResolvedValue({ id: "v1", versionNumber: 1 });
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue({
        id: "dpp-001",
        lot: mockLot,
        versions: [{}],
        _count: { events: 6, versions: 1 },
      });

      await service.createPassportForLot(mockLot.id, traderUser);

      const eventTypes = capturedEvents.map((e) => e.eventType);
      expect(eventTypes).toContain("LOT_CREATED");
      expect(eventTypes).toContain("INSPECTION_COMPLETED");
      expect(eventTypes).toContain("QUALITY_RESULT_APPROVED");
      expect(eventTypes).toContain("TRADE_CREATED");
      expect(eventTypes).toContain("CONTRACT_CONFIRMED");
      expect(eventTypes).toContain("SHIPMENT_CREATED");
      expect(eventTypes).toContain("SHIPMENT_PICKED_UP");
      expect(eventTypes).toContain("SHIPMENT_DELIVERED");

      // Verify exact timestamps preserved
      const inspectionEvent = capturedEvents.find((e) => e.eventType === "INSPECTION_COMPLETED");
      expect(inspectionEvent.occurredAt).toEqual(mockInspection.completedAt);
      expect(inspectionEvent.sourceType).toBe("inspection");
      expect(inspectionEvent.sourceId).toBe(mockInspection.id);

      const qualityEvent = capturedEvents.find((e) => e.eventType === "QUALITY_RESULT_APPROVED");
      expect(qualityEvent.occurredAt).toEqual(mockInspection.qualityResult.decidedAt);
      expect(qualityEvent.verificationStatus).toBe("VERIFIED");

      const tradeEvent = capturedEvents.find((e) => e.eventType === "TRADE_CREATED");
      expect(tradeEvent.occurredAt).toEqual(mockTrade.createdAt);

      const deliveryEvent = capturedEvents.find((e) => e.eventType === "SHIPMENT_DELIVERED");
      expect(deliveryEvent.occurredAt).toEqual(
        mockTrade.contract.shipments[0].trackingEvents[1].occurredAt,
      );
      expect(deliveryEvent.verificationStatus).toBe("VERIFIED");
    });
  });

  // ── SYNCHRONIZATION & VERSIONING TESTS ─────────────────────────

  describe("Synchronization & Versioning", () => {
    it("should add a new version when authoritative data materially changes", async () => {
      const existingDpp = {
        id: "dpp-001",
        passportNumber: "DPP-20261002-8888AAAA",
        lot: mockLot,
        versions: [
          {
            id: "ver-001",
            versionNumber: 1,
            snapshot: {
              quality: { inspections: [] }, // previous snapshot had no inspections
              transaction: [],
              logistics: [],
            },
          },
        ],
      };

      mockPrisma.digitalProductPassport.findUnique
        .mockResolvedValueOnce(existingDpp) // first call in syncPassport
        .mockResolvedValueOnce({
          ...existingDpp,
          currentVersionNumber: 2,
          versions: [{ versionNumber: 2, snapshot: {} }],
          _count: { events: 6, versions: 2 },
        }); // second call in getPassportById

      mockPrisma.trade.findMany.mockResolvedValue([mockTrade]);
      mockPrisma.inspection.findMany.mockResolvedValue([mockInspection]);
      mockPrisma.complianceDocument.findMany.mockResolvedValue([mockComplianceDoc]);
      mockPrisma.dPPEvent.findMany.mockResolvedValue([]);
      mockPrisma.dPPCustodyRecord.findMany.mockResolvedValue([]);

      mockPrisma.dPPVersion.create.mockResolvedValue({ id: "ver-002", versionNumber: 2 });
      mockPrisma.dPPEvent.create.mockResolvedValue({});
      mockPrisma.dPPCustodyRecord.create.mockResolvedValue({});

      const result = await service.syncPassport(existingDpp.id, traderUser);

      expect(mockPrisma.dPPVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            versionNumber: 2,
            previousVersionId: "ver-001",
          }),
        }),
      );
      expect(result.currentVersionNumber).toBe(2);
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "dpp.passport.synchronized" }),
        expect.anything(),
      );
    });

    it("should not create a new version when synchronization detects no material change", async () => {
      // Create snapshot identical to current data
      const currentAuthData = {
        trades: [mockTrade],
        inspections: [mockInspection],
        complianceDocs: [mockComplianceDoc],
      };
      const custody = (service as any).projectCustody(mockLot, currentAuthData);
      const snapshot = (service as any).buildSnapshot(
        "DPP-20261002-8888AAAA",
        mockLot,
        currentAuthData,
        custody,
      );

      const existingDpp = {
        id: "dpp-001",
        passportNumber: "DPP-20261002-8888AAAA",
        lot: mockLot,
        versions: [
          {
            id: "ver-001",
            versionNumber: 1,
            snapshot,
          },
        ],
      };

      mockPrisma.digitalProductPassport.findUnique
        .mockResolvedValueOnce(existingDpp)
        .mockResolvedValueOnce({
          ...existingDpp,
          currentVersionNumber: 1,
          versions: [{ versionNumber: 1, snapshot }],
          _count: { events: 6, versions: 1 },
        });

      mockPrisma.trade.findMany.mockResolvedValue([mockTrade]);
      mockPrisma.inspection.findMany.mockResolvedValue([mockInspection]);
      mockPrisma.complianceDocument.findMany.mockResolvedValue([mockComplianceDoc]);

      // All events already exist
      const projectedEvents = (service as any).projectEvents(mockLot, currentAuthData);
      mockPrisma.dPPEvent.findMany.mockResolvedValue(
        projectedEvents.map((e: any, idx: number) => ({
          id: `ev-${idx}`,
          sourceType: e.sourceType,
          sourceId: e.sourceId,
          eventType: e.eventType,
        })),
      );
      mockPrisma.dPPCustodyRecord.findMany.mockResolvedValue(
        custody.map((c: any, idx: number) => ({
          id: `cr-${idx}`,
          sourceType: c.sourceType,
          sourceId: c.sourceId,
          milestone: c.milestone,
        })),
      );

      const result = await service.syncPassport(existingDpp.id, traderUser);

      expect(mockPrisma.dPPVersion.create).not.toHaveBeenCalled();
      expect(mockPrisma.dPPEvent.create).not.toHaveBeenCalled();
      expect(result.currentVersionNumber).toBe(1);
    });

    it("should reject synchronization by non-Trader roles", async () => {
      await expect(service.syncPassport("dpp-001", buyerUser)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.syncPassport("dpp-001", supplierUser)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.syncPassport("dpp-001", inspectorUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── SECURITY & TENANT ISOLATION TESTS ─────────────────────────

  describe("Security & Tenant Isolation", () => {
    const dppRecord = {
      id: "dpp-001",
      passportNumber: "DPP-20261002-8888AAAA",
      lot: mockLot,
      versions: [{ snapshot: {} }],
      _count: { events: 3, versions: 1 },
    };

    it("should allow a related Buyer to read the DPP", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(dppRecord);
      mockPrisma.trade.findFirst.mockResolvedValue(mockTrade); // buyer is in the trade

      const result = await service.getPassportById("dpp-001", buyerUser);
      expect(result).toBeDefined();
      expect(result.id).toBe("dpp-001");
    });

    it("should deny an unrelated Buyer access to the DPP", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(dppRecord);
      mockPrisma.trade.findFirst.mockResolvedValue(null); // other buyer is not in any trade

      await expect(service.getPassportById("dpp-001", otherBuyerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should allow the producing Supplier to read their own DPP", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(dppRecord);

      const result = await service.getPassportById("dpp-001", supplierUser);
      expect(result).toBeDefined();
      expect(result.id).toBe("dpp-001");
    });

    it("should deny an unrelated Supplier access to the DPP", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(dppRecord);

      await expect(service.getPassportById("dpp-001", otherSupplierUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should never expose internal trader margins or bank details in snapshot", () => {
      const authData = {
        trades: [
          {
            ...mockTrade,
            acceptedCommercialAmount: 25000,
            buyerOrganisation: { name: "EcoTextiles Paris" },
            // internal margin / sensitive data
            idoGrowMarginCommission: 1500,
            bankAccountNumber: "FR7630006000011234567890189",
          } as any,
        ],
        inspections: [mockInspection],
        complianceDocs: [mockComplianceDoc],
      };

      const custody = (service as any).projectCustody(mockLot, authData);
      const snapshot = (service as any).buildSnapshot(
        "DPP-20261002-8888AAAA",
        mockLot,
        authData,
        custody,
      );

      const snapshotString = JSON.stringify(snapshot);
      expect(snapshotString).not.toContain("idoGrowMarginCommission");
      expect(snapshotString).not.toContain("1500");
      expect(snapshotString).not.toContain("FR7630006000011234567890189");
      expect(snapshotString).not.toContain("bankAccountNumber");
    });

    it("should roll back transaction if audit event emission fails", async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.site.findUnique.mockResolvedValue(mockListing.site);
      mockPrisma.traceableLot.create.mockResolvedValue(mockLot);
      mockAuditWriter.append.mockRejectedValue(new Error("Audit database failure"));

      await expect(
        service.createLot({ listingId: mockListing.id }, traderUser),
      ).rejects.toThrow("Audit database failure");
    });
  });

  describe("Block 02 — Passport Page, Downloadable PDF & QR Entry Point", () => {
    const mockDppWithVersions = {
      id: "dpp-uuid-1",
      passportNumber: "DPP-20261002-11112222",
      lotId: mockLot.id,
      status: "ACTIVE",
      currentVersionNumber: 2,
      currentVersionId: "ver-uuid-2",
      createdAt: new Date("2026-10-02T08:00:00.000Z"),
      updatedAt: new Date("2026-10-02T10:00:00.000Z"),
      createdByUserId: traderUser.userId,
      lot: mockLot,
      versions: [
        {
          id: "ver-uuid-1",
          dppId: "dpp-uuid-1",
          versionNumber: 1,
          snapshot: {
            identity: {
              passportNumber: "DPP-20261002-11112222",
              lotNumber: mockLot.lotNumber,
              materialType: "HEMP",
              productForm: "STRAW_RAW",
              batchReference: null,
              quantity: 20,
              quantityUnit: "TONNES",
            },
            origin: {
              supplierOrganisationId: mockLot.supplierOrganisationId,
              supplierName: "Cooperative Chanvre de France",
              supplierCountry: "France",
              productionSiteName: "Site Alpha",
              productionSiteAddress: "Route 1",
              countryOfOrigin: "France",
              regionOfOrigin: null,
              productionDate: null,
            },
            quality: { inspections: [] },
            certifications: [],
            transaction: [],
            logistics: [],
            custodyMilestones: [],
          },
          createdAt: new Date("2026-10-02T08:00:00.000Z"),
          createdByUserId: traderUser.userId,
          changeReason: "Initial passport record",
        },
        {
          id: "ver-uuid-2",
          dppId: "dpp-uuid-1",
          versionNumber: 2,
          snapshot: {
            identity: {
              passportNumber: "DPP-20261002-11112222",
              lotNumber: mockLot.lotNumber,
              materialType: "HEMP",
              productForm: "STRAW_RAW",
              batchReference: null,
              quantity: 20,
              quantityUnit: "TONNES",
            },
            origin: {
              supplierOrganisationId: mockLot.supplierOrganisationId,
              supplierName: "Cooperative Chanvre de France",
              supplierCountry: "France",
              productionSiteName: "Site Alpha",
              productionSiteAddress: "Route 1",
              countryOfOrigin: "France",
              regionOfOrigin: null,
              productionDate: null,
            },
            quality: {
              inspections: [
                {
                  inspectionReference: "INSP-01",
                  status: "COMPLETED",
                  decision: "APPROVED",
                  humanClassificationLabel: "Premium",
                  certificateReference: "QIC-01",
                  completedAt: "2026-10-02T09:30:00.000Z",
                  summary: "Inspection approved",
                },
              ],
            },
            certifications: [],
            transaction: [],
            logistics: [],
            custodyMilestones: [],
          },
          createdAt: new Date("2026-10-02T10:00:00.000Z"),
          createdByUserId: traderUser.userId,
          changeReason: "Quality inspection approved",
        },
      ],
      _count: {
        events: 2,
        versions: 2,
      },
    };

    it("should return passport view for current version by default", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);
      mockPrisma.dPPEvent.findMany.mockResolvedValue([
        {
          id: "evt-1",
          dppId: "dpp-uuid-1",
          lotId: mockLot.id,
          eventType: "LOT_CREATED",
          occurredAt: new Date("2026-10-02T08:00:00.000Z"),
          recordedAt: new Date("2026-10-02T08:00:00.000Z"),
          location: "France",
          sourceType: "traceable_lot",
          sourceId: mockLot.id,
          verificationStatus: "RECORDED",
          responsibleOrganisation: null,
          responsibleUser: null,
        },
      ]);
      mockPrisma.dPPCustodyRecord.findMany.mockResolvedValue([]);

      const view = await service.getPassportView("dpp-uuid-1", traderUser);

      expect(view.dppId).toBe("dpp-uuid-1");
      expect(view.versionNumber).toBe(2);
      expect(view.isHistorical).toBe(false);
      expect(view.totalVersions).toBe(2);
      expect(view.provenanceEvents.length).toBe(1);
      expect(view.qr.requiresAuth).toBe(true);
      expect(view.qr.targetUrl).toContain("/dpp/dpp-uuid-1/passport");
      expect(mockPrisma.dPPVersion.create).not.toHaveBeenCalled();
    });

    it("should return exact historical snapshot when specific version is requested", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);
      mockPrisma.dPPEvent.findMany.mockResolvedValue([]);
      mockPrisma.dPPCustodyRecord.findMany.mockResolvedValue([]);

      const view = await service.getPassportView("dpp-uuid-1", traderUser, 1);

      expect(view.versionNumber).toBe(1);
      expect(view.isHistorical).toBe(true);
      expect(view.snapshot.quality.inspections.length).toBe(0);
    });

    it("should throw NotFoundException if requested historical version does not exist", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);

      await expect(
        service.getPassportView("dpp-uuid-1", traderUser, 999),
      ).rejects.toThrow("DPP Version 999 not found.");
    });

    it("should allow related Buyer to view passport", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);
      mockPrisma.trade.findFirst.mockResolvedValue({ id: "trade-1", listingId: mockLot.listingId });
      mockPrisma.dPPEvent.findMany.mockResolvedValue([]);
      mockPrisma.dPPCustodyRecord.findMany.mockResolvedValue([]);

      const view = await service.getPassportView("dpp-uuid-1", buyerUser);
      expect(view.passportNumber).toBe("DPP-20261002-11112222");
    });

    it("should deny unrelated Buyer from viewing passport", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);
      mockPrisma.trade.findFirst.mockResolvedValue(null);

      await expect(
        service.getPassportView("dpp-uuid-1", buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow own Supplier to view passport", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);
      mockPrisma.dPPEvent.findMany.mockResolvedValue([]);
      mockPrisma.dPPCustodyRecord.findMany.mockResolvedValue([]);

      const view = await service.getPassportView("dpp-uuid-1", supplierUser);
      expect(view.passportNumber).toBe("DPP-20261002-11112222");
    });

    it("should deny unrelated Supplier from viewing passport", async () => {
      const unrelatedSupplier: AuthenticatedUser = {
        userId: "unrelated-user-1",
        email: "unrelated@supplier.com",
        role: "SUPPLIER",
        organisationId: "other-supplier-org",
      };

      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);

      await expect(
        service.getPassportView("dpp-uuid-1", unrelatedSupplier),
      ).rejects.toThrow("Access denied to another supplier's lot.");
    });

    it("should deny unauthenticated or unauthorized users from viewing passport", async () => {
      const unauthorizedUser: AuthenticatedUser = {
        userId: "anon-1",
        email: "anon@unknown.com",
        role: null,
        organisationId: null,
      };

      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);

      await expect(
        service.getPassportView("dpp-uuid-1", unauthorizedUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should generate downloadable PDF passport for authorised user", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);
      mockPrisma.dPPEvent.findMany.mockResolvedValue([]);
      mockPrisma.dPPCustodyRecord.findMany.mockResolvedValue([]);

      const { buffer, filename } = await service.generatePassportPdf(
        "dpp-uuid-1",
        traderUser,
      );

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(100);
      expect(filename).toBe("passport-DPP-20261002-11112222-v2.pdf");
    });

    it("should generate downloadable PDF for historical version", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);
      mockPrisma.dPPEvent.findMany.mockResolvedValue([]);
      mockPrisma.dPPCustodyRecord.findMany.mockResolvedValue([]);

      const { buffer, filename } = await service.generatePassportPdf(
        "dpp-uuid-1",
        traderUser,
        1,
      );

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(filename).toBe("passport-DPP-20261002-11112222-v1.pdf");
    });

    it("should return QR code result with requiresAuth flag", async () => {
      mockPrisma.digitalProductPassport.findUnique.mockResolvedValue(mockDppWithVersions);

      const qr = await service.getPassportQr("dpp-uuid-1", traderUser);

      expect(qr.dppId).toBe("dpp-uuid-1");
      expect(qr.requiresAuth).toBe(true);
      expect(qr.route).toBe("/dpp/dpp-uuid-1/passport");
      expect(qr.qrSvg).toContain("<svg");
    });
  });
});

