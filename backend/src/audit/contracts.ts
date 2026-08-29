export const AUTHENTICATION_AUDIT_EVENT_TYPES = [
  "authentication.login.succeeded",
  "authentication.login.failed",
  "authentication.logout.succeeded",
] as const;

export const ORGANISATION_AUDIT_EVENT_TYPES = [
  "organisation.profile.updated",
  "organisation.site.created",
  "organisation.site.updated",
  "organisation.compliance_document.uploaded",
] as const;

export const AUDIT_EVENT_TYPES = [
  ...AUTHENTICATION_AUDIT_EVENT_TYPES,
  ...ORGANISATION_AUDIT_EVENT_TYPES,
] as const;

export type AuthenticationAuditEventType =
  (typeof AUTHENTICATION_AUDIT_EVENT_TYPES)[number];

export type OrganisationAuditEventType =
  (typeof ORGANISATION_AUDIT_EVENT_TYPES)[number];

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

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

export type OrganisationProfileUpdatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "organisation.profile.updated";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "organisation"; id: string }>;
    metadata: Readonly<Record<string, string>>;
  }>;

export type SiteCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "organisation.site.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "site"; id: string }>;
    metadata: Readonly<{ organisationId: string }>;
  }>;

export type SiteUpdatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "organisation.site.updated";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "site"; id: string }>;
    metadata: Readonly<{ organisationId: string }>;
  }>;

export type ComplianceDocumentUploadedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "organisation.compliance_document.uploaded";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "compliance_document"; id: string }>;
    metadata: Readonly<{ organisationId: string; documentType: string; filename: string }>;
  }>;

export type AuthenticationAuditEvent =
  | LoginSucceededAuditEvent
  | LoginFailedAuditEvent
  | LogoutSucceededAuditEvent;

export type OrganisationAuditEvent =
  | OrganisationProfileUpdatedAuditEvent
  | SiteCreatedAuditEvent
  | SiteUpdatedAuditEvent
  | ComplianceDocumentUploadedAuditEvent;

export type PlatformAuditEvent = AuthenticationAuditEvent | OrganisationAuditEvent;
