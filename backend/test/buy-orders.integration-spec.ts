import { BadRequestException, ForbiddenException } from "@nestjs/common";

import { AuditEventWriter } from "../src/audit/audit-event.writer";
import type { PlatformAuditEvent } from "../src/audit/contracts";
import {
  type BuyOrderRecord,
  BuyOrdersRepository,
} from "../src/buy-orders/buy-orders.repository";
import { BuyOrdersService } from "../src/buy-orders/buy-orders.service";
import type {
  BuyOrderQuery,
  BuyOrderStatus,
  CreateBuyOrderInput,
  UpdateBuyOrderInput,
} from "../src/buy-orders/contracts";
import {
  type ComplianceDocumentRecord,
  type MembershipRecord,
  type OrganisationMemberRecord,
  type OrganisationRecord,
  OrganisationsRepository,
  type SiteRecord,
} from "../src/organisations/organisations.repository";

class InMemoryOrganisationsRepository extends OrganisationsRepository {
  private organisations = new Map<string, OrganisationRecord>();
  private memberships: MembershipRecord[] = [];

  seedOrganisation(org: OrganisationRecord) {
    this.organisations.set(org.id, org);
  }

  seedMembership(membership: MembershipRecord) {
    this.memberships.push(membership);
  }

  async findMembershipsForUser(userId: string): Promise<MembershipRecord[]> {
    return this.memberships.filter((m) => m.userId === userId);
  }

  async findMembership(
    userId: string,
    organisationId: string,
  ): Promise<MembershipRecord | null> {
    return (
      this.memberships.find(
        (m) => m.userId === userId && m.organisationId === organisationId,
      ) ?? null
    );
  }

  async findOrganisationById(id: string): Promise<OrganisationRecord | null> {
    return this.organisations.get(id) ?? null;
  }

  async createOrganisation(): Promise<OrganisationRecord> {
    throw new Error("Not needed");
  }
  async updateOrganisationProfile(): Promise<OrganisationRecord> {
    throw new Error("Not needed");
  }
  async findSitesByOrganisationId(): Promise<SiteRecord[]> {
    return [];
  }
  async findSiteById(): Promise<SiteRecord | null> {
    return null;
  }
  async createSite(): Promise<SiteRecord> {
    throw new Error("Not needed");
  }
  async updateSite(): Promise<SiteRecord> {
    throw new Error("Not needed");
  }
  async findComplianceDocumentsByOrganisationId(): Promise<ComplianceDocumentRecord[]> {
    return [];
  }
  async findComplianceDocumentById(): Promise<ComplianceDocumentRecord | null> {
    return null;
  }
  async createComplianceDocument(): Promise<ComplianceDocumentRecord> {
    throw new Error("Not needed");
  }
  async findMembersByOrganisationId(): Promise<OrganisationMemberRecord[]> {
    return [];
  }
  async findOrganisationsByType(
    organisationType: string,
  ): Promise<OrganisationRecord[]> {
    return Array.from(this.organisations.values()).filter(
      (o) => o.organisationType.toUpperCase() === organisationType.toUpperCase(),
    );
  }
}

class InMemoryBuyOrdersRepository extends BuyOrdersRepository {
  private buyOrders = new Map<string, BuyOrderRecord>();
  private idCounter = 1;

  async findBuyOrdersForOrganisation(
    buyerOrganisationId: string,
    query?: BuyOrderQuery,
  ): Promise<{ items: BuyOrderRecord[]; total: number }> {
    let items = Array.from(this.buyOrders.values()).filter(
      (b) => b.buyerOrganisationId === buyerOrganisationId,
    );

    if (query?.status) {
      items = items.filter((b) => b.status === query.status);
    }
    if (query?.materialType) {
      items = items.filter((b) => b.materialType === query.materialType);
    }

    return { items, total: items.length };
  }

  async findBuyOrderById(id: string): Promise<BuyOrderRecord | null> {
    return this.buyOrders.get(id) ?? null;
  }

