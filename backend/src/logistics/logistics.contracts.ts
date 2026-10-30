// Logistics domain contracts — Sprint 08 Block 02

export type ShipmentStatus =
  | "PLANNING"
  | "QUOTE_REQUESTED"
  | "CARRIER_SELECTED"
  | "PICKUP_SCHEDULED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "CUSTOMS"
  | "DELAYED"
  | "DELIVERED"
  | "DISPUTED"
  | "CLOSED";

export type LogisticsRequestStatus = "REQUESTED" | "QUOTED" | "CANCELLED";

export type FreightQuotationStatus = "ACTIVE" | "SUPERSEDED";

export interface ShipmentSummary {
  id: string;
  shipmentNumber: string;
  contractId: string;
  contractNumber: string;
  buyerOrganisationId: string;
  buyerOrganisationName: string;
  supplierOrganisationId: string;
  supplierOrganisationName: string;
  origin: string | null;
  destination: string | null;
  shipmentQuantity: number;
  quantityUnit: string;
  requestedPickupDate: string | null;
  requestedDeliveryDate: string | null;
  transportRequirements: string | null;
  packagingRequirements: string | null;
  specialHandlingRequirements: string | null;
  notes: string | null;
  selectedFreightQuotationId: string | null;
  status: ShipmentStatus;
  freightQuotationsCount: number;
  logisticsRequestsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentDetail extends ShipmentSummary {
  contractQuantity: number;
  contractQuantityUnit: string;
  contractCurrency: string;
  contractAcceptedAmount: number;
  materialType: string;
  productForm: string | null;

  scheduledPickupAt: string | null;
  actualPickupAt: string | null;
  deliveredAt: string | null;
  deliveredLocation: string | null;
  deliveryNotes: string | null;
  previousStatus: string | null;
  delayReason: string | null;
  delayReportedAt: string | null;
  revisedExpectedDeliveryDate: string | null;
  disputeReason: string | null;
  disputeReportedAt: string | null;
  disputeResolvedAt: string | null;
  disputeResolutionNotes: string | null;
  closedAt: string | null;
  closedByUserId: string | null;
  closedByUserEmail: string | null;

  selectedProviderUserId: string | null;
  selectedProviderEmail: string | null;
  selectedCarrierName: string | null;
  carrierTotalCost: number | null;
  carrierCurrency: string | null;

  trackingEvents: ShipmentTrackingEventSummary[];
  documents: ShipmentDocumentSummary[];
  discrepancies: ShipmentDiscrepancySummary[];
  costReconciliation: ShipmentCostReconciliationSummary | null;
}

export interface ShipmentCollection {
  items: ShipmentSummary[];
  total: number;
}

export interface CreateShipmentInput {
  origin?: string | null;
  destination?: string | null;
  shipmentQuantity: number;
  requestedPickupDate?: string | null;
  requestedDeliveryDate?: string | null;
  transportRequirements?: string | null;
  packagingRequirements?: string | null;
  specialHandlingRequirements?: string | null;
  notes?: string | null;
}

export interface UpdateShipmentRequirementsInput {
  origin?: string | null;
  destination?: string | null;
  shipmentQuantity?: number;
  requestedPickupDate?: string | null;
  requestedDeliveryDate?: string | null;
  transportRequirements?: string | null;
  packagingRequirements?: string | null;
  specialHandlingRequirements?: string | null;
  notes?: string | null;
}

export interface LogisticsRequestSummary {
  id: string;
  shipmentId: string;
  shipmentNumber: string;
  targetProviderUserId: string;
  targetProviderEmail: string;
  requesterUserId: string;
  status: LogisticsRequestStatus;
  requestedAt: string;
  cancelledAt: string | null;
  hasQuotation: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFreightRequestInput {
  targetProviderUserIds: string[];
}

export interface FreightQuotationSummary {
  id: string;
  logisticsRequestId: string;
  shipmentId: string;
  providerUserId: string;
  providerEmail: string;
  submittedByUserId: string;
  submittedByEmail: string;
  submittedByRole: string;
  enteredOnBehalfOfProvider: boolean;
  currency: string;
  freightAmount: number;
  validUntil: string | null;
  proposedPickupDate: string | null;
  estimatedDeliveryDate: string | null;
  notes: string | null;
  status: FreightQuotationStatus;
  isSelected: boolean;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitFreightQuotationInput {
  currency: string;
  freightAmount: number;
  validUntil?: string | null;
  proposedPickupDate?: string | null;
  estimatedDeliveryDate?: string | null;
  notes?: string | null;
}

export interface SelectCarrierInput {
  freightQuotationId: string;
}

export interface LogisticsPartnerRequestSummary {
  id: string;
  shipmentId: string;
  shipmentNumber: string;
  origin: string | null;
  destination: string | null;
  shipmentQuantity: number;
  quantityUnit: string;
  requestedPickupDate: string | null;
  requestedDeliveryDate: string | null;
  transportRequirements: string | null;
  specialHandlingRequirements: string | null;
  status: LogisticsRequestStatus;
  requestedAt: string;
  hasQuotation: boolean;
  ownQuotation: FreightQuotationSummary | null;
}

// ── Block 03 Tracking & Execution Contracts ─────────────────────

export interface ShipmentTrackingEventSummary {
  id: string;
  shipmentId: string;
  previousStatus: string;
  resultingStatus: string;
  actorUserId: string;
  actorUserEmail: string;
  actorRole: string;
  location: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
  recordedAt: string;
}

export interface ShipmentDocumentSummary {
  id: string;
  shipmentId: string;
  uploadedByUserId: string;
  uploadedByUserEmail: string;
  label: string;
  documentReference: string | null;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface ShipmentDiscrepancySummary {
  id: string;
  shipmentId: string;
  reportedByUserId: string;
  reportedByUserEmail: string;
  type: "DAMAGE" | "QUANTITY_DIFFERENCE";
  description: string;
  expectedQuantity: number | null;
  deliveredQuantity: number | null;
  quantityUnit: string | null;
  differenceQuantity: number | null;
  recordedAt: string;
}

export interface ShipmentCostReconciliationSummary {
  id: string;
  shipmentId: string;
  selectedFreightQuotationId: string;
  quotedAmount: number;
  quotedCurrency: string;
  finalAmount: number;
  finalCurrency: string;
  differenceAmount: number;
  notes: string | null;
  reconciledByUserId: string;
  reconciledByUserEmail: string;
  reconciledAt: string;
}

export interface SchedulePickupInput {
  scheduledPickupAt: string;
  location?: string | null;
  notes?: string | null;
}

export interface MarkPickedUpInput {
  actualPickupAt?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface MarkInTransitInput {
  location?: string | null;
  notes?: string | null;
}

export interface CustomsStatusInput {
  location?: string | null;
  notes?: string | null;
  reference?: string | null;
}

export interface ReportDelayInput {
  delayReason: string;
  revisedExpectedDeliveryDate?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface ConfirmDeliveryInput {
  deliveredAt?: string | null;
  deliveredLocation?: string | null;
  deliveryNotes?: string | null;
}

export interface CreateDiscrepancyInput {
  type: "DAMAGE" | "QUANTITY_DIFFERENCE";
  description: string;
  expectedQuantity?: number | null;
  deliveredQuantity?: number | null;
  quantityUnit?: string | null;
}

export type RecordDiscrepancyInput = CreateDiscrepancyInput;

export interface MarkDisputedInput {
  disputeReason: string;
  notes?: string | null;
}

export interface ResolveDisputeInput {
  disputeResolutionNotes: string;
}

export interface ReconcileCostsInput {
  finalAmount: number;
  finalCurrency: string;
  notes?: string | null;
}

export interface CloseShipmentInput {
  notes?: string | null;
}

// ── Block 03 Settlement Domain Contracts ────────────────────────

export type PaymentStatus = "PENDING" | "PARTIALLY_RECORDED" | "SETTLED";

export type SettlementDocumentType =
  | "INVOICE"
  | "CREDIT_NOTE"
  | "PAYMENT_INSTRUCTION"
  | "CLAIM";

export type SettlementClaimStatus = "OPEN" | "RESOLVED";

export interface SettlementDocumentSummary {
  id: string;
  settlementId: string;
  uploadedByUserId: string;
  uploadedByUserEmail: string;
  documentType: SettlementDocumentType;
  documentReference: string | null;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface SettlementClaimSummary {
  id: string;
  settlementId: string;
  discrepancyId: string | null;
  description: string;
  amount: number | null;
  currency: string | null;
  status: SettlementClaimStatus;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  recordedByUserId: string;
  recordedByUserEmail: string;
  recordedAt: string;
  updatedAt: string;
}

export interface SettlementSummary {
  id: string;
  tradeId: string;
  shipmentId: string | null;
  buyerOrganisationId: string;
  buyerOrganisationName: string;
  supplierOrganisationId: string;
  supplierOrganisationName: string;
  currency: string;
  totalCommercialAmount: number;
  depositAmount: number;
  remainingBalance: number;
  commissionAmount: number;
  finalSettlementAmount: number;
  paymentStatus: PaymentStatus;
  paymentDueDate: string | null;
  paymentInstructions: string | null;
  notes: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementDetail extends SettlementSummary {
  documents: SettlementDocumentSummary[];
  claims: SettlementClaimSummary[];
}

export interface CreateSettlementInput {
  depositAmount?: number;
  commissionAmount?: number;
  finalSettlementAmount?: number;
  paymentDueDate?: string | null;
  paymentInstructions?: string | null;
  notes?: string | null;
  shipmentId?: string | null;
}

export interface UpdateSettlementInput {
  depositAmount?: number;
  commissionAmount?: number;
  finalSettlementAmount?: number;
  paymentStatus?: PaymentStatus;
  paymentDueDate?: string | null;
  paymentInstructions?: string | null;
  notes?: string | null;
}

export interface CreateSettlementClaimInput {
  discrepancyId?: string | null;
  description: string;
  amount?: number | null;
  currency?: string | null;
}

export interface ResolveSettlementClaimInput {
  resolutionNotes: string;
}
