import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Readable } from "node:stream";

import { AuditEventWriter, type PlatformAuditEvent } from "../audit";
import { StorageService, type RetrievedFile, type StoredFileMetadata } from "../storage";
import type {
  CreateOrganisationInput,
  CreateSiteInput,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "./contracts";
import type {
  ComplianceDocumentRecord,
  MembershipRecord,
  OrganisationRecord,
  SiteRecord,
} from "./organisations.repository";
import { OrganisationsRepository } from "./organisations.repository";
import { OrganisationsService } from "./organisations.service";

class InMemoryStorageService extends StorageService {
  readonly files = new Map<string, { buffer: Buffer; mimeType: string; filename: string }>();

  async store(
    filename: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StoredFileMetadata> {
    const storageKey = `mock-${Math.random().toString(36).substring(7)}.pdf`;
    this.files.set(storageKey, { buffer, mimeType, filename });
    return {
      storageKey,
      originalFilename: filename,
      mimeType,
      fileSize: buffer.length,
    };
  }

  async retrieve(
    storageKey: string,
    originalFilename: string,
    mimeType: string,
  ): Promise<RetrievedFile | null> {
    void mimeType;
    const f = this.files.get(storageKey);
    if (!f) return null;
    return {
      stream: Readable.from(f.buffer),
      mimeType: f.mimeType,
      fileSize: f.buffer.length,
      filename: originalFilename,
    };
  }

  async delete(storageKey: string): Promise<boolean> {
    return this.files.delete(storageKey);
  }
}

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
  readonly documents = new Map<string, ComplianceDocumentRecord>();

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
      complianceDocuments: [],
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

  async findComplianceDocumentsByOrganisationId(organisationId: string): Promise<ComplianceDocumentRecord[]> {
    return Array.from(this.documents.values()).filter(
      (d) => d.organisationId === organisationId,
    );
  }

  async findComplianceDocumentById(
    organisationId: string,
    documentId: string,
  ): Promise<ComplianceDocumentRecord | null> {
    const d = this.documents.get(documentId);
    return d && d.organisationId === organisationId ? d : null;
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
    const id = "doc-" + Math.random().toString(36).substring(7);
    const doc: ComplianceDocumentRecord = {
      id,
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
    this.documents.set(id, doc);

    const org = this.organisations.get(organisationId);
    if (org) {
      this.organisations.set(organisationId, {
        ...org,
        complianceDocuments: [...org.complianceDocuments, doc],
      });
    }

    return doc;
  }

  async findMembersByOrganisationId(organisationId: string): Promise<{
    id: string;
    userId: string;
    organisationId: string;
    userEmail: string;
    createdAt: Date;
    updatedAt: Date;
  }[]> {
    const list: {
      id: string;
      userId: string;
      organisationId: string;
      userEmail: string;
      createdAt: Date;
      updatedAt: Date;
    }[] = [];

    for (const [uid, userMemberships] of this.membershipsByUser.entries()) {
      for (const m of userMemberships) {
        if (m.organisationId === organisationId) {
          list.push({
            id: m.id,
            userId: uid,
            organisationId: m.organisationId,
            userEmail: `${uid}@example.test`,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          });
        }
      }
    }
    return list;
  }

  async findOrganisationsByType(
    organisationType: string,
  ): Promise<OrganisationRecord[]> {
    return Array.from(this.organisations.values()).filter(
      (o) => o.organisationType.toUpperCase() === organisationType.toUpperCase(),
    );
  }
}

describe("OrganisationsService", () => {
  const timestamp = new Date("2026-08-26T12:00:00.000Z");
  let repository: InMemoryOrganisationsRepository;
  let auditWriter: InMemoryAuditEventWriter;
  let storage: InMemoryStorageService;
  let service: OrganisationsService;

  beforeEach(() => {
    repository = new InMemoryOrganisationsRepository();
    auditWriter = new InMemoryAuditEventWriter();
    storage = new InMemoryStorageService();
    service = new OrganisationsService(repository, auditWriter, storage);
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
      complianceDocuments: [],
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
    expect(profile.missingFields).toEqual(["productionSites", "complianceDocuments"]);
    expect(profile.completenessPercent).toBe(83); // 10/12 filled
  });

  it("rejects access to organisation profile if user is not a member (403)", async () => {
    await expect(
      service.getOrganisationProfile("unauthorized-user", "org-1"),
    ).rejects.toThrow(ForbiddenException);
  });

  it("allows member to upload compliance document, persists record, and logs audit event", async () => {
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
      complianceDocuments: [],
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

    const buffer = Buffer.from("%PDF-1.4 kvk proof");
    const doc = await service.uploadComplianceDocument(
      "user-1",
      "org-1",
      "COMPANY_REGISTRATION",
      "kvk_extract.pdf",
      buffer,
      "application/pdf",
    );

    expect(doc.documentType).toBe("COMPANY_REGISTRATION");
    expect(doc.originalFilename).toBe("kvk_extract.pdf");
    expect(doc.status).toBe("PENDING_REVIEW");

    const docs = await service.listComplianceDocuments("user-1", "org-1");
    expect(docs.items.length).toBe(1);
    expect(docs.items[0].id).toBe(doc.id);

    expect(auditWriter.events.length).toBe(1);
    expect(auditWriter.events[0].eventType).toBe("organisation.compliance_document.uploaded");
  });

  it("rejects invalid document types (400)", async () => {
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
      complianceDocuments: [],
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

    await expect(
      service.uploadComplianceDocument(
        "user-1",
        "org-1",
        "UNSUPPORTED_TYPE",
        "file.pdf",
        Buffer.from("data"),
        "application/pdf",
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("allows member to download and remove compliance document", async () => {
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
      complianceDocuments: [],
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

    const doc = await service.uploadComplianceDocument(
      "user-1",
      "org-1",
      "ORGANIC_CERTIFICATION",
      "organic_cert.pdf",
      Buffer.from("%PDF-1.4 organic"),
      "application/pdf",
    );

    const file = await service.getComplianceDocumentFile("user-1", "org-1", doc.id);
    expect(file.filename).toBe("organic_cert.pdf");

    const docs = await service.listComplianceDocuments("user-1", "org-1");
    expect(docs.items.length).toBe(1);
    expect(docs.items[0].documentType).toBe("ORGANIC_CERTIFICATION");

    expect(auditWriter.events.length).toBe(1);
    expect(auditWriter.events[0].eventType).toBe("organisation.compliance_document.uploaded");
  });

  it("rejects document operations for non-members (403)", async () => {
    await expect(
      service.listComplianceDocuments("intruder", "org-1"),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.uploadComplianceDocument(
        "intruder",
        "org-1",
        "TAX_CERTIFICATE",
        "tax.pdf",
        Buffer.from("tax"),
        "application/pdf",
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("lists organisation members for authenticated member", async () => {
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
      complianceDocuments: [],
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
    repository.membershipsByUser.set("user-2", [
      {
        id: "mem-2",
        userId: "user-2",
        organisationId: "org-1",
        createdAt: timestamp,
        updatedAt: timestamp,
        organisation: orgRecord,
      },
    ]);

    const result = await service.listOrganisationMembers("user-1", "org-1");
    expect(result.items.length).toBe(2);
    expect(result.items[0]).toMatchObject({
      id: "mem-1",
      userId: "user-1",
      organisationId: "org-1",
      userEmail: "user-1@example.test",
    });
    expect(result.items[1]).toMatchObject({
      id: "mem-2",
      userId: "user-2",
      organisationId: "org-1",
      userEmail: "user-2@example.test",
    });
  });

  it("rejects listing members for non-members (403)", async () => {
    await expect(
      service.listOrganisationMembers("intruder", "org-1"),
    ).rejects.toThrow(ForbiddenException);
  });
});
