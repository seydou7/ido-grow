import { BadRequestException, ForbiddenException } from "@nestjs/common";

import { AuditEventWriter } from "../audit/audit-event.writer";
import {
  type OrganisationRecord,
  OrganisationsRepository,
} from "../organisations/organisations.repository";
import {
  type BuyOrderRecord,
  BuyOrdersRepository,
} from "./buy-orders.repository";
import { BuyOrdersService } from "./buy-orders.service";
import type {
  CreateBuyOrderInput,
  MaterialType,
  UpdateBuyOrderInput,
} from "./contracts";

class MockOrganisationsRepository extends OrganisationsRepository {
  findMembershipsForUser = jest.fn();
  findMembership = jest.fn();
  findOrganisationById = jest.fn();
  createOrganisation = jest.fn();
  updateOrganisationProfile = jest.fn();
  findSitesByOrganisationId = jest.fn();
  createSite = jest.fn();
  updateSite = jest.fn();
  findSiteById = jest.fn();
  createComplianceDocument = jest.fn();
  findComplianceDocumentsByOrganisationId = jest.fn();
  findComplianceDocumentById = jest.fn();
  findMembersByOrganisationId = jest.fn();
  findOrganisationsByType = jest.fn();
}

class MockBuyOrdersRepository extends BuyOrdersRepository {
  findBuyOrdersForOrganisation = jest.fn();
  findBuyOrderById = jest.fn();
  createBuyOrder = jest.fn();
  updateBuyOrder = jest.fn();
  updateStatus = jest.fn();
  findOpenBuyOrdersForTrader = jest.fn();
  findDraftBuyOrdersForTrader = jest.fn();
  deleteBuyOrder = jest.fn();
}

class MockAuditEventWriter extends AuditEventWriter {
  append = jest.fn().mockResolvedValue(undefined);
}

