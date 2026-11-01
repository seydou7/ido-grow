import {
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { AuditEventDatabaseClient } from "../audit";
import { PrismaService } from "../database";
import type {
  ContractDetail,
  ContractStatus,
  ContractSummary,
  UpdateContractDraftInput,
} from "./contracts.contracts";
import {
  type CreateContractData,
  ContractsRepository,
} from "./contracts.repository";

type ContractWithRelations = Prisma.ContractGetPayload<{
  include: {
    trade: {
      select: {
        tradeNumber: true;
        acceptedQuoteVersionNumber: true;
        quote: {
          select: {
            quoteNumber: true;
          };
        };
      };
    };
    buyerOrganisation: {
      select: {
        name: true;
        address: true;
        city: true;
        country: true;
      };
    };
    supplierOrganisation: {
      select: {
        name: true;
        address: true;
        city: true;
        country: true;
      };
    };
  };
}>;

const contractInclude = {
  trade: {
    select: {
      tradeNumber: true,
      acceptedQuoteVersionNumber: true,
      quote: {
        select: {
          quoteNumber: true,
        },
      },
    },
  },
  buyerOrganisation: {
    select: {
      name: true,
      address: true,
      city: true,
      country: true,
    },
  },
  supplierOrganisation: {
    select: {
      name: true,
      address: true,
      city: true,
      country: true,
    },
  },
} as const;

@Injectable()
export class PrismaContractsRepository extends ContractsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<ContractDetail | null> {
    if (!this.prisma.contract?.findUnique) return null;

    const row = await this.prisma.contract.findUnique({
      where: { id },
      include: contractInclude,
    });

    return row ? this.mapToDetail(row) : null;
  }

  async findByTradeId(tradeId: string): Promise<ContractDetail | null> {
    if (!this.prisma.contract?.findUnique) return null;

    const row = await this.prisma.contract.findUnique({
      where: { tradeId },
      include: contractInclude,
    });

    return row ? this.mapToDetail(row) : null;
  }

  async findAll(): Promise<ContractSummary[]> {
    if (!this.prisma.contract?.findMany) return [];

    const rows = await this.prisma.contract.findMany({
      include: contractInclude,
      orderBy: { createdAt: "desc" },
    });

    return rows.map((r) => this.mapToSummary(r));
  }

  async createContract(
    data: CreateContractData,
    onAtomicActions?: (
      tx: AuditEventDatabaseClient,
      createdContract: ContractDetail,
    ) => Promise<void>,
  ): Promise<ContractDetail> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const created = await tx.contract.create({
          data: {
            contractNumber: data.contractNumber,
            tradeId: data.tradeId,
            acceptedQuoteVersionId: data.acceptedQuoteVersionId,
            buyerOrganisationId: data.buyerOrganisationId,
            supplierOrganisationId: data.supplierOrganisationId,
            createdByUserId: data.createdByUserId,
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
            pickupDate: data.pickupDate ?? null,
            deliveryDate: data.deliveryDate ?? null,
            paymentTerms: data.paymentTerms ?? null,
            claimsProcess: data.claimsProcess ?? null,
            requiredDocuments: data.requiredDocuments ?? null,
            cancellationConditions: data.cancellationConditions ?? null,
            governingLaw: data.governingLaw ?? null,
            status: "DRAFT",
            buyerSignatureStatus: "UNSIGNED",
            supplierSignatureStatus: "UNSIGNED",
          },
          include: contractInclude,
        });

        const detail = this.mapToDetail(created);

        if (onAtomicActions) {
          await onAtomicActions(tx as unknown as AuditEventDatabaseClient, detail);
        }

        return detail;
      });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const target = (err.meta?.target as string[]) || [];
        if (target.includes("tradeId")) {
          throw new ConflictException({
            type: "https://errors.idogrow.com/contracts/trade-contract-already-exists",
            title: "Trade Contract Already Exists",
            status: 409,
            detail: `A contract record has already been created for Trade ${data.tradeId}.`,
          });
        }
        if (target.includes("contractNumber")) {
          throw new ConflictException({
            type: "https://errors.idogrow.com/contracts/reference-collision",
            title: "Contract Reference Collision",
            status: 409,
            detail: `Contract number ${data.contractNumber} already exists. Please retry.`,
          });
        }
      }
      throw err;
    }
  }

  async updateContractDraft(
    id: string,
    data: UpdateContractDraftInput,
    onAtomicActions?: (tx: AuditEventDatabaseClient) => Promise<void>,
  ): Promise<ContractDetail> {
    return await this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.ContractUpdateInput = {};

      if (data.acceptedTolerance !== undefined) {
        updateData.acceptedTolerance = data.acceptedTolerance;
      }
      if (data.incoterm !== undefined) {
        updateData.incoterm = data.incoterm;
      }
      if (data.qualityConditions !== undefined) {
        updateData.qualityConditions = data.qualityConditions;
      }
      if (data.inspectionMethod !== undefined) {
        updateData.inspectionMethod = data.inspectionMethod;
      }
      if (data.pickupDate !== undefined) {
        updateData.pickupDate = data.pickupDate ? new Date(data.pickupDate) : null;
      }
      if (data.deliveryDate !== undefined) {
        updateData.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null;
      }
      if (data.paymentTerms !== undefined) {
        updateData.paymentTerms = data.paymentTerms;
      }
      if (data.claimsProcess !== undefined) {
        updateData.claimsProcess = data.claimsProcess;
      }
      if (data.requiredDocuments !== undefined) {
        updateData.requiredDocuments = data.requiredDocuments;
      }
      if (data.cancellationConditions !== undefined) {
        updateData.cancellationConditions = data.cancellationConditions;
      }
      if (data.governingLaw !== undefined) {
        updateData.governingLaw = data.governingLaw;
      }

      const updated = await tx.contract.update({
        where: { id },
        data: updateData,
        include: contractInclude,
      });

      if (onAtomicActions) {
        await onAtomicActions(tx as unknown as AuditEventDatabaseClient);
      }

      return this.mapToDetail(updated);
    });
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
    return await this.prisma.$transaction(async (tx) => {
      const confirmed = await tx.contract.update({
        where: { id },
        data: {
          status: "CONFIRMED",
          confirmedAt: data.confirmedAt,
          confirmedByUserId: data.confirmedByUserId,
          storageKey: data.storageKey,
          documentGeneratedAt: data.documentGeneratedAt,
        },
        include: contractInclude,
      });

      if (onAtomicActions) {
        await onAtomicActions(tx as unknown as AuditEventDatabaseClient);
      }

      return this.mapToDetail(confirmed);
    });
  }

  private mapToDetail(c: ContractWithRelations): ContractDetail {
    return {
      ...this.mapToSummary(c),
      quoteNumber: c.trade?.quote?.quoteNumber ?? "Unknown",
      buyerAddress: c.buyerOrganisation?.address ?? null,
      buyerCity: c.buyerOrganisation?.city ?? null,
      buyerCountry: c.buyerOrganisation?.country ?? null,
      supplierAddress: c.supplierOrganisation?.address ?? null,
      supplierCity: c.supplierOrganisation?.city ?? null,
      supplierCountry: c.supplierOrganisation?.country ?? null,
    };
  }

  private mapToSummary(c: ContractWithRelations): ContractSummary {
    return {
      id: c.id,
      contractNumber: c.contractNumber,
      tradeId: c.tradeId,
      tradeNumber: c.trade?.tradeNumber ?? "Unknown",
      acceptedQuoteVersionId: c.acceptedQuoteVersionId,
      acceptedQuoteVersionNumber: c.trade?.acceptedQuoteVersionNumber ?? 1,
      buyerOrganisationId: c.buyerOrganisationId,
      buyerOrganisationName: c.buyerOrganisation?.name ?? "Buyer",
      supplierOrganisationId: c.supplierOrganisationId,
      supplierOrganisationName: c.supplierOrganisation?.name ?? "Supplier",
      materialType: c.materialType,
      productForm: c.productForm,
      quantity: c.quantity,
      quantityUnit: c.quantityUnit,
      currency: c.currency,
      acceptedCommercialAmount: c.acceptedCommercialAmount,
      acceptedTolerance: c.acceptedTolerance,
      incoterm: c.incoterm,
      qualityConditions: c.qualityConditions,
      inspectionMethod: c.inspectionMethod,
      pickupDate: c.pickupDate ? c.pickupDate.toISOString() : null,
      deliveryDate: c.deliveryDate ? c.deliveryDate.toISOString() : null,
      paymentTerms: c.paymentTerms,
      claimsProcess: c.claimsProcess,
      requiredDocuments: c.requiredDocuments,
      cancellationConditions: c.cancellationConditions,
      governingLaw: c.governingLaw,
      status: c.status as ContractStatus,
      confirmedAt: c.confirmedAt ? c.confirmedAt.toISOString() : null,
      confirmedByUserId: c.confirmedByUserId,
      hasDocument: Boolean(c.storageKey),
      documentGeneratedAt: c.documentGeneratedAt ? c.documentGeneratedAt.toISOString() : null,
      buyerSignatureStatus: c.buyerSignatureStatus,
      supplierSignatureStatus: c.supplierSignatureStatus,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }
}
