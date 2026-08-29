import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import {
  AuditEventWriter,
  type AuthenticationAuditEvent,
  type LoginSucceededAuditEvent,
} from "../src/audit";
import {
  type AuthenticationSessionRecord,
  type AuthenticationUserRecord,
  AuthenticationRepository,
} from "../src/authentication/authentication.repository";
import { PasswordHasher } from "../src/authentication/password-hasher";
import type {
  CreateOrganisationInput,
  CreateSiteInput,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "../src/organisations/contracts";
import type {
  MembershipRecord,
  OrganisationRecord,
  SiteRecord,
} from "../src/organisations/organisations.repository";
import { OrganisationsRepository } from "../src/organisations/organisations.repository";

type MutableSessionRecord = {
  id: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: {
    id: string;
    email: string;
    isActive: boolean;
  };
};

class TestAuthenticationRepository extends AuthenticationRepository {
  users = new Map<string, AuthenticationUserRecord>();
  sessions = new Map<string, MutableSessionRecord>();

  constructor(private readonly auditEvents: TestAuditEventWriter) {
    super();
  }

  async findActiveUserByEmail(email: string): Promise<AuthenticationUserRecord | null> {
    const user = this.users.get(email);
    return user && user.isActive ? user : null;
  }

  async createSession(input: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    auditEvent: LoginSucceededAuditEvent;
  }): Promise<void> {
    const user = Array.from(this.users.values()).find((u) => u.id === input.userId);
    if (!user) return;
    await this.auditEvents.append(input.auditEvent);
    this.sessions.set(input.tokenHash, {
      id: input.id,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
      },
    });
  }

  async findActiveSessionByTokenHash(
    tokenHash: string,
    now: Date,
  ): Promise<AuthenticationSessionRecord | null> {
    const session = this.sessions.get(tokenHash);
    if (!session || session.revokedAt || session.expiresAt <= now) {
      return null;
    }
    return session;
  }

  async revokeSessionByTokenHash(
    sessionId: string,
    tokenHash: string,
    revokedAt: Date,
  ): Promise<boolean> {
    const session = this.sessions.get(tokenHash);
    if (session && session.id === sessionId && !session.revokedAt) {
      session.revokedAt = revokedAt;
      return true;
    }
    return false;
  }
}

class TestAuditEventWriter extends AuditEventWriter {
  events: AuthenticationAuditEvent[] = [];
  failure: Error | null = null;

  async append(event: AuthenticationAuditEvent): Promise<void> {
    if (this.failure) throw this.failure;
    this.events.push(event);
  }
}

class TestOrganisationsRepository extends OrganisationsRepository {
  membershipsByUser = new Map<string, MembershipRecord[]>();
  requestedUserIds: string[] = [];
  organisations = new Map<string, OrganisationRecord>();
  sites = new Map<string, SiteRecord>();

  async findMembershipsForUser(userId: string): Promise<MembershipRecord[]> {
    this.requestedUserIds.push(userId);
    return this.membershipsByUser.get(userId) ?? [];
  }

  async findMembership(userId: string, organisationId: string): Promise<MembershipRecord | null> {
    const list = this.membershipsByUser.get(userId) ?? [];
    return list.find((m) => m.organisationId === organisationId) ?? null;
  }

  async findOrganisationById(id: string): Promise<OrganisationRecord | null> {
    return this.organisations.get(id) ?? null;
  }

