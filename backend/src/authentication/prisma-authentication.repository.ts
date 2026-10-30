import { Injectable } from "@nestjs/common";

import {
  AuditEventWriter,
  type LoginSucceededAuditEvent,
} from "../audit";
import { PrismaService } from "../database";
import {
  AuthenticationRepository,
  type AuthenticationSessionRecord,
  type AuthenticationUserRecord,
} from "./authentication.repository";

@Injectable()
export class PrismaAuthenticationRepository extends AuthenticationRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditEvents: AuditEventWriter,
  ) {
    super();
  }

  findActiveUserByEmail(
    normalizedEmail: string,
  ): Promise<AuthenticationUserRecord | null> {
    return this.prisma.user.findFirst({
      where: { email: normalizedEmail, isActive: true },
      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        isActive: true,
      },
    });
  }

  async createSession(input: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    auditEvent: LoginSucceededAuditEvent;
  }): Promise<void> {
    const { auditEvent, ...session } = input;

    await this.prisma.$transaction(async (transaction) => {
      await transaction.session.create({ data: session });
      await this.auditEvents.append(auditEvent, transaction);
    });
  }

  findActiveSessionByTokenHash(
    tokenHash: string,
    now: Date,
  ): Promise<AuthenticationSessionRecord | null> {
    return this.prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
        user: { isActive: true },
      },
      select: {
        id: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
        user: { select: { id: true, email: true, role: true, isActive: true } },
      },
    });
  }

  async revokeSessionByTokenHash(
    sessionId: string,
    tokenHash: string,
    revokedAt: Date,
  ): Promise<boolean> {
    const result = await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: revokedAt },
        user: { isActive: true },
      },
      data: { revokedAt },
    });

    return result.count > 0;
  }

  async createBuyerUser(input: {
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
  }> {
    const { auditEvent, sessionId, tokenHash, expiresAt, ...userData } = input;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userData.userId,
          email: userData.email,
          passwordHash: userData.passwordHash,
          isActive: true,
          role: "STANDARD",
        },
        select: { id: true, email: true, role: true },
      });

      const organisation = await tx.organisation.create({
        data: {
          id: userData.organisationId,
          name: userData.companyName,
          legalName: userData.companyName,
          organisationType: "BUYER",
          contactName: userData.contactName || null,
          contactEmail: userData.email,
          country: userData.country || null,
          verificationStatus: "PENDING",
        },
        select: { id: true, name: true, organisationType: true },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          organisationId: organisation.id,
        },
      });

      await tx.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await this.auditEvents.append(auditEvent, tx);

      return {
        user,
        organisation: {
          id: organisation.id,
          name: organisation.name,
          organisationType: "BUYER" as const,
        },
      };
    });
  }
}
