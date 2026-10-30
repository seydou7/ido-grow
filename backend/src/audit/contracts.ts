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

export const CONTRACT_AUDIT_EVENT_TYPES = [
  "contract.created",
  "contract.updated",
  "contract.confirmed",
  "contract.document.generated",
] as const;

export const LOGISTICS_AUDIT_EVENT_TYPES = [
  "logistics.shipment.created",
  "logistics.shipment.requirements.updated",
  "logistics.freight_request.created",
  "logistics.freight_quote.submitted",
  "logistics.carrier.selected",
  "logistics.carrier.reselected",
  "logistics.pickup.scheduled",
  "logistics.shipment.picked_up",
  "logistics.shipment.in_transit",
  "logistics.shipment.customs",
  "logistics.shipment.delayed",
  "logistics.shipping_document.uploaded",
  "logistics.delivery.confirmed",
  "logistics.discrepancy.recorded",
  "logistics.shipment.disputed",
  "logistics.costs.reconciled",
  "logistics.shipment.closed",
] as const;

export const SETTLEMENT_AUDIT_EVENT_TYPES = [
  "settlement.created",
  "settlement.updated",
  "settlement.document.uploaded",
  "settlement.claim.created",
  "settlement.claim.resolved",
] as const;

export const DPP_AUDIT_EVENT_TYPES = [
  "dpp.lot.created",
  "dpp.passport.created",
  "dpp.passport.synchronized",
  "dpp.version.created",
  "dpp.custody.recorded",
] as const;

export const AI_AUDIT_EVENT_TYPES = [
  "ai.run.started",
  "ai.run.completed",
  "ai.run.failed",
  "ai.proposal.created",
  "ai.approval.requested",
  "ai.approval.approved",
  "ai.approval.rejected",
  "ai.tool.executed",
  "ai.tool.failed",
] as const;

export const AUDIT_EVENT_TYPES = [
  ...AUTHENTICATION_AUDIT_EVENT_TYPES,
  ...ORGANISATION_AUDIT_EVENT_TYPES,
  ...BUY_ORDER_AUDIT_EVENT_TYPES,
  ...MATCH_AUDIT_EVENT_TYPES,
  ...QUOTE_AUDIT_EVENT_TYPES,
  ...TRADE_AUDIT_EVENT_TYPES,
  ...CONTRACT_AUDIT_EVENT_TYPES,
  ...LOGISTICS_AUDIT_EVENT_TYPES,
  ...SETTLEMENT_AUDIT_EVENT_TYPES,
  ...DPP_AUDIT_EVENT_TYPES,
  ...AI_AUDIT_EVENT_TYPES,
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

export type ContractAuditEventType =
  (typeof CONTRACT_AUDIT_EVENT_TYPES)[number];

export type LogisticsAuditEventType =
  (typeof LOGISTICS_AUDIT_EVENT_TYPES)[number];

export type SettlementAuditEventType =
  (typeof SETTLEMENT_AUDIT_EVENT_TYPES)[number];

export type DPPAuditEventType =
  (typeof DPP_AUDIT_EVENT_TYPES)[number];

export type AiAuditEventType =
  (typeof AI_AUDIT_EVENT_TYPES)[number];

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


export type QualityInspectionCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.inspection.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      tradeId: string;
      tradeNumber?: string;
      templateKey: string;
      templateVersion: string;
      inspectionMethod: string;
      status: string;
    }>;
  }>;

export type QualityInspectionAssignedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.inspection.assigned";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      tradeId: string;
      inspectorUserId: string;
      status: string;
    }>;
  }>;

export type QualityInspectionStartedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.inspection.started";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      tradeId: string;
      status: "IN_PROGRESS";
    }>;
  }>;

export type QualityMeasurementsUpdatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.measurements.updated";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      tradeId: string;
      status: string;
      updatedFieldsCount: string;
    }>;
  }>;

export type QualityInspectionCompletedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.inspection.completed";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      tradeId: string;
      status: "COMPLETED";
      completedAt: string;
    }>;
  }>;

export type QualityEvidenceUploadedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.evidence.uploaded";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      evidenceId: string;
      evidenceType: string;
      storageKey: string;
      originalFilename: string;
      mimeType: string;
      fileSize: string;
    }>;
  }>;

