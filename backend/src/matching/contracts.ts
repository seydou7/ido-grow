export interface TraderBuyerDetailQuote {
  id: string;
  quoteNumber: string;
  currentVersionNumber: number;
  totalAmount: number;
  currency: string | null;
  status: string;
  materialType: string;
  lastActivity: string;
}

export type MatchStatus = "DRAFT" | "APPROVED" | "CANCELLED";

export type CompatibilityStatus = "MATCH" | "MISMATCH" | "NOT_SPECIFIED";
export type QuantityCoverageStatus = "SUFFICIENT" | "INSUFFICIENT" | "UNKNOWN";
export type OriginCompatibilityStatus =
  | "ACCEPTABLE"
  | "NOT_ACCEPTABLE"
  | "NOT_SPECIFIED";
export type CertificationCompatibilityStatus =
  | "MATCH"
  | "MISSING"
  | "NOT_REQUIRED"
  | "UNKNOWN";

export interface DeterministicCompatibilityIndicators {
  material: CompatibilityStatus;
  productForm: CompatibilityStatus;
  quantity: QuantityCoverageStatus;
  quantityAvailable: number;
  quantityRequested: number;
  quantityRatio: number;
  origin: OriginCompatibilityStatus;
  certification: CertificationCompatibilityStatus;
  priceComparison: {
    targetPriceAmount: number | null;
    targetPriceUnit: string | null;
    listingPriceAmount: number | null;
    listingPriceUnit: string | null;
    currency: string;
    priceDifference: number | null;
  };
}

