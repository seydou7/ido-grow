import type { PlatformAuditEvent } from "./contracts";

export type AuditEventCreateData = Readonly<{
  eventType: string;
  outcome: string;
  actorType: string;
  actorUserId: string | null;
  targetType: string;
  targetId: string | null;
  correlationId: string;
  occurredAt: Date;
  metadata: Readonly<Record<string, string>>;
}>;

export type AuditEventDatabaseClient = Readonly<{
  auditEvent: Readonly<{
    create(input: { data: AuditEventCreateData }): Promise<unknown>;
  }>;
}>;

export type PersistedAuditEvent = Readonly<{
  id: string;
  eventType: string;
  outcome: string;
  actorType: string;
  actorUserId: string | null;
  actorUserEmail?: string | null;
  targetType: string;
  targetId: string | null;
  correlationId: string;
  occurredAt: Date;
  metadata: Record<string, unknown>;
}>;

export abstract class AuditEventWriter {
  abstract append(
    event: PlatformAuditEvent,
    database?: AuditEventDatabaseClient,
  ): Promise<void>;

  async findEventsByTarget(
    targetType: string,
    targetId: string,
  ): Promise<PersistedAuditEvent[]> {
    void targetType;
    void targetId;
    return [];
  }
}
