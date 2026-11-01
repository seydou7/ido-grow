/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common";
import { AuditEventWriter } from "../audit";
import { PrismaService } from "../database";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import { StorageService } from "../storage";
import { LogisticsService } from "./logistics.service";

describe("LogisticsService", () => {
  let service: LogisticsService;
  let mockPrisma: any;
  let mockOrganisationsRepo: any;
  let mockAuditWriter: any;
  let mockStorageService: any;

  const traderUserId = "00000000-0000-0000-0000-000000000001";
  const buyerUserId = "00000000-0000-0000-0000-000000000002";
  const supplierUserId = "00000000-0000-0000-0000-000000000005";
  const lpUserId = "00000000-0000-0000-0000-000000000003";
  const otherLpUserId = "00000000-0000-0000-0000-000000000004";
  const unaffiliatedUserId = "00000000-0000-0000-0000-000000000006";

  const mockContract = {
    id: "ctr-001",
    contractNumber: "CTR-20260918-0001",
    status: "CONFIRMED",
    quantity: 1000,
    quantityUnit: "KG",
    buyerOrganisationId: "org-buyer-01",
    supplierOrganisationId: "org-supplier-01",
    buyerOrganisation: { name: "Buyer Textiles" },
    supplierOrganisation: { name: "Supplier Farms" },
    currency: "EUR",
    acceptedCommercialAmount: 25000,
    materialType: "COTTON",
    productForm: "RAW",
    shipments: [] as any[],
  };

  const selectedQuote = {
    id: "fq-001",
    shipmentId: "shp-001",
    providerUserId: lpUserId,
    freightAmount: 1500,
    currency: "EUR",
    status: "ACTIVE",
    providerUser: { email: "lp@carrier.com" },
  };

  const carrierSelectedShipment: any = {
    id: "shp-001",
    shipmentNumber: "SHP-20261002-0001",
    contractId: "ctr-001",
    status: "CARRIER_SELECTED",
    selectedFreightQuotationId: "fq-001",
    selectedFreightQuotation: selectedQuote,
    origin: "Dakar, Senegal",
    destination: "Le Havre, France",
    shipmentQuantity: 1000,
    quantityUnit: "KG",
    contract: mockContract,
    buyerOrganisation: mockContract.buyerOrganisation,
    supplierOrganisation: mockContract.supplierOrganisation,
    trackingEvents: [],
    documents: [],
    discrepancies: [],
    costReconciliation: null,
    _count: { freightQuotations: 1, logisticsRequests: 1 },
  };

  beforeEach(() => {
    mockPrisma = {
      contract: {
        findUnique: jest.fn(),
      },
      shipment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      logisticsRequest: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      freightQuotation: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      shipmentTrackingEvent: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      shipmentDocument: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      shipmentDiscrepancy: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      shipmentCostReconciliation: {
        create: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      trade: {
        findUnique: jest.fn(),
      },
      settlement: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      settlementDocument: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      settlementClaim: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      membership: {
        findMany: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn((args: any) => {
          if (args.where.id === traderUserId) return Promise.resolve({ id: traderUserId, role: "STANDARD", email: "trader@idogrow.com" });
          if (args.where.id === buyerUserId) return Promise.resolve({ id: buyerUserId, role: "STANDARD", email: "buyer@idogrow.com" });
          if (args.where.id === supplierUserId) return Promise.resolve({ id: supplierUserId, role: "STANDARD", email: "supplier@idogrow.com" });
          if (args.where.id === unaffiliatedUserId) return Promise.resolve({ id: unaffiliatedUserId, role: "STANDARD", email: "unaffiliated@idogrow.com" });
          if (args.where.id === lpUserId) return Promise.resolve({ id: lpUserId, role: "LOGISTICS_PARTNER", email: "lp@carrier.com" });
          if (args.where.id === otherLpUserId) return Promise.resolve({ id: otherLpUserId, role: "LOGISTICS_PARTNER", email: "other@carrier.com" });
          return Promise.resolve(null);
        }),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    mockOrganisationsRepo = {
      findMembershipsForUser: jest.fn((userId: string) => {
        if (userId === traderUserId) {
          return Promise.resolve([
            { organisation: { organisationType: "TRADER" }, role: "ADMIN" },
          ]);
        }
        if (userId === buyerUserId) {
          return Promise.resolve([
            { organisation: { organisationType: "BUYER" }, role: "MEMBER" },
          ]);
        }
        if (userId === supplierUserId) {
          return Promise.resolve([
            { organisation: { organisationType: "SUPPLIER" }, role: "MEMBER" },
          ]);
        }
        if (userId === lpUserId || userId === otherLpUserId) {
          return Promise.resolve([
            { organisation: { organisationType: "LOGISTICS_PARTNER" }, role: "MEMBER" },
          ]);
        }
        return Promise.resolve([]);
      }),
    };

    mockAuditWriter = {
      append: jest.fn().mockResolvedValue(undefined),
    };

    mockStorageService = {
      store: jest.fn().mockResolvedValue({ storageKey: "store-key-01", sizeBytes: 1024 }),
      retrieve: jest.fn().mockResolvedValue({
        stream: {} as any,
        mimeType: "application/pdf",
        fileSize: 1024,
      }),
      delete: jest.fn().mockResolvedValue(true),
    };

    service = new LogisticsService(
      mockPrisma as unknown as PrismaService,
      mockOrganisationsRepo as unknown as OrganisationsRepository,
      mockAuditWriter as unknown as AuditEventWriter,
      mockStorageService as unknown as StorageService,
    );
  });

  // ── Block 02 Baseline Regression Tests ─────────────────────

  describe("Block 02 Baseline Functionality", () => {
    it("should allow trader to create shipment for confirmed contract", async () => {
      mockPrisma.contract.findUnique.mockResolvedValue(mockContract);
      mockPrisma.shipment.create.mockResolvedValue({
        ...carrierSelectedShipment,
        status: "PLANNING",
        selectedFreightQuotationId: null,
      });

      const res = await service.createShipment(traderUserId, mockContract.id, {
        origin: "Dakar, Senegal",
        destination: "Le Havre, France",
        shipmentQuantity: 1000,
      });

      expect(res.origin).toBe("Dakar, Senegal");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.shipment.created" }),
        expect.anything(),
      );
    });

    it("should reject carrier selection if quotation does not belong to shipment", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);
      mockPrisma.freightQuotation.findUnique.mockResolvedValue({
        ...selectedQuote,
        shipmentId: "shp-OTHER",
      });

      await expect(
        service.selectCarrier(traderUserId, "shp-001", { freightQuotationId: "fq-001" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── Block 03 Authority & Permissions ───────────────────────

  describe("Shipment Execution Authorization", () => {
    it("should block execution when shipment is not yet CARRIER_SELECTED", async () => {
      const planningShipment = {
        ...carrierSelectedShipment,
        status: "PLANNING",
        selectedFreightQuotationId: null,
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(planningShipment);

      await expect(
        service.schedulePickup(traderUserId, "shp-001", {
          scheduledPickupAt: new Date().toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should allow Trader to execute shipment actions", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);
      mockPrisma.shipment.update.mockResolvedValue({
        ...carrierSelectedShipment,
        status: "PICKUP_SCHEDULED",
        scheduledPickupAt: new Date(),
      });
      mockPrisma.shipmentTrackingEvent.create.mockResolvedValue({
        id: "te-01",
        shipmentId: "shp-001",
        previousStatus: "CARRIER_SELECTED",
        resultingStatus: "PICKUP_SCHEDULED",
        actorUserId: traderUserId,
        actorRole: "TRADER",
        occurredAt: new Date(),
        recordedAt: new Date(),
      });

      const res = await service.schedulePickup(traderUserId, "shp-001", {
        scheduledPickupAt: new Date().toISOString(),
      });

      expect(res.status).toBe("PICKUP_SCHEDULED");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.pickup.scheduled" }),
        expect.anything(),
      );
    });

    it("should allow selected Logistics Partner to execute shipment actions", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);
      mockPrisma.shipment.update.mockResolvedValue({
        ...carrierSelectedShipment,
        status: "PICKUP_SCHEDULED",
        scheduledPickupAt: new Date(),
      });
      mockPrisma.shipmentTrackingEvent.create.mockResolvedValue({
        id: "te-02",
        shipmentId: "shp-001",
        previousStatus: "CARRIER_SELECTED",
        resultingStatus: "PICKUP_SCHEDULED",
        actorUserId: lpUserId,
        actorRole: "LOGISTICS_PARTNER",
        occurredAt: new Date(),
        recordedAt: new Date(),
      });

      const res = await service.schedulePickup(lpUserId, "shp-001", {
        scheduledPickupAt: new Date().toISOString(),
      });

      expect(res.status).toBe("PICKUP_SCHEDULED");
    });

    it("should deny unselected Logistics Partner with 403 Forbidden", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);

      await expect(
        service.schedulePickup(otherLpUserId, "shp-001", {
          scheduledPickupAt: new Date().toISOString(),
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should deny Buyer from shipment execution with 403 Forbidden", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);

      await expect(
        service.schedulePickup(buyerUserId, "shp-001", {
          scheduledPickupAt: new Date().toISOString(),
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should deny Supplier from shipment execution with 403 Forbidden", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);

      await expect(
        service.schedulePickup(supplierUserId, "shp-001", {
          scheduledPickupAt: new Date().toISOString(),
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── Block 03 Status Lifecycle Transitions ─────────────────

  describe("Status Transitions Lifecycle", () => {
    it("should schedule pickup from CARRIER_SELECTED", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);
      const scheduledDate = new Date("2026-10-15T09:00:00Z");
      mockPrisma.shipment.update.mockResolvedValue({
        ...carrierSelectedShipment,
        status: "PICKUP_SCHEDULED",
        scheduledPickupAt: scheduledDate,
      });

      const res = await service.schedulePickup(traderUserId, "shp-001", {
        scheduledPickupAt: scheduledDate.toISOString(),
        notes: "Scheduled for morning",
      });

      expect(res.status).toBe("PICKUP_SCHEDULED");
      expect(mockPrisma.shipmentTrackingEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            previousStatus: "CARRIER_SELECTED",
            resultingStatus: "PICKUP_SCHEDULED",
          }),
        }),
      );
    });

    it("should mark picked up from PICKUP_SCHEDULED", async () => {
      const scheduledShipment = {
        ...carrierSelectedShipment,
        status: "PICKUP_SCHEDULED",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(scheduledShipment);
      mockPrisma.shipment.update.mockResolvedValue({
        ...scheduledShipment,
        status: "PICKED_UP",
        actualPickupAt: new Date(),
      });

      const res = await service.markPickedUp(traderUserId, "shp-001", {
        actualPickupAt: new Date().toISOString(),
        location: "Dakar Port Terminal 2",
      });

      expect(res.status).toBe("PICKED_UP");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.shipment.picked_up" }),
        expect.anything(),
      );
    });

    it("should reject mark picked up if status is not PICKUP_SCHEDULED", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment); // status is CARRIER_SELECTED

      await expect(
        service.markPickedUp(traderUserId, "shp-001", {}),
      ).rejects.toThrow(BadRequestException);
    });

    it("should mark in transit from PICKED_UP", async () => {
      const pickedUpShipment = {
        ...carrierSelectedShipment,
        status: "PICKED_UP",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(pickedUpShipment);
      mockPrisma.shipment.update.mockResolvedValue({
        ...pickedUpShipment,
        status: "IN_TRANSIT",
      });

      const res = await service.markInTransit(traderUserId, "shp-001", {
        location: "Atlantic Corridor",
      });

      expect(res.status).toBe("IN_TRANSIT");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.shipment.in_transit" }),
        expect.anything(),
      );
    });

    it("should support optional customs status from IN_TRANSIT", async () => {
      const inTransitShipment = {
        ...carrierSelectedShipment,
        status: "IN_TRANSIT",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(inTransitShipment);
      mockPrisma.shipment.update.mockResolvedValue({
        ...inTransitShipment,
        status: "CUSTOMS",
      });

      const res = await service.customsStatus(traderUserId, "shp-001", {
        location: "Customs Office Le Havre",
        notes: "Customs reference: CUST-9921",
      });

      expect(res.status).toBe("CUSTOMS");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.shipment.customs" }),
        expect.anything(),
      );
    });

    it("should allow reporting delay from active states (IN_TRANSIT) and record previous state", async () => {
      const inTransitShipment = {
        ...carrierSelectedShipment,
        status: "IN_TRANSIT",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(inTransitShipment);
      mockPrisma.shipment.update.mockResolvedValue({
        ...inTransitShipment,
        status: "DELAYED",
        previousStatus: "IN_TRANSIT",
        delayReason: "Port congestion at intermediate hub",
      });

      const res = await service.reportDelay(traderUserId, "shp-001", {
        delayReason: "Port congestion at intermediate hub",
        revisedExpectedDeliveryDate: "2026-10-25",
      });

      expect(res.status).toBe("DELAYED");
      expect(mockPrisma.shipmentTrackingEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            previousStatus: "IN_TRANSIT",
            resultingStatus: "DELAYED",
            notes: "Port congestion at intermediate hub",
          }),
        }),
      );
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.shipment.delayed" }),
        expect.anything(),
      );
    });

    it("should reject delay reporting from invalid states (PLANNING or CLOSED)", async () => {
      const closedShipment = {
        ...carrierSelectedShipment,
        status: "CLOSED",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(closedShipment);

      await expect(
        service.reportDelay(traderUserId, "shp-001", { delayReason: "Bad weather" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should confirm delivery from IN_TRANSIT or CUSTOMS", async () => {
      const customsShipment = {
        ...carrierSelectedShipment,
        status: "CUSTOMS",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(customsShipment);
      mockPrisma.shipment.update.mockResolvedValue({
        ...customsShipment,
        status: "DELIVERED",
        deliveredAt: new Date(),
        deliveredLocation: "Warehouse B, Le Havre",
      });

      const res = await service.confirmDelivery(traderUserId, "shp-001", {
        deliveredLocation: "Warehouse B, Le Havre",
        deliveryNotes: "Goods unloaded in good order",
      });

      expect(res.status).toBe("DELIVERED");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.delivery.confirmed" }),
        expect.anything(),
      );
    });

    it("should reject duplicate delivery confirmation if already DELIVERED", async () => {
      const deliveredShipment = {
        ...carrierSelectedShipment,
        status: "DELIVERED",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(deliveredShipment);

      await expect(
        service.confirmDelivery(traderUserId, "shp-001", {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── Block 03 Discrepancies & Disputes ──────────────────────

  describe("Discrepancies & Dispute Flow", () => {
    it("should record a DAMAGE discrepancy with free-text description", async () => {
      const deliveredShipment = {
        ...carrierSelectedShipment,
        status: "DELIVERED",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(deliveredShipment);
      mockPrisma.shipmentDiscrepancy.create.mockResolvedValue({
        id: "disc-01",
        shipmentId: "shp-001",
        reportedByUserId: traderUserId,
        type: "DAMAGE",
        description: "Water damage to bottom bales",
        expectedQuantity: null,
        deliveredQuantity: null,
        quantityUnit: null,
        differenceQuantity: null,
        recordedAt: new Date(),
        reportedByUser: { email: "trader@idogrow.com" },
      });

      const res = await service.recordDiscrepancy(traderUserId, "shp-001", {
        type: "DAMAGE",
        description: "Water damage to bottom bales",
      });

      expect(res.type).toBe("DAMAGE");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.discrepancy.recorded" }),
        expect.anything(),
      );
    });

    it("should record a QUANTITY_DIFFERENCE and calculate difference server-side", async () => {
      const deliveredShipment = {
        ...carrierSelectedShipment,
        status: "DELIVERED",
        quantityUnit: "KG",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(deliveredShipment);
      mockPrisma.shipmentDiscrepancy.create.mockResolvedValue({
        id: "disc-02",
        shipmentId: "shp-001",
        reportedByUserId: traderUserId,
        type: "QUANTITY_DIFFERENCE",
        description: "Delivered 950 KG instead of 1000 KG",
        expectedQuantity: 1000,
        deliveredQuantity: 950,
        quantityUnit: "KG",
        differenceQuantity: -50,
        recordedAt: new Date(),
        reportedByUser: { email: "trader@idogrow.com" },
      });

      const res = await service.recordDiscrepancy(traderUserId, "shp-001", {
        type: "QUANTITY_DIFFERENCE",
        description: "Shortfall of 50 KG",
        expectedQuantity: 1000,
        deliveredQuantity: 950,
        quantityUnit: "KG",
      });

      expect(res.differenceQuantity).toBe(-50);
      expect(mockPrisma.shipmentDiscrepancy.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            differenceQuantity: -50,
          }),
        }),
      );
    });

    it("should reject quantity discrepancy when units do not match shipment unit", async () => {
      const deliveredShipment = {
        ...carrierSelectedShipment,
        status: "DELIVERED",
        quantityUnit: "KG",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(deliveredShipment);

      await expect(
        service.recordDiscrepancy(traderUserId, "shp-001", {
          type: "QUANTITY_DIFFERENCE",
          description: "Mismatched units",
          expectedQuantity: 1,
          deliveredQuantity: 0.95,
          quantityUnit: "TONNES", // does not match KG
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should allow explicit marking of DISPUTED with reason", async () => {
      const deliveredShipment = {
        ...carrierSelectedShipment,
        status: "DELIVERED",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(deliveredShipment);
      mockPrisma.shipment.update.mockResolvedValue({
        ...deliveredShipment,
        status: "DISPUTED",
        disputeReason: "Unresolved 50 KG quantity shortfall",
      });

      const res = await service.markDisputed(traderUserId, "shp-001", {
        disputeReason: "Unresolved 50 KG quantity shortfall",
      });

      expect(res.status).toBe("DISPUTED");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.shipment.disputed" }),
        expect.anything(),
      );
    });

    it("should allow resolving a dispute", async () => {
      const disputedShipment = {
        ...carrierSelectedShipment,
        status: "DISPUTED",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(disputedShipment);
      mockPrisma.shipment.update.mockResolvedValue({
        ...disputedShipment,
        status: "DELIVERED",
        disputeResolvedAt: new Date(),
        disputeResolutionNotes: "Credit note agreed with supplier",
      });

      const res = await service.resolveDispute(traderUserId, "shp-001", {
        disputeResolutionNotes: "Credit note agreed with supplier",
      });

      expect(res.status).toBe("DELIVERED");
    });
  });

  // ── Block 03 Cost Reconciliation & Closing ────────────────

  describe("Cost Reconciliation & Shipment Closure", () => {
    it("should reconcile costs and calculate difference server-side without mutating quote", async () => {
      const deliveredShipment = {
        ...carrierSelectedShipment,
        status: "DELIVERED",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(deliveredShipment);
      mockPrisma.shipmentCostReconciliation.upsert.mockResolvedValue({
        id: "rec-01",
        shipmentId: "shp-001",
        selectedFreightQuotationId: "fq-001",
        quotedAmount: 1500,
        quotedCurrency: "EUR",
        finalAmount: 1650,
        finalCurrency: "EUR",
        differenceAmount: 150,
        notes: "Fuel surcharge applied",
        reconciledByUserId: traderUserId,
        reconciledAt: new Date(),
        reconciledByUser: { email: "trader@idogrow.com" },
      });

      const res = await service.reconcileCosts(traderUserId, "shp-001", {
        finalAmount: 1650,
        finalCurrency: "EUR",
        notes: "Fuel surcharge applied",
      });

      expect(res.differenceAmount).toBe(150);
      expect(res.quotedAmount).toBe(1500);
      expect(mockPrisma.freightQuotation.update).not.toHaveBeenCalled(); // Quote must remain immutable!
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.costs.reconciled" }),
        expect.anything(),
      );
    });

    it("should reject close before delivery is confirmed", async () => {
      const inTransitShipment = {
        ...carrierSelectedShipment,
        status: "IN_TRANSIT",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(inTransitShipment);

      await expect(
        service.closeShipment(traderUserId, "shp-001", {}),
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject close if cost reconciliation is not yet completed", async () => {
      const deliveredWithoutReconciliation = {
        ...carrierSelectedShipment,
        status: "DELIVERED",
        costReconciliation: null,
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(deliveredWithoutReconciliation);

      await expect(
        service.closeShipment(traderUserId, "shp-001", {}),
      ).rejects.toThrow(BadRequestException);
    });

    it("should successfully close shipment when delivered and costs reconciled", async () => {
      const readyToClose = {
        ...carrierSelectedShipment,
        status: "DELIVERED",
        costReconciliation: { id: "rec-01", finalAmount: 1650 },
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(readyToClose);
      mockPrisma.shipment.update.mockResolvedValue({
        ...readyToClose,
        status: "CLOSED",
        closedAt: new Date(),
        closedByUserId: traderUserId,
      });

      const res = await service.closeShipment(traderUserId, "shp-001", {
        notes: "Operation successfully closed",
      });

      expect(res.status).toBe("CLOSED");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.shipment.closed" }),
        expect.anything(),
      );
    });

    it("should block any mutations on a CLOSED shipment", async () => {
      const closedShipment = {
        ...carrierSelectedShipment,
        status: "CLOSED",
      };
      mockPrisma.shipment.findUnique.mockResolvedValue(closedShipment);

      await expect(
        service.schedulePickup(traderUserId, "shp-001", { scheduledPickupAt: new Date().toISOString() }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── Block 03 Shipping Documents & Storage Compensation ─────

  describe("Shipping Documents", () => {
    it("should upload shipping document and write audit event", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);
      mockPrisma.shipmentDocument.create.mockResolvedValue({
        id: "doc-01",
        shipmentId: "shp-001",
        uploadedByUserId: traderUserId,
        label: "Bill of Lading",
        documentReference: "BL-8882",
        storageKey: "store-key-01",
        originalFilename: "bol.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        uploadedAt: new Date(),
        uploadedByUser: { email: "trader@idogrow.com" },
      });

      const file = { originalname: "bol.pdf", buffer: Buffer.from("test"), mimetype: "application/pdf" };
      const res = await service.uploadShippingDocument(
        traderUserId,
        "shp-001",
        file,
        "Bill of Lading",
        "BL-8882",
      );

      expect(res.label).toBe("Bill of Lading");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "logistics.shipping_document.uploaded" }),
        expect.anything(),
      );
    });

    it("should compensate storage (delete file) if DB/audit persistence fails", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);
      mockPrisma.shipmentDocument.create.mockRejectedValue(new Error("DB Connection Error"));

      const file = { originalname: "bol.pdf", buffer: Buffer.from("test"), mimetype: "application/pdf" };

      await expect(
        service.uploadShippingDocument(
          traderUserId,
          "shp-001",
          file,
          "Bill of Lading",
        ),
      ).rejects.toThrow("DB Connection Error");

      expect(mockStorageService.delete).toHaveBeenCalledWith("store-key-01");
    });
  });

  // ── Block 03 Administrative Settlement ────────────────────

  describe("Administrative Settlement", () => {
    const mockTrade = {
      id: "trade-001",
      tradeNumber: "TRD-001",
      buyerOrganisationId: "org-buyer-01",
      supplierOrganisationId: "org-supplier-01",
      currency: "EUR",
      acceptedTotalAmount: 25000,
      settlement: null,
    };

    it("should create administrative settlement with server-calculated remaining balance", async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade);
      mockPrisma.settlement.create.mockResolvedValue({
        id: "stl-01",
        tradeId: "trade-001",
        shipmentId: "shp-001",
        currency: "EUR",
        totalCommercialAmount: 25000,
        depositAmount: 5000,
        remainingBalance: 20000,
        commissionAmount: 500,
        finalSettlementAmount: 25000,
        paymentStatus: "PENDING",
        paymentDueDate: new Date("2026-11-01"),
        paymentInstructions: "SWIFT instructions recorded",
        notes: null,
        createdByUserId: traderUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        trade: { tradeNumber: "TRD-001" },
        shipment: null,
        buyerOrganisation: { name: "Buyer Org" },
        supplierOrganisation: { name: "Supplier Org" },
        createdByUser: { email: "trader@idogrow.com" },
        documents: [],
        claims: [],
      });

      const res = await service.createSettlement(traderUserId, "trade-001", {
        depositAmount: 5000,
        commissionAmount: 500,
        paymentDueDate: "2026-11-01",
        paymentInstructions: "SWIFT instructions recorded",
      });

      expect(res.depositAmount).toBe(5000);
      expect(res.remainingBalance).toBe(20000);
      expect(res.paymentStatus).toBe("PENDING");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "settlement.created" }),
        expect.anything(),
      );
    });

    it("should reject negative monetary amounts in settlement", async () => {
      mockPrisma.trade.findUnique.mockResolvedValue(mockTrade);

      await expect(
        service.createSettlement(traderUserId, "trade-001", {
          depositAmount: -100,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should prevent duplicate settlement creation on the same trade", async () => {
      mockPrisma.trade.findUnique.mockResolvedValue({
        ...mockTrade,
        settlement: { id: "stl-existing" },
      });

      await expect(
        service.createSettlement(traderUserId, "trade-001", {}),
      ).rejects.toThrow(ConflictException);
    });

    it("should upload settlement documents (INVOICE, CREDIT_NOTE, PAYMENT_INSTRUCTION, CLAIM)", async () => {
      mockPrisma.settlement.findUnique.mockResolvedValue({
        id: "stl-01",
        tradeId: "trade-001",
      });
      mockPrisma.settlementDocument.create.mockResolvedValue({
        id: "stldoc-01",
        settlementId: "stl-01",
        uploadedByUserId: traderUserId,
        documentType: "INVOICE",
        documentReference: "INV-2026-001",
        storageKey: "store-key-01",
        originalFilename: "inv.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        uploadedAt: new Date(),
        uploadedByUser: { email: "trader@idogrow.com" },
      });

      const file = { originalname: "inv.pdf", buffer: Buffer.from("test"), mimetype: "application/pdf" };
      const res = await service.uploadSettlementDocument(
        traderUserId,
        "stl-01",
        file,
        "INVOICE",
        "INV-2026-001",
      );

      expect(res.documentType).toBe("INVOICE");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "settlement.document.uploaded" }),
        expect.anything(),
      );
    });

    it("should create and resolve settlement claims", async () => {
      mockPrisma.settlement.findUnique.mockResolvedValue({
        id: "stl-01",
        tradeId: "trade-001",
      });
      mockPrisma.settlementClaim.create.mockResolvedValue({
        id: "claim-01",
        settlementId: "stl-01",
        description: "50 KG shortfall claim",
        amount: 250,
        status: "OPEN",
        resolutionNotes: null,
        resolvedAt: null,
        recordedByUserId: traderUserId,
        recordedAt: new Date(),
        recordedByUser: { email: "trader@idogrow.com" },
      });

      const claim = await service.createSettlementClaim(traderUserId, "stl-01", {
        description: "50 KG shortfall claim",
        amount: 250,
      });

      expect(claim.status).toBe("OPEN");

      mockPrisma.settlementClaim.findUnique.mockResolvedValue({
        id: "claim-01",
        settlementId: "stl-01",
        status: "OPEN",
        settlement: { tradeId: "trade-001" },
      });
      mockPrisma.settlementClaim.update.mockResolvedValue({
        id: "claim-01",
        settlementId: "stl-01",
        description: "50 KG shortfall claim",
        amount: 250,
        status: "RESOLVED",
        resolutionNotes: "Credit memo issued",
        resolvedAt: new Date(),
        recordedByUserId: traderUserId,
        recordedAt: new Date(),
        recordedByUser: { email: "trader@idogrow.com" },
      });

      const resolved = await service.resolveSettlementClaim(traderUserId, "stl-01", "claim-01", {
        resolutionNotes: "Credit memo issued",
      });

      expect(resolved.status).toBe("RESOLVED");
      expect(mockAuditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "settlement.claim.resolved" }),
        expect.anything(),
      );
    });
  });

  // ── Centralized Trader RBAC Tests ─────────────────────────

  describe("Centralized Trader RBAC Resolution", () => {
    it("should allow STANDARD user with TRADER membership to pass assertTraderAccess", async () => {
      await expect(service.assertTraderAccess(traderUserId)).resolves.toBeUndefined();
    });

    it("should deny STANDARD user without TRADER membership (unaffiliated) in assertTraderAccess", async () => {
      await expect(service.assertTraderAccess(unaffiliatedUserId)).rejects.toThrow(ForbiddenException);
    });

    it("should deny Buyer from assertTraderAccess", async () => {
      await expect(service.assertTraderAccess(buyerUserId)).rejects.toThrow(ForbiddenException);
    });

    it("should deny Supplier from assertTraderAccess", async () => {
      await expect(service.assertTraderAccess(supplierUserId)).rejects.toThrow(ForbiddenException);
    });

    it("should allow STANDARD user with TRADER membership to view shipment by ID", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);
      const res = await service.getShipmentById(traderUserId, "shp-001");
      expect(res.id).toBe("shp-001");
      expect(res.selectedCarrierName).toBe("lp@carrier.com");
      expect(res.carrierTotalCost).toBe(1500);
      expect(res.carrierCurrency).toBe("EUR");
    });

    it("should deny unaffiliated STANDARD user from viewing shipment by ID", async () => {
      mockPrisma.shipment.findUnique.mockResolvedValue(carrierSelectedShipment);
      await expect(service.getShipmentById(unaffiliatedUserId, "shp-001")).rejects.toThrow(ForbiddenException);
    });

    it("should allow STANDARD user with TRADER membership in assertTradeAccess", async () => {
      await expect(
        (service as any).assertTradeAccess(traderUserId, "org-buyer-01", "org-supplier-01"),
      ).resolves.toBeUndefined();
    });

    it("should allow Buyer member in assertTradeAccess", async () => {
      mockPrisma.membership.findMany.mockResolvedValueOnce([
        { id: "m-1", userId: buyerUserId, organisationId: "org-buyer-01" },
      ]);
      await expect(
        (service as any).assertTradeAccess(buyerUserId, "org-buyer-01", "org-supplier-01"),
      ).resolves.toBeUndefined();
    });

    it("should deny unaffiliated user in assertTradeAccess", async () => {
      mockPrisma.membership.findMany.mockResolvedValueOnce([]);
      await expect(
        (service as any).assertTradeAccess(unaffiliatedUserId, "org-buyer-01", "org-supplier-01"),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
