import { Injectable } from "@nestjs/common";

import { PrismaService } from "../database";
import {
  type AuditEventCreateData,
  type AuditEventDatabaseClient,
  AuditEventWriter,
} from "./audit-event.writer";
import type { AuthenticationAuditEvent } from "./contracts";

@Injectable()
export class PrismaAuditEventWriter extends AuditEventWriter {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async append(
    event: AuthenticationAuditEvent,
    database: AuditEventDatabaseClient = this.prisma,
  ): Promise<void> {
    await database.auditEvent.create({ data: sanitizeAuthenticationEvent(event) });
  }
}

export function sanitizeAuthenticationEvent(
  event: AuthenticationAuditEvent,
): AuditEventCreateData {
  assertUuid(event.correlationId, "correlationId");

  if (!Number.isFinite(event.occurredAt.getTime())) {
    throw new Error("Audit event occurredAt must be a valid Date.");
  }

  switch (event.eventType) {
    case "authentication.login.failed":
      return {
        eventType: event.eventType,
        outcome: "failed",
        actorType: "unauthenticated",
        actorUserId: null,
        targetType: "authentication",
        targetId: null,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: { failureCategory: "invalid_credentials" },
      };
    case "authentication.login.succeeded":
    case "authentication.logout.succeeded":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "session",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: {},
      };
  }
}

function assertUuid(value: string, field: string): void {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new Error(`Audit event ${field} must be a UUID.`);
  }
}
