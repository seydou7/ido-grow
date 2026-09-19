type TradePrismaRecord = {
  id: string;
  tradeNumber: string;
  quoteId: string;
  acceptedQuoteVersionNumber: number;
  matchId: string;
  buyOrderId: string;
  listingId: string;
  buyerOrganisationId: string;
  supplierOrganisationId: string;
  createdByUserId: string;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  currency: string;
  acceptedTotalAmount: number;
  incoterm: string | null;
  paymentTerms: string | null;
  acceptedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  quote?: {
    id: string;
    quoteNumber: string;
    versions?: Array<{
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
      commercialNotes: string | null;
      validUntil: Date | null;
    }>;
  };
  buyerOrganisation?: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    country: string | null;
  };
  supplierOrganisation?: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    country: string | null;
  };
  listing?: {
    id: string;
    title: string;
  };
  inspections?: Array<{
    id: string;
    inspectionReference: string;
    status: string;
    inspectionMethod: string;
    assignedInspectorUser?: { id: string; email: string } | null;
    completedAt?: Date | null;
    assessmentStatus?: string | null;
    physicalInspectionRequired?: boolean | null;
    evidence?: Array<{ id: string }>;
    nonConformities?: Array<{ id: string; status: string }>;
    qualityResult?: { decision: string; classificationLabel: string } | null;
    certificate?: { id: string; certificateNumber: string } | null;
  }>;
};

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import type {
  TradeCollection,
  TradeDetail,
  TradeSummary,
} from "./trades.contracts";

