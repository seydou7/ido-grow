import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { AuditEventWriter } from "../audit";
import type { AuthenticationIdentity } from "./contracts";
import { AuthenticationProblem } from "./authentication-problem";
import { AuthenticationRepository } from "./authentication.repository";
import { Clock } from "./clock";
import { PasswordHasher } from "./password-hasher";
import { LOCAL_SESSION_DURATION_MS } from "./runtime-config";
import { hashSessionToken, SessionTokenService } from "./session-token";

export type UnauthenticatedSessionResult = Readonly<{
  status: "unauthenticated";
  user: null;
}>;

export type AuthenticatedSessionResult = Readonly<{
  status: "authenticated";
  user: Readonly<{ id: string; email: string }>;
}>;

export type SessionStatusResult =
  | UnauthenticatedSessionResult
  | AuthenticatedSessionResult;

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly repository: AuthenticationRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionTokens: SessionTokenService,
    private readonly clock: Clock,
    private readonly auditEvents: AuditEventWriter,
  ) {}

  async login(
    email: string,
    password: string,
    correlationId: string,
  ): Promise<Readonly<{ response: AuthenticatedSessionResult; rawToken: string }>> {
    const user = await this.repository.findActiveUserByEmail(email);
    const verified = await this.passwordHasher.verify(
      password,
      user?.passwordHash ?? this.passwordHasher.dummyHash(),
    );

    if (!user || !verified) {
      await this.auditEvents.append({
        eventType: "authentication.login.failed",
        outcome: "failed",
        actor: { type: "unauthenticated" },
        target: { type: "authentication", id: null },
        correlationId,
        occurredAt: this.clock.now(),
        metadata: { failureCategory: "invalid_credentials" },
      });
      throwInvalidCredentials(correlationId);
    }

    const token = this.sessionTokens.create();
    const now = this.clock.now();
    const expiresAt = new Date(now.getTime() + LOCAL_SESSION_DURATION_MS);

    const sessionId = randomUUID();

    await this.repository.createSession({
      id: sessionId,
      userId: user.id,
      tokenHash: token.hash,
      expiresAt,
      auditEvent: {
        eventType: "authentication.login.succeeded",
        outcome: "succeeded",
        actor: { type: "user", userId: user.id },
        target: { type: "session", id: sessionId },
        correlationId,
        occurredAt: now,
        metadata: {},
      },
    });

    return {
      rawToken: token.raw,
      response: authenticatedResponse({ userId: user.id, email: user.email }),
    };
  }

  async session(rawToken: string | null): Promise<SessionStatusResult> {
    if (!rawToken) {
      return { status: "unauthenticated", user: null };
    }

    const now = this.clock.now();
    const session = await this.repository.findActiveSessionByTokenHash(
      hashSessionToken(rawToken),
      now,
    );

    if (
      !session ||
      session.revokedAt !== null ||
      session.expiresAt.getTime() <= now.getTime() ||
      !session.user.isActive
    ) {
      return { status: "unauthenticated", user: null };
    }

    return authenticatedResponse({
      userId: session.user.id,
      email: session.user.email,
    });
  }

  async resolveIdentity(
    rawToken: string | null,
  ): Promise<AuthenticationIdentity> {
    if (!rawToken) {
      throwAuthenticationRequired();
    }

    const now = this.clock.now();
    const session = await this.repository.findActiveSessionByTokenHash(
      hashSessionToken(rawToken),
      now,
    );

    if (
      !session ||
      session.revokedAt !== null ||
      session.expiresAt.getTime() <= now.getTime() ||
      !session.user.isActive
    ) {
      throwAuthenticationRequired();
    }

    return {
      userId: session.user.id,
      email: session.user.email,
    };
  }

  async logout(rawToken: string | null, correlationId: string): Promise<void> {
    if (!rawToken) {
      return;
    }

    const now = this.clock.now();
    const tokenHash = hashSessionToken(rawToken);
    const session = await this.repository.findActiveSessionByTokenHash(
      tokenHash,
      now,
    );

    if (!session) {
      return;
    }

    const revoked = await this.repository.revokeSessionByTokenHash(
      session.id,
      tokenHash,
      now,
    );

    if (!revoked) {
      return;
    }

    await this.auditEvents.append({
      eventType: "authentication.logout.succeeded",
      outcome: "succeeded",
      actor: { type: "user", userId: session.user.id },
      target: { type: "session", id: session.id },
      correlationId,
      occurredAt: now,
      metadata: {},
    });
  }
}

function authenticatedResponse(
  identity: AuthenticationIdentity,
): AuthenticatedSessionResult {
  return {
    status: "authenticated",
    user: { id: identity.userId, email: identity.email },
  };
}

function throwInvalidCredentials(correlationId: string): never {
  throw new AuthenticationProblem(
    401,
    "AUTHENTICATION_REQUIRED",
    "Authentication required",
    "The email or password is incorrect.",
    correlationId,
  );
}

function throwAuthenticationRequired(): never {
  throw new AuthenticationProblem(
    401,
    "AUTHENTICATION_REQUIRED",
    "Authentication required",
    "A valid application session is required.",
  );
}
