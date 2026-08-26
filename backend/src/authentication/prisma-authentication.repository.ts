import { Injectable } from "@nestjs/common";

import { PrismaService } from "../database";
import {
  AuthenticationRepository,
  type AuthenticationSessionRecord,
  type AuthenticationUserRecord,
} from "./authentication.repository";

@Injectable()
export class PrismaAuthenticationRepository extends AuthenticationRepository {
  constructor(private readonly prisma: PrismaService) {
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
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.session.create({ data: input });
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
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
        user: { select: { id: true, email: true, isActive: true } },
      },
    });
  }

  async revokeSessionByTokenHash(
    tokenHash: string,
    revokedAt: Date,
  ): Promise<void> {
    await this.prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt },
    });
  }
}