@Injectable()
export class TradesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organisationsRepository: OrganisationsRepository,
  ) {}

  async getTradesForTrader(userId: string): Promise<TradeCollection> {
    await this.assertTraderAccess(userId);

    const trades = this.prisma.trade
      ? await this.prisma.trade.findMany({
          include: {
            quote: {
              select: {
                quoteNumber: true,
              },
            },
            buyerOrganisation: { select: { id: true, name: true } },
            supplierOrganisation: { select: { id: true, name: true } },
          },
          orderBy: { acceptedAt: "desc" },
        })
      : [];

    const items: TradeSummary[] = trades.map((t) => ({
      id: t.id,
      tradeNumber: t.tradeNumber,
      quoteId: t.quoteId,
      quoteNumber: t.quote?.quoteNumber ?? "Unknown",
      acceptedQuoteVersionNumber: t.acceptedQuoteVersionNumber,
      matchId: t.matchId,
      buyOrderId: t.buyOrderId,
      listingId: t.listingId,
      buyerOrganisationId: t.buyerOrganisationId,
      buyerOrganisationName: t.buyerOrganisation?.name ?? "Buyer",
      supplierOrganisationId: t.supplierOrganisationId,
      supplierOrganisationName: t.supplierOrganisation?.name ?? "Supplier",
      materialType: t.materialType,
      productForm: t.productForm,
      quantity: t.quantity,
      quantityUnit: t.quantityUnit,
      currency: t.currency,
      acceptedTotalAmount: t.acceptedTotalAmount,
      incoterm: t.incoterm,
      paymentTerms: t.paymentTerms,
      acceptedAt: t.acceptedAt.toISOString(),
      createdAt: t.createdAt.toISOString(),
    }));

    return { items, total: items.length };
  }

  async getTradeDetailForTrader(
    userId: string,
    tradeId: string,
  ): Promise<TradeDetail> {
    await this.assertTraderAccess(userId);

    const trade = this.prisma.trade
      ? await this.prisma.trade.findUnique({
          where: { id: tradeId },
          include: {
            quote: {
              include: {
                versions: true,
              },
            },
            buyerOrganisation: {
              select: { id: true, name: true, address: true, city: true, country: true },
            },
            supplierOrganisation: {
              select: { id: true, name: true, address: true, city: true, country: true },
            },
            listing: { select: { id: true, title: true } },
            inspections: {
              include: {
                assignedInspectorUser: { select: { id: true, email: true } },
                evidence: { select: { id: true } },
                nonConformities: { select: { id: true, status: true } },
                qualityResult: { select: { decision: true, classificationLabel: true } },
                certificate: { select: { id: true, certificateNumber: true } },
              },
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

    return this.mapToDetail(trade);
  }

  async getTradesForBuyer(userId: string): Promise<TradeCollection> {
    const buyerOrgId = await this.assertBuyerAccess(userId);

    const trades = this.prisma.trade
      ? await this.prisma.trade.findMany({
          where: { buyerOrganisationId: buyerOrgId },
          include: {
            quote: {
              select: {
                quoteNumber: true,
              },
            },
            buyerOrganisation: { select: { id: true, name: true } },
            supplierOrganisation: { select: { id: true, name: true } },
          },
          orderBy: { acceptedAt: "desc" },
        })
      : [];

    const items: TradeSummary[] = trades.map((t) => ({
      id: t.id,
      tradeNumber: t.tradeNumber,
      quoteId: t.quoteId,
      quoteNumber: t.quote?.quoteNumber ?? "Unknown",
      acceptedQuoteVersionNumber: t.acceptedQuoteVersionNumber,
      matchId: t.matchId,
      buyOrderId: t.buyOrderId,
      listingId: t.listingId,
      buyerOrganisationId: t.buyerOrganisationId,
      buyerOrganisationName: t.buyerOrganisation?.name ?? "Buyer",
      supplierOrganisationId: t.supplierOrganisationId,
      supplierOrganisationName: t.supplierOrganisation?.name ?? "Supplier",
      materialType: t.materialType,
      productForm: t.productForm,
      quantity: t.quantity,
      quantityUnit: t.quantityUnit,
      currency: t.currency,
      acceptedTotalAmount: t.acceptedTotalAmount,
      incoterm: t.incoterm,
      paymentTerms: t.paymentTerms,
      acceptedAt: t.acceptedAt.toISOString(),
      createdAt: t.createdAt.toISOString(),
    }));

    return { items, total: items.length };
  }

  async getTradeDetailForBuyer(
    userId: string,
    tradeId: string,
  ): Promise<TradeDetail> {
    const buyerOrgId = await this.assertBuyerAccess(userId);

    const trade = this.prisma.trade
      ? await this.prisma.trade.findUnique({
          where: { id: tradeId },
          include: {
            quote: {
              include: {
                versions: true,
              },
            },
            buyerOrganisation: {
              select: { id: true, name: true, address: true, city: true, country: true },
            },
            supplierOrganisation: {
              select: { id: true, name: true, address: true, city: true, country: true },
            },
            listing: { select: { id: true, title: true } },
          },
        })
      : null;

    if (!trade || trade.buyerOrganisationId !== buyerOrgId) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/trades/not-found",
        title: "Trade Not Found",
        status: 404,
        detail: `Trade record with ID ${tradeId} not found.`,
      });
    }

    return this.mapToDetail(trade);
  }

  private mapToDetail(trade: TradePrismaRecord): TradeDetail {
    const acceptedVer = trade.quote?.versions?.find(
      (v) => v.versionNumber === trade.acceptedQuoteVersionNumber,
    );

    if (!acceptedVer) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/trades/accepted-version-not-found",
        title: "Accepted Quote Version Not Found",
        status: 404,
        detail: `The exact accepted QuoteVersion (v${trade.acceptedQuoteVersionNumber}) for Trade ${trade.tradeNumber} could not be found.`,
      });
    }

    return {
      id: trade.id,
      tradeNumber: trade.tradeNumber,
      quoteId: trade.quoteId,
      quoteNumber: trade.quote?.quoteNumber ?? "Unknown",
      acceptedQuoteVersionNumber: trade.acceptedQuoteVersionNumber,
      matchId: trade.matchId,
      buyOrderId: trade.buyOrderId,
      listingId: trade.listingId,
      buyerOrganisationId: trade.buyerOrganisationId,
      buyerOrganisationName: trade.buyerOrganisation?.name ?? "Buyer",
      supplierOrganisationId: trade.supplierOrganisationId,
      supplierOrganisationName: trade.supplierOrganisation?.name ?? "Supplier",
      materialType: trade.materialType,
      productForm: trade.productForm,
      quantity: trade.quantity,
      quantityUnit: trade.quantityUnit,
      currency: trade.currency,
      acceptedTotalAmount: trade.acceptedTotalAmount,
      incoterm: trade.incoterm,
      paymentTerms: trade.paymentTerms,
      acceptedAt: trade.acceptedAt.toISOString(),
      createdAt: trade.createdAt.toISOString(),
      acceptedBreakdown: {
        productValue: acceptedVer.productValue,
        idoGrowMarginCommission: acceptedVer.idoGrowMarginCommission,
        inspectionCost: acceptedVer.inspectionCost,
        packagingCost: acceptedVer.packagingCost,
        inlandTransportCost: acceptedVer.inlandTransportCost,
        internationalFreightCost: acceptedVer.internationalFreightCost,
        customsCost: acceptedVer.customsCost,
        insuranceCost: acceptedVer.insuranceCost,
        storageCost: acceptedVer.storageCost,
        taxAmount: acceptedVer.taxAmount,
        otherServiceFees: acceptedVer.otherServiceFees,
      },
      commercialNotes: acceptedVer.commercialNotes ?? null,
      validUntil: acceptedVer.validUntil
        ? new Date(acceptedVer.validUntil).toISOString()
        : null,
      buyerAddress: trade.buyerOrganisation?.address ?? null,
      buyerCity: trade.buyerOrganisation?.city ?? null,
      buyerCountry: trade.buyerOrganisation?.country ?? null,
      supplierAddress: trade.supplierOrganisation?.address ?? null,
      supplierCity: trade.supplierOrganisation?.city ?? null,
      supplierCountry: trade.supplierOrganisation?.country ?? null,
      listingTitle: trade.listing?.title ?? null,
      latestInspection: trade.inspections?.[0]
        ? {
            id: trade.inspections[0].id,
            inspectionReference: trade.inspections[0].inspectionReference,
            status: trade.inspections[0].status,
            inspectionMethod: trade.inspections[0].inspectionMethod,
            assignedInspectorEmail:
              trade.inspections[0].assignedInspectorUser?.email ?? null,
            completedAt: trade.inspections[0].completedAt
              ? new Date(trade.inspections[0].completedAt).toISOString()
              : null,
            evidenceCount: trade.inspections[0].evidence?.length ?? 0,
            assessmentStatus: trade.inspections[0].assessmentStatus ?? "NOT_ASSESSED",
            openNonConformitiesCount: (trade.inspections[0].nonConformities || []).filter(
              (nc: { status: string }) => nc.status === "OPEN",
            ).length,
            physicalInspectionRequired: Boolean(trade.inspections[0].physicalInspectionRequired),
            qualityDecision: (trade.inspections[0].qualityResult?.decision as "APPROVED" | "REJECTED") ?? null,
            classificationLabel: trade.inspections[0].qualityResult?.classificationLabel ?? null,
            certificateNumber: trade.inspections[0].certificate?.certificateNumber ?? null,
            certificateId: trade.inspections[0].certificate?.id ?? null,
          }
        : null,
      inspections: (trade.inspections || []).map((ins) => ({
        id: ins.id,
        inspectionReference: ins.inspectionReference,
        status: ins.status,
        inspectionMethod: ins.inspectionMethod,
        assignedInspectorEmail: ins.assignedInspectorUser?.email ?? null,
        completedAt: ins.completedAt
          ? new Date(ins.completedAt).toISOString()
          : null,
      })),
    };
  }

  private async assertTraderAccess(userId: string): Promise<void> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    const isTrader = memberships?.some(
      (m) => m.organisation.organisationType.toUpperCase() === "TRADER",
    );

    if (!isTrader) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/trades/trader-access-required",
        title: "Trader Access Required",
        status: 403,
        detail: "Only authenticated Trader organisations can view trades.",
      });
    }
  }

  private async assertBuyerAccess(userId: string): Promise<string> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    const buyerMembership = memberships?.find(
      (m) => m.organisation.organisationType.toUpperCase() === "BUYER",
    );

    if (!buyerMembership) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/trades/buyer-access-required",
        title: "Buyer Access Required",
        status: 403,
        detail: "Only authenticated Buyer organisations can access Buyer trades.",
      });
    }

    return buyerMembership.organisationId;
  }
}
