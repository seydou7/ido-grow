import type { CommercialBreakdown } from "../quotes/contracts";

export interface TradeSummary {
  id: string;
  tradeNumber: string;
  quoteId: string;
  quoteNumber: string;
  acceptedQuoteVersionNumber: number;
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
  currency: string;
  acceptedTotalAmount: number;
  incoterm: string | null;
  paymentTerms: string | null;
  acceptedAt: string;
  createdAt: string;
}

export interface TradeDetail extends TradeSummary {
  acceptedBreakdown: CommercialBreakdown;
  commercialNotes: string | null;
  validUntil: string | null;
  buyerAddress?: string | null;
  buyerCity?: string | null;
  buyerCountry?: string | null;
  supplierAddress?: string | null;
  supplierCity?: string | null;
  supplierCountry?: string | null;
  listingTitle?: string | null;
  latestInspection?: {
    id: string;
    inspectionReference: string;
    status: string;
    inspectionMethod: string;
    assignedInspectorEmail?: string | null;
    completedAt?: string | null;
    evidenceCount?: number;
    assessmentStatus?: string | null;
    openNonConformitiesCount?: number;
    physicalInspectionRequired?: boolean;
    qualityDecision?: "APPROVED" | "REJECTED" | null;
    classificationLabel?: string | null;
    certificateNumber?: string | null;
    certificateId?: string | null;
  } | null;
  inspections?: Array<{
    id: string;
    inspectionReference: string;
    status: string;
    inspectionMethod: string;
    assignedInspectorEmail?: string | null;
    completedAt?: string | null;
  }>;
  contract?: {
    id: string;
    contractNumber: string;
    status: string;
    hasDocument: boolean;
    confirmedAt?: string | null;
    acceptedCommercialAmount?: number;
    quantity?: number;
    quantityUnit?: string;
    currency?: string;
    materialType?: string;
    productForm?: string | null;
    buyerOrganisationName?: string;
    supplierOrganisationName?: string;
    acceptedTolerance?: string | null;
    incoterm?: string | null;
    qualityConditions?: string | null;
    inspectionMethod?: string | null;
    pickupDate?: string | null;
    deliveryDate?: string | null;
    paymentTerms?: string | null;
    claimsProcess?: string | null;
    requiredDocuments?: string | null;
    cancellationConditions?: string | null;
    governingLaw?: string | null;
  } | null;
}

export interface TradeCollection {
  items: TradeSummary[];
  total: number;
}
