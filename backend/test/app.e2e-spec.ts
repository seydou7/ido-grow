import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import {
  AuthenticationRepository,
  type AuthenticationSessionRecord,
  type AuthenticationUserRecord,
} from "../src/authentication/authentication.repository";
import { PasswordHasher } from "../src/authentication/password-hasher";
import { PrismaService } from "../src/database";

class TestAuthenticationRepository extends AuthenticationRepository {
  users = new Map<string, AuthenticationUserRecord>();
  sessions = new Map<string, AuthenticationSessionRecord>();

  async findActiveUserByEmail(
    email: string,
  ): Promise<AuthenticationUserRecord | null> {
    const user = this.users.get(email);
    return user?.isActive ? user : null;
  }

  async createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    const user = [...this.users.values()].find(({ id }) => id === input.userId);
    if (!user) throw new Error("Missing test user");

    this.sessions.set(input.tokenHash, {
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
    tokenHash: string,
    revokedAt: Date,
  ): Promise<void> {
    const session = this.sessions.get(tokenHash);
    if (session) this.sessions.set(tokenHash, { ...session, revokedAt });
  }
}

describe("application-managed authentication (e2e)", () => {
  let app: INestApplication;
  let repository: TestAuthenticationRepository;

  beforeAll(async () => {
    process.env.IDO_GROW_RUNTIME_ENV = "local";
    repository = new TestAuthenticationRepository();
    repository.users.set("synthetic@example.test", {
      id: "4c74eb4d-f1c4-4dc8-8281-e7cd42447188",
      email: "synthetic@example.test",
      passwordHash: await new PasswordHasher().hash("correct-password"),
      isActive: true,
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AuthenticationRepository)
      .useValue(repository)
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
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
