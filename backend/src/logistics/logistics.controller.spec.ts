/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthenticationService } from "../authentication/authentication.service";
import { LogisticsController } from "./logistics.controller";
import { LogisticsService } from "./logistics.service";

describe("LogisticsController", () => {
  let controller: LogisticsController;
  let mockAuthentication: jest.Mocked<AuthenticationService>;
  let mockLogisticsService: jest.Mocked<LogisticsService>;

  beforeEach(() => {
    mockAuthentication = {
      resolveIdentity: jest.fn().mockResolvedValue({
        userId: "00000000-0000-0000-0000-000000000001",
        email: "trader@idogrow.com",
        role: "TRADER",
      }),
    } as unknown as jest.Mocked<AuthenticationService>;

    mockLogisticsService = {
      createShipment: jest.fn().mockResolvedValue({ id: "shp-001" }),
      getShipments: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getShipmentById: jest.fn().mockResolvedValue({ id: "shp-001" }),
      updateShipmentRequirements: jest.fn().mockResolvedValue({ id: "shp-001" }),
      createFreightRequests: jest.fn().mockResolvedValue([{ id: "lr-001" }]),
      getFreightRequestsForShipment: jest.fn().mockResolvedValue([]),
      submitTraderManualQuotation: jest.fn().mockResolvedValue({ id: "fq-001" }),
      getFreightQuotationsForShipment: jest.fn().mockResolvedValue([]),
      selectCarrier: jest.fn().mockResolvedValue({ id: "shp-001", status: "CARRIER_SELECTED" }),
      getMyRequests: jest.fn().mockResolvedValue([]),
      getMyRequestById: jest.fn().mockResolvedValue({ id: "lr-001" }),
      submitFreightQuotation: jest.fn().mockResolvedValue({ id: "fq-001" }),
      getMyActiveShipments: jest.fn().mockResolvedValue([]),
      schedulePickup: jest.fn().mockResolvedValue({ id: "shp-001", status: "PICKUP_SCHEDULED" }),
      markPickedUp: jest.fn().mockResolvedValue({ id: "shp-001", status: "PICKED_UP" }),
      markInTransit: jest.fn().mockResolvedValue({ id: "shp-001", status: "IN_TRANSIT" }),
      customsStatus: jest.fn().mockResolvedValue({ id: "shp-001", status: "CUSTOMS" }),
      reportDelay: jest.fn().mockResolvedValue({ id: "shp-001", status: "DELAYED" }),
      confirmDelivery: jest.fn().mockResolvedValue({ id: "shp-001", status: "DELIVERED" }),
      recordDiscrepancy: jest.fn().mockResolvedValue({ id: "disc-001" }),
      markDisputed: jest.fn().mockResolvedValue({ id: "shp-001", status: "DISPUTED" }),
      resolveDispute: jest.fn().mockResolvedValue({ id: "shp-001", status: "DELIVERED" }),
      reconcileCosts: jest.fn().mockResolvedValue({ id: "rec-001", differenceAmount: 100 }),
      closeShipment: jest.fn().mockResolvedValue({ id: "shp-001", status: "CLOSED" }),
      getTrackingEvents: jest.fn().mockResolvedValue([]),
      uploadShippingDocument: jest.fn().mockResolvedValue({ id: "doc-001" }),
      getShippingDocuments: jest.fn().mockResolvedValue([]),
      downloadShippingDocument: jest.fn().mockResolvedValue({
        file: { stream: {} as any, mimeType: "application/pdf", fileSize: 100 },
        filename: "doc.pdf",
      }),
      createSettlement: jest.fn().mockResolvedValue({ id: "stl-001" }),
      getSettlementByTradeId: jest.fn().mockResolvedValue({ id: "stl-001" }),
      getSettlementById: jest.fn().mockResolvedValue({ id: "stl-001" }),
      updateSettlement: jest.fn().mockResolvedValue({ id: "stl-001" }),
      uploadSettlementDocument: jest.fn().mockResolvedValue({ id: "stldoc-001" }),
      downloadSettlementDocument: jest.fn().mockResolvedValue({
        file: { stream: {} as any, mimeType: "application/pdf", fileSize: 100 },
        filename: "settlement.pdf",
      }),
      createSettlementClaim: jest.fn().mockResolvedValue({ id: "claim-001" }),
      resolveSettlementClaim: jest.fn().mockResolvedValue({ id: "claim-001" }),
    } as unknown as jest.Mocked<LogisticsService>;

    controller = new LogisticsController(
      mockAuthentication,
      mockLogisticsService,
    );
  });

  const validCookie = "session_token=valid-token";

  describe("Shipments Core", () => {
    it("should route createShipment to service with resolved identity", async () => {
      const res = await controller.createShipment(
        validCookie,
        "ctr-001",
        { shipmentQuantity: 1000 },
      );
      expect(mockAuthentication.resolveIdentity).toHaveBeenCalled();
      expect(mockLogisticsService.createShipment).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "ctr-001",
        { shipmentQuantity: 1000 },
      );
      expect(res).toEqual({ id: "shp-001" });
    });

    it("should route selectCarrier to service", async () => {
      const res = await controller.selectCarrier(
        validCookie,
        "shp-001",
        { freightQuotationId: "fq-001" },
      );
      expect(mockLogisticsService.selectCarrier).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        { freightQuotationId: "fq-001" },
      );
      expect(res.status).toBe("CARRIER_SELECTED");
    });
  });

  describe("Block 03 Execution & Tracking", () => {
    it("should route schedulePickup to service", async () => {
      const res = await controller.schedulePickup(validCookie, "shp-001", {
        scheduledPickupAt: "2026-10-15T09:00:00Z",
      });
      expect(mockLogisticsService.schedulePickup).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        { scheduledPickupAt: "2026-10-15T09:00:00Z" },
      );
      expect(res.status).toBe("PICKUP_SCHEDULED");
    });

    it("should route markPickedUp to service", async () => {
      const res = await controller.markPickedUp(validCookie, "shp-001", {
        location: "Dakar Port",
      });
      expect(mockLogisticsService.markPickedUp).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        { location: "Dakar Port" },
      );
      expect(res.status).toBe("PICKED_UP");
    });

    it("should route markInTransit to service", async () => {
      const res = await controller.markInTransit(validCookie, "shp-001", {});
      expect(mockLogisticsService.markInTransit).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        {},
      );
      expect(res.status).toBe("IN_TRANSIT");
    });

    it("should route customs to service", async () => {
      const res = await controller.customsStatus(validCookie, "shp-001", { notes: "Customs check" });
      expect(mockLogisticsService.customsStatus).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        { notes: "Customs check" },
      );
      expect(res.status).toBe("CUSTOMS");
    });

    it("should route reportDelay to service", async () => {
      const res = await controller.reportDelay(validCookie, "shp-001", { delayReason: "Heavy rain" });
      expect(mockLogisticsService.reportDelay).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        { delayReason: "Heavy rain" },
      );
      expect(res.status).toBe("DELAYED");
    });

    it("should route confirmDelivery to service", async () => {
      const res = await controller.confirmDelivery(validCookie, "shp-001", { deliveredLocation: "Le Havre" });
      expect(mockLogisticsService.confirmDelivery).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        { deliveredLocation: "Le Havre" },
      );
      expect(res.status).toBe("DELIVERED");
    });

    it("should route discrepancies to service", async () => {
      await controller.recordDiscrepancy(validCookie, "shp-001", {
        type: "DAMAGE",
        description: "Bale torn",
      });
      expect(mockLogisticsService.recordDiscrepancy).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        { type: "DAMAGE", description: "Bale torn" },
      );
    });

    it("should route markDisputed to service", async () => {
      await controller.markDisputed(validCookie, "shp-001", { disputeReason: "Discrepancy not resolved" });
      expect(mockLogisticsService.markDisputed).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        { disputeReason: "Discrepancy not resolved" },
      );
    });

    it("should route reconcileCosts to service", async () => {
      await controller.reconcileCosts(validCookie, "shp-001", { finalAmount: 1600, finalCurrency: "EUR" });
      expect(mockLogisticsService.reconcileCosts).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        { finalAmount: 1600, finalCurrency: "EUR" },
      );
    });

    it("should route close to service", async () => {
      await controller.closeShipment(validCookie, "shp-001", {});
      expect(mockLogisticsService.closeShipment).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "shp-001",
        {},
      );
    });
  });

  describe("Administrative Settlement", () => {
    it("should route createSettlement to service", async () => {
      await controller.createSettlement(validCookie, "trd-001", { depositAmount: 1000 });
      expect(mockLogisticsService.createSettlement).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "trd-001",
        { depositAmount: 1000 },
      );
    });

    it("should route updateSettlement to service", async () => {
      await controller.updateSettlement(validCookie, "stl-001", { paymentStatus: "SETTLED" });
      expect(mockLogisticsService.updateSettlement).toHaveBeenCalledWith(
        "00000000-0000-0000-0000-000000000001",
        "stl-001",
        { paymentStatus: "SETTLED" },
      );
    });
  });
});
