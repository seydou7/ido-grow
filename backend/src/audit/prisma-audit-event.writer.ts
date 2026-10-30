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
    case "quality.inspection.created":
    case "quality.inspection.assigned":
    case "quality.inspection.started":
    case "quality.measurements.updated":
    case "quality.inspection.completed":
    case "quality.evidence.uploaded":
    case "quality.assessment.recorded":
    case "quality.non_conformity.created":
    case "quality.non_conformity.resolved":
    case "quality.result.approved":
      case "quality.result.rejected":
      case "quality.certificate.issued":
      case "quality.physical_inspection.requested":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "inspection",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as Record<string, string>,
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
    case "contract.created":
    case "contract.updated":
    case "contract.confirmed":
    case "contract.document.generated":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "contract",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "logistics.shipment.created":
    case "logistics.shipment.requirements.updated":
    case "logistics.carrier.selected":
    case "logistics.carrier.reselected":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "shipment",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "logistics.freight_request.created":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "logistics_request",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "logistics.freight_quote.submitted":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "freight_quotation",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "logistics.pickup.scheduled":
    case "logistics.shipment.picked_up":
    case "logistics.shipment.in_transit":
    case "logistics.shipment.customs":
    case "logistics.shipment.delayed":
    case "logistics.delivery.confirmed":
    case "logistics.shipment.disputed":
    case "logistics.shipment.closed":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "shipment",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "logistics.shipping_document.uploaded":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "shipment_document",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "logistics.discrepancy.recorded":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "discrepancy",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "logistics.costs.reconciled":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "cost_reconciliation",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "settlement.created":
    case "settlement.updated":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "settlement",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "settlement.document.uploaded":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "settlement_document",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "settlement.claim.created":
    case "settlement.claim.resolved":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "settlement_claim",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "dpp.lot.created":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "traceable_lot",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "dpp.passport.created":
    case "dpp.passport.synchronized":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "dpp",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "dpp.version.created":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "dpp_version",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "dpp.custody.recorded":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "dpp_custody_record",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "ai.run.started":
    case "ai.run.completed":
    case "ai.run.failed":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: event.outcome,
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "ai_run",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "ai.proposal.created":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "ai_proposal",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "ai.approval.requested":
    case "ai.approval.approved":
    case "ai.approval.rejected":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: "succeeded",
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "ai_approval",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
      };
    case "ai.tool.executed":
    case "ai.tool.failed":
      assertUuid(event.actor.userId, "actor.userId");
      assertUuid(event.target.id, "target.id");
      return {
        eventType: event.eventType,
        outcome: event.outcome,
        actorType: "user",
        actorUserId: event.actor.userId,
        targetType: "ai_tool_execution",
        targetId: event.target.id,
        correlationId: event.correlationId,
        occurredAt: event.occurredAt,
        metadata: event.metadata as unknown as Record<string, string>,
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