  async createBuyOrder(
    buyerOrganisationId: string,
    createdByUserId: string | null,
    input: CreateBuyOrderInput,
    initialStatus: BuyOrderStatus,
  ): Promise<BuyOrderRecord> {
    const id = `buy-order-${this.idCounter++}`;
    const record: BuyOrderRecord = {
      id,
      buyerOrganisationId,
      createdByUserId,
      materialType: input.materialType,
      productForm: input.productForm ?? null,
      quantity: input.quantity,
      quantityUnit: input.quantityUnit ?? "TONNES",
      deliveryCountry: input.deliveryCountry ?? null,
      deliveryDestination: input.deliveryDestination ?? null,
      requestedDeliveryDate: input.requestedDeliveryDate
        ? new Date(input.requestedDeliveryDate)
        : null,
      targetPriceAmount: input.targetPriceAmount ?? null,
      currency: input.currency ?? "EUR",
      targetPriceUnit: input.targetPriceUnit ?? "PER_TONNE",
      acceptableOriginCountries: input.acceptableOriginCountries ?? null,
      qualityRequirements: input.qualityRequirements ?? null,
      packagingRequirements: input.packagingRequirements ?? null,
      certificationRequirements: input.certificationRequirements ?? null,
      transportPreferences: input.transportPreferences ?? null,
      paymentTerms: input.paymentTerms ?? null,
      status: initialStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.buyOrders.set(id, record);
    return record;
  }

  async updateBuyOrder(
    id: string,
    input: UpdateBuyOrderInput,
  ): Promise<BuyOrderRecord> {
    const existing = this.buyOrders.get(id);
    if (!existing) throw new Error("Not found");

    const updated: BuyOrderRecord = {
      ...existing,
      ...input,
      productForm:
        input.productForm !== undefined
          ? input.productForm
          : existing.productForm,
      requestedDeliveryDate:
        input.requestedDeliveryDate !== undefined
          ? input.requestedDeliveryDate
            ? new Date(input.requestedDeliveryDate)
            : null
          : existing.requestedDeliveryDate,
      updatedAt: new Date(),
    };

    this.buyOrders.set(id, updated);
    return updated;
  }

  async updateStatus(
    id: string,
    newStatus: BuyOrderStatus,
  ): Promise<BuyOrderRecord> {
    const existing = this.buyOrders.get(id);
    if (!existing) throw new Error("Not found");

    const updated: BuyOrderRecord = {
      ...existing,
      status: newStatus,
      updatedAt: new Date(),
    };

    this.buyOrders.set(id, updated);
    return updated;
  }

  async findOpenBuyOrdersForTrader(
    query?: BuyOrderQuery,
  ): Promise<{ items: BuyOrderRecord[]; total: number }> {
    let items = Array.from(this.buyOrders.values()).filter(
      (b) => b.status === "OPEN",
    );

    if (query?.materialType) {
      items = items.filter((b) => b.materialType === query.materialType);
    }

    return { items, total: items.length };
  }

  async findDraftBuyOrdersForTrader(
    traderUserId: string,
    query?: BuyOrderQuery,
  ): Promise<{ items: BuyOrderRecord[]; total: number }> {
    let items = Array.from(this.buyOrders.values()).filter(
      (b) => b.status === "DRAFT" && b.createdByUserId === traderUserId,
    );

    if (query?.materialType) {
      items = items.filter((b) => b.materialType === query.materialType);
    }

    return { items, total: items.length };
  }

  async deleteBuyOrder(id: string): Promise<void> {
    this.buyOrders.delete(id);
  }
}

class InMemoryAuditEventWriter extends AuditEventWriter {
  readonly events: PlatformAuditEvent[] = [];