  async createOrganisation(userId: string, input: CreateOrganisationInput): Promise<OrganisationRecord> {
    const org: OrganisationRecord = {
      id: "org-" + Math.random().toString(36).substring(7),
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
    this.organisations.set(org.id, org);
    return org;
  }

  async updateOrganisationProfile(id: string, input: UpdateOrganisationProfileInput): Promise<OrganisationRecord> {
    const existing = this.organisations.get(id)!;
    const updated: OrganisationRecord = {
      ...existing,
      name: input.name ?? existing.name,
      legalName: input.legalName !== undefined ? input.legalName : existing.legalName,
      businessType: input.businessType !== undefined ? input.businessType : existing.businessType,
      updatedAt: new Date(),
    };
    this.organisations.set(id, updated);
    return updated;
  }

  async findSitesByOrganisationId(organisationId: string): Promise<SiteRecord[]> {
    return Array.from(this.sites.values()).filter((s) => s.organisationId === organisationId);
  }

  async findSiteById(organisationId: string, siteId: string): Promise<SiteRecord | null> {
    const s = this.sites.get(siteId);
    return s && s.organisationId === organisationId ? s : null;
  }

  async createSite(organisationId: string, input: CreateSiteInput): Promise<SiteRecord> {
    const site: SiteRecord = {
      id: "site-" + Math.random().toString(36).substring(7),
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

  async updateSite(organisationId: string, siteId: string, input: UpdateSiteInput): Promise<SiteRecord> {
    const existing = this.sites.get(siteId)!;
    const updated: SiteRecord = {
      ...existing,
      name: input.name ?? existing.name,
      updatedAt: new Date(),
    };
    this.sites.set(siteId, updated);
    return updated;
  }
}

describe("application-managed authentication (e2e)", () => {
  let app: INestApplication;
  let repository: TestAuthenticationRepository;
  let organisationsRepository: TestOrganisationsRepository;
  let auditEvents: TestAuditEventWriter;

  beforeAll(async () => {
    process.env.IDO_GROW_RUNTIME_ENV = "local";
    auditEvents = new TestAuditEventWriter();
    repository = new TestAuthenticationRepository(auditEvents);
    organisationsRepository = new TestOrganisationsRepository();
    repository.users.set("synthetic@example.test", {
      id: "4c74eb4d-f1c4-4dc8-8281-e7cd42447188",
      email: "synthetic@example.test",
      passwordHash: await new PasswordHasher().hash("correct-password"),
      isActive: true,
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AuthenticationRepository)
      .useValue(repository)
      .overrideProvider(OrganisationsRepository)
      .useValue(organisationsRepository)
      .overrideProvider(AuditEventWriter)
      .useValue(auditEvents)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("completes full login, session lookup, membership retrieval, and logout cycle", async () => {
    const timestamp = new Date("2026-08-26T12:00:00.000Z");
    organisationsRepository.membershipsByUser.set(
      "4c74eb4d-f1c4-4dc8-8281-e7cd42447188",
      [
        membershipRecord(
          "70258169-2f5a-4b05-9b21-698fba0e08f2",
          "514ab31e-450f-488a-ba02-0e9e1c27ad6f",
          timestamp,
        ),
      ],
    );

    const loginRes = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "synthetic@example.test", password: "correct-password" })
      .expect(200);

    const cookie = loginRes.headers["set-cookie"];
    expect(cookie).toBeDefined();

    const sessionRes = await request(app.getHttpServer())
      .get("/api/v1/auth/session")
      .set("Cookie", cookie)
      .expect(200);

    expect(sessionRes.body).toMatchObject({
      status: "authenticated",
      user: {
        id: "4c74eb4d-f1c4-4dc8-8281-e7cd42447188",
        email: "synthetic@example.test",
      },
    });

    const membershipRes = await request(app.getHttpServer())
      .get("/api/v1/memberships")
      .set("Cookie", cookie)
      .expect(200);

    expect(membershipRes.body.items).toHaveLength(1);
    expect(membershipRes.body.items[0].organisation.name).toBe("Synthetic Test Organisation");

    await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Cookie", cookie)
      .expect(204);

    await request(app.getHttpServer())
      .get("/api/v1/auth/session")
      .set("Cookie", cookie)
      .expect(401);
  });
});

function membershipRecord(
  membershipId: string,
  organisationId: string,
  timestamp: Date,
): MembershipRecord {
  return {
    id: membershipId,
    userId: "4c74eb4d-f1c4-4dc8-8281-e7cd42447188",
    organisationId,
    createdAt: timestamp,
    updatedAt: timestamp,
    organisation: {
      id: organisationId,
      name: "Synthetic Test Organisation",
      legalName: "Synthetic Test Legal Entity",
      organisationType: "SUPPLIER",
      businessType: "farmer",
      registrationNumber: "KVK-11223344",
      vatNumber: "NL11223344B01",
      address: "Hemp Road 1",
      city: "Groningen",
      postalCode: "9700AA",
      country: "Netherlands",
      contactName: "Test Contact",
      contactEmail: "test@example.test",
      contactPhone: "+31600000000",
      verificationStatus: "PENDING",
      createdAt: timestamp,
      updatedAt: timestamp,
      sites: [
        {
          id: `site-for-${organisationId}`,
          organisationId,
          name: "Synthetic Test Site",
          facilityType: "farm",
          address: "Site Road 1",
          city: "Groningen",
          postalCode: "9700AA",
          country: "Netherlands",
          latitude: 53.2194,
          longitude: 6.5665,
          landAreaHectares: 50.0,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    },
  };
}
