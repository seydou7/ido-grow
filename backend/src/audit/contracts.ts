export const AUTHENTICATION_AUDIT_EVENT_TYPES = [
  "authentication.login.succeeded",
  "authentication.login.failed",
  "authentication.logout.succeeded",
] as const;

export type AuthenticationAuditEventType =
  (typeof AUTHENTICATION_AUDIT_EVENT_TYPES)[number];

type AuditEventBase = Readonly<{
  correlationId: string;
  occurredAt: Date;
}>;

export type LoginSucceededAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "authentication.login.succeeded";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "session"; id: string }>;
    metadata: Readonly<Record<string, never>>;
  }>;

export type LoginFailedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "authentication.login.failed";
    outcome: "failed";
    actor: Readonly<{ type: "unauthenticated" }>;
    target: Readonly<{ type: "authentication"; id: null }>;
    metadata: Readonly<{ failureCategory: "invalid_credentials" }>;
  }>;

export type LogoutSucceededAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "authentication.logout.succeeded";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "session"; id: string }>;
    metadata: Readonly<Record<string, never>>;
  }>;

export type AuthenticationAuditEvent =
  | LoginSucceededAuditEvent
  | LoginFailedAuditEvent
  | LogoutSucceededAuditEvent;