export interface MatchSummary {
  id: string;
  buyOrderId: string;
  listingId: string;
  buyerOrganisationId: string | null;
  supplierOrganisationId: string | null;
  createdByUserId: string | null;
  status: MatchStatus;
  traderNotes: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateListing {
  id: string;
  organisationId: string;
  organisationName: string;
  organisationCountry: string | null;
  verificationStatus: string;
  siteId: string | null;
  siteName: string | null;
  title: string;
  description: string | null;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  priceAmount: number | null;
  currency: string;
  priceUnit: string;
  originCountry: string | null;
  harvestYear: number | null;
  compatibility: DeterministicCompatibilityIndicators;
  match: MatchSummary | null;
}

export interface MatchingWorkspace {
  buyOrder: {
    id: string;
    buyerOrganisationId: string;
    buyerOrganisationName: string;
    materialType: string;
    productForm: string | null;
    quantity: number;
    quantityUnit: string;
    deliveryCountry: string | null;
    deliveryDestination: string | null;
    requestedDeliveryDate: string | null;
    targetPriceAmount: number | null;
    currency: string;
    targetPriceUnit: string;
    acceptableOriginCountries: string | null;
    qualityRequirements: string | null;
    packagingRequirements: string | null;
    certificationRequirements: string | null;
    transportPreferences: string | null;
    paymentTerms: string | null;
    status: string;
  };
  candidates: CandidateListing[];
  activeApprovedMatch: MatchSummary | null;
  matches: MatchSummary[];
}

export interface SelectMatchInput {
  listingId: string;
  traderNotes?: string;
}

export interface ApproveMatchInput {
  traderNotes?: string;
}

export interface CancelMatchInput {
  reason?: string;
}


export interface TraderCockpitSummary {
  supplierOnboardingCount: number;
  pendingListingsCount: number;
  publishedListingsCount: number;
  openBuyOrdersCount: number;
  approvedMatchesCount: number;
}

export type OperationalQueueCategory =
  | "supplier_onboarding"
  | "listing_review"
  | "buyer_demand"
  | "approved_match"
  | "quote_internal_review"
  | "quote_countered"
  | "quote_awaiting_buyer"
  | "quote_accepted"
  | "quote_rejected"
  | "quality_inspection";

export interface OperationalQueueItem {
  id: string;
  category: OperationalQueueCategory;
  referenceId: string;
  referenceDisplay: string;
  organisationName: string;
  organisationType: string;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
  attentionReason: string;
  nextActionLabel: string;
  nextActionUrl: string;
  meta?: {
    buyOrderId?: string;
    listingId?: string;
    matchId?: string;
    organisationId?: string;
    tradeId?: string;
    tradeNumber?: string;
    materialType?: string;
    productForm?: string | null;
    quantity?: number;
    quantityUnit?: string;
    currency?: string;
    buyerOrganisationName?: string;
    supplierOrganisationName?: string;
    inspectionId?: string;
    inspectionReference?: string;
    status?: string;
  };
}

export interface CockpitBuyOrder {
  id: string;
  buyerOrganisationId: string;
  buyerOrganisationName: string;
  buyerCountry: string | null;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  deliveryCountry: string | null;
  deliveryDestination: string | null;
  requestedDeliveryDate: string | null;
  status: string;
  matchStatus: "No Match" | "Draft Match" | "Approved Match";
  activeMatchId: string | null;
  createdAt: string;
}

export interface CockpitApprovedMatch {
  id: string;
  buyOrderId: string;
  listingId: string;
  buyerOrganisationId: string | null;
  buyerOrganisationName: string;
  supplierOrganisationId: string | null;
  supplierOrganisationName: string;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  currency: string;
  status: "APPROVED";
  approvedAt: string | null;
  nextStep: "Ready for Quotation";
  createdAt: string;
}

export interface TraderCockpitResponse {
  summary: TraderCockpitSummary;
  operationalQueue: OperationalQueueItem[];
  openBuyOrders: CockpitBuyOrder[];
  approvedMatches: CockpitApprovedMatch[];
}


export interface TraderSupplierSummary {
  id: string;
  name: string;
  legalName: string | null;
  country: string | null;
  city: string | null;
  verificationStatus: string;
  publishedListingCount: number;
  draftListingCount: number;
  siteCount: number;
  createdAt: string;
}

export interface TraderSupplierCollection {
  items: TraderSupplierSummary[];
  total: number;
}

export interface TraderSupplierDetail {
  id: string;
  name: string;
  legalName: string | null;
  businessType: string | null;
  registrationNumber: string | null;
  vatNumber: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  summary: {
    publishedListingCount: number;
    draftListingCount: number;
    siteCount: number;
    documentCount: number;
  };
  sites: Array<{
    id: string;
    name: string;
    facilityType: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    landAreaHectares: number | null;
    createdAt: string;
  }>;
  listings: Array<{
    id: string;
    siteId: string | null;
    siteName: string | null;
    title: string;
    description: string | null;
    materialType: string;
    productForm: string | null;
    quantity: number;
    quantityUnit: string;
    priceAmount: number | null;
    currency: string;
    priceUnit: string;
    originCountry: string | null;
    harvestYear: number | null;
    status: string;
    createdAt: string;
  }>;
  complianceDocuments: Array<{
    id: string;
    documentType: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    status: string;
    createdAt: string;
  }>;
}

export interface TraderBuyerSummary {
  id: string;
  name: string;
  legalName: string | null;
  country: string | null;
  city: string | null;
  verificationStatus: string;
  totalBuyOrderCount: number;
  openBuyOrderCount: number;
  approvedMatchCount: number;
  mostRecentDemandDate: string | null;
  createdAt: string;
}

export interface TraderBuyerCollection {
  items: TraderBuyerSummary[];
  total: number;
}

export interface TraderBuyerDetail {
  id: string;
  name: string;
  legalName: string | null;
  businessType: string | null;
  registrationNumber: string | null;
  vatNumber: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  summary: {
    totalBuyOrders: number;
    openBuyOrders: number;
    draftBuyOrders: number;
    approvedMatchesCount: number;
  };
  buyOrders: Array<{
    id: string;
    materialType: string;
    productForm: string | null;
    quantity: number;
    quantityUnit: string;
    deliveryCountry: string | null;
    deliveryDestination: string | null;
    requestedDeliveryDate: string | null;
    targetPriceAmount: number | null;
    currency: string;
    targetPriceUnit: string;
    status: string;
    matchStatus: "No Match" | "Draft Match" | "Approved Match";
    activeMatchId: string | null;
    createdByTrader: boolean;
    createdAt: string;
  }>;
  approvedMatches: Array<{
    id: string;
    buyOrderId: string;
    listingId: string;
    supplierOrganisationId: string | null;
    supplierOrganisationName: string;
    materialType: string;
    productForm: string | null;
    quantity: number;
    quantityUnit: string;
    currency: string;
    approvedAt: string | null;
    nextStep: "Ready for Quotation";
    createdAt: string;
  }>;
  quotes?: TraderBuyerDetailQuote[];
}
