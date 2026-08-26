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
  ): Promise<AuthenticationSessionRecord | null> {
    return this.sessions.get(tokenHash) ?? null;
  }

  async revokeSessionByTokenHash(
    tokenHash: string,
    revokedAt: Date,
  ): Promise<void> {
    const session = this.sessions.get(tokenHash);
    if (session) this.sessions.set(tokenHash, { ...session, revokedAt });
  }
}

describe("AuthenticationService", () => {
  const now = new Date("2026-08-23T12:00:00.000Z");
  let repository: InMemoryAuthenticationRepository;
  let clock: FixedClock;
  let service: AuthenticationService;
  let passwordHasher: PasswordHasher;

  beforeEach(async () => {
    repository = new InMemoryAuthenticationRepository();
    clock = new FixedClock(now);
    passwordHasher = new PasswordHasher();
    service = new AuthenticationService(
      repository,
      passwordHasher,
      new SessionTokenService(),
      clock,
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
        await service.login(email, "wrong-password");
      } catch (error) {
        const problem = error as AuthenticationProblem;
        return { status: problem.getStatus(), body: problem.getResponse() };
      }
      throw new Error("Expected authentication to fail");
    };

    await expect(capture("synthetic@example.test")).resolves.toEqual(
      await capture("unknown@example.test"),
    );
  });

  it("creates an eight-hour hashed session and returns only safe identity", async () => {
    const result = await service.login(
      "synthetic@example.test",
      "correct-password",
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
  });

  it("resolves an active session", async () => {
    const login = await service.login(
      "synthetic@example.test",
      "correct-password",
    );

    await expect(service.session(login.rawToken)).resolves.toEqual(login.response);
  });

  it("rejects missing, expired, revoked, and disabled-user sessions", async () => {
    await expect(service.session(null)).rejects.toMatchObject({ status: 401 });

    const expired = await service.login(
      "synthetic@example.test",
      "correct-password",
    );
    clock.set(new Date(now.getTime() + LOCAL_SESSION_DURATION_MS));
    await expect(service.session(expired.rawToken)).rejects.toMatchObject({
      status: 401,
    });

    clock.set(now);
    const revoked = await service.login(
      "synthetic@example.test",
      "correct-password",
    );
    await service.logout(revoked.rawToken);
    await expect(service.session(revoked.rawToken)).rejects.toMatchObject({
      status: 401,
    });

    const disabled = await service.login(
      "synthetic@example.test",
      "correct-password",
    );
    const disabledTokenHash = hashSessionToken(disabled.rawToken);
    const stored = repository.sessions.get(disabledTokenHash);
    if (!stored) throw new Error("Missing test session");
    repository.sessions.set(disabledTokenHash, {
      ...stored,
      user: { ...stored.user, isActive: false },
    });
    await expect(service.session(disabled.rawToken)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("makes logout idempotent and revokes a presented session", async () => {
    const login = await service.login(
      "synthetic@example.test",
      "correct-password",
    );

    await service.logout(login.rawToken);
    await service.logout(login.rawToken);
    await service.logout(null);

    await expect(service.session(login.rawToken)).rejects.toMatchObject({
      status: 401,
    });
  });
});
