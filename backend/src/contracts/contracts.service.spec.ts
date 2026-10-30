/* eslint-disable @typescript-eslint/no-explicit-any */
import { Readable } from "stream";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { AuditEventWriter, type AuditEventDatabaseClient } from "../audit";
import { PrismaService } from "../database";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import { StorageService, type RetrievedFile, type StoredFileMetadata } from "../storage";
import type {
  ContractDetail,
  ContractSummary,
  UpdateContractDraftInput,
} from "./contracts.contracts";
import { ContractsRepository, type CreateContractData } from "./contracts.repository";
import { ContractsService } from "./contracts.service";

class InMemoryContractsRepository extends ContractsRepository {
  public contracts: ContractDetail[] = [];
  public failOnAudit = false;
  public failOnDbConfirm = false;

  async findById(id: string): Promise<ContractDetail | null> {
    const found = this.contracts.find((c) => c.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async findByTradeId(tradeId: string): Promise<ContractDetail | null> {
    const found = this.contracts.find((c) => c.tradeId === tradeId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async findAll(): Promise<ContractSummary[]> {
    return JSON.parse(JSON.stringify(this.contracts));
  }

  async createContract(
    data: CreateContractData,
    onAtomicActions?: (
      tx: AuditEventDatabaseClient,
      createdContract: ContractDetail,
    ) => Promise<void>,
  ): Promise<ContractDetail> {
    const existing = this.contracts.find((c) => c.tradeId === data.tradeId);
    if (existing) {
      throw new BadRequestException("Contract already exists for trade.");
    }

    const newContract: ContractDetail = {
      id: `00000000-0000-4000-8000-0000000000${(this.contracts.length + 1).toString().padStart(2, "0")}`,
      contractNumber: data.contractNumber,
      tradeId: data.tradeId,
      tradeNumber: "TRD-20260918-0001",
      quoteNumber: "QUO-20260917-0001",
      acceptedQuoteVersionId: data.acceptedQuoteVersionId,
      acceptedQuoteVersionNumber: 1,
      buyerOrganisationId: data.buyerOrganisationId,
      buyerOrganisationName: "Buyer Org",
      supplierOrganisationId: data.supplierOrganisationId,
      supplierOrganisationName: "Supplier Org",
      materialType: data.materialType,
      productForm: data.productForm ?? null,
      quantity: data.quantity,
      quantityUnit: data.quantityUnit,
      currency: data.currency,
      acceptedCommercialAmount: data.acceptedCommercialAmount,
      acceptedTolerance: data.acceptedTolerance ?? null,
      incoterm: data.incoterm ?? null,
      qualityConditions: data.qualityConditions ?? null,
      inspectionMethod: data.inspectionMethod ?? null,
      pickupDate: data.pickupDate ? data.pickupDate.toISOString() : null,
      deliveryDate: data.deliveryDate ? data.deliveryDate.toISOString() : null,
      paymentTerms: data.paymentTerms ?? null,
      claimsProcess: data.claimsProcess ?? null,
      requiredDocuments: data.requiredDocuments ?? null,
      cancellationConditions: data.cancellationConditions ?? null,
      governingLaw: data.governingLaw ?? null,
      status: "DRAFT",
      confirmedAt: null,
      confirmedByUserId: null,
      hasDocument: false,
      documentGeneratedAt: null,
      buyerSignatureStatus: "UNSIGNED",
      supplierSignatureStatus: "UNSIGNED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.failOnAudit) {
      throw new Error("Simulated database audit write failure");
    }

    if (onAtomicActions) {
      await onAtomicActions({} as AuditEventDatabaseClient, newContract);
    }

    this.contracts.push(newContract);
    return JSON.parse(JSON.stringify(newContract));
  }

  async updateContractDraft(
    id: string,
    data: UpdateContractDraftInput,
    onAtomicActions?: (tx: AuditEventDatabaseClient) => Promise<void>,
  ): Promise<ContractDetail> {
    const idx = this.contracts.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException();

    const current = this.contracts[idx];
    const updated: ContractDetail = {
      ...current,
      acceptedTolerance: data.acceptedTolerance !== undefined ? data.acceptedTolerance : current.acceptedTolerance,
      incoterm: data.incoterm !== undefined ? data.incoterm : current.incoterm,
      qualityConditions: data.qualityConditions !== undefined ? data.qualityConditions : current.qualityConditions,
      inspectionMethod: data.inspectionMethod !== undefined ? data.inspectionMethod : current.inspectionMethod,
      pickupDate: data.pickupDate !== undefined ? (data.pickupDate ? new Date(data.pickupDate).toISOString() : null) : current.pickupDate,
      deliveryDate: data.deliveryDate !== undefined ? (data.deliveryDate ? new Date(data.deliveryDate).toISOString() : null) : current.deliveryDate,
      paymentTerms: data.paymentTerms !== undefined ? data.paymentTerms : current.paymentTerms,
      claimsProcess: data.claimsProcess !== undefined ? data.claimsProcess : current.claimsProcess,
      requiredDocuments: data.requiredDocuments !== undefined ? data.requiredDocuments : current.requiredDocuments,
      cancellationConditions: data.cancellationConditions !== undefined ? data.cancellationConditions : current.cancellationConditions,
      governingLaw: data.governingLaw !== undefined ? data.governingLaw : current.governingLaw,
      updatedAt: new Date().toISOString(),
    };

    if (onAtomicActions) {
      await onAtomicActions({} as AuditEventDatabaseClient);
    }

    this.contracts[idx] = updated;
    return JSON.parse(JSON.stringify(updated));
  }

  async confirmContract(
    id: string,
    data: {
      confirmedAt: Date;
      confirmedByUserId: string;
      storageKey: string;
      documentGeneratedAt: Date;
    },
    onAtomicActions?: (tx: AuditEventDatabaseClient) => Promise<void>,
  ): Promise<ContractDetail> {
    if (this.failOnDbConfirm) {
      throw new Error("Database transaction failure during confirm.");
    }

    const idx = this.contracts.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException();

    if (onAtomicActions) {
      await onAtomicActions({} as AuditEventDatabaseClient);
    }

    const current = this.contracts[idx];
    const confirmed: ContractDetail = {
      ...current,
      status: "CONFIRMED",
      confirmedAt: data.confirmedAt.toISOString(),
      confirmedByUserId: data.confirmedByUserId,
      hasDocument: true,
      documentGeneratedAt: data.documentGeneratedAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.contracts[idx] = confirmed;
    return JSON.parse(JSON.stringify(confirmed));
  }
}

class InMemoryStorageService extends StorageService {
  public files = new Map<string, { buffer: Buffer; meta: StoredFileMetadata }>();
  public deletedKeys: string[] = [];

  async store(
    filename: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StoredFileMetadata> {
    const storageKey = `storage-key-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullMeta: StoredFileMetadata = {
      storageKey,
      originalFilename: filename,
      mimeType,
      fileSize: buffer.length,
    };
    this.files.set(storageKey, { buffer, meta: fullMeta });
    return fullMeta;
  }

  async retrieve(storageKey: string): Promise<RetrievedFile | null> {
    const found = this.files.get(storageKey);
    if (!found) return null;
    return {
      stream: Readable.from(found.buffer),
      filename: found.meta.originalFilename,
      mimeType: found.meta.mimeType,
      fileSize: found.meta.fileSize,
    };
  }

  async delete(storageKey: string): Promise<boolean> {
    this.deletedKeys.push(storageKey);
    this.files.delete(storageKey);
    return true;
  }
}

describe("ContractsService", () => {
  let service: ContractsService;
  let repo: InMemoryContractsRepository;
  let storage: InMemoryStorageService;
  let auditWriter: jest.Mocked<AuditEventWriter>;
  let organisationsRepo: jest.Mocked<OrganisationsRepository>;
  let mockPrisma: any;

  const traderUserId = "00000000-0000-4000-8000-000000000001";
  const buyerUserId = "00000000-0000-4000-8000-000000000002";
  const supplierUserId = "00000000-0000-4000-8000-000000000003";

  const validTradeId = "11111111-1111-4111-8111-111111111111";
  const acceptedQuoteVersionId = "22222222-2222-4222-8222-222222222222";
  const buyerOrgId = "33333333-3333-4333-8333-333333333333";
  const supplierOrgId = "44444444-4444-4444-8444-444444444444";

  const mockTrade = {
    id: validTradeId,
    tradeNumber: "TRD-20260918-0001",
    quoteId: "quote-1",
    acceptedQuoteVersionNumber: 1,
    buyerOrganisationId: buyerOrgId,
    supplierOrganisationId: supplierOrgId,
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 25,
    quantityUnit: "TONNES",
    currency: "EUR",
    acceptedTotalAmount: 12500,
    incoterm: "FCA",
    paymentTerms: "14_DAYS_NET",
    quote: {
      id: "quote-1",
      quoteNumber: "QUO-20260917-0001",
      status: "ACCEPTED",
      versions: [
        {
          id: acceptedQuoteVersionId,
          versionNumber: 1,
          totalAmount: 12500,
        },
      ],
    },
    buyerOrganisation: {
      id: buyerOrgId,
      name: "Buyer Corp",
      address: "Main St 1",
      city: "Amsterdam",
      country: "Netherlands",
    },
    supplierOrganisation: {
      id: supplierOrgId,
      name: "Supplier Corp",
      address: "Ferme Nord 5",
      city: "Lille",
      country: "France",
    },
    inspections: [
      {
        id: "ins-1",
        inspectionMethod: "ON_SITE_PORTABLE_MOISTURE_METER",
        createdAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    repo = new InMemoryContractsRepository();
    storage = new InMemoryStorageService();

    auditWriter = {
      append: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditEventWriter>;

    organisationsRepo = {
      findMembershipsForUser: jest.fn().mockImplementation(async (uid: string) => {
        if (uid === traderUserId) {
          return [{ organisation: { organisationType: "TRADER" } }];
        }
        if (uid === buyerUserId) {
          return [{ organisation: { organisationType: "BUYER" } }];
        }
        if (uid === supplierUserId) {
          return [{ organisation: { organisationType: "SUPPLIER" } }];
        }
        return [];
      }),
    } as unknown as jest.Mocked<OrganisationsRepository>;

    mockPrisma = {
      trade: {
        findUnique: jest.fn().mockImplementation(async ({ where }: { where: { id: string } }) => {
          if (where.id === validTradeId) {
            return mockTrade;
          }
          return null;
        }),
      },
      contract: {
        findUnique: jest.fn().mockImplementation(async ({ where }: { where: { id: string } }) => {
          const c = repo.contracts.find((x) => x.id === where.id);
          if (!c) return null;
          return {
            id: c.id,
            storageKey: storage.files.size > 0 ? Array.from(storage.files.keys())[0] : null,
          };
        }),
      },
    };

    service = new ContractsService(
      mockPrisma as unknown as PrismaService,
      repo,
      organisationsRepo,
      auditWriter,
      storage,
    );
  });

  // 1. Create Contract from valid Trade
  it("creates a Contract from a valid Trade and initializes DRAFT status", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    expect(contract.id).toBeDefined();
    expect(contract.contractNumber).toMatch(/^CTR-\d{8}-[A-F0-9]{8}$/);
    expect(contract.tradeId).toBe(validTradeId);
    expect(contract.status).toBe("DRAFT");
    expect(contract.materialType).toBe("HEMP");
    expect(contract.productForm).toBe("STRAW_RETTED");
    expect(contract.quantity).toBe(25);
    expect(contract.currency).toBe("EUR");
    expect(contract.acceptedCommercialAmount).toBe(12500);
    // Upstream values prefilled
    expect(contract.incoterm).toBe("FCA");
    expect(contract.paymentTerms).toBe("14_DAYS_NET");
    expect(contract.inspectionMethod).toBe("ON_SITE_PORTABLE_MOISTURE_METER");
    // Other fields stay null without fake defaults
    expect(contract.acceptedTolerance).toBeNull();
    expect(contract.qualityConditions).toBeNull();
    expect(contract.governingLaw).toBeNull();
    expect(contract.pickupDate).toBeNull();
    expect(contract.deliveryDate).toBeNull();

    // Verify audit event binding
    expect(auditWriter.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "contract.created",
        outcome: "succeeded",
        target: { type: "contract", id: contract.id },
        correlationId: validTradeId,
      }),
      expect.anything(),
    );
  });

  it("regression: contract.created audit event binds real contract UUID rather than empty string", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    expect(contract.id).toBeDefined();
    expect(contract.id.length).toBeGreaterThan(0);
    // UUID regex check
    expect(contract.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    expect(auditWriter.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "contract.created",
        target: { type: "contract", id: contract.id },
      }),
      expect.anything(),
    );
  });

  it("regression: atomic audit failure during contract creation triggers transaction rollback and no contract is persisted", async () => {
    repo.failOnAudit = true;

    await expect(service.createContract(traderUserId, validTradeId)).rejects.toThrow(
      "Simulated database audit write failure",
    );

    // Verify atomic rollback: no contract was added to the repository
    expect(repo.contracts.length).toBe(0);
    const inDb = await repo.findByTradeId(validTradeId);
    expect(inDb).toBeNull();
  });

  // 2. Duplicate Contract blocked/idempotent
  it("is idempotent: creating a Contract twice for the same Trade returns the existing record without duplicating", async () => {
    const first = await service.createContract(traderUserId, validTradeId);
    const second = await service.createContract(traderUserId, validTradeId);
    expect(second.id).toBe(first.id);
    expect(second.contractNumber).toBe(first.contractNumber);
    expect(repo.contracts.length).toBe(1);
  });

  // 3. Wrong/missing Trade rejected (404)
  it("rejects contract creation for non-existent Trade with 404", async () => {
    await expect(
      service.createContract(traderUserId, "99999999-9999-4999-8999-999999999999"),
    ).rejects.toThrow(NotFoundException);
  });

  // 4. Trade without accepted Quote rejected
  it("rejects contract creation if Trade quote is not in ACCEPTED status", async () => {
    mockPrisma.trade.findUnique.mockResolvedValueOnce({
      ...mockTrade,
      quote: { ...mockTrade.quote, status: "DRAFT" },
    });

    await expect(service.createContract(traderUserId, validTradeId)).rejects.toThrow(
      BadRequestException,
    );
  });

  // 5. Exact accepted QuoteVersion linkage
  it("rejects contract creation if the exact accepted QuoteVersion cannot be found", async () => {
    mockPrisma.trade.findUnique.mockResolvedValueOnce({
      ...mockTrade,
      acceptedQuoteVersionNumber: 99, // does not exist in versions
    });

    await expect(service.createContract(traderUserId, validTradeId)).rejects.toThrow(
      NotFoundException,
    );
  });

  // 6. Immutable baseline copied exactly
  it("copies the accepted commercial baseline exactly from Trade and accepted QuoteVersion", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    expect(contract.acceptedQuoteVersionId).toBe(acceptedQuoteVersionId);
    expect(contract.buyerOrganisationId).toBe(buyerOrgId);
    expect(contract.supplierOrganisationId).toBe(supplierOrgId);
    expect(contract.materialType).toBe(mockTrade.materialType);
    expect(contract.productForm).toBe(mockTrade.productForm);
    expect(contract.quantity).toBe(mockTrade.quantity);
    expect(contract.quantityUnit).toBe(mockTrade.quantityUnit);
    expect(contract.currency).toBe(mockTrade.currency);
    expect(contract.acceptedCommercialAmount).toBe(mockTrade.acceptedTotalAmount);
  });

  // 7. Trader editable supplemental terms
  it("allows Trader to update supplemental terms in DRAFT contract", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    const updated = await service.updateContractDraft(traderUserId, contract.id, {
      acceptedTolerance: "+/- 3%",
      qualityConditions: "Moisture <= 14%, clean retted straw",
      governingLaw: "Dutch law",
      pickupDate: "2026-10-10T10:00:00.000Z",
      deliveryDate: "2026-10-15T15:00:00.000Z",
      claimsProcess: "Notice within 7 days",
      requiredDocuments: "CMR, Certificate",
      cancellationConditions: "Prior to shipment",
    });

    expect(updated.acceptedTolerance).toBe("+/- 3%");
    expect(updated.qualityConditions).toBe("Moisture <= 14%, clean retted straw");
    expect(updated.governingLaw).toBe("Dutch law");
    expect(updated.pickupDate).toBe("2026-10-10T10:00:00.000Z");
    expect(updated.deliveryDate).toBe("2026-10-15T15:00:00.000Z");
  });

  // 8. Attempt to mutate baseline rejected
  it("rejects any attempt to modify immutable commercial baseline fields via update", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    await expect(
      service.updateContractDraft(traderUserId, contract.id, {
        quantity: 9999,
      } as unknown as UpdateContractDraftInput),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.updateContractDraft(traderUserId, contract.id, {
        materialType: "COTTON",
      } as unknown as UpdateContractDraftInput),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.updateContractDraft(traderUserId, contract.id, {
        currency: "USD",
      } as unknown as UpdateContractDraftInput),
    ).rejects.toThrow(BadRequestException);
  });

  // 9. Confirm incomplete Contract rejected
  it("rejects confirmation if any required contract term is missing or blank", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    // Terms are still blank
    await expect(service.confirmContract(traderUserId, contract.id)).rejects.toThrow(
      BadRequestException,
    );
  });

  // 10. Successful confirmation
  it("confirms complete Contract, generates PDF, and marks status CONFIRMED", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    await service.updateContractDraft(traderUserId, contract.id, {
      acceptedTolerance: "+/- 5%",
      incoterm: "FCA",
      qualityConditions: "Moisture <= 15%",
      inspectionMethod: "ON_SITE_PORTABLE_MOISTURE_METER",
      pickupDate: "2026-10-10T10:00:00.000Z",
      deliveryDate: "2026-10-15T15:00:00.000Z",
      paymentTerms: "14_DAYS_NET",
      claimsProcess: "Notice within 5 days",
      requiredDocuments: "CMR, Invoice, Certificate",
      cancellationConditions: "10% penalty prior to dispatch",
      governingLaw: "Dutch law",
    });

    const confirmed = await service.confirmContract(traderUserId, contract.id);
    expect(confirmed.status).toBe("CONFIRMED");
    expect(confirmed.confirmedAt).toBeDefined();
    expect(confirmed.hasDocument).toBe(true);
    expect(confirmed.documentGeneratedAt).toBeDefined();
    expect(storage.files.size).toBe(1);
  });

  // 11. Confirmed Contract immutable
  it("rejects any update on a CONFIRMED contract", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    await service.updateContractDraft(traderUserId, contract.id, {
      acceptedTolerance: "+/- 5%",
      incoterm: "FCA",
      qualityConditions: "Moisture <= 15%",
      inspectionMethod: "ON_SITE_PORTABLE_MOISTURE_METER",
      pickupDate: "2026-10-10T10:00:00.000Z",
      deliveryDate: "2026-10-15T15:00:00.000Z",
      paymentTerms: "14_DAYS_NET",
      claimsProcess: "Notice within 5 days",
      requiredDocuments: "CMR, Invoice, Certificate",
      cancellationConditions: "10% penalty prior to dispatch",
      governingLaw: "Dutch law",
    });

    await service.confirmContract(traderUserId, contract.id);

    // Attempting to update a confirmed contract
    await expect(
      service.updateContractDraft(traderUserId, contract.id, {
        acceptedTolerance: "+/- 10%",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // 12. PDF generation on confirmation produces valid PDF
  it("generates and stores PDF document on confirmation", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    await service.updateContractDraft(traderUserId, contract.id, {
      acceptedTolerance: "+/- 5%",
      incoterm: "FCA",
      qualityConditions: "Standard retted hemp",
      inspectionMethod: "ON_SITE_PORTABLE_MOISTURE_METER",
      pickupDate: "2026-10-10T10:00:00.000Z",
      deliveryDate: "2026-10-15T15:00:00.000Z",
      paymentTerms: "14_DAYS_NET",
      claimsProcess: "Standard",
      requiredDocuments: "CMR",
      cancellationConditions: "None",
      governingLaw: "French law",
    });

    await service.confirmContract(traderUserId, contract.id);
    expect(storage.files.size).toBe(1);
    const key = Array.from(storage.files.keys())[0];
    const file = storage.files.get(key)!;
    expect(file.buffer.toString("latin1").startsWith("%PDF-1.4\n")).toBe(true);
  });

  // 13. PDF retrieval authorization
  it("allows Trader to retrieve document and denies non-Trader", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    await service.updateContractDraft(traderUserId, contract.id, {
      acceptedTolerance: "+/- 5%",
      incoterm: "FCA",
      qualityConditions: "Standard",
      inspectionMethod: "ON_SITE",
      pickupDate: "2026-10-10T10:00:00.000Z",
      deliveryDate: "2026-10-15T15:00:00.000Z",
      paymentTerms: "14_DAYS_NET",
      claimsProcess: "Standard",
      requiredDocuments: "CMR",
      cancellationConditions: "None",
      governingLaw: "Dutch law",
    });
    await service.confirmContract(traderUserId, contract.id);

    const doc = await service.getContractDocument(traderUserId, contract.id);
    expect(doc.filename).toMatch(/^CTR-.*\.pdf$/);
    expect(doc.file.mimeType).toBe("application/pdf");

    // Denied for buyer
    await expect(service.getContractDocument(buyerUserId, contract.id)).rejects.toThrow(
      ForbiddenException,
    );
  });

  // 14. Audit events written
  it("writes contract.created, contract.updated, contract.confirmed, and contract.document.generated audit events", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    expect(auditWriter.append).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "contract.created" }),
      expect.anything(),
    );

    await service.updateContractDraft(traderUserId, contract.id, {
      acceptedTolerance: "+/- 5%",
      incoterm: "FCA",
      qualityConditions: "Standard",
      inspectionMethod: "ON_SITE",
      pickupDate: "2026-10-10T10:00:00.000Z",
      deliveryDate: "2026-10-15T15:00:00.000Z",
      paymentTerms: "14_DAYS_NET",
      claimsProcess: "Standard",
      requiredDocuments: "CMR",
      cancellationConditions: "None",
      governingLaw: "Dutch law",
    });

    expect(auditWriter.append).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "contract.updated" }),
      expect.anything(),
    );

    await service.confirmContract(traderUserId, contract.id);

    expect(auditWriter.append).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "contract.confirmed" }),
      expect.anything(),
    );
    expect(auditWriter.append).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "contract.document.generated" }),
      expect.anything(),
    );
  });

  // 15. Rollback / storage compensation on DB/audit failure during confirmation
  it("compensates and deletes stored PDF if database confirmation fails", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    await service.updateContractDraft(traderUserId, contract.id, {
      acceptedTolerance: "+/- 5%",
      incoterm: "FCA",
      qualityConditions: "Standard",
      inspectionMethod: "ON_SITE",
      pickupDate: "2026-10-10T10:00:00.000Z",
      deliveryDate: "2026-10-15T15:00:00.000Z",
      paymentTerms: "14_DAYS_NET",
      claimsProcess: "Standard",
      requiredDocuments: "CMR",
      cancellationConditions: "None",
      governingLaw: "Dutch law",
    });

    repo.failOnDbConfirm = true;

    await expect(service.confirmContract(traderUserId, contract.id)).rejects.toThrow();
    // Compensation should delete stored PDF
    expect(storage.deletedKeys.length).toBe(1);
    expect(storage.files.size).toBe(0);
  });

  // 16. Date range validation
  it("rejects invalid date range where pickupDate is after deliveryDate", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    await expect(
      service.updateContractDraft(traderUserId, contract.id, {
        pickupDate: "2026-10-25T10:00:00.000Z",
        deliveryDate: "2026-10-10T10:00:00.000Z",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // 17. 403 when user is not Trader
  it("rejects non-Trader access with 403 Forbidden", async () => {
    await expect(service.createContract(buyerUserId, validTradeId)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.createContract(supplierUserId, validTradeId)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.getContracts(buyerUserId)).rejects.toThrow(
      ForbiddenException,
    );
  });

  // 18. Buyer/Supplier mutation denied
  it("strictly denies Buyer or Supplier from updating or confirming a contract", async () => {
    const contract = await service.createContract(traderUserId, validTradeId);
    await expect(
      service.updateContractDraft(buyerUserId, contract.id, { acceptedTolerance: "5%" }),
    ).rejects.toThrow(ForbiddenException);
    await expect(service.confirmContract(supplierUserId, contract.id)).rejects.toThrow(
      ForbiddenException,
    );
  });

  // 19. Get contract by tradeId
  it("retrieves contract by Trade ID", async () => {
    const created = await service.createContract(traderUserId, validTradeId);
    const found = await service.getContractByTradeId(traderUserId, validTradeId);
    expect(found.id).toBe(created.id);
  });

  // 20. Concurrency duplicate creation returns existing contract
  it("handles race condition and returns existing contract safely", async () => {
    const first = await service.createContract(traderUserId, validTradeId);
    // Simulating race condition where repository throws unique constraint on tradeId
    jest.spyOn(repo, "createContract").mockRejectedValueOnce(
      new BadRequestException("Duplicate trade contract"),
    );

    const raceResult = await service.createContract(traderUserId, validTradeId);
    expect(raceResult.id).toBe(first.id);
  });
});