export type QualityAssessmentRecordedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.assessment.recorded";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      assessmentStatus: string;
      assessedAt: string;
    }>;
  }>;

export type QualityNonConformityCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.non_conformity.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      nonConformityId: string;
      category: string;
    }>;
  }>;

export type QualityNonConformityResolvedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.non_conformity.resolved";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      nonConformityId: string;
      resolvedAt: string;
    }>;
  }>;

export type QualityPhysicalInspectionRequestedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.physical_inspection.requested";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      reason: string;
    }>;
  }>;

export type QualityAuditEvent =
  | QualityInspectionCreatedAuditEvent
  | QualityInspectionAssignedAuditEvent
  | QualityInspectionStartedAuditEvent
  | QualityMeasurementsUpdatedAuditEvent
  | QualityInspectionCompletedAuditEvent
  | QualityEvidenceUploadedAuditEvent
  | QualityAssessmentRecordedAuditEvent
  | QualityNonConformityCreatedAuditEvent
  | QualityNonConformityResolvedAuditEvent
  | QualityPhysicalInspectionRequestedAuditEvent
  | QualityResultApprovedAuditEvent
  | QualityResultRejectedAuditEvent
  | QualityCertificateIssuedAuditEvent;

export type PlatformAuditEvent =
  | AuthenticationAuditEvent
  | OrganisationAuditEvent
  | BuyOrderAuditEvent
  | MatchAuditEvent
  | QuoteAuditEvent
  | TradeAuditEvent
  | QualityAuditEvent
  | ContractAuditEvent
  | LogisticsAuditEvent
  | SettlementAuditEvent
  | DPPAuditEvent
  | AiAuditEvent;

export type QualityResultApprovedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.result.approved";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      tradeId?: string;
      qualityResultId: string;
      classificationLabel: string;
      decision: "APPROVED";
    }>;
  }>;

export type QualityResultRejectedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.result.rejected";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      tradeId?: string;
      qualityResultId: string;
      classificationLabel: string;
      decision: "REJECTED";
      decisionNotes?: string;
    }>;
  }>;

export type QualityCertificateIssuedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "quality.certificate.issued";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "inspection"; id: string }>;
    metadata: Readonly<{
      inspectionReference: string;
      tradeId?: string;
      qualityResultId: string;
      certificateId: string;
      certificateNumber: string;
      storageKey?: string;
    }>;
  }>;

export type ContractCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "contract.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "contract"; id: string }>;
    metadata: Readonly<{
      contractNumber: string;
      tradeId: string;
      tradeNumber?: string;
      buyerOrganisationId: string;
      supplierOrganisationId: string;
      status: "DRAFT";
    }>;
  }>;

export type ContractUpdatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "contract.updated";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "contract"; id: string }>;
    metadata: Readonly<{
      contractNumber: string;
      tradeId: string;
      updatedFields: string;
    }>;
  }>;

export type ContractConfirmedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "contract.confirmed";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "contract"; id: string }>;
    metadata: Readonly<{
      contractNumber: string;
      tradeId: string;
      confirmedAt: string;
      status: "CONFIRMED";
    }>;
  }>;

export type ContractDocumentGeneratedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "contract.document.generated";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "contract"; id: string }>;
    metadata: Readonly<{
      contractNumber: string;
      tradeId: string;
      storageKey: string;
      generatedAt: string;
    }>;
  }>;

export type ContractAuditEvent =
  | ContractCreatedAuditEvent
  | ContractUpdatedAuditEvent
  | ContractConfirmedAuditEvent
  | ContractDocumentGeneratedAuditEvent;

