export type AuthenticationUserRecord = Readonly<{
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
}>;

export type AuthenticationSessionRecord = Readonly<{
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: Readonly<{
    id: string;
    email: string;
    isActive: boolean;
  }>;
}>;

export abstract class AuthenticationRepository {
  abstract findActiveUserByEmail(
    normalizedEmail: string,
  ): Promise<AuthenticationUserRecord | null>;

  abstract createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;

  abstract findActiveSessionByTokenHash(
    tokenHash: string,
    now: Date,
  ): Promise<AuthenticationSessionRecord | null>;

  abstract revokeSessionByTokenHash(
    tokenHash: string,
    revokedAt: Date,
  ): Promise<void>;
}
