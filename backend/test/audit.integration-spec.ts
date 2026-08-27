import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { AuditEventWriter } from "../src/audit";
import { PrismaAuditEventWriter } from "../src/audit/prisma-audit-event.writer";
import { AuthenticationService } from "../src/authentication/authentication.service";
import { Clock } from "../src/authentication/clock";
import { PasswordHasher } from "../src/authentication/password-hasher";
import { PrismaAuthenticationRepository } from "../src/authentication/prisma-authentication.repository";
import {
  hashSessionToken,
  SessionTokenService,
} from "../src/authentication/session-token";
import { PrismaService } from "../src/database";

class FailingAuditEventWriter extends AuditEventWriter {
  async append(): Promise<void> {
    throw new Error("audit unavailable");
  }
}

describe("immutable audit event persistence (integration)", () => {
  const prisma = new PrismaClient();
  const writer = new PrismaAuditEventWriter(prisma as PrismaService);
  const userId = randomUUID();
  const sessionId = randomUUID();
  const correlationId = randomUUID();
  const sessionIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.user.create({
      data: {
        id: userId,
        email: `audit-${userId}@example.test`,
        passwordHash: "integration-test-only-password-hash",
      },
    });
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { id: { in: sessionIds } } });
    await prisma.auditEvent.deleteMany({ where: { actorUserId: userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("persists an allowlisted event with server-derived references", async () => {
    const occurredAt = new Date("2026-08-27T12:00:00.000Z");

    await writer.append({
      eventType: "authentication.login.succeeded",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "session", id: sessionId },
      correlationId,
      occurredAt,
      metadata: {},
    });

    const event = await prisma.auditEvent.findFirstOrThrow({
      where: { actorUserId: userId, correlationId },
    });
    expect(event).toMatchObject({
      eventType: "authentication.login.succeeded",
      outcome: "succeeded",
      actorType: "user",
      actorUserId: userId,
      targetType: "session",
      targetId: sessionId,
      correlationId,
      occurredAt,
      metadata: {},
    });
  });

  it("preserves audit actor history by restricting deletion", async () => {
    await expect(prisma.user.delete({ where: { id: userId } })).rejects.toMatchObject(
      { code: "P2003" },
    );
  });

  it("rolls back session creation when its audit write fails", async () => {
    const sessionId = randomUUID();
    sessionIds.push(sessionId);
    const repository = new PrismaAuthenticationRepository(
      prisma as PrismaService,
      new FailingAuditEventWriter(),
    );

    await expect(
      repository.createSession({
        id: sessionId,
        userId,
        tokenHash: "a".repeat(64),
        expiresAt: new Date("2026-08-28T12:00:00.000Z"),
        auditEvent: {
          eventType: "authentication.login.succeeded",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "session", id: sessionId },
          correlationId: randomUUID(),
          occurredAt: new Date("2026-08-27T12:00:00.000Z"),
          metadata: {},
        },
      }),
    ).rejects.toThrow("audit unavailable");

    await expect(
      prisma.session.findUnique({ where: { id: sessionId } }),
    ).resolves.toBeNull();
  });

  it("keeps session revocation committed when its audit write fails", async () => {
    const sessionId = randomUUID();
    sessionIds.push(sessionId);
    const rawToken = `integration-logout-token-${randomUUID()}`;
    const tokenHash = hashSessionToken(rawToken);
    const failingAuditEvents = new FailingAuditEventWriter();
    const repository = new PrismaAuthenticationRepository(
      prisma as PrismaService,
      failingAuditEvents,
    );
    const authentication = new AuthenticationService(
      repository,
      new PasswordHasher(),
      new SessionTokenService(),
      new Clock(),
      failingAuditEvents,
    );
    await prisma.session.create({
      data: {
        id: sessionId,
        userId,
        tokenHash,
        expiresAt: new Date("2099-08-28T12:00:00.000Z"),
      },
    });

    await expect(
      authentication.logout(rawToken, randomUUID()),
    ).rejects.toThrow("audit unavailable");

    const revokedSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    expect(revokedSession?.revokedAt).toBeInstanceOf(Date);
  });
});
