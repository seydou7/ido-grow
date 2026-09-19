export const QUOTE_STATUSES = [
  "DRAFT",
  "INTERNAL_REVIEW",
  "SENT",
  "COUNTERED",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED_TO_CONTRACT",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];


export const BREAKDOWN_FIELD_LABELS: Record<keyof CommercialBreakdown, string> = {
  productValue: "1. Base Product Value (Fibre / Material)",
  idoGrowMarginCommission: "2. I Do Grow Intermediation Margin / Commission",
  inspectionCost: "3. Quality Inspection & Origin Certification",
  packagingCost: "4. Packaging, Baling & Handling",
  inlandTransportCost: "5. Inland Transport (Supplier to Port / Terminal)",
  internationalFreightCost: "6. International Freight (Sea / Rail / Road)",
  customsCost: "7. Customs Clearance, Duties & Export Documentation",
  insuranceCost: "8. Cargo Marine / Transit Insurance",
  storageCost: "9. Warehousing & Terminal Storage",
  taxAmount: "10. Applicable VAT / Import Surcharges",
  otherServiceFees: "11. Miscellaneous Trade & Administrative Fees",
};

export interface CommercialBreakdown {
  productValue: number;
  idoGrowMarginCommission: number;
  inspectionCost: number;
  packagingCost: number;
  inlandTransportCost: number;
  internationalFreightCost: number;
  customsCost: number;
  insuranceCost: number;
  storageCost: number;
  taxAmount: number;
  otherServiceFees: number;
}

export interface QuoteVersionSummary extends CommercialBreakdown {
  id: string;
  quoteId: string;
  versionNumber: number;
  totalAmount: number;
  currency: string;
  incoterm: string | null;
  paymentTerms: string | null;
  validUntil: string | null;
  commercialNotes: string | null;
  createdByUserId: string;
  createdByUserEmail?: string | null;
  createdAt: string;
}

export interface QuoteCounterOfferSummary {
  id: string;
  quoteId: string;
  sourceVersionNumber: number;
  buyerOrganisationId: string;
  buyerOrganisationName?: string | null;
  createdByUserId: string;
  createdByUserEmail?: string | null;
  proposedProductValue: number | null;
  proposedTotalAmount: number | null;
  proposedIncoterm: string | null;
  proposedPaymentTerms: string | null;
  buyerNote: string;
  createdAt: string;
}

export interface QuoteTimelineEvent {
  id: string;
  type:
    | "created"
    | "version_created"
    | "submitted_internal_review"
    | "returned_to_draft"
    | "sent"
    | "countered"
    | "counter_revised"
    | "accepted"
    | "rejected";
  title: string;
  description: string;
  versionNumber?: number;
  actorEmail?: string | null;
  occurredAt: string;
}

export interface QuoteSummary {
  id: string;
  quoteNumber: string;
  matchId: string;
  buyOrderId: string;
  listingId: string;
  buyerOrganisationId: string;
  buyerOrganisationName: string;
  supplierOrganisationId: string;
  supplierOrganisationName: string;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  status: QuoteStatus;
  currency: string;
  currentVersionNumber: number;
  currentVersion: QuoteVersionSummary;
  versionsCount: number;
  sentAt?: string | null;
  sentByUserId?: string | null;
  sentVersionNumber?: number | null;
  acceptedAt?: string | null;
  acceptedByUserId?: string | null;
  acceptedVersionNumber?: number | null;
  rejectedAt?: string | null;
  rejectedByUserId?: string | null;
  rejectionReason?: string | null;
  trade?: {
    id: string;
    tradeNumber: string;
    acceptedQuoteVersionNumber: number;
    currency: string;
    acceptedTotalAmount: number;
    acceptedAt: string;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteDetail extends QuoteSummary {
  versions: QuoteVersionSummary[];
  counterOffers: QuoteCounterOfferSummary[];
  timeline: QuoteTimelineEvent[];
}

export interface CreateQuoteInput {
  matchId: string;
  commercialBreakdown: CommercialBreakdown;
  incoterm?: string | null;
  paymentTerms?: string | null;
  validUntil?: string | null;
  commercialNotes?: string | null;
}

export interface UpdateQuoteInput {
  commercialBreakdown: CommercialBreakdown;
  incoterm?: string | null;
  paymentTerms?: string | null;
  validUntil?: string | null;
  commercialNotes?: string | null;
}

export interface QuoteCounterOfferInput {
  proposedProductValue?: number | null;
  proposedTotalAmount?: number | null;
  proposedIncoterm?: string | null;
  proposedPaymentTerms?: string | null;
  buyerNote: string;
}

export interface RejectQuoteInput {
  rejectionReason?: string | null;
}

export interface ReviseCounterQuoteInput {
  commercialBreakdown?: CommercialBreakdown;
  incoterm?: string | null;
  paymentTerms?: string | null;
  validUntil?: string | null;
  commercialNotes?: string | null;
}
