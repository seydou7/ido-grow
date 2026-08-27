import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import {
  type AuthenticationAuditEvent,
  AuditEventWriter,
} from "../src/audit";
import {
  AuthenticationRepository,
  type AuthenticationSessionRecord,
  type AuthenticationUserRecord,
} from "../src/authentication/authentication.repository";
import { PasswordHasher } from "../src/authentication/password-hasher";
import { PrismaService } from "../src/database";
import {
  type MembershipRecord,
  OrganisationsRepository,
} from "../src/organisations/organisations.repository";

class TestAuthenticationRepository extends AuthenticationRepository {
  constructor(private readonly auditEvents: TestAuditEventWriter) {
    super();
  }

  users = new Map<string, AuthenticationUserRecord>();
  sessions = new Map<string, AuthenticationSessionRecord>();

  async findActiveUserByEmail(
    email: string,
  ): Promise<AuthenticationUserRecord | null> {
    const user = this.users.get(email);
    return user?.isActive ? user : null;
  }

  async createSession(input: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    auditEvent: Extract<
      AuthenticationAuditEvent,
      { eventType: "authentication.login.succeeded" }
    >;
  }): Promise<void> {
    const user = [...this.users.values()].find(({ id }) => id === input.userId);
    if (!user) throw new Error("Missing test user");

    await this.auditEvents.append(input.auditEvent);
    this.sessions.set(input.tokenHash, {
      id: input.id,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
      user,
    });
  }

  async findActiveSessionByTokenHash(
    tokenHash: string,
    now: Date,
  ): Promise<AuthenticationSessionRecord | null> {
    const session = this.sessions.get(tokenHash);
    return session &&
      session.revokedAt === null &&
      session.expiresAt > now &&
      session.user.isActive
      ? session
      : null;
  }

  async revokeSessionByTokenHash(
    sessionId: string,
    tokenHash: string,
    revokedAt: Date,
  ): Promise<boolean> {
    const session = this.sessions.get(tokenHash);
    if (!session || session.id !== sessionId || session.revokedAt !== null) {
      return false;
    }

    this.sessions.set(tokenHash, { ...session, revokedAt });
    return true;
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

  async findMembershipsForUser(userId: string): Promise<MembershipRecord[]> {
    this.requestedUserIds.push(userId);
    return this.membershipsByUser.get(userId) ?? [];
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
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication({ logger: false });
    app.setGlobalPrefix("api/v1");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.IDO_GROW_RUNTIME_ENV;
  });

  it("does not expose an unrelated feature endpoint", async () => {
    await request(app.getHttpServer()).get("/api/v1").expect(404);
  });

  it("does not reveal whether a user exists", async () => {
    const auditCount = auditEvents.events.length;
    const wrongPassword = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "synthetic@example.test", password: "wrong-password" })
      .expect(401)
      .expect("Cache-Control", "no-store")
      .expect("Content-Type", /application\/problem\+json/);
    const unknownUser = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "unknown@example.test", password: "wrong-password" })
      .expect(401)
      .expect("Cache-Control", "no-store");

    expect({ ...unknownUser.body, requestId: "ignored" }).toEqual({
      ...wrongPassword.body,
      requestId: "ignored",
    });
    expect(JSON.stringify(unknownUser.body)).not.toContain("unknown@example.test");
    const failedEvents = auditEvents.events.slice(auditCount);
    expect(failedEvents).toHaveLength(2);
    expect(failedEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "authentication.login.failed",
          actor: { type: "unauthenticated" },
        }),
      ]),
    );
    expect(JSON.stringify(failedEvents)).not.toMatch(
      /synthetic@example|unknown@example|wrong-password/i,
    );
    expect(failedEvents[0]?.correlationId).toBe(
      wrongPassword.headers["x-request-id"],
    );
    expect(failedEvents[1]?.correlationId).toBe(
      unknownUser.headers["x-request-id"],
    );
  });

  it("logs in with a secure local cookie and returns only safe identity", async () => {
    const response = await login();
    const cookie = response.headers["set-cookie"]?.[0] ?? "";

    expect(response.body).toEqual({
      status: "authenticated",
      user: {
        id: "4c74eb4d-f1c4-4dc8-8281-e7cd42447188",
        email: "synthetic@example.test",
      },
    });
    expect(cookie).toMatch(/^ido_grow_session=[A-Za-z0-9_-]{43};/);
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("Secure");
    expect(JSON.stringify(response.body)).not.toMatch(/password|token|hash/i);
    expect([...repository.sessions.keys()][0]).toMatch(/^[0-9a-f]{64}$/);
    expect(cookie).not.toContain([...repository.sessions.keys()][0]);
    expect(auditEvents.events.at(-1)).toMatchObject({
      eventType: "authentication.login.succeeded",
      actor: {
        type: "user",
        userId: "4c74eb4d-f1c4-4dc8-8281-e7cd42447188",
      },
      correlationId: response.headers["x-request-id"],
    });
  });

  it("rejects a non-local browser origin before a state-changing login", async () => {
    const sessionCount = repository.sessions.size;
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .set("Origin", "http://attacker.example")
      .send({ email: "synthetic@example.test", password: "correct-password" })
      .expect(403)
      .expect("Cache-Control", "no-store")
      .expect("Content-Type", /application\/problem\+json/);

    expect(response.body.code).toBe("REQUEST_ORIGIN_REJECTED");
    expect(response.headers["set-cookie"]).toBeUndefined();
    expect(repository.sessions.size).toBe(sessionCount);
  });

  it("returns Problem Details for an unauthenticated session request", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/auth/session")
      .expect(401)
      .expect("Cache-Control", "no-store")
      .expect("Content-Type", /application\/problem\+json/);

    expect(response.body).toMatchObject({
      type: "about:blank",
      title: "Authentication required",
      status: 401,
      code: "AUTHENTICATION_REQUIRED",
      instance: "/api/v1/auth/session",
    });
    expect(response.body.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.headers["x-request-id"]).toBe(response.body.requestId);
  });

  it("resolves a valid application session", async () => {
    const loginResponse = await login();
    const cookie = loginResponse.headers["set-cookie"]?.[0];
    if (!cookie) throw new Error("Missing test session cookie");

    const response = await request(app.getHttpServer())
      .get("/api/v1/auth/session")
      .set("Cookie", cookie)
      .expect(200)
      .expect("Cache-Control", "no-store");

    expect(response.body).toEqual(loginResponse.body);
  });

  it("revokes the session on logout and clears the cookie", async () => {
    const loginResponse = await login();
    const cookie = loginResponse.headers["set-cookie"]?.[0];
    if (!cookie) throw new Error("Missing test session cookie");

    const logoutResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Origin", "http://localhost:3000")
      .set("Cookie", cookie)
      .expect(204)
      .expect("Cache-Control", "no-store");

    expect(logoutResponse.headers["set-cookie"]?.[0]).toMatch(
      /^ido_grow_session=;/,
    );
    await request(app.getHttpServer())
      .get("/api/v1/auth/session")
      .set("Cookie", cookie)
      .expect(401);
    expect(auditEvents.events.at(-1)).toMatchObject({
      eventType: "authentication.logout.succeeded",
      actor: {
        type: "user",
        userId: "4c74eb4d-f1c4-4dc8-8281-e7cd42447188",
      },
      correlationId: logoutResponse.headers["x-request-id"],
    });
  });

  it("blocks login creation and preserves logout revocation when audit persistence fails", async () => {
    const sessionCount = repository.sessions.size;
    auditEvents.failure = new Error("audit unavailable");

    const failedLogin = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .send({ email: "synthetic@example.test", password: "correct-password" })
      .expect(500);
    expect(failedLogin.headers["set-cookie"]).toBeUndefined();
    expect(repository.sessions.size).toBe(sessionCount);

    auditEvents.failure = null;
    const loginResponse = await login();
    const cookie = loginResponse.headers["set-cookie"]?.[0];
    if (!cookie) throw new Error("Missing test session cookie");

    auditEvents.failure = new Error("audit unavailable");
    const failedLogout = await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Origin", "http://localhost:3000")
      .set("Cookie", cookie)
      .expect(500);
    expect(failedLogout.headers["set-cookie"]?.[0]).toMatch(
      /^ido_grow_session=;/,
    );

    auditEvents.failure = null;
    await request(app.getHttpServer())
      .get("/api/v1/auth/session")
      .set("Cookie", cookie)
      .expect(401);
  });

  it("rejects a non-local browser origin without revoking the session", async () => {
    const loginResponse = await login();
    const cookie = loginResponse.headers["set-cookie"]?.[0];
    if (!cookie) throw new Error("Missing test session cookie");

    await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Origin", "null")
      .set("Cookie", cookie)
      .expect(403)
      .expect("Cache-Control", "no-store");

    await request(app.getHttpServer())
      .get("/api/v1/auth/session")
      .set("Cookie", cookie)
      .expect(200);
  });

  it("denies unauthenticated self-membership retrieval", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/memberships")
      .expect(401)
      .expect("Cache-Control", "no-store")
      .expect("Content-Type", /application\/problem\+json/);

    expect(response.body).toMatchObject({
      type: "about:blank",
      title: "Authentication required",
      status: 401,
      code: "AUTHENTICATION_REQUIRED",
      instance: "/api/v1/memberships",
    });
    expect(organisationsRepository.requestedUserIds).toEqual([]);
  });

  it("returns an empty collection for an authenticated user with no memberships", async () => {
    const loginResponse = await login();
    const cookie = loginResponse.headers["set-cookie"]?.[0];
    if (!cookie) throw new Error("Missing test session cookie");

    const response = await request(app.getHttpServer())
      .get("/api/v1/memberships")
      .set("Cookie", cookie)
      .expect(200)
      .expect("Cache-Control", "no-store");

    expect(response.body).toEqual({
      items: [],
      page: { nextCursor: null, hasMore: false },
    });
    expect(organisationsRepository.requestedUserIds.at(-1)).toBe(
      "4c74eb4d-f1c4-4dc8-8281-e7cd42447188",
    );
  });

  it("derives self-memberships from the session and ignores user-supplied scope", async () => {
    const timestamp = new Date("2026-08-26T12:00:00.000Z");
    const userAId = "4c74eb4d-f1c4-4dc8-8281-e7cd42447188";
    const userBId = "54133469-4e0c-4427-a54a-6156d5a01ba7";
    organisationsRepository.membershipsByUser.set(userAId, [
      membershipRecord("membership-a", "organisation-a", timestamp),
    ]);
    organisationsRepository.membershipsByUser.set(userBId, [
      membershipRecord("membership-b", "organisation-b", timestamp),
    ]);

    const loginResponse = await login();
    const cookie = loginResponse.headers["set-cookie"]?.[0];
    if (!cookie) throw new Error("Missing test session cookie");

    const response = await request(app.getHttpServer())
      .get(
        `/api/v1/memberships?userId=${userBId}&organisationId=organisation-b`,
      )
      .set("Cookie", cookie)
      .expect(200)
      .expect("Cache-Control", "no-store");

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({
      id: "membership-a",
      organisation: { id: "organisation-a" },
    });
    expect(JSON.stringify(response.body)).not.toContain("membership-b");
    expect(JSON.stringify(response.body)).not.toContain("organisation-b");
    expect(JSON.stringify(response.body)).not.toMatch(
      /password|session|token|hash|role|permission|authority|activeOrganisation/i,
    );
    expect(organisationsRepository.requestedUserIds.at(-1)).toBe(userAId);
  });

  function login() {
    return request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .send({
        email: "synthetic@example.test",
        password: "correct-password",
      })
      .expect(200)
      .expect("Cache-Control", "no-store");
  }
});

function membershipRecord(
  membershipId: string,
  organisationId: string,
  timestamp: Date,
): MembershipRecord {
  return {
    id: membershipId,
    createdAt: timestamp,
    updatedAt: timestamp,
    organisation: {
      id: organisationId,
      name: "Synthetic Test Organisation",
      createdAt: timestamp,
      updatedAt: timestamp,
      sites: [
        {
          id: `site-for-${organisationId}`,
          name: "Synthetic Test Site",
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    },
  };
}