export type LogisticsShipmentCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.shipment.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsShipmentRequirementsUpdatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.shipment.requirements.updated";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsFreightRequestCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.freight_request.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "logistics_request"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsFreightQuoteSubmittedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.freight_quote.submitted";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "freight_quotation"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsCarrierSelectedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.carrier.selected";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsCarrierReselectedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.carrier.reselected";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsPickupScheduledAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.pickup.scheduled";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsShipmentPickedUpAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.shipment.picked_up";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsShipmentInTransitAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.shipment.in_transit";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsShipmentCustomsAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.shipment.customs";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsShipmentDelayedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.shipment.delayed";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsShippingDocumentUploadedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.shipping_document.uploaded";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment_document"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsDeliveryConfirmedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.delivery.confirmed";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsDiscrepancyRecordedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.discrepancy.recorded";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "discrepancy"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsShipmentDisputedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.shipment.disputed";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsCostsReconciledAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.costs.reconciled";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "cost_reconciliation"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsShipmentClosedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "logistics.shipment.closed";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "shipment"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type LogisticsAuditEvent =
  | LogisticsShipmentCreatedAuditEvent
  | LogisticsShipmentRequirementsUpdatedAuditEvent
  | LogisticsFreightRequestCreatedAuditEvent
  | LogisticsFreightQuoteSubmittedAuditEvent
  | LogisticsCarrierSelectedAuditEvent
  | LogisticsCarrierReselectedAuditEvent
  | LogisticsPickupScheduledAuditEvent
  | LogisticsShipmentPickedUpAuditEvent
  | LogisticsShipmentInTransitAuditEvent
  | LogisticsShipmentCustomsAuditEvent
  | LogisticsShipmentDelayedAuditEvent
  | LogisticsShippingDocumentUploadedAuditEvent
  | LogisticsDeliveryConfirmedAuditEvent
  | LogisticsDiscrepancyRecordedAuditEvent
  | LogisticsShipmentDisputedAuditEvent
  | LogisticsCostsReconciledAuditEvent
  | LogisticsShipmentClosedAuditEvent;

export type SettlementCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "settlement.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "settlement"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type SettlementUpdatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "settlement.updated";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "settlement"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type SettlementDocumentUploadedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "settlement.document.uploaded";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "settlement_document"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type SettlementClaimCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "settlement.claim.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "settlement_claim"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type SettlementClaimResolvedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "settlement.claim.resolved";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "settlement_claim"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type SettlementAuditEvent =
  | SettlementCreatedAuditEvent
  | SettlementUpdatedAuditEvent
  | SettlementDocumentUploadedAuditEvent
  | SettlementClaimCreatedAuditEvent
  | SettlementClaimResolvedAuditEvent;

export type DppLotCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "dpp.lot.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "traceable_lot"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type DppPassportCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "dpp.passport.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "dpp"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type DppPassportSynchronizedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "dpp.passport.synchronized";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "dpp"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type DppVersionCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "dpp.version.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "dpp_version"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type DppCustodyRecordedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "dpp.custody.recorded";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "dpp_custody_record"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type DPPAuditEvent =
  | DppLotCreatedAuditEvent
  | DppPassportCreatedAuditEvent
  | DppPassportSynchronizedAuditEvent
  | DppVersionCreatedAuditEvent
  | DppCustodyRecordedAuditEvent;

export type AiRunStartedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "ai.run.started";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "ai_run"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type AiRunCompletedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "ai.run.completed";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "ai_run"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type AiRunFailedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "ai.run.failed";
    outcome: "failed";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "ai_run"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type AiProposalCreatedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "ai.proposal.created";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "ai_proposal"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type AiApprovalRequestedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "ai.approval.requested";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "ai_approval"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type AiApprovalApprovedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "ai.approval.approved";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "ai_approval"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type AiApprovalRejectedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "ai.approval.rejected";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "ai_approval"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type AiToolExecutedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "ai.tool.executed";
    outcome: "succeeded";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "ai_tool_execution"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type AiToolFailedAuditEvent = AuditEventBase &
  Readonly<{
    eventType: "ai.tool.failed";
    outcome: "failed";
    actor: Readonly<{ type: "user"; userId: string }>;
    target: Readonly<{ type: "ai_tool_execution"; id: string }>;
    metadata: Readonly<Record<string, unknown>>;
  }>;

export type AiAuditEvent =
  | AiRunStartedAuditEvent
  | AiRunCompletedAuditEvent
  | AiRunFailedAuditEvent
  | AiProposalCreatedAuditEvent
  | AiApprovalRequestedAuditEvent
  | AiApprovalApprovedAuditEvent
  | AiApprovalRejectedAuditEvent
  | AiToolExecutedAuditEvent
  | AiToolFailedAuditEvent;