  async append(event: PlatformAuditEvent): Promise<void> {
    this.events.push(event);
  }
}

describe("Buy Orders Integration Workflow", () => {
  let service: BuyOrdersService;
  let orgRepo: InMemoryOrganisationsRepository;
  let buyOrderRepo: InMemoryBuyOrdersRepository;
  let auditWriter: InMemoryAuditEventWriter;

  const buyerAUserId = "10000000-0000-4000-8000-000000000001";
  const buyerAOrgId = "10000000-0000-4000-8000-000000000002";

  const buyerBUserId = "20000000-0000-4000-8000-000000000001";
  const buyerBOrgId = "20000000-0000-4000-8000-000000000002";

  const supplierUserId = "30000000-0000-4000-8000-000000000001";
  const supplierOrgId = "30000000-0000-4000-8000-000000000002";

  const traderUserId = "40000000-0000-4000-8000-000000000001";
  const traderOrgId = "40000000-0000-4000-8000-000000000002";

  beforeEach(() => {
    orgRepo = new InMemoryOrganisationsRepository();
    buyOrderRepo = new InMemoryBuyOrdersRepository();
    auditWriter = new InMemoryAuditEventWriter();
    service = new BuyOrdersService(orgRepo, buyOrderRepo, auditWriter);

    // Seed Buyer A
    orgRepo.seedOrganisation({
      id: buyerAOrgId,
      name: "Buyer Corp A",
      legalName: "Buyer Corp A BV",
      organisationType: "BUYER",
      businessType: "Manufacturer",
      registrationNumber: "REG-A",
      vatNumber: "NL11111111B01",
      address: "Industrial Road 1",
      city: "Rotterdam",
      postalCode: "3000 AA",
      country: "Netherlands",
      contactName: "Buyer A",
      contactEmail: "buyer-a@example.test",
      contactPhone: "+31101234567",
      verificationStatus: "VERIFIED",
      createdAt: new Date(),
      updatedAt: new Date(),
      sites: [],
      complianceDocuments: [],
    });
    orgRepo.seedMembership({
      id: "mem-buyer-a",
      userId: buyerAUserId,
      organisationId: buyerAOrgId,
      createdAt: new Date(),
      updatedAt: new Date(),
      organisation: {
        id: buyerAOrgId,
        name: "Buyer Corp A",
        legalName: "Buyer Corp A BV",
        organisationType: "BUYER",
        businessType: "Manufacturer",
        registrationNumber: "REG-A",
        vatNumber: "NL11111111B01",
        address: null,
        city: "Rotterdam",
        postalCode: null,
        country: "Netherlands",
        contactName: null,
        contactEmail: "buyer-a@example.test",
        contactPhone: null,
        verificationStatus: "VERIFIED",
        createdAt: new Date(),
        updatedAt: new Date(),
        sites: [],
        complianceDocuments: [],
      },
    });

    // Seed Buyer B
    orgRepo.seedOrganisation({
      id: buyerBOrgId,
      name: "Buyer Corp B",
      legalName: "Buyer Corp B SAS",
      organisationType: "BUYER",
      businessType: "Automotive Supplier",
      registrationNumber: "REG-B",
      vatNumber: "FR22222222222",
      address: null,
      city: "Lyon",
      postalCode: null,
      country: "France",
      contactName: null,
      contactEmail: "buyer-b@example.test",
      contactPhone: null,
      verificationStatus: "VERIFIED",
      createdAt: new Date(),
      updatedAt: new Date(),
      sites: [],
      complianceDocuments: [],
    });
    orgRepo.seedMembership({
      id: "mem-buyer-b",
      userId: buyerBUserId,
      organisationId: buyerBOrgId,
      createdAt: new Date(),
      updatedAt: new Date(),
      organisation: {
        id: buyerBOrgId,
        name: "Buyer Corp B",
        legalName: "Buyer Corp B SAS",
        organisationType: "BUYER",
        businessType: "Automotive Supplier",
        registrationNumber: "REG-B",
        vatNumber: "FR22222222222",
        address: null,
        city: "Lyon",
        postalCode: null,
        country: "France",
        contactName: null,
        contactEmail: "buyer-b@example.test",
        contactPhone: null,
        verificationStatus: "VERIFIED",
        createdAt: new Date(),
        updatedAt: new Date(),
        sites: [],
        complianceDocuments: [],
      },
    });

    // Seed Supplier
    orgRepo.seedOrganisation({
      id: supplierOrgId,
      name: "Supplier Farm S",
      legalName: "Supplier Farm S",
      organisationType: "SUPPLIER",
      businessType: "FARM",
      registrationNumber: "REG-S",
      vatNumber: null,
      address: null,
      city: null,
      postalCode: null,
      country: "France",
      contactName: null,
      contactEmail: "supplier-s@example.test",
      contactPhone: null,
      verificationStatus: "VERIFIED",
      createdAt: new Date(),
      updatedAt: new Date(),
      sites: [],
      complianceDocuments: [],
    });
    orgRepo.seedMembership({
      id: "mem-supplier-s",
      userId: supplierUserId,
      organisationId: supplierOrgId,
      createdAt: new Date(),
      updatedAt: new Date(),
      organisation: {
        id: supplierOrgId,
        name: "Supplier Farm S",
        legalName: "Supplier Farm S",
        organisationType: "SUPPLIER",
        businessType: "FARM",
        registrationNumber: "REG-S",
        vatNumber: null,
        address: null,
        city: null,
        postalCode: null,
        country: "France",
        contactName: null,
        contactEmail: "supplier-s@example.test",
        contactPhone: null,
        verificationStatus: "VERIFIED",
        createdAt: new Date(),
        updatedAt: new Date(),
        sites: [],
        complianceDocuments: [],
      },
    });

    // Seed Trader
    orgRepo.seedOrganisation({
      id: traderOrgId,
      name: "I Do Grow Desk",
      legalName: "I Do Grow Desk BV",
      organisationType: "TRADER",
      businessType: "COMMODITY_BROKER",
      registrationNumber: "REG-T",
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
    });
    orgRepo.seedMembership({
      id: "mem-trader",
      userId: traderUserId,
      organisationId: traderOrgId,
      createdAt: new Date(),
      updatedAt: new Date(),
      organisation: {
        id: traderOrgId,
        name: "I Do Grow Desk",
        legalName: "I Do Grow Desk BV",
        organisationType: "TRADER",
        businessType: "COMMODITY_BROKER",
        registrationNumber: "REG-T",
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
    });
  });

  describe("Tenant Isolation & Role Authorization", () => {
    it("denies Supplier from creating or listing buy orders", async () => {
      await expect(
        service.createBuyOrder(supplierUserId, supplierOrgId, {
          materialType: "HEMP",
          quantity: 20,
        }),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.listBuyOrders(supplierUserId, supplierOrgId),
      ).rejects.toThrow(ForbiddenException);
    });

    it("prevents Buyer A from reading or modifying Buyer B buy orders", async () => {
      const orderB = await service.createBuyOrder(buyerBUserId, buyerBOrgId, {
        materialType: "SISAL",
        quantity: 30,
      });

      await expect(
        service.getBuyOrder(buyerAUserId, orderB.id),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.updateBuyOrder(buyerAUserId, orderB.id, { quantity: 40 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("End-to-End Buy Order Lifecycle", () => {
    it("progresses cleanly from DRAFT to OPEN, is visible to Trader, and can be cancelled", async () => {
      // 1. Create as Draft
      const draft = await service.createBuyOrder(buyerAUserId, buyerAOrgId, {
        materialType: "HEMP",
        productForm: "STRAW_RETTED",
        quantity: 100,
        quantityUnit: "TONNES",
        deliveryCountry: "Germany",
        deliveryDestination: "Stuttgart Factory 2",
        targetPriceAmount: 220,
        targetPriceUnit: "PER_TONNE",
        acceptableOriginCountries: "France, Netherlands",
        qualityRequirements: "Retted, clean straw",
      });

      expect(draft.status).toBe("DRAFT");
      expect(draft.quantity).toBe(100);

      // Verify Trader cannot see DRAFT demand in overview
      const traderOverviewDraft = await service.listTraderDemand(traderUserId);
      expect(traderOverviewDraft.items.find((i) => i.id === draft.id)).toBeUndefined();

      // 2. Edit Draft
      const updated = await service.updateBuyOrder(buyerAUserId, draft.id, {
        quantity: 120,
        targetPriceAmount: 230,
      });
      expect(updated.quantity).toBe(120);
      expect(updated.targetPriceAmount).toBe(230);

      // 3. Submit Draft -> OPEN
      const submitted = await service.submitBuyOrder(buyerAUserId, draft.id);
      expect(submitted.status).toBe("OPEN");

      // Verify Trader CAN now see OPEN demand
      const traderOverviewOpen = await service.listTraderDemand(traderUserId);
      expect(traderOverviewOpen.items.find((i) => i.id === draft.id)).toBeDefined();

      // 4. Attempt to edit OPEN buy order should fail (400)
      await expect(
        service.updateBuyOrder(buyerAUserId, draft.id, { quantity: 150 }),
      ).rejects.toThrow(BadRequestException);

      // 5. Cancel OPEN Buy Order
      const cancelled = await service.cancelBuyOrder(buyerAUserId, draft.id);
      expect(cancelled.status).toBe("CANCELLED");

      // 6. Verify audit events trail
      const eventTypes = auditWriter.events.map((e) => e.eventType);
      expect(eventTypes).toContain("buyer.buy_order.created");
      expect(eventTypes).toContain("buyer.buy_order.updated");
      expect(eventTypes).toContain("buyer.buy_order.submitted");
      expect(eventTypes).toContain("buyer.buy_order.cancelled");
    });

    it("allows Trader to create on behalf of Buyer A, edit DRAFT, and submit to OPEN", async () => {
      // Trader creates DRAFT on behalf of Buyer A
      const traderDraft = await service.createBuyOrder(traderUserId, buyerAOrgId, {
        materialType: "SISAL",
        productForm: "FIBRE_TECHNICAL",
        quantity: 200,
        quantityUnit: "TONNES",
        deliveryCountry: "Netherlands",
        submitDirectly: false,
      });

      expect(traderDraft.buyerOrganisationId).toBe(buyerAOrgId);
      expect(traderDraft.createdByUserId).toBe(traderUserId);
      expect(traderDraft.status).toBe("DRAFT");

      // Trader edits DRAFT on behalf of Buyer A
      const edited = await service.updateBuyOrder(traderUserId, traderDraft.id, {
        quantity: 250,
      });
      expect(edited.quantity).toBe(250);

      // Trader submits DRAFT -> OPEN
      const submitted = await service.submitBuyOrder(traderUserId, traderDraft.id);
      expect(submitted.status).toBe("OPEN");

      // Verify Trader cannot edit once OPEN
      await expect(
        service.updateBuyOrder(traderUserId, traderDraft.id, { quantity: 300 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("rejects Trader creating on behalf of a Supplier organisation", async () => {
      await expect(
        service.createBuyOrder(traderUserId, supplierOrgId, {
          materialType: "HEMP",
          quantity: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("ensures Trader drafts are discoverable only by creator, private Buyer drafts stay hidden, and submitted drafts move to Active Demand", async () => {
      const otherTraderUserId = "trader-user-2222";
      // 1. Trader A creates DRAFT on behalf of Buyer A
      const traderDraft = await service.createBuyOrder(traderUserId, buyerAOrgId, {
        materialType: "HEMP",
        quantity: 120,
        submitDirectly: false,
      });

      // 2. Buyer A creates private DRAFT directly
      const buyerPrivateDraft = await service.createBuyOrder(buyerAUserId, buyerAOrgId, {
        materialType: "JUTE",
        quantity: 80,
        submitDirectly: false,
      });

      // 3. Trader A queries My Drafts -> sees traderDraft, does NOT see buyerPrivateDraft
      const traderDrafts = await service.listTraderDrafts(traderUserId);
      expect(traderDrafts.items.find((i) => i.id === traderDraft.id)).toBeDefined();
      expect(traderDrafts.items.find((i) => i.id === buyerPrivateDraft.id)).toBeUndefined();

      // 4. Other Trader queries My Drafts -> does NOT see Trader A's draft
      const otherTraderDrafts = await service.listTraderDrafts(otherTraderUserId);
      expect(otherTraderDrafts.items.find((i) => i.id === traderDraft.id)).toBeUndefined();

      // 5. Trader A submits draft -> moves to OPEN
      await service.submitBuyOrder(traderUserId, traderDraft.id);

      // 6. Trader A queries My Drafts -> traderDraft is gone
      const traderDraftsAfterSubmit = await service.listTraderDrafts(traderUserId);
      expect(traderDraftsAfterSubmit.items.find((i) => i.id === traderDraft.id)).toBeUndefined();

      // 7. Trader queries Active Demand -> traderDraft is present
      const activeDemand = await service.listTraderDemand(traderUserId);
      expect(activeDemand.items.find((i) => i.id === traderDraft.id)).toBeDefined();

      // 8. Supplier is forbidden from calling listTraderDrafts
      await expect(
        service.listTraderDrafts(supplierUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it("verifies Draft Deletion rules: Buyer deletes own draft, Trader deletes on-behalf draft, OPEN/CANCELLED rejected, private drafts isolated", async () => {
      // 1. Buyer creates DRAFT and deletes it
      const buyerDraft = await service.createBuyOrder(buyerAUserId, buyerAOrgId, {
        materialType: "HEMP",
        quantity: 100,
        submitDirectly: false,
      });
      expect(buyerDraft.status).toBe("DRAFT");

      // Verify draft is present
      const listBefore = await service.listBuyOrders(buyerAUserId, buyerAOrgId);
      expect(listBefore.items.find((i) => i.id === buyerDraft.id)).toBeDefined();

      // Buyer deletes own draft
      await service.deleteBuyOrder(buyerAUserId, buyerDraft.id);

      // Verify draft is gone
      const listAfter = await service.listBuyOrders(buyerAUserId, buyerAOrgId);
      expect(listAfter.items.find((i) => i.id === buyerDraft.id)).toBeUndefined();

      // 2. Trader creates DRAFT on behalf of Buyer A
      const traderDraft = await service.createBuyOrder(traderUserId, buyerAOrgId, {
        materialType: "SISAL",
        quantity: 150,
        submitDirectly: false,
      });

      // Trader deletes own created draft
      await service.deleteBuyOrder(traderUserId, traderDraft.id);
      const traderDraftsAfter = await service.listTraderDrafts(traderUserId);
      expect(traderDraftsAfter.items.find((i) => i.id === traderDraft.id)).toBeUndefined();

      // 3. Buyer creates private DRAFT -> Trader cannot delete it
      const buyerPrivateDraft = await service.createBuyOrder(buyerAUserId, buyerAOrgId, {
        materialType: "JUTE",
        quantity: 90,
        submitDirectly: false,
      });

      await expect(
        service.deleteBuyOrder(traderUserId, buyerPrivateDraft.id),
      ).rejects.toThrow(ForbiddenException);

      // 4. OPEN buy order cannot be deleted
      const openOrder = await service.createBuyOrder(buyerAUserId, buyerAOrgId, {
        materialType: "COIR",
        quantity: 50,
        submitDirectly: true,
      });
      expect(openOrder.status).toBe("OPEN");

      await expect(
        service.deleteBuyOrder(buyerAUserId, openOrder.id),
      ).rejects.toThrow(BadRequestException);

      // 5. CANCELLED buy order cannot be deleted
      const cancelledOrder = await service.cancelBuyOrder(buyerAUserId, openOrder.id);
      expect(cancelledOrder.status).toBe("CANCELLED");

      await expect(
        service.deleteBuyOrder(buyerAUserId, cancelledOrder.id),
      ).rejects.toThrow(BadRequestException);

      // 6. Supplier is denied from deleting any buy order
      await expect(
        service.deleteBuyOrder(supplierUserId, buyerPrivateDraft.id),
      ).rejects.toThrow(ForbiddenException);

      // 7. Verify buyer.buy_order.deleted audit event was appended
      const deletedEvents = auditWriter.events.filter(
        (e) => e.eventType === "buyer.buy_order.deleted",
      );
      expect(deletedEvents.length).toBe(2);
      expect(deletedEvents[0].target.id).toBe(buyerDraft.id);
      expect(deletedEvents[1].target.id).toBe(traderDraft.id);
    });
  });
});
