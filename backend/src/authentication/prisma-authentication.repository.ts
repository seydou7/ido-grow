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
        user: { select: { id: true, email: true, isActive: true } },
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
}
