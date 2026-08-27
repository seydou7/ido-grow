import type { AuthenticationAuditEvent } from "./contracts";

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

export abstract class AuditEventWriter {
  abstract append(
    event: AuthenticationAuditEvent,
    database?: AuditEventDatabaseClient,
  ): Promise<void>;
}
