import type { AuditEventDatabaseClient } from "../audit";
import type {
  ContractDetail,
  ContractSummary,
  UpdateContractDraftInput,
} from "./contracts.contracts";

export interface CreateContractData {
  contractNumber: string;
  tradeId: string;
  acceptedQuoteVersionId: string;
  buyerOrganisationId: string;
  supplierOrganisationId: string;
  createdByUserId: string;
  materialType: string;
  productForm?: string | null;
  quantity: number;
  quantityUnit: string;
  currency: string;
  acceptedCommercialAmount: number;
  acceptedTolerance?: string | null;
  incoterm?: string | null;
  qualityConditions?: string | null;
  inspectionMethod?: string | null;
  pickupDate?: Date | null;
  deliveryDate?: Date | null;
  paymentTerms?: string | null;
  claimsProcess?: string | null;
  requiredDocuments?: string | null;
  cancellationConditions?: string | null;
  governingLaw?: string | null;
}

export abstract class ContractsRepository {
  abstract findById(id: string): Promise<ContractDetail | null>;
  abstract findByTradeId(tradeId: string): Promise<ContractDetail | null>;
  abstract findAll(): Promise<ContractSummary[]>;
  abstract createContract(
    data: CreateContractData,
    onAtomicActions?: (
      tx: AuditEventDatabaseClient,
      createdContract: ContractDetail,
    ) => Promise<void>,
  ): Promise<ContractDetail>;
  abstract updateContractDraft(
    id: string,
    data: UpdateContractDraftInput,
    onAtomicActions?: (tx: AuditEventDatabaseClient) => Promise<void>,
  ): Promise<ContractDetail>;
  abstract confirmContract(
    id: string,
    data: {
      confirmedAt: Date;
      confirmedByUserId: string;
      storageKey: string;
      documentGeneratedAt: Date;
    },
    onAtomicActions?: (tx: AuditEventDatabaseClient) => Promise<void>,
  ): Promise<ContractDetail>;
}
