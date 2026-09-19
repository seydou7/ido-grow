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

export const MATCH_AUDIT_EVENT_TYPES = [
  "buyer.buy_order.match.created",
  "buyer.buy_order.match.approved",
  "buyer.buy_order.match.cancelled",
] as const;

export const QUOTE_AUDIT_EVENT_TYPES = [
  "quote.created",
  "quote.version.created",
  "quote.submitted_for_internal_review",
  "quote.returned_to_draft",
  "quote.sent",
  "quote.countered",
  "quote.accepted",
  "quote.rejected",
  "quote.counter.revised",
] as const;

export const TRADE_AUDIT_EVENT_TYPES = [
  "trade.created",
] as const;

export const AUDIT_EVENT_TYPES = [
  ...AUTHENTICATION_AUDIT_EVENT_TYPES,
  ...ORGANISATION_AUDIT_EVENT_TYPES,
  ...BUY_ORDER_AUDIT_EVENT_TYPES,
  ...MATCH_AUDIT_EVENT_TYPES,
  ...QUOTE_AUDIT_EVENT_TYPES,
  ...TRADE_AUDIT_EVENT_TYPES,
] as const;

export type AuthenticationAuditEventType =
  (typeof AUTHENTICATION_AUDIT_EVENT_TYPES)[number];

export type OrganisationAuditEventType =
  (typeof ORGANISATION_AUDIT_EVENT_TYPES)[number];

export type BuyOrderAuditEventType =
  (typeof BUY_ORDER_AUDIT_EVENT_TYPES)[number];

export type QuoteAuditEventType =
  (typeof QUOTE_AUDIT_EVENT_TYPES)[number];

export type TradeAuditEventType =
  (typeof TRADE_AUDIT_EVENT_TYPES)[number];

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

export type MatchCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "buyer.buy_order.match.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "match"; id: string }>;
    metadata: Readonly<{
      buyOrderId: string;
      listingId: string;
      status: "DRAFT";
    }>;
  }>;

export type MatchApprovedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "buyer.buy_order.match.approved";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "match"; id: string }>;
    metadata: Readonly<{
      buyOrderId: string;
      listingId: string;
      status: "APPROVED";
    }>;
  }>;

export type MatchCancelledAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "buyer.buy_order.match.cancelled";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "match"; id: string }>;
    metadata: Readonly<{
      buyOrderId: string;
      listingId: string;
      status: "CANCELLED";
    }>;
  }>;

export type MatchAuditEvent =
  | MatchCreatedAuditEvent
  | MatchApprovedAuditEvent
  | MatchCancelledAuditEvent;

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


export type QuoteCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quote.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "quote"; id: string }>;
    metadata: Readonly<{
      quoteNumber: string;
      matchId: string;
      versionNumber: string;
      totalAmount: string;
      currency?: string;
      status: string;
    }>;
  }>;

export type QuoteVersionCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quote.version.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "quote"; id: string }>;
    metadata: Readonly<{
      quoteNumber: string;
      versionNumber: string;
      totalAmount: string;
      currency?: string;
    }>;
  }>;

export type QuoteSubmittedForInternalReviewAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quote.submitted_for_internal_review";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "quote"; id: string }>;
    metadata: Readonly<{
      quoteNumber: string;
      versionNumber: string;
      status: "INTERNAL_REVIEW";
    }>;
  }>;

export type QuoteReturnedToDraftAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quote.returned_to_draft";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "quote"; id: string }>;
    metadata: Readonly<{
      quoteNumber: string;
      versionNumber: string;
      status: "DRAFT";
    }>;
  }>;


export type QuoteSentAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quote.sent";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "quote"; id: string }>;
    metadata: Readonly<{
      quoteNumber: string;
      versionNumber: string;
      status: "SENT";
      currency?: string;
    }>;
  }>;

export type QuoteCounteredAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quote.countered";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "quote"; id: string }>;
    metadata: Readonly<{
      quoteNumber: string;
      versionNumber: string;
      status: "COUNTERED";
      currency?: string;
    }>;
  }>;

export type QuoteAcceptedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quote.accepted";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "quote"; id: string }>;
    metadata: Readonly<{
      quoteNumber: string;
      versionNumber: string;
      status: "ACCEPTED";
      currency?: string;
    }>;
  }>;

export type QuoteRejectedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quote.rejected";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "quote"; id: string }>;
    metadata: Readonly<{
      quoteNumber: string;
      versionNumber: string;
      status: "REJECTED";
      currency?: string;
      reason?: string;
    }>;
  }>;

export type QuoteCounterRevisedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quote.counter.revised";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "quote"; id: string }>;
    metadata: Readonly<{
      quoteNumber: string;
      versionNumber: string;
      status: "DRAFT";
      currency?: string;
    }>;
  }>;

export type QuoteAuditEvent =
  | QuoteCreatedAuditEvent
  | QuoteVersionCreatedAuditEvent
  | QuoteSubmittedForInternalReviewAuditEvent
  | QuoteReturnedToDraftAuditEvent
  | QuoteSentAuditEvent
  | QuoteCounteredAuditEvent
  | QuoteAcceptedAuditEvent
  | QuoteRejectedAuditEvent
  | QuoteCounterRevisedAuditEvent;

export type TradeCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "trade.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "trade"; id: string }>;
    metadata: Readonly<{
      tradeNumber: string;
      quoteNumber: string;
      acceptedVersionNumber: string;
      currency?: string;
      acceptedTotalAmount: string;
    }>;
  }>;

export type TradeAuditEvent = TradeCreatedAuditEvent;


export type PlatformAuditEvent =
  | AuthenticationAuditEvent
  | OrganisationAuditEvent
  | BuyOrderAuditEvent
  | MatchAuditEvent
  | QuoteAuditEvent
  | TradeAuditEvent;
