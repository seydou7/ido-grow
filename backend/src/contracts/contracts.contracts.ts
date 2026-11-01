export type ContractStatus = "DRAFT" | "CONFIRMED";

export interface ContractSummary {
  id: string;
  contractNumber: string;
  tradeId: string;
  tradeNumber: string;
  acceptedQuoteVersionId: string;
  acceptedQuoteVersionNumber: number;
  buyerOrganisationId: string;
  buyerOrganisationName: string;
  supplierOrganisationId: string;
  supplierOrganisationName: string;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  currency: string;
  acceptedCommercialAmount: number;
  acceptedTolerance: string | null;
  incoterm: string | null;
  qualityConditions: string | null;
  inspectionMethod: string | null;
  pickupDate: string | null;
  deliveryDate: string | null;
  paymentTerms: string | null;
  claimsProcess: string | null;
  requiredDocuments: string | null;
  cancellationConditions: string | null;
  governingLaw: string | null;
  status: ContractStatus;
  confirmedAt: string | null;
  confirmedByUserId: string | null;
  hasDocument: boolean;
  documentGeneratedAt: string | null;
  buyerSignatureStatus: string;
  supplierSignatureStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractDetail extends ContractSummary {
  quoteNumber: string;
  buyerAddress?: string | null;
  buyerCity?: string | null;
  buyerCountry?: string | null;
  supplierAddress?: string | null;
  supplierCity?: string | null;
  supplierCountry?: string | null;
}

export interface ContractCollection {
  items: ContractSummary[];
  total: number;
}

export interface CreateContractInput {
  tradeId: string;
}

export interface UpdateContractDraftInput {
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
  [key: string]: unknown;
}
