import type { AuditEventDatabaseClient } from "../audit/audit-event.writer";
import type { CommercialBreakdown, QuoteStatus } from "./contracts";

export interface CreateQuoteData {
  quoteNumber: string;
  matchId: string;
  buyOrderId: string;
  listingId: string;
  buyerOrganisationId: string;
  supplierOrganisationId: string;
  createdByUserId: string;
  currency: string;
  breakdown: CommercialBreakdown;
  totalAmount: number;
  incoterm?: string | null;
  paymentTerms?: string | null;
  validUntil?: Date | null;
  commercialNotes?: string | null;
}

export interface CreateQuoteVersionData {
  quoteId: string;
  versionNumber: number;
  breakdown: CommercialBreakdown;
  totalAmount: number;
  currency: string;
  incoterm?: string | null;
  paymentTerms?: string | null;
  validUntil?: Date | null;
  commercialNotes?: string | null;
  createdByUserId: string;
}

export interface CreateCounterOfferData {
  quoteId: string;
  sourceVersionNumber: number;
  buyerOrganisationId: string;
  createdByUserId: string;
  proposedProductValue?: number | null;
  proposedTotalAmount?: number | null;
  proposedIncoterm?: string | null;
  proposedPaymentTerms?: string | null;
  buyerNote: string;
}

export interface QuoteRecordWithRelations {
  id: string;
  quoteNumber: string;
  matchId: string;
  buyOrderId: string;
  listingId: string;
  buyerOrganisationId: string;
  supplierOrganisationId: string;
  createdByUserId: string;
  status: string;
  currency: string;
  currentVersionNumber: number;
  sentAt: Date | null;
  sentByUserId: string | null;
  sentVersionNumber: number | null;
  acceptedAt: Date | null;
  acceptedByUserId: string | null;
  acceptedVersionNumber: number | null;
  rejectedAt: Date | null;
  rejectedByUserId: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  buyerOrganisation: { id: string; name: string };
  supplierOrganisation: { id: string; name: string };
  buyOrder: {
    id: string;
    quantity: number;
    quantityUnit: string;
    materialType: string;
    productForm: string | null;
  };
  listing: {
    id: string;
    title: string;
    materialType: string;
    productForm: string | null;
  };
  createdByUser: { id: string; email: string };
  versions: Array<{
    id: string;
    quoteId: string;
    versionNumber: number;
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
    totalAmount: number;
    currency: string;
    incoterm: string | null;
    paymentTerms: string | null;
    validUntil: Date | null;
    commercialNotes: string | null;
    createdByUserId: string;
    createdAt: Date;
    createdByUser?: { id: string; email: string };
  }>;
  counterOffers?: Array<{
    id: string;
    quoteId: string;
    sourceVersionNumber: number;
    buyerOrganisationId: string;
    createdByUserId: string;
    proposedProductValue: number | null;
    proposedTotalAmount: number | null;
    proposedIncoterm: string | null;
    proposedPaymentTerms: string | null;
    buyerNote: string;
    createdAt: Date;
    buyerOrganisation?: { id: string; name: string };
    createdByUser?: { id: string; email: string };
  }>;
  trade?: {
    id: string;
    tradeNumber: string;
    quoteId: string;
    acceptedQuoteVersionNumber: number;
    currency: string;
    acceptedTotalAmount: number;
    acceptedAt: Date;
    createdAt: Date;
  } | null;
}

export abstract class QuotesRepository {
  abstract findQuoteById(id: string): Promise<QuoteRecordWithRelations | null>;
  abstract findQuoteByMatchId(matchId: string): Promise<QuoteRecordWithRelations | null>;
  abstract findQuotesByBuyer(
    buyerOrganisationId: string,
    statuses?: QuoteStatus[],
  ): Promise<QuoteRecordWithRelations[]>;
  abstract createQuote(data: CreateQuoteData): Promise<QuoteRecordWithRelations>;
  abstract createQuoteVersion(
    quoteId: string,
    versionNumber: number,
    data: CreateQuoteVersionData,
  ): Promise<QuoteRecordWithRelations>;
  abstract updateQuoteStatus(
    id: string,
    status: QuoteStatus,
  ): Promise<QuoteRecordWithRelations>;
  abstract sendQuote(
    id: string,
    sentByUserId: string,
    sentVersionNumber: number,
  ): Promise<QuoteRecordWithRelations>;
  abstract acceptQuote(
    id: string,
    acceptedByUserId: string,
    acceptedVersionNumber: number,
    tradeData?: {
      tradeNumber: string;
      matchId: string;
      buyOrderId: string;
      listingId: string;
      buyerOrganisationId: string;
      supplierOrganisationId: string;
      materialType: string;
      productForm: string | null;
      quantity: number;
      quantityUnit: string;
      currency: string;
      acceptedTotalAmount: number;
      incoterm: string | null;
      paymentTerms: string | null;
      acceptedAt: Date;
    },
    onAtomicActions?: (
      database: AuditEventDatabaseClient,
      context: { trade: { id: string; tradeNumber: string }; isFirstAcceptance: boolean },
    ) => Promise<void>,
  ): Promise<QuoteRecordWithRelations>;
  abstract rejectQuote(
    id: string,
    rejectedByUserId: string,
    rejectionReason?: string | null,
  ): Promise<QuoteRecordWithRelations>;
  abstract createCounterOffer(
    data: CreateCounterOfferData,
  ): Promise<QuoteRecordWithRelations>;
}
