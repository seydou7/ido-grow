/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthenticationProblem } from "../authentication/authentication-problem";
import type { AuthenticationService } from "../authentication/authentication.service";
import type { PrismaService } from "../database/prisma.service";
import { DppController } from "./dpp.controller";
import type { DppService } from "./dpp.service";

describe("DppController", () => {
  let controller: DppController;
  let authenticationServiceMock: jest.Mocked<AuthenticationService>;
  let prismaServiceMock: any;
  let dppServiceMock: jest.Mocked<DppService>;

  const traderUserId = "00000000-0000-4000-8000-000000000001";
  const traderToken = "T".repeat(43);
  const validCookie = `ido_grow_session=${traderToken}`;
  const lotId = "lot-123";
  const dppId = "dpp-123";

  beforeEach(() => {
    authenticationServiceMock = {
      resolveIdentity: jest.fn().mockResolvedValue({
        userId: traderUserId,
        email: "trader@idogrow.com",
        role: "TRADER",
      }),
    } as any;

    prismaServiceMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: traderUserId,
          email: "trader@idogrow.com",
          role: "TRADER",
          memberships: [{ organisationId: "org-trader" }],
        }),
      },
    };

    dppServiceMock = {
      createLot: jest.fn().mockResolvedValue({ id: lotId, lotNumber: "LOT-001" } as any),
      findLots: jest.fn().mockResolvedValue([{ id: lotId, lotNumber: "LOT-001" }] as any),
      getLotById: jest.fn().mockResolvedValue({ id: lotId, lotNumber: "LOT-001" } as any),
      createPassportForLot: jest.fn().mockResolvedValue({ id: dppId, passportNumber: "DPP-001" } as any),
      findPassports: jest.fn().mockResolvedValue([{ id: dppId, passportNumber: "DPP-001" }] as any),
      getPassportById: jest.fn().mockResolvedValue({ id: dppId, passportNumber: "DPP-001" } as any),
      getPassportEvents: jest.fn().mockResolvedValue([{ id: "ev-1", eventType: "LOT_CREATED" }] as any),
      getPassportVersions: jest.fn().mockResolvedValue([{ id: "ver-1", versionNumber: 1 }] as any),
      getPassportVersionByNumber: jest.fn().mockResolvedValue({ id: "ver-1", versionNumber: 1 } as any),
      getPassportCustodyRecords: jest.fn().mockResolvedValue([{ id: "cr-1", milestone: "SUPPLIER_ORIGIN" }] as any),
      syncPassport: jest.fn().mockResolvedValue({ id: dppId, currentVersionNumber: 2 } as any),
      getPassportView: jest.fn().mockResolvedValue({ dppId, passportNumber: "DPP-001", versionNumber: 1 } as any),
      generatePassportPdf: jest.fn().mockResolvedValue({ buffer: Buffer.from("pdf-data"), filename: "passport-DPP-001-v1.pdf" }),
      getPassportQr: jest.fn().mockResolvedValue({ dppId, requiresAuth: true, route: `/dpp/${dppId}/passport` } as any),
    } as any;

    controller = new DppController(
      authenticationServiceMock,
      prismaServiceMock as PrismaService,
      dppServiceMock,
    );
  });

  describe("Authentication Guard", () => {
    it("should throw AuthenticationProblem if cookie is missing", async () => {
      authenticationServiceMock.resolveIdentity.mockImplementation(() => {
        throw new AuthenticationProblem(
          401,
          "authentication_required",
          "Authentication Required",
          "A valid session token is required to access this resource.",
        );
      });

      await expect(controller.findLots(undefined)).rejects.toThrow(
        AuthenticationProblem,
      );
    });
  });

  describe("Lots Endpoints", () => {
    it("should create lot via POST /lots", async () => {
      const result = await controller.createLot(validCookie, { listingId: "listing-1" });
      expect(result).toBeDefined();
      expect(dppServiceMock.createLot).toHaveBeenCalledWith(
        { listingId: "listing-1" },
        expect.objectContaining({ userId: traderUserId }),
      );
    });

    it("should find lots via GET /lots", async () => {
      const result = await controller.findLots(validCookie);
      expect(result).toHaveLength(1);
      expect(dppServiceMock.findLots).toHaveBeenCalledWith(
        expect.objectContaining({ userId: traderUserId }),
      );
    });

    it("should get lot by id via GET /lots/:lotId", async () => {
      const result = await controller.getLotById(validCookie, lotId);
      expect(result.id).toBe(lotId);
      expect(dppServiceMock.getLotById).toHaveBeenCalledWith(
        lotId,
        expect.objectContaining({ userId: traderUserId }),
      );
    });
  });

  describe("DPP Endpoints", () => {
    it("should create passport via POST /lots/:lotId/dpp", async () => {
      const result = await controller.createPassportForLot(validCookie, lotId);
      expect(result.id).toBe(dppId);
      expect(dppServiceMock.createPassportForLot).toHaveBeenCalledWith(
        lotId,
        expect.objectContaining({ userId: traderUserId }),
      );
    });

    it("should find passports via GET /dpp", async () => {
      const result = await controller.findPassports(validCookie);
      expect(result).toHaveLength(1);
      expect(dppServiceMock.findPassports).toHaveBeenCalledWith(
        expect.objectContaining({ userId: traderUserId }),
      );
    });

    it("should get passport by id via GET /dpp/:dppId", async () => {
      const result = await controller.getPassportById(validCookie, dppId);
      expect(result.id).toBe(dppId);
      expect(dppServiceMock.getPassportById).toHaveBeenCalledWith(
        dppId,
        expect.objectContaining({ userId: traderUserId }),
      );
    });

    it("should get events via GET /dpp/:dppId/events", async () => {
      const result = await controller.getPassportEvents(validCookie, dppId);
      expect(result).toHaveLength(1);
      expect(dppServiceMock.getPassportEvents).toHaveBeenCalledWith(
        dppId,
        expect.objectContaining({ userId: traderUserId }),
      );
    });

    it("should get versions via GET /dpp/:dppId/versions", async () => {
      const result = await controller.getPassportVersions(validCookie, dppId);
      expect(result).toHaveLength(1);
      expect(dppServiceMock.getPassportVersions).toHaveBeenCalledWith(
        dppId,
        expect.objectContaining({ userId: traderUserId }),
      );
    });

    it("should get version by number via GET /dpp/:dppId/versions/:versionNumber", async () => {
      const result = await controller.getPassportVersionByNumber(validCookie, dppId, 1);
      expect(result.versionNumber).toBe(1);
      expect(dppServiceMock.getPassportVersionByNumber).toHaveBeenCalledWith(
        dppId,
        1,
        expect.objectContaining({ userId: traderUserId }),
      );
    });

    it("should get custody records via GET /dpp/:dppId/custody", async () => {
      const result = await controller.getPassportCustodyRecords(validCookie, dppId);
      expect(result).toHaveLength(1);
      expect(dppServiceMock.getPassportCustodyRecords).toHaveBeenCalledWith(
        dppId,
        expect.objectContaining({ userId: traderUserId }),
      );
    });

    it("should sync passport via POST /dpp/:dppId/sync", async () => {
      const result = await controller.syncPassport(validCookie, dppId);
      expect(result.currentVersionNumber).toBe(2);
      expect(dppServiceMock.syncPassport).toHaveBeenCalledWith(
        dppId,
        expect.objectContaining({ userId: traderUserId }),
      );
    });

    it("should get passport view via GET /dpp/:dppId/passport", async () => {
      const result = await controller.getPassportView(validCookie, dppId, "1");
      expect(result.dppId).toBe(dppId);
      expect(dppServiceMock.getPassportView).toHaveBeenCalledWith(
        dppId,
        expect.objectContaining({ userId: traderUserId }),
        1,
      );
    });

    it("should download passport PDF via GET /dpp/:dppId/passport.pdf", async () => {
      const mockRes = {
        set: jest.fn(),
      } as any;

      const file = await controller.downloadPassportPdf(validCookie, dppId, mockRes, "1");
      expect(file).toBeDefined();
      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "Content-Type": "application/pdf",
          "Content-Disposition": expect.stringContaining("passport-DPP-001-v1.pdf"),
        }),
      );
    });

    it("should get QR code via GET /dpp/:dppId/qr", async () => {
      const result = await controller.getPassportQr(validCookie, dppId);
      expect(result.dppId).toBe(dppId);
      expect(result.requiresAuth).toBe(true);
      expect(dppServiceMock.getPassportQr).toHaveBeenCalledWith(
        dppId,
        expect.objectContaining({ userId: traderUserId }),
      );
    });
  });
});

