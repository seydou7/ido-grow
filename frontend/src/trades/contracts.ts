export interface InspectionOverview {
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
}

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
  latestInspection?: InspectionOverview | null;
  inspections?: InspectionOverview[];
}

export interface TradeCollection {
  items: TradeSummary[];
  total: number;
}
