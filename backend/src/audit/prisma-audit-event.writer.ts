import { Injectable } from "@nestjs/common";

import { PrismaService } from "../database";
import {
  type AuditEventCreateData,
  type AuditEventDatabaseClient,
  type PersistedAuditEvent,
  AuditEventWriter,
} from "./audit-event.writer";
import type { PlatformAuditEvent } from "./contracts";

@Injectable()
export class PrismaAuditEventWriter extends AuditEventWriter {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async append(
    event: PlatformAuditEvent,
    database: AuditEventDatabaseClient = this.prisma,
  ): Promise<void> {
    await database.auditEvent.create({ data: sanitizePlatformEvent(event) });
  }

  async findEventsByTarget(
    targetType: string,
    targetId: string,
  ): Promise<PersistedAuditEvent[]> {
    if (!this.prisma?.auditEvent?.findMany) return [];

    const events = await this.prisma.auditEvent.findMany({
      where: { targetType, targetId },
      include: {
        actorUser: {
          select: { email: true },
        },
      },
      orderBy: { occurredAt: "asc" },
    });

    return events.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      outcome: e.outcome,
      actorType: e.actorType,
      actorUserId: e.actorUserId,
      actorUserEmail: e.actorUser?.email ?? null,
      targetType: e.targetType,
      targetId: e.targetId,
      correlationId: e.correlationId,
      occurredAt: e.occurredAt,
      metadata: (e.metadata as Record<string, unknown>) ?? {},
    }));
  }
}

export function sanitizePlatformEvent(
  event: PlatformAuditEvent,
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
    case "organisation.profile.updated":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "organisation",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata,
      };
    case "organisation.site.created":
    case "organisation.site.updated":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "site",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: { organisationId: event.metadata.organisationId },
      };
    case "organisation.compliance_document.uploaded":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "compliance_document",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: {
          organisationId: event.metadata.organisationId,
          documentType: event.metadata.documentType,
          filename: event.metadata.filename,
        },
      };
    case "organisation.listing.created":
    case "organisation.listing.updated":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "listing",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata,
      };
    case "buyer.buy_order.created":
    case "buyer.buy_order.updated":
    case "buyer.buy_order.submitted":
    case "buyer.buy_order.cancelled":
    case "buyer.buy_order.deleted":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "buy_order",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata,
      };
    case "buyer.buy_order.match.created":
    case "buyer.buy_order.match.approved":
    case "buyer.buy_order.match.cancelled":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "match",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata,
      };
    case "quote.created":
    case "quote.version.created":
    case "quote.submitted_for_internal_review":
    case "quote.returned_to_draft":
    case "quote.sent":
    case "quote.countered":
    case "quote.accepted":
    case "quote.rejected":
    case "quote.counter.revised":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "quote",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata,
      };
    case "trade.created":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "trade",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata,
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
