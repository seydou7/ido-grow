import { randomBytes } from "crypto";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AuditEventWriter, type AuditEventDatabaseClient } from "../audit";
import { PrismaService } from "../database";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import { StorageService, type RetrievedFile } from "../storage";
import {
  generateContractPdfBuffer,
  type ContractPdfSnapshot,
} from "./contract-pdf-generator";
import type {
  ContractCollection,
  ContractDetail,
  UpdateContractDraftInput,
} from "./contracts.contracts";
import { ContractsRepository } from "./contracts.repository";

const IMMUTABLE_BASELINE_FIELDS = [
  "buyerOrganisationId",
  "supplierOrganisationId",
  "materialType",
  "productForm",
  "quantity",
  "quantityUnit",
  "currency",
  "acceptedCommercialAmount",
  "tradeId",
  "acceptedQuoteVersionId",
  "contractNumber",
  "status",
  "confirmedAt",
  "confirmedByUserId",
  "storageKey",
  "documentGeneratedAt",
] as const;

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contractsRepository: ContractsRepository,
    private readonly organisationsRepository: OrganisationsRepository,
    private readonly auditEventWriter: AuditEventWriter,
    private readonly storageService: StorageService,
  ) {}

  async createContract(userId: string, tradeId: string): Promise<ContractDetail> {
    await this.assertTraderAccess(userId);

    // Idempotency check: if contract already exists for this trade, return it
    const existing = await this.contractsRepository.findByTradeId(tradeId);
    if (existing) {
      return existing;
    }

    // Gate verification: load Trade with its quote and accepted version
    const trade = this.prisma.trade
      ? await this.prisma.trade.findUnique({
          where: { id: tradeId },
          include: {
            quote: {
              include: {
                versions: true,
              },
            },
            buyerOrganisation: true,
            supplierOrganisation: true,
            inspections: {
              orderBy: { createdAt: "desc" },
            },
          },
        })
      : null;

    if (!trade) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/trades/not-found",
        title: "Trade Not Found",
        status: 404,
        detail: `Trade record with ID ${tradeId} not found.`,
      });
    }

    if (!trade.quote || trade.quote.status !== "ACCEPTED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/contracts/trade-quote-not-accepted",
        title: "Trade Quote Not Accepted",
        status: 400,
        detail: `Trade ${trade.tradeNumber} does not originate from an ACCEPTED Quote. Current status: ${trade.quote?.status ?? "NONE"}.`,
      });
    }

    const acceptedQuoteVersion = trade.quote.versions.find(
      (v) => v.versionNumber === trade.acceptedQuoteVersionNumber,
    );

    if (!acceptedQuoteVersion) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/contracts/accepted-quote-version-not-found",
        title: "Accepted Quote Version Not Found",
        status: 404,
        detail: `The exact accepted QuoteVersion (v${trade.acceptedQuoteVersionNumber}) for Trade ${trade.tradeNumber} was not found.`,
      });
    }

    if (!trade.buyerOrganisation || !trade.supplierOrganisation) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/contracts/incomplete-commercial-baseline",
        title: "Incomplete Commercial Baseline",
        status: 400,
        detail: `Trade ${trade.tradeNumber} is missing Buyer or Supplier organisation linkage.`,
      });
    }

    if (
      !trade.materialType ||
      trade.quantity <= 0 ||
      !trade.currency ||
      trade.acceptedTotalAmount <= 0
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/contracts/incomplete-commercial-baseline",
        title: "Incomplete Commercial Baseline",
        status: 400,
        detail: `Trade ${trade.tradeNumber} has incomplete commercial baseline data (material, quantity, currency, or amount missing).`,
      });
    }

    // Prefill authoritative values from upstream without fabricating fake defaults
    const prefilledIncoterm = trade.incoterm || null;
    const prefilledPaymentTerms = trade.paymentTerms || null;
    const prefilledInspectionMethod =
      trade.inspections?.[0]?.inspectionMethod || null;

    // Retry loop for unique contractNumber collision safety (up to 3 attempts)
    let contract: ContractDetail | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const contractNumber = this.generateContractNumber();
      try {
        contract = await this.contractsRepository.createContract(
          {
            contractNumber,
            tradeId: trade.id,
            acceptedQuoteVersionId: acceptedQuoteVersion.id,
            buyerOrganisationId: trade.buyerOrganisationId,
            supplierOrganisationId: trade.supplierOrganisationId,
            createdByUserId: userId,
            materialType: trade.materialType,
            productForm: trade.productForm,
            quantity: trade.quantity,
            quantityUnit: trade.quantityUnit,
            currency: trade.currency,
            acceptedCommercialAmount: trade.acceptedTotalAmount,
            acceptedTolerance: null,
            incoterm: prefilledIncoterm,
            qualityConditions: null,
            inspectionMethod: prefilledInspectionMethod,
            pickupDate: null,
            deliveryDate: null,
            paymentTerms: prefilledPaymentTerms,
            claimsProcess: null,
            requiredDocuments: null,
            cancellationConditions: null,
            governingLaw: null,
          },
          async (tx: AuditEventDatabaseClient, createdContract: ContractDetail) => {
            await this.auditEventWriter.append(
              {
                eventType: "contract.created",
                outcome: "succeeded",
                actor: { type: "user", userId },
                target: { type: "contract", id: createdContract.id },
                correlationId: trade.id,
                occurredAt: new Date(),
                metadata: {
                  contractNumber,
                  tradeId: trade.id,
                  tradeNumber: trade.tradeNumber,
                  buyerOrganisationId: trade.buyerOrganisationId,
                  supplierOrganisationId: trade.supplierOrganisationId,
                  status: "DRAFT",
                },
              },
              tx,
            );
          },
        );
        break;
      } catch (err: unknown) {
        if (
          err instanceof BadRequestException ||
          (err as { status?: number })?.status === 409
        ) {
          // If collision on contractNumber, retry; if already exists for tradeId, re-query and return
          const existingAfterRace = await this.contractsRepository.findByTradeId(tradeId);
          if (existingAfterRace) {
            return existingAfterRace;
          }
          if (attempt === 2) throw err;
        } else {
          throw err;
        }
      }
    }

    if (!contract) {
      throw new BadRequestException("Failed to create contract after retries.");
    }

    return contract;
  }

  async getContracts(userId: string): Promise<ContractCollection> {
    await this.assertTraderAccess(userId);
    const items = await this.contractsRepository.findAll();
    return { items, total: items.length };
  }

  async getContractById(userId: string, contractId: string): Promise<ContractDetail> {
    await this.assertTraderAccess(userId);

    const contract = await this.contractsRepository.findById(contractId);
    if (!contract) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/contracts/not-found",
        title: "Contract Not Found",
        status: 404,
        detail: `Contract record with ID ${contractId} not found.`,
      });
    }

    return contract;
  }

  async getContractByTradeId(userId: string, tradeId: string): Promise<ContractDetail> {
    await this.assertTraderAccess(userId);

    const contract = await this.contractsRepository.findByTradeId(tradeId);
    if (!contract) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/contracts/not-found",
        title: "Contract Not Found",
        status: 404,
        detail: `No contract record found for Trade ID ${tradeId}.`,
      });
    }

    return contract;
  }

  async updateContractDraft(
    userId: string,
    contractId: string,
    input: UpdateContractDraftInput,
  ): Promise<ContractDetail> {
    await this.assertTraderAccess(userId);

    const contract = await this.contractsRepository.findById(contractId);
    if (!contract) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/contracts/not-found",
        title: "Contract Not Found",
        status: 404,
        detail: `Contract record with ID ${contractId} not found.`,
      });
    }

    if (contract.status === "CONFIRMED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/contracts/contract-already-confirmed",
        title: "Contract Already Confirmed",
        status: 400,
        detail: `Contract ${contract.contractNumber} is CONFIRMED and immutable. Modifications are rejected.`,
      });
    }

    // Reject attempt to modify immutable baseline fields
    for (const key of IMMUTABLE_BASELINE_FIELDS) {
      if (
        input[key] !== undefined &&
        input[key] !== (contract as unknown as Record<string, unknown>)[key]
      ) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/contracts/immutable-baseline-mutation-denied",
          title: "Immutable Baseline Mutation Denied",
          status: 400,
          detail: `Field '${key}' is an immutable commercial baseline property derived from Trade and cannot be edited.`,
        });
      }
    }

    // Validate dates if provided
    if (input.pickupDate !== undefined && input.pickupDate !== null) {
      const d = new Date(input.pickupDate);
      if (isNaN(d.getTime())) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/contracts/invalid-date",
          title: "Invalid Pickup Date",
          status: 400,
          detail: `Pickup date '${input.pickupDate}' is not a valid ISO date.`,
        });
      }
    }

    if (input.deliveryDate !== undefined && input.deliveryDate !== null) {
      const d = new Date(input.deliveryDate);
      if (isNaN(d.getTime())) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/contracts/invalid-date",
          title: "Invalid Delivery Date",
          status: 400,
          detail: `Delivery date '${input.deliveryDate}' is not a valid ISO date.`,
        });
      }
    }

    const effectivePickup =
      input.pickupDate !== undefined
        ? input.pickupDate ? new Date(input.pickupDate) : null
        : contract.pickupDate ? new Date(contract.pickupDate) : null;

    const effectiveDelivery =
      input.deliveryDate !== undefined
        ? input.deliveryDate ? new Date(input.deliveryDate) : null
        : contract.deliveryDate ? new Date(contract.deliveryDate) : null;

    if (effectivePickup && effectiveDelivery && effectivePickup > effectiveDelivery) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/contracts/invalid-date-range",
        title: "Invalid Date Range",
        status: 400,
        detail: "Pickup date cannot be later than delivery date.",
      });
    }

    const updatedKeys = Object.keys(input).filter(
      (k) => !IMMUTABLE_BASELINE_FIELDS.includes(k as (typeof IMMUTABLE_BASELINE_FIELDS)[number]),
    );

    return await this.contractsRepository.updateContractDraft(
      contractId,
      input,
      async (tx: AuditEventDatabaseClient) => {
        await this.auditEventWriter.append(
          {
            eventType: "contract.updated",
            outcome: "succeeded",
            actor: { type: "user", userId },
            target: { type: "contract", id: contractId },
            correlationId: contract.tradeId,
            occurredAt: new Date(),
            metadata: {
              contractNumber: contract.contractNumber,
              tradeId: contract.tradeId,
              updatedFields: updatedKeys.join(", "),
            },
          },
          tx,
        );
      },
    );
  }

  async confirmContract(userId: string, contractId: string): Promise<ContractDetail> {
    await this.assertTraderAccess(userId);

    const contract = await this.contractsRepository.findById(contractId);
    if (!contract) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/contracts/not-found",
        title: "Contract Not Found",
        status: 404,
        detail: `Contract record with ID ${contractId} not found.`,
      });
    }

    if (contract.status === "CONFIRMED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/contracts/contract-already-confirmed",
        title: "Contract Already Confirmed",
        status: 400,
        detail: `Contract ${contract.contractNumber} is already CONFIRMED.`,
      });
    }

    // Validate that all required structured terms are present and non-empty
    const missingFields: string[] = [];

    if (!contract.acceptedTolerance || !contract.acceptedTolerance.trim()) {
      missingFields.push("acceptedTolerance");
    }
    if (!contract.incoterm || !contract.incoterm.trim()) {
      missingFields.push("incoterm");
    }
    if (!contract.qualityConditions || !contract.qualityConditions.trim()) {
      missingFields.push("qualityConditions");
    }
    if (!contract.inspectionMethod || !contract.inspectionMethod.trim()) {
      missingFields.push("inspectionMethod");
    }
    if (!contract.pickupDate) {
      missingFields.push("pickupDate");
    }
    if (!contract.deliveryDate) {
      missingFields.push("deliveryDate");
    }
    if (!contract.paymentTerms || !contract.paymentTerms.trim()) {
      missingFields.push("paymentTerms");
    }
    if (!contract.claimsProcess || !contract.claimsProcess.trim()) {
      missingFields.push("claimsProcess");
    }
    if (!contract.requiredDocuments || !contract.requiredDocuments.trim()) {
      missingFields.push("requiredDocuments");
    }
    if (!contract.cancellationConditions || !contract.cancellationConditions.trim()) {
      missingFields.push("cancellationConditions");
    }
    if (!contract.governingLaw || !contract.governingLaw.trim()) {
      missingFields.push("governingLaw");
    }

    if (missingFields.length > 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/contracts/incomplete-contract-terms",
        title: "Incomplete Contract Terms",
        status: 400,
        detail: `Contract ${contract.contractNumber} cannot be confirmed because required terms are missing: ${missingFields.join(", ")}.`,
        missingFields,
      });
    }

    // Date validity check
    const pDate = new Date(contract.pickupDate!);
    const dDate = new Date(contract.deliveryDate!);
    if (pDate > dDate) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/contracts/invalid-date-range",
        title: "Invalid Date Range",
        status: 400,
        detail: "Pickup date cannot be later than delivery date.",
      });
    }

    const now = new Date();

    // 1. Generate PDF document in memory
    const snapshot: ContractPdfSnapshot = {
      contractNumber: contract.contractNumber,
      tradeNumber: contract.tradeNumber,
      quoteNumber: contract.quoteNumber,
      quoteVersionNumber: contract.acceptedQuoteVersionNumber,
      buyerName: contract.buyerOrganisationName,
      buyerAddress: contract.buyerAddress,
      buyerCity: contract.buyerCity,
      buyerCountry: contract.buyerCountry,
      supplierName: contract.supplierOrganisationName,
      supplierAddress: contract.supplierAddress,
      supplierCity: contract.supplierCity,
      supplierCountry: contract.supplierCountry,
      idoGrowEntity: "I Do Grow B.V. (Platform Intermediary / Active Commodity Trader)",
      materialType: contract.materialType,
      productForm: contract.productForm,
      quantity: contract.quantity,
      quantityUnit: contract.quantityUnit,
      acceptedTolerance: contract.acceptedTolerance!,
      priceAmount: contract.acceptedCommercialAmount,
      currency: contract.currency,
      incoterm: contract.incoterm!,
      qualityConditions: contract.qualityConditions!,
      inspectionMethod: contract.inspectionMethod!,
      pickupDate: contract.pickupDate!,
      deliveryDate: contract.deliveryDate!,
      paymentTerms: contract.paymentTerms!,
      claimsProcess: contract.claimsProcess!,
      requiredDocuments: contract.requiredDocuments!,
      cancellationConditions: contract.cancellationConditions!,
      governingLaw: contract.governingLaw!,
      buyerSignatureStatus: contract.buyerSignatureStatus,
      supplierSignatureStatus: contract.supplierSignatureStatus,
      generatedAt: now.toISOString(),
    };

    const pdfBuffer = generateContractPdfBuffer(snapshot);

    // 2. Store PDF via StorageService
    const stored = await this.storageService.store(
      `${contract.contractNumber}.pdf`,
      pdfBuffer,
      "application/pdf",
    );

    // 3. Atomically persist confirmed status and audit events with storage compensation on failure
    try {
      return await this.contractsRepository.confirmContract(
        contractId,
        {
          confirmedAt: now,
          confirmedByUserId: userId,
          storageKey: stored.storageKey,
          documentGeneratedAt: now,
        },
        async (tx: AuditEventDatabaseClient) => {
          await this.auditEventWriter.append(
            {
              eventType: "contract.confirmed",
              outcome: "succeeded",
              actor: { type: "user", userId },
              target: { type: "contract", id: contractId },
              correlationId: contract.tradeId,
              occurredAt: now,
              metadata: {
                contractNumber: contract.contractNumber,
                tradeId: contract.tradeId,
                confirmedAt: now.toISOString(),
                status: "CONFIRMED",
              },
            },
            tx,
          );

          await this.auditEventWriter.append(
            {
              eventType: "contract.document.generated",
              outcome: "succeeded",
              actor: { type: "user", userId },
              target: { type: "contract", id: contractId },
              correlationId: contract.tradeId,
              occurredAt: now,
              metadata: {
                contractNumber: contract.contractNumber,
                tradeId: contract.tradeId,
                storageKey: stored.storageKey,
                generatedAt: now.toISOString(),
              },
            },
            tx,
          );
        },
      );
    } catch (err: unknown) {
      // Storage compensation: if DB update or audit fails, clean up stored PDF
      try {
        await this.storageService.delete(stored.storageKey);
      } catch (cleanupErr) {
        console.error(
          `Failed to clean up stored contract document '${stored.storageKey}':`,
          cleanupErr,
        );
      }
      throw err;
    }
  }

  async getContractDocument(
    userId: string,
    contractId: string,
  ): Promise<{
    file: RetrievedFile;
    filename: string;
  }> {
    await this.assertTraderAccess(userId);

    const contract = await this.contractsRepository.findById(contractId);
    if (!contract) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/contracts/not-found",
        title: "Contract Not Found",
        status: 404,
        detail: `Contract record with ID ${contractId} not found.`,
      });
    }

    const row = this.prisma.contract
      ? await this.prisma.contract.findUnique({
          where: { id: contractId },
          select: { storageKey: true },
        })
      : null;

    if (!row?.storageKey) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/contracts/document-not-found",
        title: "Contract Document Not Found",
        status: 404,
        detail: `No document snapshot has been generated for Contract ${contract.contractNumber}.`,
      });
    }

    const file = await this.storageService.retrieve(
      row.storageKey,
      `${contract.contractNumber}.pdf`,
      "application/pdf",
    );

    if (!file) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/contracts/document-not-found",
        title: "Contract Document Not Found",
        status: 404,
        detail: `Underlying contract PDF file for Contract ${contract.contractNumber} could not be retrieved.`,
      });
    }

    return {
      file,
      filename: `${contract.contractNumber}.pdf`,
    };
  }

  private generateContractNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = randomBytes(4).toString("hex").toUpperCase();
    return `CTR-${dateStr}-${randomSuffix}`;
  }

  private async assertTraderAccess(userId: string): Promise<void> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    const isTrader = memberships?.some(
      (m) => m.organisation.organisationType.toUpperCase() === "TRADER",
    );

    if (!isTrader) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/contracts/trader-access-required",
        title: "Trader Access Required",
        status: 403,
        detail: "Only authenticated Trader organisations can manage contracts.",
      });
    }
  }
}
