import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { AuditEventWriter, type PlatformAuditEvent } from "../audit";
import type {
  CreateOrganisationInput,
  CreateSiteInput,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "../organisations/contracts";
import type {
  ComplianceDocumentRecord,
  MembershipRecord,
  OrganisationMemberRecord,
  OrganisationRecord,
  SiteRecord,
} from "../organisations/organisations.repository";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import type { CreateListingInput, UpdateListingInput } from "./contracts";
import type { ListingRecord } from "./listings.repository";
import { ListingsRepository } from "./listings.repository";
import { ListingsService } from "./listings.service";

class InMemoryListingsRepository extends ListingsRepository {
  listings = new Map<string, ListingRecord>();

  async findListingsByOrganisationId(
    organisationId: string,
  ): Promise<ListingRecord[]> {
    return Array.from(this.listings.values())
      .filter((l) => l.organisationId === organisationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findListingById(
    organisationId: string,
    listingId: string,
  ): Promise<ListingRecord | null> {
    const l = this.listings.get(listingId);
    return l && l.organisationId === organisationId ? l : null;
  }

  async createListing(
    organisationId: string,
    input: CreateListingInput,
  ): Promise<ListingRecord> {
    const id = `listing-${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const record: ListingRecord = {
      id,
      organisationId,
      siteId: input.siteId ?? null,
      site: input.siteId ? { id: input.siteId, name: "Test Site" } : null,
      title: input.title,
      description: input.description ?? null,
      materialType: input.materialType,
      productForm: input.productForm ?? null,
      quantity: input.quantity,
      quantityUnit: input.quantityUnit ?? "TONNES",
      priceAmount: input.priceAmount ?? null,
      currency: input.currency ?? "EUR",
      priceUnit: input.priceUnit ?? "PER_TONNE",
      originCountry: input.originCountry ?? null,
      harvestYear: input.harvestYear ?? null,
      status: input.status ?? "DRAFT",
      createdAt: now,
      updatedAt: now,
    };
    this.listings.set(id, record);
    return record;
  }

  async updateListing(
    organisationId: string,
    listingId: string,
    input: UpdateListingInput,
  ): Promise<ListingRecord | null> {
    const existing = await this.findListingById(organisationId, listingId);
    if (!existing) {
      return null;
    }
    const updated: ListingRecord = {
      ...existing,
      title: input.title ?? existing.title,
      description:
        input.description !== undefined
          ? input.description
          : existing.description,
      materialType: input.materialType ?? existing.materialType,
      productForm:
        input.productForm !== undefined
          ? input.productForm
          : existing.productForm,
      quantity: input.quantity ?? existing.quantity,
      quantityUnit: input.quantityUnit ?? existing.quantityUnit,
      priceAmount:
        input.priceAmount !== undefined
          ? input.priceAmount
          : existing.priceAmount,
      currency: input.currency ?? existing.currency,
      priceUnit: input.priceUnit ?? existing.priceUnit,
      originCountry:
        input.originCountry !== undefined
          ? input.originCountry
          : existing.originCountry,
      harvestYear:
        input.harvestYear !== undefined
          ? input.harvestYear
          : existing.harvestYear,
      siteId: input.siteId !== undefined ? input.siteId : existing.siteId,
      status: input.status ?? existing.status,
      updatedAt: new Date(),
    };
    this.listings.set(listingId, updated);
    return updated;
  }
}

class InMemoryOrganisationsRepository extends OrganisationsRepository {
  membershipsByUser = new Map<string, MembershipRecord[]>();
  organisations = new Map<string, OrganisationRecord>();
  sites = new Map<string, SiteRecord>();

  async findMembershipsForUser(userId: string): Promise<MembershipRecord[]> {
    return this.membershipsByUser.get(userId) ?? [];
  }

  async findMembership(
    userId: string,
    organisationId: string,
  ): Promise<MembershipRecord | null> {
    const list = this.membershipsByUser.get(userId) ?? [];
    return list.find((m) => m.organisationId === organisationId) ?? null;
  }

  async findOrganisationById(id: string): Promise<OrganisationRecord | null> {
    return this.organisations.get(id) ?? null;
  }

  async createOrganisation(
    userId: string,
    input: CreateOrganisationInput,
  ): Promise<OrganisationRecord> {
    const org: OrganisationRecord = {
      id: "org-1",
      name: input.name,
      legalName: input.legalName ?? null,
      organisationType: "SUPPLIER",
      businessType: input.businessType ?? null,
      registrationNumber: input.registrationNumber ?? null,
      vatNumber: input.vatNumber ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      postalCode: input.postalCode ?? null,
      country: input.country ?? null,
      contactName: input.contactName ?? null,
      contactEmail: input.contactEmail ?? null,
      contactPhone: input.contactPhone ?? null,
      verificationStatus: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
      sites: [],
      complianceDocuments: [],
    };
    this.organisations.set(org.id, org);
    return org;
  }

  async updateOrganisationProfile(
    id: string,
    input: UpdateOrganisationProfileInput,
  ): Promise<OrganisationRecord> {
    const existing = this.organisations.get(id)!;
    const updated = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };
    this.organisations.set(id, updated);
    return updated;
  }

  async findSitesByOrganisationId(
    organisationId: string,
  ): Promise<SiteRecord[]> {
    return Array.from(this.sites.values()).filter(
      (s) => s.organisationId === organisationId,
    );
  }

  async findSiteById(
    organisationId: string,
    siteId: string,
  ): Promise<SiteRecord | null> {
    const s = this.sites.get(siteId);
    return s && s.organisationId === organisationId ? s : null;
  }

  async createSite(
    organisationId: string,
    input: CreateSiteInput,
  ): Promise<SiteRecord> {
    const site: SiteRecord = {
      id: "site-1",
      organisationId,
      name: input.name,
      facilityType: input.facilityType ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      postalCode: input.postalCode ?? null,
      country: input.country ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      landAreaHectares: input.landAreaHectares ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sites.set(site.id, site);
    return site;
  }

  async updateSite(
    organisationId: string,
    siteId: string,
    input: UpdateSiteInput,
  ): Promise<SiteRecord> {
    const existing = this.sites.get(siteId)!;
    const updated = { ...existing, ...input, updatedAt: new Date() };
    this.sites.set(siteId, updated);
    return updated;
  }

  async findComplianceDocumentsByOrganisationId(
    organisationId: string,
  ): Promise<ComplianceDocumentRecord[]> {
    void organisationId;
    return [];
  }

  async findComplianceDocumentById(
    organisationId: string,
    documentId: string,
  ): Promise<ComplianceDocumentRecord | null> {
    void organisationId;
    void documentId;
    return null;
  }

  async createComplianceDocument(
    organisationId: string,
    input: {
      documentType: string;
      originalFilename: string;
      storageKey: string;
      mimeType: string;
      fileSize: number;
    },
  ): Promise<ComplianceDocumentRecord> {
    return {
      id: "doc-1",
      organisationId,
      documentType: input.documentType,
      originalFilename: input.originalFilename,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      status: "PENDING_REVIEW",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findMembersByOrganisationId(
    organisationId: string,
  ): Promise<OrganisationMemberRecord[]> {
    void organisationId;
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

class InMemoryAuditEventWriter extends AuditEventWriter {
  events: PlatformAuditEvent[] = [];

  async append(event: PlatformAuditEvent): Promise<void> {
    this.events.push(event);
  }
}

describe("ListingsService", () => {
  let service: ListingsService;
  let repository: InMemoryListingsRepository;
  let organisationsRepository: InMemoryOrganisationsRepository;
  let auditEvents: InMemoryAuditEventWriter;

  const timestamp = new Date("2026-08-29T12:00:00.000Z");

  const orgRecord: OrganisationRecord = {
    id: "org-1",
    name: "Hemp Farm BV",
    legalName: "Hemp Farm BV",
    organisationType: "SUPPLIER",
    businessType: "farmer",
    registrationNumber: "12345678",
    vatNumber: "NL123456789B01",
    address: "Farm Road 1",
    city: "Groningen",
    postalCode: "9711AA",
    country: "Netherlands",
    contactName: "Jan Farmer",
    contactEmail: "jan@example.test",
    contactPhone: "+31612345678",
    verificationStatus: "PENDING",
    createdAt: timestamp,
    updatedAt: timestamp,
    sites: [],
    complianceDocuments: [],
  };

  beforeEach(() => {
    repository = new InMemoryListingsRepository();
    organisationsRepository = new InMemoryOrganisationsRepository();
    auditEvents = new InMemoryAuditEventWriter();
    service = new ListingsService(
      repository,
      organisationsRepository,
      auditEvents,
    );

    organisationsRepository.organisations.set("org-1", orgRecord);
    organisationsRepository.membershipsByUser.set("user-1", [
      {
        id: "mem-1",
        userId: "user-1",
        organisationId: "org-1",
        createdAt: timestamp,
        updatedAt: timestamp,
        organisation: orgRecord,
      },
    ]);
  });

  it("lists listings for authenticated organisation member", async () => {
    await repository.createListing("org-1", {
      title: "Retted Hemp Straw 2026",
      materialType: "HEMP",
      productForm: "STRAW_RETTED",
      quantity: 50,
      quantityUnit: "TONNES",
      priceAmount: 220,
      currency: "EUR",
      priceUnit: "PER_TONNE",
    });

    const result = await service.listListings("user-1", "org-1");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      title: "Retted Hemp Straw 2026",
      materialType: "HEMP",
      productForm: "STRAW_RETTED",
      quantity: 50,
      quantityUnit: "TONNES",
      priceAmount: 220,
    });
  });

  it("rejects listing retrieval for non-member (403)", async () => {
    await expect(
      service.listListings("intruder-user", "org-1"),
    ).rejects.toThrow(ForbiddenException);
  });

  it("creates a new listing with audit logging", async () => {
    const input: CreateListingInput = {
      title: "Technical Hemp Fibre - Grade A",
      description: "High tensile decorticated technical fibre.",
      materialType: "HEMP",
      productForm: "FIBRE_TECHNICAL",
      quantity: 25,
      quantityUnit: "TONNES",
      priceAmount: 850,
      currency: "EUR",
      priceUnit: "PER_TONNE",
      originCountry: "Netherlands",
      harvestYear: 2026,
      status: "DRAFT",
    };

    const created = await service.createListing("user-1", "org-1", input);
    expect(created.id).toBeDefined();
    expect(created.title).toBe("Technical Hemp Fibre - Grade A");
    expect(created.materialType).toBe("HEMP");
    expect(created.quantity).toBe(25);
    expect(created.status).toBe("DRAFT");

    expect(auditEvents.events).toHaveLength(1);
    expect(auditEvents.events[0]).toMatchObject({
      eventType: "organisation.listing.created",
      outcome: "succeeded",
      actor: { type: "user", userId: "user-1" },
      target: { type: "listing", id: created.id },
    });
  });

  it("validates that siteId belongs to the organisation", async () => {
    organisationsRepository.sites.set("site-valid", {
      id: "site-valid",
      organisationId: "org-1",
      name: "Valid Farm Site",
      facilityType: "farm",
      address: null,
      city: null,
      postalCode: null,
      country: null,
      latitude: null,
      longitude: null,
      landAreaHectares: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const valid = await service.createListing("user-1", "org-1", {
      title: "Hemp Straw with Site",
      materialType: "HEMP",
      quantity: 10,
      siteId: "site-valid",
    });
    expect(valid.siteId).toBe("site-valid");

    await expect(
      service.createListing("user-1", "org-1", {
        title: "Hemp Straw with Invalid Site",
        materialType: "HEMP",
        quantity: 10,
        siteId: "site-other-org",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects invalid material type (400)", async () => {
    await expect(
      service.createListing("user-1", "org-1", {
        title: "Synthetic Nylon",
        materialType: "NYLON" as unknown as CreateListingInput["materialType"],
        quantity: 10,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects invalid non-positive quantity (400)", async () => {
    await expect(
      service.createListing("user-1", "org-1", {
        title: "Hemp Straw",
        materialType: "HEMP",
        quantity: -5,
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.createListing("user-1", "org-1", {
        title: "Hemp Straw",
        materialType: "HEMP",
        quantity: 0,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("updates an existing listing with audit logging", async () => {
    const created = await service.createListing("user-1", "org-1", {
      title: "Initial Title",
      materialType: "HEMP",
      quantity: 10,
    });

    const updated = await service.updateListing(
      "user-1",
      "org-1",
      created.id,
      {
        title: "Updated Title",
        quantity: 20,
        status: "PUBLISHED",
      },
    );

    expect(updated.title).toBe("Updated Title");
    expect(updated.quantity).toBe(20);
    expect(updated.status).toBe("PUBLISHED");

    expect(auditEvents.events).toHaveLength(2);
    expect(auditEvents.events[1]).toMatchObject({
      eventType: "organisation.listing.updated",
      outcome: "succeeded",
      actor: { type: "user", userId: "user-1" },
      target: { type: "listing", id: created.id },
    });
  });

  it("returns 404 for non-existent listing", async () => {
    await expect(
      service.getListing("user-1", "org-1", "non-existent-id"),
    ).rejects.toThrow(NotFoundException);
  });

  it("allows Trader to create a listing on behalf of a Supplier organisation", async () => {
    const traderOrg: OrganisationRecord = {
      id: "org-trader",
      name: "I Do Grow Trading BV",
      legalName: "I Do Grow Trading BV",
      organisationType: "TRADER",
      businessType: null,
      registrationNumber: null,
      vatNumber: null,
      address: null,
      city: null,
      postalCode: null,
      country: "Netherlands",
      contactName: "Trader Joe",
      contactEmail: "trader@idogrow.com",
      contactPhone: null,
      verificationStatus: "VERIFIED",
      createdAt: timestamp,
      updatedAt: timestamp,
      sites: [],
      complianceDocuments: [],
    };
    organisationsRepository.organisations.set("org-trader", traderOrg);
    organisationsRepository.membershipsByUser.set("trader-user", [
      {
        id: "mem-trader",
        userId: "trader-user",
        organisationId: "org-trader",
        createdAt: timestamp,
        updatedAt: timestamp,
        organisation: traderOrg,
      },
    ]);

    const created = await service.createListing("trader-user", "org-1", {
      title: "Trader Created Straw",
      materialType: "HEMP",
      quantity: 40,
    });

    expect(created.title).toBe("Trader Created Straw");
    expect(auditEvents.events).toHaveLength(1);
    expect(auditEvents.events[0]).toMatchObject({
      eventType: "organisation.listing.created",
      actor: { type: "user", userId: "trader-user" },
      metadata: { organisationId: "org-1" },
    });
  });

  it("rejects Trader creating a listing for a Buyer organisation (400)", async () => {
    const buyerOrg: OrganisationRecord = {
      id: "org-buyer",
      name: "Textile Buyer BV",
      legalName: "Textile Buyer BV",
      organisationType: "BUYER",
      businessType: null,
      registrationNumber: null,
      vatNumber: null,
      address: null,
      city: null,
      postalCode: null,
      country: "France",
      contactName: "Buyer Bob",
      contactEmail: "bob@buyer.com",
      contactPhone: null,
      verificationStatus: "VERIFIED",
      createdAt: timestamp,
      updatedAt: timestamp,
      sites: [],
      complianceDocuments: [],
    };
    const traderOrg: OrganisationRecord = {
      id: "org-trader",
      name: "I Do Grow Trading BV",
      legalName: "I Do Grow Trading BV",
      organisationType: "TRADER",
      businessType: null,
      registrationNumber: null,
      vatNumber: null,
      address: null,
      city: null,
      postalCode: null,
      country: "Netherlands",
      contactName: "Trader Joe",
      contactEmail: "trader@idogrow.com",
      contactPhone: null,
      verificationStatus: "VERIFIED",
      createdAt: timestamp,
      updatedAt: timestamp,
      sites: [],
      complianceDocuments: [],
    };
    organisationsRepository.organisations.set("org-buyer", buyerOrg);
    organisationsRepository.organisations.set("org-trader", traderOrg);
    organisationsRepository.membershipsByUser.set("trader-user", [
      {
        id: "mem-trader",
        userId: "trader-user",
        organisationId: "org-trader",
        createdAt: timestamp,
        updatedAt: timestamp,
        organisation: traderOrg,
      },
    ]);

    await expect(
      service.createListing("trader-user", "org-buyer", {
        title: "Invalid Buyer Listing",
        materialType: "HEMP",
        quantity: 10,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects Trader listing listings for their own Trader organisation (400)", async () => {
    const traderOrg: OrganisationRecord = {
      id: "org-trader",
      name: "I Do Grow Trading BV",
      legalName: "I Do Grow Trading BV",
      organisationType: "TRADER",
      businessType: null,
      registrationNumber: null,
      vatNumber: null,
      address: null,
      city: null,
      postalCode: null,
      country: "Netherlands",
      contactName: "Trader Joe",
      contactEmail: "trader@idogrow.com",
      contactPhone: null,
      verificationStatus: "VERIFIED",
      createdAt: timestamp,
      updatedAt: timestamp,
      sites: [],
      complianceDocuments: [],
    };
    organisationsRepository.organisations.set("org-trader", traderOrg);
    organisationsRepository.membershipsByUser.set("trader-user", [
      {
        id: "mem-trader",
        userId: "trader-user",
        organisationId: "org-trader",
        createdAt: timestamp,
        updatedAt: timestamp,
        organisation: traderOrg,
      },
    ]);

    await expect(
      service.listListings("trader-user", "org-trader"),
    ).rejects.toThrow(BadRequestException);
  });
});
