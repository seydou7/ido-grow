import type { LoginSucceededAuditEvent } from "../audit";

export type AuthenticationUserRecord = Readonly<{
  id: string;
  email: string;
  role?: string | null;
  passwordHash: string;
  isActive: boolean;
}>;

export type AuthenticationSessionRecord = Readonly<{
  id: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: Readonly<{
    id: string;
    email: string;
    role?: string | null;
    isActive: boolean;
  }>;
}>;

export abstract class AuthenticationRepository {
  abstract findActiveUserByEmail(
    normalizedEmail: string,
  ): Promise<AuthenticationUserRecord | null>;

  abstract createSession(input: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    auditEvent: LoginSucceededAuditEvent;
  }): Promise<void>;

  abstract findActiveSessionByTokenHash(
    tokenHash: string,
    now: Date,
  ): Promise<AuthenticationSessionRecord | null>;

  abstract revokeSessionByTokenHash(
    sessionId: string,
    tokenHash: string,
    revokedAt: Date,
  ): Promise<boolean>;

  abstract createBuyerUser(input: {
    userId: string;
    email: string;
    passwordHash: string;
    organisationId: string;
    companyName: string;
    contactName?: string | null;
    country?: string | null;
    sessionId: string;
    tokenHash: string;
    expiresAt: Date;
    auditEvent: LoginSucceededAuditEvent;
  }): Promise<{
    user: { id: string; email: string; role: string | null };
    organisation: { id: string; name: string; organisationType: "BUYER" };
  }>;
}