describe("BuyOrdersService", () => {
  let service: BuyOrdersService;
  let orgRepo: MockOrganisationsRepository;
  let buyOrderRepo: MockBuyOrdersRepository;
  let auditWriter: MockAuditEventWriter;

  const buyerUserId = "11111111-1111-1111-1111-111111111111";
  const buyerOrgId = "22222222-2222-2222-2222-222222222222";
  const supplierUserId = "33333333-3333-3333-3333-333333333333";
  const supplierOrgId = "44444444-4444-4444-4444-444444444444";
  const traderUserId = "55555555-5555-5555-5555-555555555555";
  const traderOrgId = "66666666-6666-6666-6666-666666666666";

  const sampleBuyOrderRecord: BuyOrderRecord = {
    id: "bo-1111-1111-1111-111111111111",
    buyerOrganisationId: buyerOrgId,
    createdByUserId: buyerUserId,
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 50,
    quantityUnit: "TONNES",
    deliveryCountry: "Germany",
    deliveryDestination: "Hamburg Warehouse 4",
    requestedDeliveryDate: new Date("2026-11-15T00:00:00Z"),
    targetPriceAmount: 250,
    currency: "EUR",
    targetPriceUnit: "PER_TONNE",
    acceptableOriginCountries: "France, Netherlands",
    qualityRequirements: "Moisture < 15%",
    packagingRequirements: "Rectangular bales",
    certificationRequirements: "Organic certification preferred",
    transportPreferences: "Road freight",
    paymentTerms: "Net 30",
    status: "DRAFT",
    createdAt: new Date("2026-08-30T10:00:00Z"),
    updatedAt: new Date("2026-08-30T10:00:00Z"),
  };

  beforeEach(() => {
    orgRepo = new MockOrganisationsRepository();
    buyOrderRepo = new MockBuyOrdersRepository();
    auditWriter = new MockAuditEventWriter();
    service = new BuyOrdersService(orgRepo, buyOrderRepo, auditWriter);

    orgRepo.findMembershipsForUser.mockImplementation(async (uid: string) => {
      if (uid === buyerUserId) {
        return [
          {
            id: "m-buyer",
            userId: buyerUserId,
            organisationId: buyerOrgId,
            createdAt: new Date(),
            updatedAt: new Date(),
            organisation: {
              id: buyerOrgId,
              name: "Test Buyer BV",
              organisationType: "BUYER",
              legalName: "Test Buyer BV",
              businessType: "Manufacturer",
              registrationNumber: "REG-B1",
              vatNumber: "NL123456789B01",
              address: null,
              city: "Amsterdam",
              postalCode: null,
              country: "Netherlands",
              contactName: null,
              contactEmail: "buyer@example.test",
              contactPhone: null,
              verificationStatus: "VERIFIED",
              createdAt: new Date(),
              updatedAt: new Date(),
              sites: [],
              complianceDocuments: [],
            },
          },
        ];
      }
      if (uid === supplierUserId) {
        return [
          {
            id: "m-supplier",
            userId: supplierUserId,
            organisationId: supplierOrgId,
            createdAt: new Date(),
            updatedAt: new Date(),
            organisation: {
              id: supplierOrgId,
              name: "Test Supplier Farm",
              organisationType: "SUPPLIER",
              legalName: "Test Supplier Farm",
              businessType: "FARM",
              registrationNumber: "REG-S1",
              vatNumber: null,
              address: null,
              city: null,
              postalCode: null,
              country: "France",
              contactName: null,
              contactEmail: "supplier@example.test",
              contactPhone: null,
              verificationStatus: "VERIFIED",
              createdAt: new Date(),
              updatedAt: new Date(),
              sites: [],
              complianceDocuments: [],
            },
          },
        ];
      }
      if (uid === traderUserId) {
        return [
          {
            id: "m-trader",
            userId: traderUserId,
            organisationId: traderOrgId,
            createdAt: new Date(),
            updatedAt: new Date(),
            organisation: {
              id: traderOrgId,
              name: "Test Trader Desk",
              organisationType: "TRADER",
              legalName: "I Do Grow Desk",
              businessType: "TRADER",
              registrationNumber: "REG-T1",
              vatNumber: null,
              address: null,
              city: null,
              postalCode: null,
              country: "Netherlands",
              contactName: null,
              contactEmail: "trader@example.test",
              contactPhone: null,
              verificationStatus: "VERIFIED",
              createdAt: new Date(),
              updatedAt: new Date(),
              sites: [],
              complianceDocuments: [],
            },
          },
        ];
      }
      return [];
    });
  });

  describe("Access Control", () => {
    it("throws ForbiddenException when user has no organisation membership", async () => {
      await expect(
        service.createBuyOrder("unknown-user", buyerOrgId, {
          materialType: "HEMP",
          quantity: 10,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws ForbiddenException when user is only a Supplier", async () => {
      await expect(
        service.createBuyOrder(supplierUserId, supplierOrgId, {
          materialType: "HEMP",
          quantity: 10,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws ForbiddenException when Buyer tries to create for another organisation", async () => {
      await expect(
        service.createBuyOrder(buyerUserId, "other-buyer-org", {
          materialType: "HEMP",
          quantity: 10,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("createBuyOrder", () => {
    it("creates a DRAFT buy order and records audit event", async () => {
      buyOrderRepo.createBuyOrder.mockResolvedValue(sampleBuyOrderRecord);

      const input: CreateBuyOrderInput = {
        materialType: "HEMP",
        productForm: "STRAW_RETTED",
        quantity: 50,
        quantityUnit: "TONNES",
        deliveryCountry: "Germany",
        deliveryDestination: "Hamburg Warehouse 4",
        requestedDeliveryDate: "2026-11-15T00:00:00Z",
        targetPriceAmount: 250,
        currency: "EUR",
        targetPriceUnit: "PER_TONNE",
      };

      const result = await service.createBuyOrder(buyerUserId, buyerOrgId, input);

      expect(result.id).toBe(sampleBuyOrderRecord.id);
      expect(result.status).toBe("DRAFT");
      expect(buyOrderRepo.createBuyOrder).toHaveBeenCalledWith(
        buyerOrgId,
        buyerUserId,
        input,
        "DRAFT",
      );
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.created",
          metadata: expect.objectContaining({
            buyerOrganisationId: buyerOrgId,
            materialType: "HEMP",
            status: "DRAFT",
          }),
        }),
      );
    });

    it("creates an OPEN buy order directly when submitDirectly is true", async () => {
      const openRecord = { ...sampleBuyOrderRecord, status: "OPEN" };
      buyOrderRepo.createBuyOrder.mockResolvedValue(openRecord);

      const input: CreateBuyOrderInput = {
        materialType: "HEMP",
        quantity: 50,
        submitDirectly: true,
      };

      const result = await service.createBuyOrder(buyerUserId, buyerOrgId, input);

      expect(result.status).toBe("OPEN");
      expect(buyOrderRepo.createBuyOrder).toHaveBeenCalledWith(
        buyerOrgId,
        buyerUserId,
        input,
        "OPEN",
      );
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.submitted",
        }),
      );
    });

    it("rejects invalid material type", async () => {
      await expect(
        service.createBuyOrder(buyerUserId, buyerOrgId, {
          materialType: "COTTON" as unknown as MaterialType,
          quantity: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("rejects non-positive quantity", async () => {
      await expect(
        service.createBuyOrder(buyerUserId, buyerOrgId, {
          materialType: "HEMP",
          quantity: 0,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateBuyOrder", () => {
    it("updates a DRAFT buy order and logs audit event", async () => {
      buyOrderRepo.findBuyOrderById.mockResolvedValue(sampleBuyOrderRecord);
      const updatedRecord = { ...sampleBuyOrderRecord, quantity: 80 };
      buyOrderRepo.updateBuyOrder.mockResolvedValue(updatedRecord);

      const input: UpdateBuyOrderInput = { quantity: 80 };
      const result = await service.updateBuyOrder(
        buyerUserId,
        sampleBuyOrderRecord.id,
        input,
      );

      expect(result.quantity).toBe(80);
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.updated",
        }),
      );
    });

    it("rejects editing when buy order status is OPEN", async () => {
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "OPEN",
      });

      await expect(
        service.updateBuyOrder(buyerUserId, sampleBuyOrderRecord.id, {
          quantity: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("rejects editing when buy order status is CANCELLED", async () => {
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "CANCELLED",
      });

      await expect(
        service.updateBuyOrder(buyerUserId, sampleBuyOrderRecord.id, {
          quantity: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("submitBuyOrder", () => {
    it("transitions DRAFT buy order to OPEN and records audit event", async () => {
      buyOrderRepo.findBuyOrderById.mockResolvedValue(sampleBuyOrderRecord);
      buyOrderRepo.updateStatus.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "OPEN",
      });

      const result = await service.submitBuyOrder(
        buyerUserId,
        sampleBuyOrderRecord.id,
      );

      expect(result.status).toBe("OPEN");
      expect(buyOrderRepo.updateStatus).toHaveBeenCalledWith(
        sampleBuyOrderRecord.id,
        "OPEN",
      );
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.submitted",
          metadata: expect.objectContaining({
            previousStatus: "DRAFT",
            newStatus: "OPEN",
          }),
        }),
      );
    });

    it("rejects submission if buy order is already OPEN", async () => {
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "OPEN",
      });

      await expect(
        service.submitBuyOrder(buyerUserId, sampleBuyOrderRecord.id),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("cancelBuyOrder", () => {
    it("cancels a DRAFT buy order", async () => {
      buyOrderRepo.findBuyOrderById.mockResolvedValue(sampleBuyOrderRecord);
      buyOrderRepo.updateStatus.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "CANCELLED",
      });

      const result = await service.cancelBuyOrder(
        buyerUserId,
        sampleBuyOrderRecord.id,
      );

      expect(result.status).toBe("CANCELLED");
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.cancelled",
          metadata: expect.objectContaining({
            previousStatus: "DRAFT",
            newStatus: "CANCELLED",
          }),
        }),
      );
    });

    it("cancels an OPEN buy order", async () => {
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "OPEN",
      });
      buyOrderRepo.updateStatus.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "CANCELLED",
      });

      const result = await service.cancelBuyOrder(
        buyerUserId,
        sampleBuyOrderRecord.id,
      );

      expect(result.status).toBe("CANCELLED");
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.cancelled",
          metadata: expect.objectContaining({
            previousStatus: "OPEN",
            newStatus: "CANCELLED",
          }),
        }),
      );
    });

    it("rejects cancelling if buy order is already CANCELLED", async () => {
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "CANCELLED",
      });

      await expect(
        service.cancelBuyOrder(buyerUserId, sampleBuyOrderRecord.id),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Trader Demand Overview", () => {
    it("allows Trader to list OPEN buy orders cross-organisation", async () => {
      buyOrderRepo.findOpenBuyOrdersForTrader.mockResolvedValue({
        items: [
          {
            ...sampleBuyOrderRecord,
            status: "OPEN",
            buyerOrganisation: {
              id: buyerOrgId,
              name: "Test Buyer BV",
              country: "Netherlands",
              verificationStatus: "VERIFIED",
            },
          },
        ],
        total: 1,
      });

      const result = await service.listTraderDemand(traderUserId, {});

      expect(result.total).toBe(1);
      expect(result.items[0].buyerOrganisation.name).toBe("Test Buyer BV");
      expect(result.items[0].status).toBe("OPEN");
    });

    it("denies non-Trader from calling listTraderDemand", async () => {
      await expect(
        service.listTraderDemand(buyerUserId, {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("Trader on-behalf creation & editing", () => {
    it("allows Trader to create Buy Order on behalf of Buyer as DRAFT", async () => {
      orgRepo.findOrganisationById.mockResolvedValue({
        id: buyerOrgId,
        name: "Test Buyer BV",
        organisationType: "BUYER",
        legalName: "Test Buyer BV",
        businessType: "Manufacturer",
        registrationNumber: "REG-B1",
        vatNumber: null,
        address: null,
        city: null,
        postalCode: null,
        country: "Netherlands",
        contactName: null,
        contactEmail: "buyer@example.test",
        contactPhone: null,
        verificationStatus: "VERIFIED",
        createdAt: new Date(),
        updatedAt: new Date(),
        sites: [],
        complianceDocuments: [],
      });
      buyOrderRepo.createBuyOrder.mockResolvedValue(sampleBuyOrderRecord);

      const input: CreateBuyOrderInput = {
        materialType: "HEMP",
        quantity: 100,
        submitDirectly: false,
      };

      const result = await service.createBuyOrder(traderUserId, buyerOrgId, input);

      expect(result.id).toBe(sampleBuyOrderRecord.id);
      expect(result.status).toBe("DRAFT");
      expect(buyOrderRepo.createBuyOrder).toHaveBeenCalledWith(
        buyerOrgId,
        traderUserId,
        input,
        "DRAFT",
      );
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.created",
          actor: { type: "user", userId: traderUserId },
          metadata: expect.objectContaining({
            buyerOrganisationId: buyerOrgId,
          }),
        }),
      );
    });

    it("allows Trader to directly submit Buy Order on behalf of Buyer as OPEN", async () => {
      orgRepo.findOrganisationById.mockResolvedValue({
        id: buyerOrgId,
        name: "Test Buyer BV",
        organisationType: "BUYER",
        legalName: "Test Buyer BV",
        businessType: "Manufacturer",
        registrationNumber: "REG-B1",
        vatNumber: null,
        address: null,
        city: null,
        postalCode: null,
        country: "Netherlands",
        contactName: null,
        contactEmail: "buyer@example.test",
        contactPhone: null,
        verificationStatus: "VERIFIED",
        createdAt: new Date(),
        updatedAt: new Date(),
        sites: [],
        complianceDocuments: [],
      });
      buyOrderRepo.createBuyOrder.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "OPEN",
      });

      const input: CreateBuyOrderInput = {
        materialType: "HEMP",
        quantity: 100,
        submitDirectly: true,
      };

      const result = await service.createBuyOrder(traderUserId, buyerOrgId, input);

      expect(result.status).toBe("OPEN");
      expect(buyOrderRepo.createBuyOrder).toHaveBeenCalledWith(
        buyerOrgId,
        traderUserId,
        input,
        "OPEN",
      );
    });

    it("rejects Trader creating on behalf of non-Buyer organisation (e.g. Supplier)", async () => {
      orgRepo.findOrganisationById.mockResolvedValue({
        id: supplierOrgId,
        name: "Supplier Farm",
        organisationType: "SUPPLIER",
        legalName: "Supplier Farm",
        businessType: "FARM",
        registrationNumber: "REG-S1",
        vatNumber: null,
        address: null,
        city: null,
        postalCode: null,
        country: "France",
        contactName: null,
        contactEmail: "supplier@example.test",
        contactPhone: null,
        verificationStatus: "VERIFIED",
        createdAt: new Date(),
        updatedAt: new Date(),
        sites: [],
        complianceDocuments: [],
      });

      await expect(
        service.createBuyOrder(traderUserId, supplierOrgId, {
          materialType: "HEMP",
          quantity: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("allows Trader to edit DRAFT Buy Order on behalf of Buyer", async () => {
      orgRepo.findOrganisationById.mockResolvedValue({
        id: buyerOrgId,
        name: "Test Buyer BV",
        organisationType: "BUYER",
        legalName: "Test Buyer BV",
        businessType: "Manufacturer",
        registrationNumber: "REG-B1",
        vatNumber: null,
        address: null,
        city: null,
        postalCode: null,
        country: "Netherlands",
        contactName: null,
        contactEmail: "buyer@example.test",
        contactPhone: null,
        verificationStatus: "VERIFIED",
        createdAt: new Date(),
        updatedAt: new Date(),
        sites: [],
        complianceDocuments: [],
      });
      buyOrderRepo.findBuyOrderById.mockResolvedValue(sampleBuyOrderRecord);
      buyOrderRepo.updateBuyOrder.mockResolvedValue({
        ...sampleBuyOrderRecord,
        quantity: 150,
      });

      const result = await service.updateBuyOrder(
        traderUserId,
        sampleBuyOrderRecord.id,
        { quantity: 150 },
      );

      expect(result.quantity).toBe(150);
    });

    it("rejects Trader editing OPEN Buy Order", async () => {
      orgRepo.findOrganisationById.mockResolvedValue({
        id: buyerOrgId,
        name: "Test Buyer BV",
        organisationType: "BUYER",
        legalName: "Test Buyer BV",
        businessType: "Manufacturer",
        registrationNumber: "REG-B1",
        vatNumber: null,
        address: null,
        city: null,
        postalCode: null,
        country: "Netherlands",
        contactName: null,
        contactEmail: "buyer@example.test",
        contactPhone: null,
        verificationStatus: "VERIFIED",
        createdAt: new Date(),
        updatedAt: new Date(),
        sites: [],
        complianceDocuments: [],
      });
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "OPEN",
      });

      await expect(
        service.updateBuyOrder(traderUserId, sampleBuyOrderRecord.id, {
          quantity: 200,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("allows Trader to list available Buyer organisations for on-behalf selection", async () => {
      orgRepo.findOrganisationsByType.mockResolvedValue([
        {
          id: buyerOrgId,
          name: "Test Buyer BV",
          organisationType: "BUYER",
          country: "Netherlands",
          verificationStatus: "VERIFIED",
        } as unknown as OrganisationRecord,
      ]);

      const result = await service.listBuyerOrganisationsForTrader(traderUserId);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(buyerOrgId);
      expect(orgRepo.findOrganisationsByType).toHaveBeenCalledWith("BUYER");
    });

    it("allows Trader to list their own DRAFT buy orders", async () => {
      buyOrderRepo.findDraftBuyOrdersForTrader.mockResolvedValue({
        items: [
          {
            ...sampleBuyOrderRecord,
            createdByUserId: traderUserId,
            status: "DRAFT",
            buyerOrganisation: {
              id: buyerOrgId,
              name: "Test Buyer BV",
              country: "Netherlands",
              verificationStatus: "VERIFIED",
            },
          },
        ],
        total: 1,
      });

      const result = await service.listTraderDrafts(traderUserId);

      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe(sampleBuyOrderRecord.id);
      expect(result.items[0].status).toBe("DRAFT");
      expect(result.items[0].buyerOrganisation.name).toBe("Test Buyer BV");
      expect(buyOrderRepo.findDraftBuyOrdersForTrader).toHaveBeenCalledWith(
        traderUserId,
        undefined,
      );
    });

    it("denies non-Trader from listing Trader drafts", async () => {
      await expect(
        service.listTraderDrafts(buyerUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("deleteBuyOrder", () => {
    it("allows Buyer to delete their own organisation's DRAFT buy order", async () => {
      orgRepo.findMembershipsForUser.mockResolvedValue([
        {
          id: "m-1",
          userId: buyerUserId,
          organisationId: buyerOrgId,
          role: "ADMIN",
          organisation: { organisationType: "BUYER" },
        },
      ]);
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        buyerOrganisationId: buyerOrgId,
        status: "DRAFT",
      });

      await service.deleteBuyOrder(buyerUserId, sampleBuyOrderRecord.id);

      expect(buyOrderRepo.deleteBuyOrder).toHaveBeenCalledWith(
        sampleBuyOrderRecord.id,
      );
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.deleted",
          actor: { type: "user", userId: buyerUserId },
          target: { type: "buy_order", id: sampleBuyOrderRecord.id },
          metadata: expect.objectContaining({
            buyerOrganisationId: buyerOrgId,
            deletedStatus: "DRAFT",
          }),
        }),
      );
    });

    it("allows Trader to delete a DRAFT buy order they created on behalf of a Buyer", async () => {
      orgRepo.findMembershipsForUser.mockResolvedValue([
        {
          id: "m-2",
          userId: traderUserId,
          organisationId: traderOrgId,
          role: "ADMIN",
          organisation: { organisationType: "TRADER" },
        },
      ]);
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        buyerOrganisationId: buyerOrgId,
        createdByUserId: traderUserId,
        status: "DRAFT",
      });

      await service.deleteBuyOrder(traderUserId, sampleBuyOrderRecord.id);

      expect(buyOrderRepo.deleteBuyOrder).toHaveBeenCalledWith(
        sampleBuyOrderRecord.id,
      );
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "buyer.buy_order.deleted",
          actor: { type: "user", userId: traderUserId },
        }),
      );
    });

    it("rejects Trader deleting a private Buyer-created DRAFT", async () => {
      orgRepo.findMembershipsForUser.mockResolvedValue([
        {
          id: "m-2",
          userId: traderUserId,
          organisationId: traderOrgId,
          role: "ADMIN",
          organisation: { organisationType: "TRADER" },
        },
      ]);
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        buyerOrganisationId: buyerOrgId,
        createdByUserId: buyerUserId, // created by Buyer, not this Trader
        status: "DRAFT",
      });

      await expect(
        service.deleteBuyOrder(traderUserId, sampleBuyOrderRecord.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it("rejects deleting an OPEN buy order", async () => {
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "OPEN",
      });

      await expect(
        service.deleteBuyOrder(buyerUserId, sampleBuyOrderRecord.id),
      ).rejects.toThrow(BadRequestException);
    });

    it("rejects deleting a CANCELLED buy order", async () => {
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "CANCELLED",
      });

      await expect(
        service.deleteBuyOrder(buyerUserId, sampleBuyOrderRecord.id),
      ).rejects.toThrow(BadRequestException);
    });

    it("rejects Supplier deleting any buy order", async () => {
      orgRepo.findMembershipsForUser.mockResolvedValue([
        {
          id: "m-3",
          userId: supplierUserId,
          organisationId: supplierOrgId,
          role: "ADMIN",
          organisation: { organisationType: "SUPPLIER" },
        },
      ]);
      buyOrderRepo.findBuyOrderById.mockResolvedValue({
        ...sampleBuyOrderRecord,
        status: "DRAFT",
      });

      await expect(
        service.deleteBuyOrder(supplierUserId, sampleBuyOrderRecord.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
