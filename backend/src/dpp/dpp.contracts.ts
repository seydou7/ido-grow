export type DPPVerificationStatus = "RECORDED" | "VERIFIED";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string | null;
  organisationId: string | null;
}

export type DPPEventType =
  | "LOT_CREATED"
  | "INSPECTION_COMPLETED"
  | "QUALITY_RESULT_APPROVED"
  | "QUALITY_RESULT_REJECTED"
  | "TRADE_CREATED"
  | "CONTRACT_CONFIRMED"
  | "SHIPMENT_CREATED"
  | "SHIPMENT_PICKED_UP"
  | "SHIPMENT_IN_TRANSIT"
  | "SHIPMENT_CUSTOMS"
  | "SHIPMENT_DELAYED"
  | "SHIPMENT_DELIVERED"
  | "SHIPMENT_DISPUTED"
  | "SHIPMENT_CLOSED";

export type DPPCustodyMilestone =
  | "SUPPLIER_ORIGIN"
  | "TRADE_COMMERCIAL_TRANSFER"
  | "LOGISTICS_CARRIER_CUSTODY"
  | "BUYER_DELIVERY_RECEIPT";

export interface CreateLotDto {
  listingId: string;
  quantity?: number;
  quantityUnit?: string;
  materialType?: string;
  productForm?: string;
  countryOfOrigin?: string;
  regionOfOrigin?: string;
  productionSiteId?: string;
  productionDate?: string;
  batchReference?: string;
  notes?: string;
}

export interface TraceableLotResponse {
  id: string;
  lotNumber: string;
  listingId: string;
  supplierOrganisationId: string;
  productionSiteId: string | null;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  countryOfOrigin: string | null;
  regionOfOrigin: string | null;
  productionDate: string | null;
  batchReference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  hasDpp: boolean;
  dppId: string | null;
  dppNumber: string | null;
  listingTitle: string | null;
  supplierName: string | null;
  productionSiteName: string | null;
}

export interface DPPSnapshot {
  identity: {
    passportNumber: string;
    lotNumber: string;
    materialType: string;
    productForm: string | null;
    batchReference: string | null;
    quantity: number;
    quantityUnit: string;
  };
  origin: {
    supplierOrganisationId: string;
    supplierName: string;
    supplierCountry: string | null;
    productionSiteName: string | null;
    productionSiteAddress: string | null;
    countryOfOrigin: string | null;
    regionOfOrigin: string | null;
    productionDate: string | null;
  };
  quality: {
    inspections: Array<{
      inspectionReference: string;
      status: string;
      decision: string | null;
      humanClassificationLabel: string | null;
      certificateReference: string | null;
      completedAt: string | null;
      summary: string | null;
    }>;
  };
  certifications: Array<{
    documentType: string;
    originalFilename: string;
    status: string;
  }>;
  transaction: Array<{
    tradeNumber: string;
    buyerOrganisationName: string;
    acceptedAt: string;
    materialType: string;
    quantity: number;
    quantityUnit: string;
  }>;
  logistics: Array<{
    shipmentNumber: string;
    origin: string | null;
    destination: string | null;
    carrierName: string | null;
    status: string;
    actualPickupAt: string | null;
    deliveredAt: string | null;
  }>;
  custodyMilestones: Array<{
    milestone: string;
    fromParty: string | null;
    toParty: string | null;
    occurredAt: string;
    location: string | null;
  }>;
}

export interface DigitalProductPassportResponse {
  id: string;
  passportNumber: string;
  lotId: string;
  status: string;
  currentVersionNumber: number;
  currentVersionId: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  lot: TraceableLotResponse;
  currentSnapshot: DPPSnapshot | null;
  eventsCount: number;
  versionsCount: number;
}

export interface DPPEventResponse {
  id: string;
  dppId: string;
  lotId: string;
  eventType: DPPEventType;
  occurredAt: string;
  recordedAt: string;
  location: string | null;
  responsibleOrganisationId: string | null;
  responsibleOrganisationName: string | null;
  responsibleUserId: string | null;
  responsibleUserEmail: string | null;
  sourceType: string;
  sourceId: string;
  verificationStatus: DPPVerificationStatus;
  metadata: Record<string, unknown> | null;
}

export interface DPPVersionResponse {
  id: string;
  dppId: string;
  versionNumber: number;
  snapshot: DPPSnapshot;
  previousVersionId: string | null;
  changeReason: string | null;
  createdAt: string;
  createdByUserId: string;
}

export interface DPPCustodyRecordResponse {
  id: string;
  dppId: string;
  lotId: string;
  milestone: DPPCustodyMilestone;
  fromOrganisationId: string | null;
  fromOrganisationName: string | null;
  toOrganisationId: string | null;
  toOrganisationName: string | null;
  sourceType: string;
  sourceId: string;
  occurredAt: string;
  recordedAt: string;
  location: string | null;
  notes: string | null;
}

export interface PassportViewResponse {
  dppId: string;
  passportNumber: string;
  versionNumber: number;
  isHistorical: boolean;
  totalVersions: number;
  status: string;
  createdAt: string;
  versionCreatedAt: string;
  renderedAt: string;
  lotId: string;
  lotNumber: string;
  snapshot: DPPSnapshot;
  provenanceEvents: DPPEventResponse[];
  custodyMilestones: DPPCustodyRecordResponse[];
  qr: {
    targetUrl: string;
    route: string;
    qrSvg: string;
    qrDataUrl: string;
    requiresAuth: boolean;
  };
  availableVersions: Array<{
    versionNumber: number;
    createdAt: string;
    changeReason: string | null;
  }>;
}
