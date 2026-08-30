import {
  type AuthenticationAuditEvent,
  AuditEventWriter,
} from "../audit";
import { AuthenticationProblem } from "./authentication-problem";
import {
  AuthenticationRepository,
  type AuthenticationSessionRecord,
  type AuthenticationUserRecord,
} from "./authentication.repository";
import { AuthenticationService } from "./authentication.service";
import { Clock } from "./clock";
import { PasswordHasher } from "./password-hasher";
import { LOCAL_SESSION_DURATION_MS } from "./runtime-config";
import { hashSessionToken, SessionTokenService } from "./session-token";

class FixedClock extends Clock {
  constructor(private current: Date) {
    super();
  }

  now(): Date {
    return new Date(this.current);
  }

  set(value: Date): void {
    this.current = value;
  }
}

class InMemoryAuthenticationRepository extends AuthenticationRepository {
  constructor(private readonly auditEvents: InMemoryAuditEventWriter) {
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
  ): Promise<AuthenticationSessionRecord | null> {
    return this.sessions.get(tokenHash) ?? null;
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

class InMemoryAuditEventWriter extends AuditEventWriter {
  events: AuthenticationAuditEvent[] = [];
  failure: Error | null = null;

  async append(event: AuthenticationAuditEvent): Promise<void> {
    if (this.failure) throw this.failure;
    this.events.push(event);
  }
}

describe("AuthenticationService", () => {
  const now = new Date("2026-08-23T12:00:00.000Z");
  let repository: InMemoryAuthenticationRepository;
  let clock: FixedClock;
  let service: AuthenticationService;
  let passwordHasher: PasswordHasher;
  let auditEvents: InMemoryAuditEventWriter;

  beforeEach(async () => {
    auditEvents = new InMemoryAuditEventWriter();
    repository = new InMemoryAuthenticationRepository(auditEvents);
    clock = new FixedClock(now);
    passwordHasher = new PasswordHasher();
    service = new AuthenticationService(
      repository,
      passwordHasher,
      new SessionTokenService(),
      clock,
      auditEvents,
    );
    repository.users.set("synthetic@example.test", {
      id: "user-1",
      email: "synthetic@example.test",
      passwordHash: await passwordHasher.hash("correct-password"),
      isActive: true,
    });
  });

  it("returns the same generic error for a wrong password and unknown user", async () => {
    const capture = async (email: string) => {
      try {
        await service.login(email, "wrong-password", CORRELATION_ID);
      } catch (error) {
        const problem = error as AuthenticationProblem;
        return { status: problem.getStatus(), body: problem.getResponse() };
      }
      throw new Error("Expected authentication to fail");
    };

    await expect(capture("synthetic@example.test")).resolves.toEqual(
      await capture("unknown@example.test"),
    );
    expect(auditEvents.events).toHaveLength(2);
    expect(auditEvents.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "authentication.login.failed",
          actor: { type: "unauthenticated" },
          metadata: { failureCategory: "invalid_credentials" },
        }),
      ]),
    );
    expect(JSON.stringify(auditEvents.events)).not.toMatch(
      /synthetic@example|unknown@example|wrong-password/i,
    );
  });

  it("creates an eight-hour hashed session and returns only safe identity", async () => {
    const result = await service.login(
      "synthetic@example.test",
      "correct-password",
      CORRELATION_ID,
    );
    const stored = [...repository.sessions.values()][0];

    expect(result.response).toEqual({
      status: "authenticated",
      user: { id: "user-1", email: "synthetic@example.test" },
    });
    expect(stored.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored.tokenHash).not.toBe(result.rawToken);
    expect(stored.expiresAt.getTime() - now.getTime()).toBe(
      LOCAL_SESSION_DURATION_MS,
    );
    expect(JSON.stringify(result.response)).not.toMatch(/password|token|hash/i);
    expect(auditEvents.events).toEqual([
      expect.objectContaining({
        eventType: "authentication.login.succeeded",
        actor: { type: "user", userId: "user-1" },
        target: { type: "session", id: stored.id },
      }),
    ]);
  });

  it("resolves an active session", async () => {
    const login = await service.login(
      "synthetic@example.test",
      "correct-password",
      CORRELATION_ID,
    );

    await expect(service.session(login.rawToken)).resolves.toEqual(login.response);
  });

  it("returns unauthenticated for missing, expired, revoked, and disabled-user sessions", async () => {
    await expect(service.session(null)).resolves.toEqual({
      status: "unauthenticated",
      user: null,
    });
    await expect(service.resolveIdentity(null)).rejects.toMatchObject({
      status: 401,
    });

    const expired = await service.login(
      "synthetic@example.test",
      "correct-password",
      CORRELATION_ID,
    );
    clock.set(new Date(now.getTime() + LOCAL_SESSION_DURATION_MS));
    await expect(service.session(expired.rawToken)).resolves.toEqual({
      status: "unauthenticated",
      user: null,
    });
    await expect(service.resolveIdentity(expired.rawToken)).rejects.toMatchObject({
      status: 401,
    });

    clock.set(now);
    const revoked = await service.login(
      "synthetic@example.test",
      "correct-password",
      CORRELATION_ID,
    );
    await service.logout(revoked.rawToken, CORRELATION_ID);
    await expect(service.session(revoked.rawToken)).resolves.toEqual({
      status: "unauthenticated",
      user: null,
    });
    await expect(service.resolveIdentity(revoked.rawToken)).rejects.toMatchObject({
      status: 401,
    });

    const disabled = await service.login(
      "synthetic@example.test",
      "correct-password",
      CORRELATION_ID,
    );
    const disabledTokenHash = hashSessionToken(disabled.rawToken);
    const stored = repository.sessions.get(disabledTokenHash);
    if (!stored) throw new Error("Missing test session");
    repository.sessions.set(disabledTokenHash, {
      ...stored,
      user: { ...stored.user, isActive: false },
    });
    await expect(service.session(disabled.rawToken)).resolves.toEqual({
      status: "unauthenticated",
      user: null,
    });
    await expect(service.resolveIdentity(disabled.rawToken)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("makes logout idempotent and revokes a presented session", async () => {
    const login = await service.login(
      "synthetic@example.test",
      "correct-password",
      CORRELATION_ID,
    );

    await service.logout(login.rawToken, CORRELATION_ID);
    await service.logout(login.rawToken, CORRELATION_ID);
    await service.logout(null, CORRELATION_ID);

    await expect(service.session(login.rawToken)).resolves.toEqual({
      status: "unauthenticated",
      user: null,
    });
    await expect(service.resolveIdentity(login.rawToken)).rejects.toMatchObject({
      status: 401,
    });
    expect(
      auditEvents.events.filter(
        ({ eventType }) => eventType === "authentication.logout.succeeded",
      ),
    ).toHaveLength(1);
  });

  it("fails closed when audit persistence is unavailable", async () => {
    auditEvents.failure = new Error("audit unavailable");

    await expect(
      service.login("synthetic@example.test", "correct-password", CORRELATION_ID),
    ).rejects.toThrow("audit unavailable");
    expect(repository.sessions.size).toBe(0);

    await expect(
      service.login("unknown@example.test", "wrong-password", CORRELATION_ID),
    ).rejects.toThrow("audit unavailable");
  });

  it("keeps a session revoked when its audit event cannot be persisted", async () => {
    const login = await service.login(
      "synthetic@example.test",
      "correct-password",
      CORRELATION_ID,
    );
    auditEvents.failure = new Error("audit unavailable");

    await expect(
      service.logout(login.rawToken, CORRELATION_ID),
    ).rejects.toThrow("audit unavailable");
    await expect(service.session(login.rawToken)).resolves.toEqual({
      status: "unauthenticated",
      user: null,
    });
    await expect(service.resolveIdentity(login.rawToken)).rejects.toMatchObject({
      status: 401,
    });
  });
});

const CORRELATION_ID = "20000000-0000-4000-8000-000000000001";
