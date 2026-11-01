import { randomBytes } from "crypto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuditEventWriter } from "../audit";
import { PrismaService } from "../database";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import { StorageService } from "../storage";
import type {
  CloseShipmentInput,
  ConfirmDeliveryInput,
  CreateDiscrepancyInput,
  CreateFreightRequestInput,
  CreateSettlementClaimInput,
  CreateSettlementInput,
  CreateShipmentInput,
  CustomsStatusInput,
  FreightQuotationSummary,
  LogisticsPartnerRequestSummary,
  LogisticsRequestStatus,
  LogisticsRequestSummary,
  MarkDisputedInput,
  MarkInTransitInput,
  MarkPickedUpInput,
  PaymentStatus,
  ReconcileCostsInput,
  ReportDelayInput,
  ResolveDisputeInput,
  ResolveSettlementClaimInput,
  SchedulePickupInput,
  SelectCarrierInput,
  SettlementClaimStatus,
  SettlementClaimSummary,
  SettlementDetail,
  SettlementDocumentSummary,
  SettlementDocumentType,
  ShipmentCollection,
  ShipmentCostReconciliationSummary,
  ShipmentDetail,
  ShipmentDiscrepancySummary,
  ShipmentDocumentSummary,
  ShipmentStatus,
  ShipmentSummary,
  ShipmentTrackingEventSummary,
  SubmitFreightQuotationInput,
  UpdateSettlementInput,
  UpdateShipmentRequirementsInput,
} from "./logistics.contracts";

// ── includes ─────────────────────────────────────────────────

const SHIPMENT_INCLUDE = {
  contract: {
    select: {
      contractNumber: true,
      quantity: true,
      quantityUnit: true,
      currency: true,
      acceptedCommercialAmount: true,
      materialType: true,
      productForm: true,
    },
  },
  buyerOrganisation: { select: { name: true } },
  supplierOrganisation: { select: { name: true } },
  _count: {
    select: {
      freightQuotations: true,
      logisticsRequests: true,
    },
  },
} as const;

type ShipmentWithRelations = Prisma.ShipmentGetPayload<{
  include: typeof SHIPMENT_INCLUDE;
}>;

const SHIPMENT_DETAIL_INCLUDE = {
  ...SHIPMENT_INCLUDE,
  selectedFreightQuotation: {
    include: {
      providerUser: {
        select: {
          id: true,
          email: true,
          memberships: {
            select: { organisation: { select: { name: true } } },
            take: 1,
          },
        },
      },
    },
  },
  closedByUser: { select: { email: true } },
  trackingEvents: {
    include: { actorUser: { select: { email: true } } },
    orderBy: { occurredAt: "asc" as const },
  },
  documents: {
    include: { uploadedByUser: { select: { email: true } } },
    orderBy: { uploadedAt: "desc" as const },
  },
  discrepancies: {
    include: { reportedByUser: { select: { email: true } } },
    orderBy: { recordedAt: "desc" as const },
  },
  costReconciliation: {
    include: { reconciledByUser: { select: { email: true } } },
  },
} as const;

type ShipmentDetailWithRelations = Prisma.ShipmentGetPayload<{
  include: typeof SHIPMENT_DETAIL_INCLUDE;
}>;

const LOGISTICS_REQUEST_INCLUDE = {
  shipment: { select: { shipmentNumber: true } },
  targetProviderUser: { select: { email: true } },
  freightQuotations: { select: { id: true } },
} as const;

type LogisticsRequestWithRelations = Prisma.LogisticsRequestGetPayload<{
  include: typeof LOGISTICS_REQUEST_INCLUDE;
}>;

const FREIGHT_QUOTATION_INCLUDE = {
  providerUser: { select: { email: true } },
  submittedByUser: { select: { email: true } },
} as const;

type FreightQuotationWithRelations = Prisma.FreightQuotationGetPayload<{
  include: typeof FREIGHT_QUOTATION_INCLUDE;
}>;

const SETTLEMENT_INCLUDE = {
  buyerOrganisation: { select: { name: true } },
  supplierOrganisation: { select: { name: true } },
  documents: {
    include: { uploadedByUser: { select: { email: true } } },
    orderBy: { uploadedAt: "desc" as const },
  },
  claims: {
    include: { recordedByUser: { select: { email: true } } },
    orderBy: { recordedAt: "desc" as const },
  },
} as const;

type SettlementWithRelations = Prisma.SettlementGetPayload<{
  include: typeof SETTLEMENT_INCLUDE;
}>;

// ── helpers ──────────────────────────────────────────────────

function generateShipmentNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = randomBytes(4).toString("hex").toUpperCase();
  return `SHP-${dateStr}-${randomSuffix}`;
}

function toIso(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString();
  if (typeof date === "string") return date;
  if (date instanceof Date) return date.toISOString();
  return String(date);
}

function toIsoOrNull(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === "string") return date;
  if (date instanceof Date) return date.toISOString();
  return String(date);
}

function mapShipmentSummary(s: ShipmentWithRelations): ShipmentSummary {
  return {
    id: s.id,
    shipmentNumber: s.shipmentNumber,
    contractId: s.contractId,
    contractNumber: s.contract?.contractNumber ?? "",
    buyerOrganisationId: s.buyerOrganisationId,
    buyerOrganisationName: s.buyerOrganisation?.name ?? "",
    supplierOrganisationId: s.supplierOrganisationId,
    supplierOrganisationName: s.supplierOrganisation?.name ?? "",
    origin: s.origin,
    destination: s.destination,
    shipmentQuantity: s.shipmentQuantity,
    quantityUnit: s.quantityUnit,
    requestedPickupDate: toIsoOrNull(s.requestedPickupDate),
    requestedDeliveryDate: toIsoOrNull(s.requestedDeliveryDate),
    transportRequirements: s.transportRequirements,
    packagingRequirements: s.packagingRequirements,
    specialHandlingRequirements: s.specialHandlingRequirements,
    notes: s.notes,
    selectedFreightQuotationId: s.selectedFreightQuotationId,
    status: s.status as ShipmentStatus,
    freightQuotationsCount: s._count?.freightQuotations ?? 0,
    logisticsRequestsCount: s._count?.logisticsRequests ?? 0,
    createdAt: toIso(s.createdAt),
    updatedAt: toIso(s.updatedAt),
  };
}

function mapShipmentDetail(s: ShipmentDetailWithRelations): ShipmentDetail {
  return {
    ...mapShipmentSummary(s),
    contractQuantity: s.contract?.quantity ?? 0,
    contractQuantityUnit: s.contract?.quantityUnit ?? "",
    contractCurrency: s.contract?.currency ?? "",
    contractAcceptedAmount: s.contract?.acceptedCommercialAmount ?? 0,
    materialType: s.contract?.materialType ?? "",
    productForm: s.contract?.productForm ?? null,

    scheduledPickupAt: toIsoOrNull(s.scheduledPickupAt),
    actualPickupAt: toIsoOrNull(s.actualPickupAt),
    deliveredAt: toIsoOrNull(s.deliveredAt),
    deliveredLocation: s.deliveredLocation ?? null,
    deliveryNotes: s.deliveryNotes ?? null,
    previousStatus: s.previousStatus ?? null,
    delayReason: s.delayReason ?? null,
    delayReportedAt: toIsoOrNull(s.delayReportedAt),
    revisedExpectedDeliveryDate: toIsoOrNull(s.revisedExpectedDeliveryDate),
    disputeReason: s.disputeReason ?? null,
    disputeReportedAt: toIsoOrNull(s.disputeReportedAt),
    disputeResolvedAt: toIsoOrNull(s.disputeResolvedAt),
    disputeResolutionNotes: s.disputeResolutionNotes ?? null,
    closedAt: toIsoOrNull(s.closedAt),
    closedByUserId: s.closedByUserId ?? null,
    closedByUserEmail: s.closedByUser?.email ?? null,

    selectedProviderUserId: s.selectedFreightQuotation?.providerUserId ?? null,
    selectedProviderEmail: s.selectedFreightQuotation?.providerUser?.email ?? null,
    selectedCarrierName:
      s.selectedFreightQuotation?.providerUser?.memberships?.[0]?.organisation?.name ||
      s.selectedFreightQuotation?.providerUser?.email ||
      null,
    carrierTotalCost: s.selectedFreightQuotation?.freightAmount ?? null,
    carrierCurrency: s.selectedFreightQuotation?.currency ?? null,

    trackingEvents: (s.trackingEvents ?? []).map((te) => ({
      id: te.id,
      shipmentId: te.shipmentId,
      previousStatus: te.previousStatus,
      resultingStatus: te.resultingStatus,
      actorUserId: te.actorUserId,
      actorUserEmail: te.actorUser?.email ?? "",
      actorRole: te.actorRole,
      location: te.location ?? null,
      notes: te.notes ?? null,
      metadata: (te.metadata as Record<string, unknown>) ?? {},
      occurredAt: toIso(te.occurredAt),
      recordedAt: toIso(te.recordedAt),
    })),
    documents: (s.documents ?? []).map((doc) => ({
      id: doc.id,
      shipmentId: doc.shipmentId,
      uploadedByUserId: doc.uploadedByUserId,
      uploadedByUserEmail: doc.uploadedByUser?.email ?? "",
      label: doc.label,
      documentReference: doc.documentReference ?? null,
      storageKey: doc.storageKey,
      originalFilename: doc.originalFilename,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      uploadedAt: toIso(doc.uploadedAt),
    })),
    discrepancies: (s.discrepancies ?? []).map((disc) => ({
      id: disc.id,
      shipmentId: disc.shipmentId,
      reportedByUserId: disc.reportedByUserId,
      reportedByUserEmail: disc.reportedByUser?.email ?? "",
      type: disc.type as "DAMAGE" | "QUANTITY_DIFFERENCE",
      description: disc.description,
      expectedQuantity: disc.expectedQuantity ?? null,
      deliveredQuantity: disc.deliveredQuantity ?? null,
      quantityUnit: disc.quantityUnit ?? null,
      differenceQuantity: disc.differenceQuantity ?? null,
      recordedAt: toIso(disc.recordedAt),
    })),
    costReconciliation: s.costReconciliation
      ? {
          id: s.costReconciliation.id,
          shipmentId: s.costReconciliation.shipmentId,
          selectedFreightQuotationId: s.costReconciliation.selectedFreightQuotationId,
          quotedAmount: s.costReconciliation.quotedAmount,
          quotedCurrency: s.costReconciliation.quotedCurrency,
          finalAmount: s.costReconciliation.finalAmount,
          finalCurrency: s.costReconciliation.finalCurrency,
          differenceAmount: s.costReconciliation.differenceAmount,
          notes: s.costReconciliation.notes ?? null,
          reconciledByUserId: s.costReconciliation.reconciledByUserId,
          reconciledByUserEmail: s.costReconciliation.reconciledByUser?.email ?? "",
          reconciledAt: toIso(s.costReconciliation.reconciledAt),
        }
      : null,
  };
}

