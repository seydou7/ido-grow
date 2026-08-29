import { ForbiddenException } from "@nestjs/common";

import { AuditEventWriter, type PlatformAuditEvent } from "../audit";
import type {
  CreateOrganisationInput,
  CreateSiteInput,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "./contracts";
import type {
  MembershipRecord,
  OrganisationRecord,
  SiteRecord,
} from "./organisations.repository";
import { OrganisationsRepository } from "./organisations.repository";
import { OrganisationsService } from "./organisations.service";

class InMemoryAuditEventWriter extends AuditEventWriter {
  readonly events: PlatformAuditEvent[] = [];

  async append(event: PlatformAuditEvent): Promise<void> {
    this.events.push(event);
  }
}

class InMemoryOrganisationsRepository extends OrganisationsRepository {
  readonly membershipsByUser = new Map<string, MembershipRecord[]>();
  readonly organisations = new Map<string, OrganisationRecord>();
  readonly sites = new Map<string, SiteRecord>();

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
    const id = "org-" + Math.random().toString(36).substring(7);
    const org: OrganisationRecord = {
      id,
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
    };
    this.organisations.set(id, org);

    const userMemberships = this.membershipsByUser.get(userId) ?? [];
    userMemberships.push({
      id: "membership-" + id,
      userId,
      organisationId: id,
      createdAt: new Date(),
      updatedAt: new Date(),
      organisation: org,
    });
    this.membershipsByUser.set(userId, userMemberships);

    return org;
  }

  async updateOrganisationProfile(
    id: string,
    input: UpdateOrganisationProfileInput,
  ): Promise<OrganisationRecord> {
    const existing = this.organisations.get(id);
    if (!existing) throw new Error("Organisation not found");
    const updated: OrganisationRecord = {
      ...existing,
      name: input.name ?? existing.name,
      legalName: input.legalName !== undefined ? input.legalName : existing.legalName,
      businessType: input.businessType !== undefined ? input.businessType : existing.businessType,
      registrationNumber: input.registrationNumber !== undefined ? input.registrationNumber : existing.registrationNumber,
      vatNumber: input.vatNumber !== undefined ? input.vatNumber : existing.vatNumber,
      address: input.address !== undefined ? input.address : existing.address,
      city: input.city !== undefined ? input.city : existing.city,
      postalCode: input.postalCode !== undefined ? input.postalCode : existing.postalCode,
      country: input.country !== undefined ? input.country : existing.country,
      contactName: input.contactName !== undefined ? input.contactName : existing.contactName,
      contactEmail: input.contactEmail !== undefined ? input.contactEmail : existing.contactEmail,
      contactPhone: input.contactPhone !== undefined ? input.contactPhone : existing.contactPhone,
      updatedAt: new Date(),
    };
    this.organisations.set(id, updated);
    return updated;
  }

  async findSitesByOrganisationId(organisationId: string): Promise<SiteRecord[]> {
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
    const id = "site-" + Math.random().toString(36).substring(7);
    const site: SiteRecord = {
      id,
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
    this.sites.set(id, site);
    return site;
  }

  async updateSite(
    organisationId: string,
    siteId: string,
    input: UpdateSiteInput,
  ): Promise<SiteRecord> {
    const existing = this.sites.get(siteId);
    if (!existing || existing.organisationId !== organisationId) {
      throw new Error("Site not found");
    }
    const updated: SiteRecord = {
      ...existing,
      name: input.name ?? existing.name,
      facilityType: input.facilityType !== undefined ? input.facilityType : existing.facilityType,
      address: input.address !== undefined ? input.address : existing.address,
      city: input.city !== undefined ? input.city : existing.city,
      postalCode: input.postalCode !== undefined ? input.postalCode : existing.postalCode,
      country: input.country !== undefined ? input.country : existing.country,
      latitude: input.latitude !== undefined ? input.latitude : existing.latitude,
      longitude: input.longitude !== undefined ? input.longitude : existing.longitude,
      landAreaHectares: input.landAreaHectares !== undefined ? input.landAreaHectares : existing.landAreaHectares,
      updatedAt: new Date(),
    };
    this.sites.set(siteId, updated);
    return updated;
  }
}

describe("OrganisationsService", () => {
  const timestamp = new Date("2026-08-26T12:00:00.000Z");
  let repository: InMemoryOrganisationsRepository;
  let auditWriter: InMemoryAuditEventWriter;
  let service: OrganisationsService;

  beforeEach(() => {
    repository = new InMemoryOrganisationsRepository();
    auditWriter = new InMemoryAuditEventWriter();
    service = new OrganisationsService(repository, auditWriter);
  });

  it("returns a valid empty collection for an authenticated user with no memberships", async () => {
    await expect(service.findSelfMemberships("user-with-none")).resolves.toEqual({
      items: [],
      page: { nextCursor: null, hasMore: false },
    });
  });

  it("allows a member to view their organisation profile with completeness calculation", async () => {
    const orgRecord: OrganisationRecord = {
      id: "org-1",
      name: "Green Fields Hemp Cooperative",
      legalName: "Green Fields Hemp Coop BV",
      organisationType: "SUPPLIER",
      businessType: "cooperative",
      registrationNumber: "NL12345678",
      vatNumber: "NL87654321B01",
      address: "Hemp Road 42",
      city: "Groningen",
      postalCode: "9700AB",
      country: "Netherlands",
      contactName: "Jan de Vries",
      contactEmail: "jan@greenfields.nl",
      contactPhone: "+31612345678",
      verificationStatus: "PENDING",
      createdAt: timestamp,
      updatedAt: timestamp,
      sites: [],
    };
    repository.organisations.set("org-1", orgRecord);
    repository.membershipsByUser.set("user-1", [
      {
        id: "mem-1",
        userId: "user-1",
        organisationId: "org-1",
        createdAt: timestamp,
        updatedAt: timestamp,
        organisation: orgRecord,
      },
    ]);

    const profile = await service.getOrganisationProfile("user-1", "org-1");

    expect(profile.id).toBe("org-1");
    expect(profile.name).toBe("Green Fields Hemp Cooperative");
    expect(profile.businessType).toBe("cooperative");
    expect(profile.missingFields).toEqual(["productionSites"]);
    expect(profile.completenessPercent).toBe(91); // 10/11 filled
  });

  it("rejects access to organisation profile if user is not a member (403)", async () => {
    await expect(
      service.getOrganisationProfile("unauthorized-user", "org-1"),
    ).rejects.toThrow(ForbiddenException);
  });

  it("allows a member to update organisation profile and writes audit event", async () => {
    const orgRecord: OrganisationRecord = {
      id: "org-1",
      name: "Original Name",
      legalName: null,
      organisationType: "SUPPLIER",
      businessType: null,
      registrationNumber: null,
      vatNumber: null,
      address: null,
      city: null,
      postalCode: null,
      country: null,
      contactName: null,
      contactEmail: null,
      contactPhone: null,
      verificationStatus: "PENDING",
      createdAt: timestamp,
      updatedAt: timestamp,
      sites: [],
    };
    repository.organisations.set("org-1", orgRecord);
    repository.membershipsByUser.set("user-1", [
      {
        id: "mem-1",
        userId: "user-1",
        organisationId: "org-1",
        createdAt: timestamp,
        updatedAt: timestamp,
        organisation: orgRecord,
      },
    ]);

    const updated = await service.updateOrganisationProfile("user-1", "org-1", {
      name: "Updated Farm Name",
      legalName: "Updated Legal Name",
      businessType: "farmer",
      country: "France",
    });

    expect(updated.name).toBe("Updated Farm Name");
    expect(updated.legalName).toBe("Updated Legal Name");
    expect(updated.businessType).toBe("farmer");
    expect(updated.country).toBe("France");
    expect(auditWriter.events.length).toBe(1);
    expect(auditWriter.events[0].eventType).toBe("organisation.profile.updated");
  });

  it("allows member to create and list sites and writes audit event", async () => {
    const orgRecord: OrganisationRecord = {
      id: "org-1",
      name: "Farm Org",
      legalName: null,
      organisationType: "SUPPLIER",
      businessType: null,
      registrationNumber: null,
      vatNumber: null,
      address: null,
      city: null,
      postalCode: null,
      country: null,
      contactName: null,
      contactEmail: null,
      contactPhone: null,
      verificationStatus: "PENDING",
      createdAt: timestamp,
      updatedAt: timestamp,
      sites: [],
    };
    repository.organisations.set("org-1", orgRecord);
    repository.membershipsByUser.set("user-1", [
      {
        id: "mem-1",
        userId: "user-1",
        organisationId: "org-1",
        createdAt: timestamp,
        updatedAt: timestamp,
        organisation: orgRecord,
      },
    ]);

    const site = await service.createSite("user-1", "org-1", {
      name: "North Parcel Farm",
      facilityType: "farm",
      city: "Reims",
      country: "France",
      latitude: 49.2583,
      longitude: 4.0317,
      landAreaHectares: 120.5,
    });

    expect(site.name).toBe("North Parcel Farm");
    expect(site.facilityType).toBe("farm");
    expect(site.latitude).toBe(49.2583);
    expect(site.landAreaHectares).toBe(120.5);

    const siteList = await service.listSites("user-1", "org-1");
    expect(siteList.items.length).toBe(1);
    expect(siteList.items[0].name).toBe("North Parcel Farm");

    expect(auditWriter.events.length).toBe(1);
    expect(auditWriter.events[0].eventType).toBe("organisation.site.created");
  });

  it("rejects site access for non-members (403)", async () => {
    await expect(
      service.listSites("unauthorized-user", "org-1"),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.createSite("unauthorized-user", "org-1", { name: "Illegal Site" }),
    ).rejects.toThrow(ForbiddenException);
  });
});
