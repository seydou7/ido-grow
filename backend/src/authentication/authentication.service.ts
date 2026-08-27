import { Injectable } from "@nestjs/common";

import type { AuthenticationIdentity } from "./contracts";
import { AuthenticationProblem } from "./authentication-problem";
import { AuthenticationRepository } from "./authentication.repository";
import { Clock } from "./clock";
import { PasswordHasher } from "./password-hasher";
import { LOCAL_SESSION_DURATION_MS } from "./runtime-config";
import { hashSessionToken, SessionTokenService } from "./session-token";

export type AuthenticatedSessionResult = Readonly<{
  status: "authenticated";
  user: Readonly<{ id: string; email: string }>;
}>;

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly repository: AuthenticationRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionTokens: SessionTokenService,
    private readonly clock: Clock,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<Readonly<{ response: AuthenticatedSessionResult; rawToken: string }>> {
    const user = await this.repository.findActiveUserByEmail(email);
    const verified = await this.passwordHasher.verify(
      password,
      user?.passwordHash ?? this.passwordHasher.dummyHash(),
    );

    if (!user || !verified) {
      throwInvalidCredentials();
    }

    const token = this.sessionTokens.create();
    const now = this.clock.now();
    const expiresAt = new Date(now.getTime() + LOCAL_SESSION_DURATION_MS);

    await this.repository.createSession({
      userId: user.id,
      tokenHash: token.hash,
      expiresAt,
    });

    return {
      rawToken: token.raw,
      response: authenticatedResponse({ userId: user.id, email: user.email }),
    };
  }

  async session(rawToken: string | null): Promise<AuthenticatedSessionResult> {
    return authenticatedResponse(await this.resolveIdentity(rawToken));
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

  async logout(rawToken: string | null): Promise<void> {
    if (!rawToken) {
      return;
    }

    await this.repository.revokeSessionByTokenHash(
      hashSessionToken(rawToken),
      this.clock.now(),
    );
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

function throwInvalidCredentials(): never {
  throw new AuthenticationProblem(
    401,
    "AUTHENTICATION_REQUIRED",
    "Authentication required",
    "The email or password is incorrect.",
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