function mapLogisticsRequest(r: LogisticsRequestWithRelations): LogisticsRequestSummary {
  return {
    id: r.id,
    shipmentId: r.shipmentId,
    shipmentNumber: r.shipment?.shipmentNumber ?? "",
    targetProviderUserId: r.targetProviderUserId,
    targetProviderEmail: r.targetProviderUser?.email ?? "",
    requesterUserId: r.requesterUserId,
    status: r.status as LogisticsRequestStatus,
    requestedAt: toIso(r.requestedAt),
    cancelledAt: toIsoOrNull(r.cancelledAt),
    hasQuotation: (r.freightQuotations?.length ?? 0) > 0,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

function mapFreightQuotation(
  q: FreightQuotationWithRelations,
  selectedId: string | null,
): FreightQuotationSummary {
  return {
    id: q.id,
    logisticsRequestId: q.logisticsRequestId,
    shipmentId: q.shipmentId,
    providerUserId: q.providerUserId,
    providerEmail: q.providerUser?.email ?? "",
    submittedByUserId: q.submittedByUserId,
    submittedByEmail: q.submittedByUser?.email ?? "",
    submittedByRole: q.submittedByRole,
    enteredOnBehalfOfProvider: q.enteredOnBehalfOfProvider,
    currency: q.currency,
    freightAmount: q.freightAmount,
    validUntil: toIsoOrNull(q.validUntil),
    proposedPickupDate: toIsoOrNull(q.proposedPickupDate),
    estimatedDeliveryDate: toIsoOrNull(q.estimatedDeliveryDate),
    notes: q.notes,
    status: q.status as "ACTIVE" | "SUPERSEDED",
    isSelected: q.id === selectedId,
    submittedAt: toIso(q.submittedAt),
    createdAt: toIso(q.createdAt),
    updatedAt: toIso(q.updatedAt),
  };
}

function mapSettlement(s: SettlementWithRelations): SettlementDetail {
  return {
    id: s.id,
    tradeId: s.tradeId,
    shipmentId: s.shipmentId ?? null,
    buyerOrganisationId: s.buyerOrganisationId,
    buyerOrganisationName: s.buyerOrganisation?.name ?? "",
    supplierOrganisationId: s.supplierOrganisationId,
    supplierOrganisationName: s.supplierOrganisation?.name ?? "",
    currency: s.currency,
    totalCommercialAmount: s.totalCommercialAmount,
    depositAmount: s.depositAmount,
    remainingBalance: s.remainingBalance,
    commissionAmount: s.commissionAmount,
    finalSettlementAmount: s.finalSettlementAmount,
    paymentStatus: s.paymentStatus as PaymentStatus,
    paymentDueDate: toIsoOrNull(s.paymentDueDate),
    paymentInstructions: s.paymentInstructions ?? null,
    notes: s.notes ?? null,
    createdByUserId: s.createdByUserId,
    createdAt: toIso(s.createdAt),
    updatedAt: toIso(s.updatedAt),
    documents: (s.documents ?? []).map((d) => ({
      id: d.id,
      settlementId: d.settlementId,
      uploadedByUserId: d.uploadedByUserId,
      uploadedByUserEmail: d.uploadedByUser?.email ?? "",
      documentType: d.documentType as SettlementDocumentType,
      documentReference: d.documentReference ?? null,
      storageKey: d.storageKey,
      originalFilename: d.originalFilename,
      mimeType: d.mimeType,
      sizeBytes: d.sizeBytes,
      uploadedAt: toIso(d.uploadedAt),
    })),
    claims: (s.claims ?? []).map((c) => ({
      id: c.id,
      settlementId: c.settlementId,
      discrepancyId: c.discrepancyId ?? null,
      description: c.description,
      amount: c.amount ?? null,
      currency: c.currency ?? null,
      status: c.status as SettlementClaimStatus,
      resolutionNotes: c.resolutionNotes ?? null,
      resolvedAt: toIsoOrNull(c.resolvedAt),
      resolvedByUserId: c.resolvedByUserId ?? null,
      recordedByUserId: c.recordedByUserId,
      recordedByUserEmail: c.recordedByUser?.email ?? "",
      recordedAt: toIso(c.recordedAt),
      updatedAt: toIso(c.updatedAt),
    })),
  };
}

// ── service ──────────────────────────────────────────────────

@Injectable()
export class LogisticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organisationsRepository: OrganisationsRepository,
    private readonly auditEventWriter: AuditEventWriter,
    private readonly storageService: StorageService,
  ) {}

  // ── Shipment CRUD ────────────────────────────────────────

  async createShipment(userId: string, contractId: string, input: CreateShipmentInput): Promise<ShipmentDetail> {
    await this.assertTraderAccess(userId);

    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        buyerOrganisation: { select: { name: true } },
        supplierOrganisation: { select: { name: true } },
        shipments: {
          where: { status: { notIn: ["CLOSED"] } },
          select: { shipmentQuantity: true },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/contract-not-found",
        title: "Contract Not Found",
        status: 404,
        detail: `Contract with ID ${contractId} not found.`,
      });
    }

    if (contract.status !== "CONFIRMED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/contract-not-confirmed",
        title: "Contract Not Confirmed",
        status: 400,
        detail: `Shipments can only be created for CONFIRMED contracts. Current status is '${contract.status}'.`,
      });
    }

    if (!input.shipmentQuantity || input.shipmentQuantity <= 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-quantity",
        title: "Invalid Quantity",
        status: 400,
        detail: "Shipment quantity must be strictly greater than 0.",
      });
    }

    const allocatedQuantity = contract.shipments.reduce(
      (sum: number, s: { shipmentQuantity: number }) => sum + s.shipmentQuantity,
      0,
    );
    const remainingContractQuantity = contract.quantity - allocatedQuantity;

    if (input.shipmentQuantity > remainingContractQuantity) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/quantity-exceeds-contract",
        title: "Quantity Exceeds Remaining Contract",
        status: 400,
        detail: `Requested shipment quantity ${input.shipmentQuantity} exceeds remaining contract balance of ${remainingContractQuantity} ${contract.quantityUnit}.`,
      });
    }

    let parsedPickup: Date | null = null;
    if (input.requestedPickupDate) {
      parsedPickup = new Date(input.requestedPickupDate);
      if (isNaN(parsedPickup.getTime())) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/invalid-date",
          title: "Invalid Date",
          status: 400,
          detail: "requestedPickupDate is not a valid ISO date.",
        });
      }
    }

    let parsedDelivery: Date | null = null;
    if (input.requestedDeliveryDate) {
      parsedDelivery = new Date(input.requestedDeliveryDate);
      if (isNaN(parsedDelivery.getTime())) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/invalid-date",
          title: "Invalid Date",
          status: 400,
          detail: "requestedDeliveryDate is not a valid ISO date.",
        });
      }
    }

    if (parsedPickup && parsedDelivery && parsedDelivery < parsedPickup) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-date-window",
        title: "Invalid Date Window",
        status: 400,
        detail: "requestedDeliveryDate cannot be earlier than requestedPickupDate.",
      });
    }

    const shipmentNumber = generateShipmentNumber();

    const shipment = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.shipment.create({
        data: {
          shipmentNumber,
          contractId,
          createdByUserId: userId,
          buyerOrganisationId: contract.buyerOrganisationId,
          supplierOrganisationId: contract.supplierOrganisationId,
          origin: input.origin ?? null,
          destination: input.destination ?? null,
          shipmentQuantity: input.shipmentQuantity,
          quantityUnit: contract.quantityUnit,
          requestedPickupDate: parsedPickup,
          requestedDeliveryDate: parsedDelivery,
          transportRequirements: input.transportRequirements ?? null,
          packagingRequirements: input.packagingRequirements ?? null,
          specialHandlingRequirements: input.specialHandlingRequirements ?? null,
          notes: input.notes ?? null,
          status: "PLANNING",
        },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.shipment.created",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: created.id },
          correlationId: contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: created.shipmentNumber,
            contractId,
            shipmentQuantity: String(input.shipmentQuantity),
            quantityUnit: contract.quantityUnit,
            status: "PLANNING",
          },
        },
        tx,
      );

      return created;
    });

    return mapShipmentDetail(shipment);
  }

  async getShipments(userId: string): Promise<ShipmentCollection> {
    await this.assertTraderAccess(userId);

    const shipments = await this.prisma.shipment.findMany({
      include: SHIPMENT_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    return {
      items: shipments.map(mapShipmentSummary),
      total: shipments.length,
    };
  }

  async getShipmentById(userId: string, shipmentId: string): Promise<ShipmentDetail> {
    const isTrader = await this.isTrader(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isLP = user?.role === "LOGISTICS_PARTNER";

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: SHIPMENT_DETAIL_INCLUDE,
    });

    if (!shipment) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/shipment-not-found",
        title: "Shipment Not Found",
        status: 404,
        detail: `Shipment with ID ${shipmentId} not found.`,
      });
    }

    if (!isTrader) {
      if (isLP) {
        // Must be the selected provider OR have an active request
        const isSelected = shipment.selectedFreightQuotation?.providerUserId === userId;
        const hasRequest = await this.prisma.logisticsRequest.findFirst({
          where: { shipmentId, targetProviderUserId: userId },
        });
        if (!isSelected && !hasRequest) {
          throw new ForbiddenException({
            type: "https://errors.idogrow.com/logistics/access-denied",
            title: "Access Denied",
            status: 403,
            detail: "You do not have permission to view this shipment.",
          });
        }
      } else {
        throw new ForbiddenException({
          type: "https://errors.idogrow.com/logistics/access-denied",
          title: "Access Denied",
          status: 403,
          detail: "Only traders or assigned logistics partners may access shipment details.",
        });
      }
    }

    return mapShipmentDetail(shipment);
  }

  async getShipmentByContractId(userId: string, contractId: string): Promise<ShipmentDetail | null> {
    await this.assertTraderAccess(userId);

    const shipment = await this.prisma.shipment.findFirst({
      where: { contractId },
      include: SHIPMENT_DETAIL_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    if (!shipment) return null;
    return mapShipmentDetail(shipment);
  }

  async updateShipmentRequirements(
    userId: string,
    shipmentId: string,
    input: UpdateShipmentRequirementsInput,
  ): Promise<ShipmentDetail> {
    await this.assertTraderAccess(userId);

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        contract: { select: { quantity: true, quantityUnit: true } },
      },
    });

    if (!shipment) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/shipment-not-found",
        title: "Shipment Not Found",
        status: 404,
        detail: `Shipment with ID ${shipmentId} not found.`,
      });
    }

    if (shipment.status !== "PLANNING" && shipment.status !== "QUOTE_REQUESTED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/cannot-edit-requirements",
        title: "Cannot Edit Requirements",
        status: 400,
        detail: `Shipment requirements cannot be modified after carrier selection. Current status is '${shipment.status}'.`,
      });
    }

    const dataToUpdate: Prisma.ShipmentUpdateInput = {};

    if (input.origin !== undefined) dataToUpdate.origin = input.origin?.trim() || null;
    if (input.destination !== undefined) dataToUpdate.destination = input.destination?.trim() || null;
    if (input.transportRequirements !== undefined) dataToUpdate.transportRequirements = input.transportRequirements?.trim() || null;
    if (input.packagingRequirements !== undefined) dataToUpdate.packagingRequirements = input.packagingRequirements?.trim() || null;
    if (input.specialHandlingRequirements !== undefined) dataToUpdate.specialHandlingRequirements = input.specialHandlingRequirements?.trim() || null;
    if (input.notes !== undefined) dataToUpdate.notes = input.notes?.trim() || null;

    if (input.shipmentQuantity !== undefined) {
      if (input.shipmentQuantity <= 0) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/invalid-quantity",
          title: "Invalid Quantity",
          status: 400,
          detail: "Shipment quantity must be strictly greater than 0.",
        });
      }
      dataToUpdate.shipmentQuantity = input.shipmentQuantity;
    }

    if (input.requestedPickupDate !== undefined) {
      if (input.requestedPickupDate === null || input.requestedPickupDate === "") {
        dataToUpdate.requestedPickupDate = null;
      } else {
        const d = new Date(input.requestedPickupDate);
        if (isNaN(d.getTime())) {
          throw new BadRequestException({
            type: "https://errors.idogrow.com/logistics/invalid-date",
            title: "Invalid Date",
            status: 400,
            detail: "requestedPickupDate is not a valid ISO date.",
          });
        }
        dataToUpdate.requestedPickupDate = d;
      }
    }

    if (input.requestedDeliveryDate !== undefined) {
      if (input.requestedDeliveryDate === null || input.requestedDeliveryDate === "") {
        dataToUpdate.requestedDeliveryDate = null;
      } else {
        const d = new Date(input.requestedDeliveryDate);
        if (isNaN(d.getTime())) {
          throw new BadRequestException({
            type: "https://errors.idogrow.com/logistics/invalid-date",
            title: "Invalid Date",
            status: 400,
            detail: "requestedDeliveryDate is not a valid ISO date.",
          });
        }
        dataToUpdate.requestedDeliveryDate = d;
      }
    }

    const updated = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const res = await tx.shipment.update({
        where: { id: shipmentId },
        data: dataToUpdate,
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.shipment.requirements.updated",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: shipmentId },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: res.shipmentNumber,
            contractId: shipment.contractId,
            origin: res.origin,
            destination: res.destination,
            shipmentQuantity: String(res.shipmentQuantity),
          },
        },
        tx,
      );

      return res;
    });

    return mapShipmentDetail(updated);
  }

  // ── Freight Requests & Provider Dispatch ─────────────────

  async createFreightRequests(
    userId: string,
    shipmentId: string,
    input: CreateFreightRequestInput,
  ): Promise<LogisticsRequestSummary[]> {
    await this.assertTraderAccess(userId);

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        logisticsRequests: { where: { status: { not: "CANCELLED" } } },
      },
    });

    if (!shipment) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/shipment-not-found",
        title: "Shipment Not Found",
        status: 404,
        detail: `Shipment with ID ${shipmentId} not found.`,
      });
    }

    if (shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/shipment-closed",
        title: "Shipment Closed",
        status: 400,
        detail: "Cannot create freight requests for a closed shipment.",
      });
    }

    if (!input.targetProviderUserIds || input.targetProviderUserIds.length === 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/no-providers-specified",
        title: "No Providers Specified",
        status: 400,
        detail: "At least one target logistics provider user ID is required.",
      });
    }

    for (const providerId of input.targetProviderUserIds) {
      const providerUser = await this.prisma.user.findUnique({
        where: { id: providerId },
        select: { id: true, role: true, isActive: true },
      });

      if (!providerUser || !providerUser.isActive) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/provider-not-found",
          title: "Provider Not Found",
          status: 400,
          detail: `User with ID ${providerId} is not an active user.`,
        });
      }

      if (providerUser.role !== "LOGISTICS_PARTNER") {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/invalid-provider-role",
          title: "Invalid Provider Role",
          status: 400,
          detail: `User with ID ${providerId} does not have the LOGISTICS_PARTNER role.`,
        });
      }
    }

    const existingProviderIds = new Set(
      (shipment.logisticsRequests || []).map((lr: { targetProviderUserId: string }) => lr.targetProviderUserId),
    );
    const newProviderIds = input.targetProviderUserIds.filter(
      (id: string) => !existingProviderIds.has(id),
    );

    if (newProviderIds.length === 0) {
      const existingRequests = await this.prisma.logisticsRequest.findMany({
        where: { shipmentId, status: { not: "CANCELLED" } },
        include: LOGISTICS_REQUEST_INCLUDE,
        orderBy: { createdAt: "desc" },
      });
      return existingRequests.map(mapLogisticsRequest);
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created: LogisticsRequestWithRelations[] = [];

      for (const providerId of newProviderIds) {
        const lr = await tx.logisticsRequest.create({
          data: {
            shipmentId,
            targetProviderUserId: providerId,
            requesterUserId: userId,
            status: "REQUESTED",
            requestedAt: new Date(),
          },
          include: LOGISTICS_REQUEST_INCLUDE,
        });
        created.push(lr);

        await this.auditEventWriter.append(
          {
            eventType: "logistics.freight_request.created",
            outcome: "succeeded",
            actor: { type: "user", userId },
            target: { type: "logistics_request", id: lr.id },
            correlationId: shipment.contractId,
            occurredAt: new Date(),
            metadata: {
              shipmentId,
              shipmentNumber: shipment.shipmentNumber,
              contractId: shipment.contractId,
              targetProviderUserId: providerId,
            },
          },
          tx,
        );
      }

      if (shipment.status === "PLANNING") {
        await tx.shipment.update({
          where: { id: shipmentId },
          data: { status: "QUOTE_REQUESTED" },
        });
      }

      return created;
    });

    const allRequests = await this.prisma.logisticsRequest.findMany({
      where: { shipmentId, status: { not: "CANCELLED" } },
      include: LOGISTICS_REQUEST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    return allRequests.map(mapLogisticsRequest);
  }

  async getFreightRequestsForShipment(userId: string, shipmentId: string): Promise<LogisticsRequestSummary[]> {
    await this.assertTraderAccess(userId);

    const requests = await this.prisma.logisticsRequest.findMany({
      where: { shipmentId },
      include: LOGISTICS_REQUEST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    return requests.map(mapLogisticsRequest);
  }

  // ── Freight Quotation Submission ─────────────────────────

  async submitFreightQuotation(
    userId: string,
    requestId: string,
    input: SubmitFreightQuotationInput,
    isTraderSubmission = false,
  ): Promise<FreightQuotationSummary> {
    const logisticsRequest = await this.prisma.logisticsRequest.findUnique({
      where: { id: requestId },
      include: {
        shipment: {
          select: {
            id: true,
            shipmentNumber: true,
            contractId: true,
            status: true,
            selectedFreightQuotationId: true,
          },
        },
        targetProviderUser: { select: { id: true, email: true } },
      },
    });

    if (!logisticsRequest) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/request-not-found",
        title: "Logistics Request Not Found",
        status: 404,
        detail: `Logistics request with ID ${requestId} not found.`,
      });
    }

    if (logisticsRequest.status === "CANCELLED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/request-cancelled",
        title: "Request Cancelled",
        status: 400,
        detail: "Cannot submit quote for a cancelled logistics request.",
      });
    }

    if (logisticsRequest.shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/shipment-closed",
        title: "Shipment Closed",
        status: 400,
        detail: "Cannot submit freight quotation for a closed shipment.",
      });
    }

    let submitterRole: string;
    if (isTraderSubmission) {
      await this.assertTraderAccess(userId);
      submitterRole = "TRADER";
    } else {
      await this.assertLogisticsPartnerAccess(userId);
      if (logisticsRequest.targetProviderUserId !== userId) {
        throw new ForbiddenException({
          type: "https://errors.idogrow.com/logistics/not-your-request",
          title: "Access Denied",
          status: 403,
          detail: "You can only submit quotations for requests addressed to you.",
        });
      }
      submitterRole = "LOGISTICS_PARTNER";
    }

    if (typeof input.freightAmount !== "number" || input.freightAmount <= 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-freight-amount",
        title: "Invalid Freight Amount",
        status: 400,
        detail: "freightAmount must be a strictly positive number.",
      });
    }

    if (!input.currency || !input.currency.trim()) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-currency",
        title: "Currency Required",
        status: 400,
        detail: "currency is required for freight quotation.",
      });
    }

    if (input.validUntil) {
      const vDate = new Date(input.validUntil);
      if (isNaN(vDate.getTime())) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/invalid-date",
          title: "Invalid Date",
          status: 400,
          detail: "validUntil is not a valid ISO date.",
        });
      }
    }

    const quotation = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.freightQuotation.create({
        data: {
          logisticsRequestId: requestId,
          shipmentId: logisticsRequest.shipment.id,
          providerUserId: logisticsRequest.targetProviderUserId,
          submittedByUserId: userId,
          submittedByRole: submitterRole,
          enteredOnBehalfOfProvider: isTraderSubmission,
          currency: input.currency,
          freightAmount: input.freightAmount,
          validUntil: input.validUntil ? new Date(input.validUntil) : null,
          proposedPickupDate: input.proposedPickupDate ? new Date(input.proposedPickupDate) : null,
          estimatedDeliveryDate: input.estimatedDeliveryDate ? new Date(input.estimatedDeliveryDate) : null,
          notes: input.notes ?? null,
          status: "ACTIVE",
          submittedAt: new Date(),
        },
        include: FREIGHT_QUOTATION_INCLUDE,
      });

      if (logisticsRequest.status === "REQUESTED") {
        await tx.logisticsRequest.update({
          where: { id: requestId },
          data: { status: "QUOTED" },
        });
      }

      await this.auditEventWriter.append(
        {
          eventType: "logistics.freight_quote.submitted",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "freight_quotation", id: created.id },
          correlationId: logisticsRequest.shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentId: logisticsRequest.shipment.id,
            shipmentNumber: logisticsRequest.shipment.shipmentNumber,
            logisticsRequestId: requestId,
            providerUserId: logisticsRequest.targetProviderUserId,
            freightAmount: String(input.freightAmount),
            currency: input.currency,
            enteredOnBehalfOfProvider: String(isTraderSubmission),
            submittedByRole: submitterRole,
          },
        },
        tx,
      );

      return created;
    });

    return mapFreightQuotation(quotation, logisticsRequest.shipment.selectedFreightQuotationId);
  }

  async getFreightQuotationsForShipment(userId: string, shipmentId: string): Promise<FreightQuotationSummary[]> {
    await this.assertTraderAccess(userId);

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      select: { selectedFreightQuotationId: true },
    });

    if (!shipment) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/shipment-not-found",
        title: "Shipment Not Found",
        status: 404,
        detail: `Shipment with ID ${shipmentId} not found.`,
      });
    }

    const quotations = await this.prisma.freightQuotation.findMany({
      where: { shipmentId },
      include: FREIGHT_QUOTATION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    return quotations.map((q: FreightQuotationWithRelations) =>
      mapFreightQuotation(q, shipment.selectedFreightQuotationId),
    );
  }

  // ── Carrier Selection ────────────────────────────────────

  async selectCarrier(userId: string, shipmentId: string, input: SelectCarrierInput): Promise<ShipmentDetail> {
    await this.assertTraderAccess(userId);

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
        include: {
          contract: { select: { id: true, contractNumber: true } },
        },
      });

      if (!shipment) {
        throw new NotFoundException({
          type: "https://errors.idogrow.com/logistics/shipment-not-found",
          title: "Shipment Not Found",
          status: 404,
          detail: `Shipment with ID ${shipmentId} not found.`,
        });
      }

      if (!["QUOTE_REQUESTED", "CARRIER_SELECTED"].includes(shipment.status)) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/invalid-state-for-selection",
          title: "Invalid Shipment State",
          status: 400,
          detail: `Shipment ${shipment.shipmentNumber} is in status '${shipment.status}'. Carrier selection requires QUOTE_REQUESTED or CARRIER_SELECTED status.`,
        });
      }

      const quotation = await tx.freightQuotation.findUnique({
        where: { id: input.freightQuotationId },
        include: {
          logisticsRequest: { select: { shipmentId: true } },
          providerUser: { select: { email: true } },
        },
      });

      if (!quotation) {
        throw new NotFoundException({
          type: "https://errors.idogrow.com/logistics/quotation-not-found",
          title: "Freight Quotation Not Found",
          status: 404,
          detail: `Freight quotation with ID ${input.freightQuotationId} not found.`,
        });
      }

      if (quotation.shipmentId !== shipmentId) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/quotation-wrong-shipment",
          title: "Quotation From Different Shipment",
          status: 400,
          detail: "The selected freight quotation does not belong to this shipment.",
        });
      }

      if (quotation.status !== "ACTIVE") {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/quotation-not-active",
          title: "Quotation Not Active",
          status: 400,
          detail: `Freight quotation is in status '${quotation.status}' and cannot be selected.`,
        });
      }

      if (quotation.validUntil && new Date(quotation.validUntil) < new Date()) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/quotation-expired",
          title: "Quotation Expired",
          status: 400,
          detail: `Freight quotation has expired (valid until ${quotation.validUntil.toISOString()}).`,
        });
      }

      const isReselection = shipment.selectedFreightQuotationId !== null &&
        shipment.selectedFreightQuotationId !== input.freightQuotationId;

      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          selectedFreightQuotationId: input.freightQuotationId,
          status: "CARRIER_SELECTED",
        },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      // Record tracking event for carrier selection / reselection
      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          previousStatus: shipment.status,
          resultingStatus: "CARRIER_SELECTED",
          actorUserId: userId,
          actorRole: "TRADER",
          notes: isReselection
            ? `Carrier reselected to quotation ${input.freightQuotationId}`
            : `Carrier selected quotation ${input.freightQuotationId}`,
          metadata: {
            freightQuotationId: input.freightQuotationId,
            providerUserId: quotation.providerUserId,
            freightAmount: quotation.freightAmount,
            currency: quotation.currency,
          },
          occurredAt: new Date(),
        },
      });

      const auditEventType = isReselection
        ? "logistics.carrier.reselected"
        : "logistics.carrier.selected";

      await this.auditEventWriter.append(
        {
          eventType: auditEventType,
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: shipmentId },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: shipment.shipmentNumber,
            contractId: shipment.contractId,
            freightQuotationId: input.freightQuotationId,
            providerUserId: quotation.providerUserId,
            freightAmount: String(quotation.freightAmount),
            currency: quotation.currency,
            ...(isReselection ? { previousQuotationId: shipment.selectedFreightQuotationId } : {}),
          },
        },
        tx,
      );

      return mapShipmentDetail(updated);
    });
  }

  // ── Logistics Partner Portal ─────────────────────────────

  async getMyRequests(userId: string): Promise<LogisticsPartnerRequestSummary[]> {
    await this.assertLogisticsPartnerAccess(userId);

    const requests = await this.prisma.logisticsRequest.findMany({
      where: {
        targetProviderUserId: userId,
        status: { not: "CANCELLED" },
      },
      include: {
        shipment: {
          select: {
            id: true,
            shipmentNumber: true,
            origin: true,
            destination: true,
            shipmentQuantity: true,
            quantityUnit: true,
            requestedPickupDate: true,
            requestedDeliveryDate: true,
            transportRequirements: true,
            specialHandlingRequirements: true,
            selectedFreightQuotationId: true,
          },
        },
        freightQuotations: {
          where: { providerUserId: userId, status: "ACTIVE" },
          include: FREIGHT_QUOTATION_INCLUDE,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests.map((r) => ({
      id: r.id,
      shipmentId: r.shipmentId,
      shipmentNumber: r.shipment?.shipmentNumber ?? "",
      origin: r.shipment?.origin ?? null,
      destination: r.shipment?.destination ?? null,
      shipmentQuantity: r.shipment?.shipmentQuantity ?? 0,
      quantityUnit: r.shipment?.quantityUnit ?? "",
      requestedPickupDate: toIsoOrNull(r.shipment?.requestedPickupDate),
      requestedDeliveryDate: toIsoOrNull(r.shipment?.requestedDeliveryDate),
      transportRequirements: r.shipment?.transportRequirements ?? null,
      specialHandlingRequirements: r.shipment?.specialHandlingRequirements ?? null,
      status: r.status as LogisticsRequestStatus,
      requestedAt: toIso(r.requestedAt),
      hasQuotation: (r.freightQuotations?.length ?? 0) > 0,
      ownQuotation:
        r.freightQuotations?.length > 0
          ? mapFreightQuotation(r.freightQuotations[0], r.shipment?.selectedFreightQuotationId)
          : null,
    }));
  }

  async getMyRequestById(userId: string, requestId: string): Promise<LogisticsPartnerRequestSummary> {
    await this.assertLogisticsPartnerAccess(userId);

    const request = await this.prisma.logisticsRequest.findUnique({
      where: { id: requestId },
      include: {
        shipment: {
          select: {
            id: true,
            shipmentNumber: true,
            origin: true,
            destination: true,
            shipmentQuantity: true,
            quantityUnit: true,
            requestedPickupDate: true,
            requestedDeliveryDate: true,
            transportRequirements: true,
            specialHandlingRequirements: true,
            selectedFreightQuotationId: true,
          },
        },
        freightQuotations: {
          where: { providerUserId: userId, status: "ACTIVE" },
          include: FREIGHT_QUOTATION_INCLUDE,
        },
      },
    });

    if (!request) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/request-not-found",
        title: "Logistics Request Not Found",
        status: 404,
        detail: `Logistics request with ID ${requestId} not found.`,
      });
    }

    if (request.targetProviderUserId !== userId) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/logistics/not-your-request",
        title: "Access Denied",
        status: 403,
        detail: "You can only view requests addressed to you.",
      });
    }

    return {
      id: request.id,
      shipmentId: request.shipmentId,
      shipmentNumber: request.shipment?.shipmentNumber ?? "",
      origin: request.shipment?.origin ?? null,
      destination: request.shipment?.destination ?? null,
      shipmentQuantity: request.shipment?.shipmentQuantity ?? 0,
      quantityUnit: request.shipment?.quantityUnit ?? "",
      requestedPickupDate: toIsoOrNull(request.shipment?.requestedPickupDate),
      requestedDeliveryDate: toIsoOrNull(request.shipment?.requestedDeliveryDate),
      transportRequirements: request.shipment?.transportRequirements ?? null,
      specialHandlingRequirements: request.shipment?.specialHandlingRequirements ?? null,
      status: request.status as LogisticsRequestStatus,
      requestedAt: toIso(request.requestedAt),
      hasQuotation: (request.freightQuotations?.length ?? 0) > 0,
      ownQuotation:
        request.freightQuotations?.length > 0
          ? mapFreightQuotation(request.freightQuotations[0], request.shipment?.selectedFreightQuotationId)
          : null,
    };
  }

  async getMyActiveShipments(userId: string): Promise<ShipmentSummary[]> {
    await this.assertLogisticsPartnerAccess(userId);

    const shipments = await this.prisma.shipment.findMany({
      where: {
        selectedFreightQuotation: {
          providerUserId: userId,
        },
        status: {
          in: [
            "CARRIER_SELECTED",
            "PICKUP_SCHEDULED",
            "PICKED_UP",
            "IN_TRANSIT",
            "CUSTOMS",
            "DELAYED",
            "DELIVERED",
            "DISPUTED",
            "CLOSED",
          ],
        },
      },
      include: SHIPMENT_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    return shipments.map(mapShipmentSummary);
  }

  // ── Trader manual quotation entry ────────────────────────

  async submitTraderManualQuotation(
    userId: string,
    shipmentId: string,
    requestId: string,
    input: SubmitFreightQuotationInput,
  ): Promise<FreightQuotationSummary> {
    return this.submitFreightQuotation(userId, requestId, input, true);
  }

  // ── Block 03 Shipment Execution & Tracking ───────────────

  async assertExecutionAccess(
    userId: string,
    shipmentId: string,
  ): Promise<{
    shipment: ShipmentDetailWithRelations;
    actorRole: "TRADER" | "LOGISTICS_PARTNER";
  }> {
    const isTrader = await this.isTrader(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: SHIPMENT_DETAIL_INCLUDE,
    });

    if (!shipment) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/shipment-not-found",
        title: "Shipment Not Found",
        status: 404,
        detail: `Shipment with ID ${shipmentId} not found.`,
      });
    }

    if (shipment.status === "PLANNING" || shipment.status === "QUOTE_REQUESTED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/execution-not-allowed",
        title: "Carrier Not Selected",
        status: 400,
        detail: `Shipment ${shipment.shipmentNumber} is in status '${shipment.status}'. Execution actions are allowed only after carrier selection (CARRIER_SELECTED).`,
      });
    }

    if (!shipment.selectedFreightQuotationId || !shipment.selectedFreightQuotation) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/no-carrier-selected",
        title: "No Carrier Selected",
        status: 400,
        detail: `Shipment ${shipment.shipmentNumber} does not have a selected carrier.`,
      });
    }

    if (isTrader) {
      return { shipment, actorRole: "TRADER" };
    }

    if (user?.role === "LOGISTICS_PARTNER") {
      if (shipment.selectedFreightQuotation.providerUserId === userId) {
        return { shipment, actorRole: "LOGISTICS_PARTNER" };
      }
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/logistics/not-selected-provider",
        title: "Access Denied",
        status: 403,
        detail: "Only the selected logistics provider may perform shipment execution actions.",
      });
    }

    throw new ForbiddenException({
      type: "https://errors.idogrow.com/logistics/access-denied",
      title: "Access Denied",
      status: 403,
      detail: "You do not have permission to execute shipment actions.",
    });
  }

  async schedulePickup(userId: string, shipmentId: string, input: SchedulePickupInput): Promise<ShipmentDetail> {
    const { shipment, actorRole } = await this.assertExecutionAccess(userId, shipmentId);

    if (shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/shipment-closed",
        title: "Shipment Closed",
        status: 400,
        detail: "Cannot schedule pickup for a closed shipment.",
      });
    }

    if (!["CARRIER_SELECTED", "DELAYED"].includes(shipment.status)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-pickup-state",
        title: "Invalid Status for Pickup Scheduling",
        status: 400,
        detail: `Pickup can only be scheduled from CARRIER_SELECTED or DELAYED. Current status is '${shipment.status}'.`,
      });
    }

    if (!input.scheduledPickupAt) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/missing-date",
        title: "Scheduled Date Required",
        status: 400,
        detail: "scheduledPickupAt is required.",
      });
    }

    const scheduledDate = new Date(input.scheduledPickupAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-date",
        title: "Invalid Date",
        status: 400,
        detail: "scheduledPickupAt is not a valid ISO date.",
      });
    }

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: "PICKUP_SCHEDULED",
          scheduledPickupAt: scheduledDate,
          notes: input.notes ? `${shipment.notes ? shipment.notes + "\n" : ""}${input.notes}` : shipment.notes,
        },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          previousStatus: shipment.status,
          resultingStatus: "PICKUP_SCHEDULED",
          actorUserId: userId,
          actorRole,
          location: input.location ?? shipment.origin,
          notes: input.notes ?? "Pickup scheduled",
          metadata: { scheduledPickupAt: scheduledDate.toISOString() },
          occurredAt: new Date(),
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.pickup.scheduled",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: shipmentId },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: shipment.shipmentNumber,
            scheduledPickupAt: scheduledDate.toISOString(),
            actorRole,
          },
        },
        tx,
      );

      return mapShipmentDetail(updated);
    });
  }

  async markPickedUp(userId: string, shipmentId: string, input: MarkPickedUpInput): Promise<ShipmentDetail> {
    const { shipment, actorRole } = await this.assertExecutionAccess(userId, shipmentId);

    if (shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/shipment-closed",
        title: "Shipment Closed",
        status: 400,
        detail: "Cannot mark picked up on a closed shipment.",
      });
    }

    if (!["PICKUP_SCHEDULED", "DELAYED"].includes(shipment.status)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-pickup-state",
        title: "Invalid State for Pickup",
        status: 400,
        detail: `Marking picked up requires status PICKUP_SCHEDULED or DELAYED. Current status is '${shipment.status}'.`,
      });
    }

    const pickupDate = input.actualPickupAt ? new Date(input.actualPickupAt) : new Date();

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: "PICKED_UP",
          actualPickupAt: pickupDate,
        },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          previousStatus: shipment.status,
          resultingStatus: "PICKED_UP",
          actorUserId: userId,
          actorRole,
          location: input.location ?? shipment.origin,
          notes: input.notes ?? "Cargo picked up",
          metadata: { actualPickupAt: pickupDate.toISOString() },
          occurredAt: new Date(),
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.shipment.picked_up",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: shipmentId },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: shipment.shipmentNumber,
            actualPickupAt: pickupDate.toISOString(),
            actorRole,
          },
        },
        tx,
      );

      return mapShipmentDetail(updated);
    });
  }

  async markInTransit(userId: string, shipmentId: string, input: MarkInTransitInput): Promise<ShipmentDetail> {
    const { shipment, actorRole } = await this.assertExecutionAccess(userId, shipmentId);

    if (shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/shipment-closed",
        title: "Shipment Closed",
        status: 400,
        detail: "Cannot mark in transit on a closed shipment.",
      });
    }

    if (!["PICKED_UP", "DELAYED"].includes(shipment.status)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-transit-state",
        title: "Invalid State for In Transit",
        status: 400,
        detail: `Marking in transit requires status PICKED_UP or DELAYED. Current status is '${shipment.status}'.`,
      });
    }

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: "IN_TRANSIT" },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          previousStatus: shipment.status,
          resultingStatus: "IN_TRANSIT",
          actorUserId: userId,
          actorRole,
          location: input.location ?? null,
          notes: input.notes ?? "Shipment in transit",
          occurredAt: new Date(),
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.shipment.in_transit",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: shipmentId },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: shipment.shipmentNumber,
            actorRole,
          },
        },
        tx,
      );

      return mapShipmentDetail(updated);
    });
  }

  async customsStatus(userId: string, shipmentId: string, input: CustomsStatusInput): Promise<ShipmentDetail> {
    const { shipment, actorRole } = await this.assertExecutionAccess(userId, shipmentId);

    if (shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/shipment-closed",
        title: "Shipment Closed",
        status: 400,
        detail: "Cannot update customs status on a closed shipment.",
      });
    }

    if (!["IN_TRANSIT", "DELAYED"].includes(shipment.status)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-customs-state",
        title: "Invalid State for Customs",
        status: 400,
        detail: `Customs status requires status IN_TRANSIT or DELAYED. Current status is '${shipment.status}'.`,
      });
    }

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: "CUSTOMS" },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          previousStatus: shipment.status,
          resultingStatus: "CUSTOMS",
          actorUserId: userId,
          actorRole,
          location: input.location ?? null,
          notes: input.notes ?? "Customs clearance in progress",
          metadata: input.reference ? { customsReference: input.reference } : {},
          occurredAt: new Date(),
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.shipment.customs",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: shipmentId },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: shipment.shipmentNumber,
            actorRole,
          },
        },
        tx,
      );

      return mapShipmentDetail(updated);
    });
  }

  async reportDelay(userId: string, shipmentId: string, input: ReportDelayInput): Promise<ShipmentDetail> {
    const { shipment, actorRole } = await this.assertExecutionAccess(userId, shipmentId);

    if (shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/shipment-closed",
        title: "Shipment Closed",
        status: 400,
        detail: "Cannot report delay on a closed shipment.",
      });
    }

    const validActiveStates = ["PICKUP_SCHEDULED", "PICKED_UP", "IN_TRANSIT", "CUSTOMS"];
    if (!validActiveStates.includes(shipment.status)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-delay-state",
        title: "Cannot Report Delay",
        status: 400,
        detail: `Delay can only be reported from active shipment states (${validActiveStates.join(", ")}). Current status is '${shipment.status}'.`,
      });
    }

    if (!input.delayReason || !input.delayReason.trim()) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/delay-reason-required",
        title: "Delay Reason Required",
        status: 400,
        detail: "delayReason is mandatory when reporting a delay.",
      });
    }

    const revisedDate = input.revisedExpectedDeliveryDate
      ? new Date(input.revisedExpectedDeliveryDate)
      : null;

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          previousStatus: shipment.status,
          status: "DELAYED",
          delayReason: input.delayReason.trim(),
          delayReportedAt: new Date(),
          revisedExpectedDeliveryDate: revisedDate,
        },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          previousStatus: shipment.status,
          resultingStatus: "DELAYED",
          actorUserId: userId,
          actorRole,
          location: input.location ?? null,
          notes: input.delayReason.trim(),
          metadata: {
            priorStatus: shipment.status,
            revisedExpectedDeliveryDate: revisedDate?.toISOString() ?? null,
          },
          occurredAt: new Date(),
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.shipment.delayed",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: shipmentId },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: shipment.shipmentNumber,
            priorStatus: shipment.status,
            delayReason: input.delayReason.trim(),
            actorRole,
          },
        },
        tx,
      );

      return mapShipmentDetail(updated);
    });
  }

  async confirmDelivery(userId: string, shipmentId: string, input: ConfirmDeliveryInput): Promise<ShipmentDetail> {
    const { shipment, actorRole } = await this.assertExecutionAccess(userId, shipmentId);

    if (["DELIVERED", "DISPUTED", "CLOSED"].includes(shipment.status)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/already-delivered",
        title: "Already Delivered",
        status: 400,
        detail: `Shipment is already in status '${shipment.status}'. Delivery cannot be confirmed again.`,
      });
    }

    const allowedSourceStates = ["IN_TRANSIT", "CUSTOMS", "DELAYED"];
    if (!allowedSourceStates.includes(shipment.status)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-delivery-state",
        title: "Invalid State for Delivery",
        status: 400,
        detail: `Delivery can only be confirmed from IN_TRANSIT, CUSTOMS, or DELAYED. Current status is '${shipment.status}'.`,
      });
    }

    const deliveredDate = input.deliveredAt ? new Date(input.deliveredAt) : new Date();

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: "DELIVERED",
          deliveredAt: deliveredDate,
          deliveredLocation: input.deliveredLocation ?? shipment.destination,
          deliveryNotes: input.deliveryNotes ?? null,
        },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          previousStatus: shipment.status,
          resultingStatus: "DELIVERED",
          actorUserId: userId,
          actorRole,
          location: input.deliveredLocation ?? shipment.destination,
          notes: input.deliveryNotes ?? "Delivery confirmed",
          metadata: { deliveredAt: deliveredDate.toISOString() },
          occurredAt: new Date(),
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.delivery.confirmed",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: shipmentId },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: shipment.shipmentNumber,
            deliveredAt: deliveredDate.toISOString(),
            actorRole,
          },
        },
        tx,
      );

      return mapShipmentDetail(updated);
    });
  }

  // ── Discrepancies & Disputes ──────────────────────────────

  async recordDiscrepancy(
    userId: string,
    shipmentId: string,
    input: CreateDiscrepancyInput,
  ): Promise<ShipmentDiscrepancySummary> {
    const { shipment } = await this.assertExecutionAccess(userId, shipmentId);

    if (shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/shipment-closed",
        title: "Shipment Closed",
        status: 400,
        detail: "Cannot record discrepancies on a closed shipment.",
      });
    }

    if (!["DAMAGE", "QUANTITY_DIFFERENCE"].includes(input.type)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-discrepancy-type",
        title: "Invalid Discrepancy Type",
        status: 400,
        detail: "type must be either 'DAMAGE' or 'QUANTITY_DIFFERENCE'.",
      });
    }

    if (!input.description || !input.description.trim()) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/description-required",
        title: "Description Required",
        status: 400,
        detail: "description is mandatory.",
      });
    }

    let differenceQuantity: number | null = null;
    if (input.type === "QUANTITY_DIFFERENCE") {
      if (input.expectedQuantity === undefined || input.deliveredQuantity === undefined || !input.quantityUnit) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/quantity-fields-required",
          title: "Quantity Fields Required",
          status: 400,
          detail: "expectedQuantity, deliveredQuantity, and quantityUnit are required for QUANTITY_DIFFERENCE.",
        });
      }
      if (input.quantityUnit !== shipment.quantityUnit) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/logistics/unit-mismatch",
          title: "Unit Mismatch",
          status: 400,
          detail: `quantityUnit '${input.quantityUnit}' does not match shipment unit '${shipment.quantityUnit}'.`,
        });
      }
      differenceQuantity =
        Math.round((Number(input.deliveredQuantity) - Number(input.expectedQuantity)) * 1000) / 1000;
    }

    const discrepancy = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.shipmentDiscrepancy.create({
        data: {
          shipmentId,
          reportedByUserId: userId,
          type: input.type,
          description: input.description.trim(),
          expectedQuantity: input.expectedQuantity ?? null,
          deliveredQuantity: input.deliveredQuantity ?? null,
          quantityUnit: input.quantityUnit ?? null,
          differenceQuantity,
          recordedAt: new Date(),
        },
        include: {
          reportedByUser: { select: { email: true } },
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.discrepancy.recorded",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "discrepancy", id: created.id },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentId,
            shipmentNumber: shipment.shipmentNumber,
            type: input.type,
            differenceQuantity: differenceQuantity !== null ? String(differenceQuantity) : "",
          },
        },
        tx,
      );

      return created;
    });

    return {
      id: discrepancy.id,
      shipmentId: discrepancy.shipmentId,
      reportedByUserId: discrepancy.reportedByUserId,
      reportedByUserEmail: discrepancy.reportedByUser?.email ?? "",
      type: discrepancy.type as "DAMAGE" | "QUANTITY_DIFFERENCE",
      description: discrepancy.description,
      expectedQuantity: discrepancy.expectedQuantity ?? null,
      deliveredQuantity: discrepancy.deliveredQuantity ?? null,
      quantityUnit: discrepancy.quantityUnit ?? null,
      differenceQuantity: discrepancy.differenceQuantity ?? null,
      recordedAt: toIso(discrepancy.recordedAt),
    };
  }

  async markDisputed(userId: string, shipmentId: string, input: MarkDisputedInput): Promise<ShipmentDetail> {
    await this.assertTraderAccess(userId);

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: SHIPMENT_DETAIL_INCLUDE,
    });

    if (!shipment) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/shipment-not-found",
        title: "Shipment Not Found",
        status: 404,
        detail: `Shipment with ID ${shipmentId} not found.`,
      });
    }

    if (shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/shipment-closed",
        title: "Shipment Closed",
        status: 400,
        detail: "Cannot mark a closed shipment disputed.",
      });
    }

    if (shipment.status === "DISPUTED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/already-disputed",
        title: "Already Disputed",
        status: 400,
        detail: "Shipment is already in DISPUTED status.",
      });
    }

    if (!input.disputeReason || !input.disputeReason.trim()) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/dispute-reason-required",
        title: "Dispute Reason Required",
        status: 400,
        detail: "disputeReason is required.",
      });
    }

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          previousStatus: shipment.status,
          status: "DISPUTED",
          disputeReason: input.disputeReason.trim(),
          disputeReportedAt: new Date(),
          disputeResolvedAt: null,
          disputeResolutionNotes: null,
        },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          previousStatus: shipment.status,
          resultingStatus: "DISPUTED",
          actorUserId: userId,
          actorRole: "TRADER",
          notes: input.disputeReason.trim(),
          occurredAt: new Date(),
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.shipment.disputed",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: shipmentId },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: shipment.shipmentNumber,
            disputeReason: input.disputeReason.trim(),
          },
        },
        tx,
      );

      return mapShipmentDetail(updated);
    });
  }

  async resolveDispute(userId: string, shipmentId: string, input: ResolveDisputeInput): Promise<ShipmentDetail> {
    await this.assertTraderAccess(userId);

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: SHIPMENT_DETAIL_INCLUDE,
    });

    if (!shipment) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/shipment-not-found",
        title: "Shipment Not Found",
        status: 404,
        detail: `Shipment with ID ${shipmentId} not found.`,
      });
    }

    if (shipment.status !== "DISPUTED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/not-disputed",
        title: "Not Disputed",
        status: 400,
        detail: `Shipment is in status '${shipment.status}' and not disputed.`,
      });
    }

    if (!input.disputeResolutionNotes || !input.disputeResolutionNotes.trim()) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/resolution-notes-required",
        title: "Resolution Notes Required",
        status: 400,
        detail: "disputeResolutionNotes is required.",
      });
    }

    const fallbackReturnStatus = shipment.previousStatus === "DELIVERED" ? "DELIVERED" : "DELIVERED";

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: fallbackReturnStatus,
          disputeResolvedAt: new Date(),
          disputeResolutionNotes: input.disputeResolutionNotes.trim(),
        },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          previousStatus: "DISPUTED",
          resultingStatus: fallbackReturnStatus,
          actorUserId: userId,
          actorRole: "TRADER",
          notes: `Dispute resolved: ${input.disputeResolutionNotes.trim()}`,
          occurredAt: new Date(),
        },
      });

      return mapShipmentDetail(updated);
    });
  }

  // ── Final Logistics Cost Reconciliation ──────────────────

  async reconcileCosts(
    userId: string,
    shipmentId: string,
    input: ReconcileCostsInput,
  ): Promise<ShipmentCostReconciliationSummary> {
    await this.assertTraderAccess(userId);

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        selectedFreightQuotation: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/shipment-not-found",
        title: "Shipment Not Found",
        status: 404,
        detail: `Shipment with ID ${shipmentId} not found.`,
      });
    }

    if (!shipment.selectedFreightQuotationId || !shipment.selectedFreightQuotation) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/no-carrier-selected",
        title: "Carrier Not Selected",
        status: 400,
        detail: "Logistics costs cannot be reconciled without a selected freight quotation.",
      });
    }

    if (typeof input.finalAmount !== "number" || input.finalAmount < 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/invalid-final-amount",
        title: "Invalid Final Amount",
        status: 400,
        detail: "finalAmount must be a non-negative number.",
      });
    }

    const quotation = shipment.selectedFreightQuotation;
    if (input.finalCurrency !== quotation.currency) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/currency-mismatch",
        title: "Currency Mismatch",
        status: 400,
        detail: `finalCurrency '${input.finalCurrency}' must match quoted currency '${quotation.currency}'.`,
      });
    }

    const differenceAmount = Math.round((input.finalAmount - quotation.freightAmount) * 100) / 100;

    const reconciliation = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const rec = await tx.shipmentCostReconciliation.upsert({
        where: { shipmentId },
        create: {
          shipmentId,
          selectedFreightQuotationId: quotation.id,
          quotedAmount: quotation.freightAmount,
          quotedCurrency: quotation.currency,
          finalAmount: input.finalAmount,
          finalCurrency: input.finalCurrency,
          differenceAmount,
          notes: input.notes?.trim() || null,
          reconciledByUserId: userId,
          reconciledAt: new Date(),
        },
        update: {
          quotedAmount: quotation.freightAmount,
          quotedCurrency: quotation.currency,
          finalAmount: input.finalAmount,
          finalCurrency: input.finalCurrency,
          differenceAmount,
          notes: input.notes?.trim() || null,
          reconciledByUserId: userId,
          reconciledAt: new Date(),
        },
        include: {
          reconciledByUser: { select: { email: true } },
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.costs.reconciled",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "cost_reconciliation", id: rec.id },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentId,
            shipmentNumber: shipment.shipmentNumber,
            quotedAmount: String(quotation.freightAmount),
            finalAmount: String(input.finalAmount),
            differenceAmount: String(differenceAmount),
            currency: input.finalCurrency,
          },
        },
        tx,
      );

      return rec;
    });

    return {
      id: reconciliation.id,
      shipmentId: reconciliation.shipmentId,
      selectedFreightQuotationId: reconciliation.selectedFreightQuotationId,
      quotedAmount: reconciliation.quotedAmount,
      quotedCurrency: reconciliation.quotedCurrency,
      finalAmount: reconciliation.finalAmount,
      finalCurrency: reconciliation.finalCurrency,
      differenceAmount: reconciliation.differenceAmount,
      notes: reconciliation.notes ?? null,
      reconciledByUserId: reconciliation.reconciledByUserId,
      reconciledByUserEmail: reconciliation.reconciledByUser?.email ?? "",
      reconciledAt: toIso(reconciliation.reconciledAt),
    };
  }

  // ── Close Shipment ───────────────────────────────────────

  async closeShipment(userId: string, shipmentId: string, input: CloseShipmentInput): Promise<ShipmentDetail> {
    await this.assertTraderAccess(userId);

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        costReconciliation: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/shipment-not-found",
        title: "Shipment Not Found",
        status: 404,
        detail: `Shipment with ID ${shipmentId} not found.`,
      });
    }

    if (shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/already-closed",
        title: "Already Closed",
        status: 400,
        detail: "Shipment is already closed.",
      });
    }

    if (shipment.status === "DISPUTED" && !shipment.disputeResolvedAt) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/unresolved-dispute",
        title: "Unresolved Dispute",
        status: 400,
        detail: "Cannot close a disputed shipment before resolving the dispute.",
      });
    }

    if (shipment.status !== "DELIVERED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/delivery-required-before-close",
        title: "Delivery Required",
        status: 400,
        detail: `Shipment cannot be closed before delivery is confirmed. Current status is '${shipment.status}'.`,
      });
    }

    if (!shipment.costReconciliation) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/reconciliation-required-before-close",
        title: "Cost Reconciliation Required",
        status: 400,
        detail: "Shipment cannot be closed before final logistics costs are reconciled.",
      });
    }

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
          closedByUserId: userId,
          notes: input.notes ? `${shipment.notes ? shipment.notes + "\n" : ""}${input.notes}` : shipment.notes,
        },
        include: SHIPMENT_DETAIL_INCLUDE,
      });

      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          previousStatus: shipment.status,
          resultingStatus: "CLOSED",
          actorUserId: userId,
          actorRole: "TRADER",
          notes: input.notes ?? "Shipment closed",
          occurredAt: new Date(),
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "logistics.shipment.closed",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "shipment", id: shipmentId },
          correlationId: shipment.contractId,
          occurredAt: new Date(),
          metadata: {
            shipmentNumber: shipment.shipmentNumber,
          },
        },
        tx,
      );

      return mapShipmentDetail(updated);
    });
  }

  // ── Shipping Documents ───────────────────────────────────

  async uploadShippingDocument(
    userId: string,
    shipmentId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string },
    label: string,
    documentReference?: string | null,
  ): Promise<ShipmentDocumentSummary> {
    const { shipment } = await this.assertExecutionAccess(userId, shipmentId);

    if (shipment.status === "CLOSED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/shipment-closed",
        title: "Shipment Closed",
        status: 400,
        detail: "Cannot upload shipping documents to a closed shipment.",
      });
    }

    if (!label || !label.trim()) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/document-label-required",
        title: "Document Label Required",
        status: 400,
        detail: "A label is required for shipping documents (e.g. Bill of Lading, CMR, Packing List).",
      });
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.buffer.length > MAX_SIZE) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/file-too-large",
        title: "File Too Large",
        status: 400,
        detail: "Shipping document cannot exceed 10MB.",
      });
    }

    const stored = await this.storageService.store(file.originalname, file.buffer, file.mimetype);

    try {
      const document = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const created = await tx.shipmentDocument.create({
          data: {
            shipmentId,
            uploadedByUserId: userId,
            label: label.trim(),
            documentReference: documentReference?.trim() || null,
            storageKey: stored.storageKey,
            originalFilename: stored.originalFilename,
            mimeType: stored.mimeType,
            sizeBytes: stored.fileSize,
            uploadedAt: new Date(),
          },
          include: {
            uploadedByUser: { select: { email: true } },
          },
        });

        await this.auditEventWriter.append(
          {
            eventType: "logistics.shipping_document.uploaded",
            outcome: "succeeded",
            actor: { type: "user", userId },
            target: { type: "shipment_document", id: created.id },
            correlationId: shipment.contractId,
            occurredAt: new Date(),
            metadata: {
              shipmentId,
              shipmentNumber: shipment.shipmentNumber,
              label: created.label,
              originalFilename: created.originalFilename,
              storageKey: created.storageKey,
            },
          },
          tx,
        );

        return created;
      });

      return {
        id: document.id,
        shipmentId: document.shipmentId,
        uploadedByUserId: document.uploadedByUserId,
        uploadedByUserEmail: document.uploadedByUser?.email ?? "",
        label: document.label,
        documentReference: document.documentReference ?? null,
        storageKey: document.storageKey,
        originalFilename: document.originalFilename,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        uploadedAt: toIso(document.uploadedAt),
      };
    } catch (err) {
      try {
        await this.storageService.delete(stored.storageKey);
      } catch (delErr) {
        console.error(`Failed to clean up stored shipping document ${stored.storageKey}:`, delErr);
      }
      throw err;
    }
  }

  async getShippingDocuments(userId: string, shipmentId: string): Promise<ShipmentDocumentSummary[]> {
    await this.assertExecutionAccess(userId, shipmentId);

    const docs = await this.prisma.shipmentDocument.findMany({
      where: { shipmentId },
      include: {
        uploadedByUser: { select: { email: true } },
      },
      orderBy: { uploadedAt: "desc" },
    });

    return docs.map((doc) => ({
      id: doc.id,
      shipmentId: doc.shipmentId,
      uploadedByUserId: doc.uploadedByUserId,
      uploadedByUserEmail: doc.uploadedByUser?.email ?? "",
      label: doc.label,
      documentReference: doc.documentReference ?? null,
      storageKey: doc.storageKey,
      originalFilename: doc.originalFilename,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      uploadedAt: toIso(doc.uploadedAt),
    }));
  }

  async getTrackingEvents(
    userId: string,
    shipmentId: string,
  ): Promise<ShipmentTrackingEventSummary[]> {
    await this.assertExecutionAccess(userId, shipmentId);

    const events = await this.prisma.shipmentTrackingEvent.findMany({
      where: { shipmentId },
      include: {
        actorUser: { select: { email: true } },
      },
      orderBy: { occurredAt: "asc" },
    });

    return events.map((te) => ({
      id: te.id,
      shipmentId: te.shipmentId,
      previousStatus: te.previousStatus,
      resultingStatus: te.resultingStatus,
      actorUserId: te.actorUserId,
      actorUserEmail: te.actorUser?.email ?? "",
      actorRole: te.actorRole,
      location: te.location ?? null,
      notes: te.notes ?? null,
      metadata: (te.metadata as Record<string, unknown>) ?? {},
      occurredAt: toIso(te.occurredAt),
      recordedAt: toIso(te.recordedAt),
    }));
  }

  async downloadShippingDocument(userId: string, shipmentId: string, documentId: string) {
    await this.assertExecutionAccess(userId, shipmentId);

    const doc = await this.prisma.shipmentDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.shipmentId !== shipmentId) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/document-not-found",
        title: "Document Not Found",
        status: 404,
        detail: `Shipping document with ID ${documentId} not found.`,
      });
    }

    const file = await this.storageService.retrieve(doc.storageKey, doc.originalFilename, doc.mimeType);
    if (!file) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/logistics/file-not-found",
        title: "File Not Found",
        status: 404,
        detail: "Stored document file could not be retrieved from storage.",
      });
    }

    return { file, filename: doc.originalFilename };
  }

  // ── Administrative Settlement ────────────────────────────

  async createSettlement(userId: string, tradeId: string, input: CreateSettlementInput): Promise<SettlementDetail> {
    await this.assertTraderAccess(userId);

    const trade = await this.prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        settlement: true,
      },
    });

    if (!trade) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/settlement/trade-not-found",
        title: "Trade Not Found",
        status: 404,
        detail: `Trade with ID ${tradeId} not found.`,
      });
    }

    if (trade.settlement) {
      throw new ConflictException({
        type: "https://errors.idogrow.com/settlement/already-exists",
        title: "Settlement Already Exists",
        status: 409,
        detail: "An administrative settlement record already exists for this trade.",
      });
    }

    const depositAmount = input.depositAmount ?? 0;
    const commissionAmount = input.commissionAmount ?? 0;
    const finalSettlementAmount = input.finalSettlementAmount ?? trade.acceptedTotalAmount;

    if (depositAmount < 0 || commissionAmount < 0 || finalSettlementAmount < 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/settlement/invalid-amounts",
        title: "Invalid Amounts",
        status: 400,
        detail: "Monetary amounts cannot be negative.",
      });
    }

    const remainingBalance = Math.max(0, Math.round((trade.acceptedTotalAmount - depositAmount) * 100) / 100);

    const dueDate = input.paymentDueDate ? new Date(input.paymentDueDate) : null;

    const settlement = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.settlement.create({
        data: {
          tradeId,
          shipmentId: input.shipmentId ?? null,
          buyerOrganisationId: trade.buyerOrganisationId,
          supplierOrganisationId: trade.supplierOrganisationId,
          currency: trade.currency,
          totalCommercialAmount: trade.acceptedTotalAmount,
          depositAmount,
          remainingBalance,
          commissionAmount,
          finalSettlementAmount,
          paymentStatus: "PENDING",
          paymentDueDate: dueDate,
          paymentInstructions: input.paymentInstructions ?? null,
          notes: input.notes ?? null,
          createdByUserId: userId,
        },
        include: SETTLEMENT_INCLUDE,
      });

      await this.auditEventWriter.append(
        {
          eventType: "settlement.created",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "settlement", id: created.id },
          correlationId: tradeId,
          occurredAt: new Date(),
          metadata: {
            tradeId,
            totalCommercialAmount: String(trade.acceptedTotalAmount),
            currency: trade.currency,
            paymentStatus: "PENDING",
          },
        },
        tx,
      );

      return created;
    });

    return mapSettlement(settlement);
  }

  async getSettlementByTradeId(userId: string, tradeId: string): Promise<SettlementDetail | null> {
    const trade = await this.prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        settlement: {
          include: SETTLEMENT_INCLUDE,
        },
      },
    });

    if (!trade) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/settlement/trade-not-found",
        title: "Trade Not Found",
        status: 404,
        detail: `Trade with ID ${tradeId} not found.`,
      });
    }

    await this.assertTradeAccess(userId, trade.buyerOrganisationId, trade.supplierOrganisationId);

    if (!trade.settlement) return null;
    return mapSettlement(trade.settlement);
  }

  async getSettlementById(userId: string, settlementId: string): Promise<SettlementDetail> {
    const settlement = await this.prisma.settlement.findUnique({
      where: { id: settlementId },
      include: SETTLEMENT_INCLUDE,
    });

    if (!settlement) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/settlement/not-found",
        title: "Settlement Not Found",
        status: 404,
        detail: `Settlement with ID ${settlementId} not found.`,
      });
    }

    await this.assertTradeAccess(userId, settlement.buyerOrganisationId, settlement.supplierOrganisationId);

    return mapSettlement(settlement);
  }

  async updateSettlement(userId: string, settlementId: string, input: UpdateSettlementInput): Promise<SettlementDetail> {
    await this.assertTraderAccess(userId);

    const settlement = await this.prisma.settlement.findUnique({
      where: { id: settlementId },
    });

    if (!settlement) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/settlement/not-found",
        title: "Settlement Not Found",
        status: 404,
        detail: `Settlement with ID ${settlementId} not found.`,
      });
    }

    const dataToUpdate: Prisma.SettlementUpdateInput = {};

    if (input.depositAmount !== undefined) {
      if (input.depositAmount < 0) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/settlement/invalid-amount",
          title: "Invalid Deposit Amount",
          status: 400,
          detail: "depositAmount cannot be negative.",
        });
      }
      dataToUpdate.depositAmount = input.depositAmount;
      dataToUpdate.remainingBalance = Math.max(
        0,
        Math.round((settlement.totalCommercialAmount - input.depositAmount) * 100) / 100,
      );
    }

    if (input.commissionAmount !== undefined) {
      if (input.commissionAmount < 0) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/settlement/invalid-amount",
          title: "Invalid Commission Amount",
          status: 400,
          detail: "commissionAmount cannot be negative.",
        });
      }
      dataToUpdate.commissionAmount = input.commissionAmount;
    }

    if (input.finalSettlementAmount !== undefined) {
      if (input.finalSettlementAmount < 0) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/settlement/invalid-amount",
          title: "Invalid Settlement Amount",
          status: 400,
          detail: "finalSettlementAmount cannot be negative.",
        });
      }
      dataToUpdate.finalSettlementAmount = input.finalSettlementAmount;
    }

    if (input.paymentStatus !== undefined) {
      if (!["PENDING", "PARTIALLY_RECORDED", "SETTLED"].includes(input.paymentStatus)) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/settlement/invalid-status",
          title: "Invalid Payment Status",
          status: 400,
          detail: "paymentStatus must be PENDING, PARTIALLY_RECORDED, or SETTLED.",
        });
      }
      dataToUpdate.paymentStatus = input.paymentStatus;
    }

    if (input.paymentDueDate !== undefined) {
      dataToUpdate.paymentDueDate = input.paymentDueDate ? new Date(input.paymentDueDate) : null;
    }

    if (input.paymentInstructions !== undefined) {
      dataToUpdate.paymentInstructions = input.paymentInstructions?.trim() || null;
    }

    if (input.notes !== undefined) {
      dataToUpdate.notes = input.notes?.trim() || null;
    }

    const updated = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const res = await tx.settlement.update({
        where: { id: settlementId },
        data: dataToUpdate,
        include: SETTLEMENT_INCLUDE,
      });

      await this.auditEventWriter.append(
        {
          eventType: "settlement.updated",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "settlement", id: settlementId },
          correlationId: settlement.tradeId,
          occurredAt: new Date(),
          metadata: {
            tradeId: settlement.tradeId,
            paymentStatus: String(res.paymentStatus),
          },
        },
        tx,
      );

      return res;
    });

    return mapSettlement(updated);
  }

  async uploadSettlementDocument(
    userId: string,
    settlementId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string },
    documentType: SettlementDocumentType,
    documentReference?: string | null,
  ): Promise<SettlementDocumentSummary> {
    await this.assertTraderAccess(userId);

    const settlement = await this.prisma.settlement.findUnique({
      where: { id: settlementId },
    });

    if (!settlement) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/settlement/not-found",
        title: "Settlement Not Found",
        status: 404,
        detail: `Settlement with ID ${settlementId} not found.`,
      });
    }

    if (!["INVOICE", "CREDIT_NOTE", "PAYMENT_INSTRUCTION", "CLAIM"].includes(documentType)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/settlement/invalid-document-type",
        title: "Invalid Document Type",
        status: 400,
        detail: "documentType must be INVOICE, CREDIT_NOTE, PAYMENT_INSTRUCTION, or CLAIM.",
      });
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.buffer.length > MAX_SIZE) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/settlement/file-too-large",
        title: "File Too Large",
        status: 400,
        detail: "Settlement document cannot exceed 10MB.",
      });
    }

    const stored = await this.storageService.store(file.originalname, file.buffer, file.mimetype);

    try {
      const doc = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const created = await tx.settlementDocument.create({
          data: {
            settlementId,
            uploadedByUserId: userId,
            documentType,
            documentReference: documentReference?.trim() || null,
            storageKey: stored.storageKey,
            originalFilename: stored.originalFilename,
            mimeType: stored.mimeType,
            sizeBytes: stored.fileSize,
            uploadedAt: new Date(),
          },
          include: {
            uploadedByUser: { select: { email: true } },
          },
        });

        await this.auditEventWriter.append(
          {
            eventType: "settlement.document.uploaded",
            outcome: "succeeded",
            actor: { type: "user", userId },
            target: { type: "settlement_document", id: created.id },
            correlationId: settlement.tradeId,
            occurredAt: new Date(),
            metadata: {
              settlementId,
              documentType,
              storageKey: created.storageKey,
            },
          },
          tx,
        );

        return created;
      });

      return {
        id: doc.id,
        settlementId: doc.settlementId,
        uploadedByUserId: doc.uploadedByUserId,
        uploadedByUserEmail: doc.uploadedByUser?.email ?? "",
        documentType: doc.documentType as SettlementDocumentType,
        documentReference: doc.documentReference ?? null,
        storageKey: doc.storageKey,
        originalFilename: doc.originalFilename,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        uploadedAt: toIso(doc.uploadedAt),
      };
    } catch (err) {
      try {
        await this.storageService.delete(stored.storageKey);
      } catch (delErr) {
        console.error(`Failed to delete stored settlement document ${stored.storageKey}:`, delErr);
      }
      throw err;
    }
  }

  async downloadSettlementDocument(userId: string, settlementId: string, documentId: string) {
    const settlement = await this.prisma.settlement.findUnique({
      where: { id: settlementId },
    });

    if (!settlement) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/settlement/not-found",
        title: "Settlement Not Found",
        status: 404,
        detail: `Settlement with ID ${settlementId} not found.`,
      });
    }

    await this.assertTradeAccess(userId, settlement.buyerOrganisationId, settlement.supplierOrganisationId);

    const doc = await this.prisma.settlementDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.settlementId !== settlementId) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/settlement/document-not-found",
        title: "Document Not Found",
        status: 404,
        detail: `Settlement document with ID ${documentId} not found.`,
      });
    }

    const file = await this.storageService.retrieve(doc.storageKey, doc.originalFilename, doc.mimeType);
    if (!file) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/settlement/file-not-found",
        title: "File Not Found",
        status: 404,
        detail: "Stored document file could not be retrieved from storage.",
      });
    }

    return { file, filename: doc.originalFilename };
  }

  async createSettlementClaim(
    userId: string,
    settlementId: string,
    input: CreateSettlementClaimInput,
  ): Promise<SettlementClaimSummary> {
    await this.assertTraderAccess(userId);

    const settlement = await this.prisma.settlement.findUnique({
      where: { id: settlementId },
    });

    if (!settlement) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/settlement/not-found",
        title: "Settlement Not Found",
        status: 404,
        detail: `Settlement with ID ${settlementId} not found.`,
      });
    }

    if (!input.description || !input.description.trim()) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/settlement/description-required",
        title: "Description Required",
        status: 400,
        detail: "Claim description is required.",
      });
    }

    const claim = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.settlementClaim.create({
        data: {
          settlementId,
          discrepancyId: input.discrepancyId ?? null,
          description: input.description.trim(),
          amount: input.amount ?? null,
          currency: input.currency ?? settlement.currency,
          status: "OPEN",
          recordedByUserId: userId,
          recordedAt: new Date(),
        },
        include: {
          recordedByUser: { select: { email: true } },
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "settlement.claim.created",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "settlement_claim", id: created.id },
          correlationId: settlement.tradeId,
          occurredAt: new Date(),
          metadata: {
            settlementId,
            claimId: created.id,
            description: created.description,
          },
        },
        tx,
      );

      return created;
    });

    return {
      id: claim.id,
      settlementId: claim.settlementId,
      discrepancyId: claim.discrepancyId ?? null,
      description: claim.description,
      amount: claim.amount ?? null,
      currency: claim.currency ?? null,
      status: claim.status as SettlementClaimStatus,
      resolutionNotes: null,
      resolvedAt: null,
      resolvedByUserId: null,
      recordedByUserId: claim.recordedByUserId,
      recordedByUserEmail: claim.recordedByUser?.email ?? "",
      recordedAt: toIso(claim.recordedAt),
      updatedAt: toIso(claim.updatedAt),
    };
  }

  async resolveSettlementClaim(
    userId: string,
    settlementId: string,
    claimId: string,
    input: ResolveSettlementClaimInput,
  ): Promise<SettlementClaimSummary> {
    await this.assertTraderAccess(userId);

    const claim = await this.prisma.settlementClaim.findUnique({
      where: { id: claimId },
      include: {
        settlement: { select: { tradeId: true } },
      },
    });

    if (!claim || claim.settlementId !== settlementId) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/settlement/claim-not-found",
        title: "Claim Not Found",
        status: 404,
        detail: `Settlement claim with ID ${claimId} not found.`,
      });
    }

    if (claim.status === "RESOLVED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/settlement/claim-already-resolved",
        title: "Claim Already Resolved",
        status: 400,
        detail: "This claim is already resolved.",
      });
    }

    if (!input.resolutionNotes || !input.resolutionNotes.trim()) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/settlement/resolution-notes-required",
        title: "Resolution Notes Required",
        status: 400,
        detail: "resolutionNotes is required to resolve a claim.",
      });
    }

    const updated = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const res = await tx.settlementClaim.update({
        where: { id: claimId },
        data: {
          status: "RESOLVED",
          resolutionNotes: input.resolutionNotes.trim(),
          resolvedAt: new Date(),
          resolvedByUserId: userId,
        },
        include: {
          recordedByUser: { select: { email: true } },
        },
      });

      await this.auditEventWriter.append(
        {
          eventType: "settlement.claim.resolved",
          outcome: "succeeded",
          actor: { type: "user", userId },
          target: { type: "settlement_claim", id: claimId },
          correlationId: claim.settlement.tradeId,
          occurredAt: new Date(),
          metadata: {
            settlementId,
            claimId,
            resolutionNotes: input.resolutionNotes.trim(),
          },
        },
        tx,
      );

      return res;
    });

    return {
      id: updated.id,
      settlementId: updated.settlementId,
      discrepancyId: updated.discrepancyId ?? null,
      description: updated.description,
      amount: updated.amount ?? null,
      currency: updated.currency ?? null,
      status: updated.status as SettlementClaimStatus,
      resolutionNotes: updated.resolutionNotes ?? null,
      resolvedAt: toIsoOrNull(updated.resolvedAt),
      resolvedByUserId: updated.resolvedByUserId ?? null,
      recordedByUserId: updated.recordedByUserId,
      recordedByUserEmail: updated.recordedByUser?.email ?? "",
      recordedAt: toIso(updated.recordedAt),
      updatedAt: toIso(updated.updatedAt),
    };
  }

  // ── Access assertion helpers ─────────────────────────────

  private async isTrader(userId: string): Promise<boolean> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    const hasTraderMembership = memberships?.some(
      (m) => m.organisation?.organisationType?.toUpperCase() === "TRADER",
    );
    if (hasTraderMembership) return true;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === "TRADER";
  }

  async assertTraderAccess(userId: string): Promise<void> {
    const isTrader = await this.isTrader(userId);

    if (!isTrader) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/logistics/trader-only",
        title: "Access Denied",
        status: 403,
        detail: "Only traders may perform this logistics operation.",
      });
    }
  }

  async assertLogisticsPartnerAccess(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "LOGISTICS_PARTNER") {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/logistics/partner-only",
        title: "Access Denied",
        status: 403,
        detail: "Only users with the LOGISTICS_PARTNER role can access logistics partner endpoints.",
      });
    }
  }

  private async assertTradeAccess(
    userId: string,
    buyerOrganisationId: string,
    supplierOrganisationId: string,
  ): Promise<void> {
    const isTrader = await this.isTrader(userId);
    if (isTrader) return;

    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
        organisationId: { in: [buyerOrganisationId, supplierOrganisationId] },
      },
    });

    if (memberships.length === 0) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/settlement/access-denied",
        title: "Access Denied",
        status: 403,
        detail: "You do not have permission to view this settlement.",
      });
    }
  }
}
