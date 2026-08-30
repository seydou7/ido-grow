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
  "organisation.listing.created",
  "organisation.listing.updated",
] as const;

export const BUY_ORDER_AUDIT_EVENT_TYPES = [
  "buyer.buy_order.created",
  "buyer.buy_order.updated",
  "buyer.buy_order.submitted",
  "buyer.buy_order.cancelled",
  "buyer.buy_order.deleted",
] as const;

export const AUDIT_EVENT_TYPES = [
  ...AUTHENTICATION_AUDIT_EVENT_TYPES,
  ...ORGANISATION_AUDIT_EVENT_TYPES,
  ...BUY_ORDER_AUDIT_EVENT_TYPES,
] as const;

export type AuthenticationAuditEventType =
  (typeof AUTHENTICATION_AUDIT_EVENT_TYPES)[number];

export type OrganisationAuditEventType =
  (typeof ORGANISATION_AUDIT_EVENT_TYPES)[number];

export type BuyOrderAuditEventType =
  (typeof BUY_ORDER_AUDIT_EVENT_TYPES)[number];

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

export type ListingCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "organisation.listing.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "listing"; id: string }>;
    metadata: Readonly<{ organisationId: string; title: string; materialType: string }>;
  }>;

export type ListingUpdatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "organisation.listing.updated";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "listing"; id: string }>;
    metadata: Readonly<{ organisationId: string; title?: string; status?: string }>;
  }>;

export type BuyOrderCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "buyer.buy_order.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "buy_order"; id: string }>;
    metadata: Readonly<{ buyerOrganisationId: string; materialType: string; status: string }>;
  }>;

export type BuyOrderUpdatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "buyer.buy_order.updated";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "buy_order"; id: string }>;
    metadata: Readonly<{ buyerOrganisationId: string; materialType?: string; status?: string }>;
  }>;

export type BuyOrderSubmittedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "buyer.buy_order.submitted";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "buy_order"; id: string }>;
    metadata: Readonly<{ buyerOrganisationId: string; previousStatus: string; newStatus: "OPEN" }>;
  }>;

export type BuyOrderCancelledAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "buyer.buy_order.cancelled";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "buy_order"; id: string }>;
    metadata: Readonly<{ buyerOrganisationId: string; previousStatus: string; newStatus: "CANCELLED" }>;
  }>;

export type BuyOrderDeletedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "buyer.buy_order.deleted";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "buy_order"; id: string }>;
    metadata: Readonly<{ buyerOrganisationId: string; deletedStatus: "DRAFT" }>;
  }>;

export type AuthenticationAuditEvent =
  | LoginSucceededAuditEvent
  | LoginFailedAuditEvent
  | LogoutSucceededAuditEvent;

export type OrganisationAuditEvent =
  | OrganisationProfileUpdatedAuditEvent
  | SiteCreatedAuditEvent
  | SiteUpdatedAuditEvent
  | ComplianceDocumentUploadedAuditEvent
  | ListingCreatedAuditEvent
  | ListingUpdatedAuditEvent;

export type BuyOrderAuditEvent =
  | BuyOrderCreatedAuditEvent
  | BuyOrderUpdatedAuditEvent
  | BuyOrderSubmittedAuditEvent
  | BuyOrderCancelledAuditEvent
  | BuyOrderDeletedAuditEvent;

export type PlatformAuditEvent =
  | AuthenticationAuditEvent
  | OrganisationAuditEvent
  | BuyOrderAuditEvent;
