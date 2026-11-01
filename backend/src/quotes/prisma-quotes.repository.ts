import type { AuditEventDatabaseClient } from "../audit/audit-event.writer";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database";
import type { QuoteStatus } from "./contracts";
import {
  type CreateCounterOfferData,
  type CreateQuoteData,
  type CreateQuoteVersionData,
  type QuoteRecordWithRelations,
  QuotesRepository,
} from "./quotes.repository";

const quoteInclude = {
  buyerOrganisation: { select: { id: true, name: true } },
  supplierOrganisation: { select: { id: true, name: true } },
  buyOrder: {
    select: {
      id: true,
      quantity: true,
      quantityUnit: true,
      materialType: true,
      productForm: true,
    },
  },
  listing: {
    select: {
      id: true,
      title: true,
      materialType: true,
      productForm: true,
    },
  },
  createdByUser: { select: { id: true, email: true } },
  versions: {
    orderBy: { versionNumber: "desc" as const },
    include: {
      createdByUser: { select: { id: true, email: true } },
    },
  },
  counterOffers: {
    orderBy: { createdAt: "desc" as const },
    include: {
      buyerOrganisation: { select: { id: true, name: true } },
      createdByUser: { select: { id: true, email: true } },
    },
  },
  trade: true,
};

@Injectable()
export class PrismaQuotesRepository implements QuotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findQuoteById(id: string): Promise<QuoteRecordWithRelations | null> {
    return (await this.prisma.quote.findUnique({
      where: { id },
      include: quoteInclude,
    })) as unknown as QuoteRecordWithRelations | null;
  }

  async findQuoteByMatchId(matchId: string): Promise<QuoteRecordWithRelations | null> {
    return (await this.prisma.quote.findUnique({
      where: { matchId },
      include: quoteInclude,
    })) as unknown as QuoteRecordWithRelations | null;
  }

  async findQuotesByBuyer(
    buyerOrganisationId: string,
    statuses?: QuoteStatus[],
  ): Promise<QuoteRecordWithRelations[]> {
    return (await this.prisma.quote.findMany({
      where: {
        buyerOrganisationId,
        ...(statuses && statuses.length > 0 ? { status: { in: statuses } } : {}),
      },
      include: quoteInclude,
      orderBy: { updatedAt: "desc" },
    })) as unknown as QuoteRecordWithRelations[];
  }

  async createQuote(data: CreateQuoteData): Promise<QuoteRecordWithRelations> {
    return (await this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          quoteNumber: data.quoteNumber,
          matchId: data.matchId,
          buyOrderId: data.buyOrderId,
          listingId: data.listingId,
          buyerOrganisationId: data.buyerOrganisationId,
          supplierOrganisationId: data.supplierOrganisationId,
          createdByUserId: data.createdByUserId,
          currency: data.currency,
          status: "DRAFT",
          currentVersionNumber: 1,
          versions: {
            create: {
              versionNumber: 1,
              productValue: data.breakdown.productValue,
              idoGrowMarginCommission: data.breakdown.idoGrowMarginCommission,
              inspectionCost: data.breakdown.inspectionCost,
              packagingCost: data.breakdown.packagingCost,
              inlandTransportCost: data.breakdown.inlandTransportCost,
              internationalFreightCost: data.breakdown.internationalFreightCost,
              customsCost: data.breakdown.customsCost,
              insuranceCost: data.breakdown.insuranceCost,
              storageCost: data.breakdown.storageCost,
              taxAmount: data.breakdown.taxAmount,
              otherServiceFees: data.breakdown.otherServiceFees,
              totalAmount: data.totalAmount,
              currency: data.currency,
              incoterm: data.incoterm ?? null,
              paymentTerms: data.paymentTerms ?? null,
              validUntil: data.validUntil ?? null,
              commercialNotes: data.commercialNotes ?? null,
              createdByUserId: data.createdByUserId,
            },
          },
        },
        include: quoteInclude,
      });

      return quote;
    })) as unknown as QuoteRecordWithRelations;
  }

  async createQuoteVersion(
    quoteId: string,
    versionNumber: number,
    data: CreateQuoteVersionData,
  ): Promise<QuoteRecordWithRelations> {
    return (await this.prisma.$transaction(async (tx) => {
      await tx.quoteVersion.create({
        data: {
          quoteId,
          versionNumber,
          productValue: data.breakdown.productValue,
          idoGrowMarginCommission: data.breakdown.idoGrowMarginCommission,
          inspectionCost: data.breakdown.inspectionCost,
          packagingCost: data.breakdown.packagingCost,
          inlandTransportCost: data.breakdown.inlandTransportCost,
          internationalFreightCost: data.breakdown.internationalFreightCost,
          customsCost: data.breakdown.customsCost,
          insuranceCost: data.breakdown.insuranceCost,
          storageCost: data.breakdown.storageCost,
          taxAmount: data.breakdown.taxAmount,
          otherServiceFees: data.breakdown.otherServiceFees,
          totalAmount: data.totalAmount,
          currency: data.currency,
          incoterm: data.incoterm ?? null,
          paymentTerms: data.paymentTerms ?? null,
          validUntil: data.validUntil ?? null,
          commercialNotes: data.commercialNotes ?? null,
          createdByUserId: data.createdByUserId,
        },
      });

      const updatedQuote = await tx.quote.update({
        where: { id: quoteId },
        data: {
          currentVersionNumber: versionNumber,
          status: "DRAFT",
          updatedAt: new Date(),
        },
        include: quoteInclude,
      });

      return updatedQuote;
    })) as unknown as QuoteRecordWithRelations;
  }

  async updateQuoteStatus(
    id: string,
    status: QuoteStatus,
  ): Promise<QuoteRecordWithRelations> {
    return (await this.prisma.quote.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: quoteInclude,
    })) as unknown as QuoteRecordWithRelations;
  }

  async sendQuote(
    id: string,
    sentByUserId: string,
    sentVersionNumber: number,
  ): Promise<QuoteRecordWithRelations> {
    return (await this.prisma.quote.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        sentByUserId,
        sentVersionNumber,
        updatedAt: new Date(),
      },
      include: quoteInclude,
    })) as unknown as QuoteRecordWithRelations;
  }

  async acceptQuote(
    id: string,
    acceptedByUserId: string,
    acceptedVersionNumber: number,
    tradeData?: {
      tradeNumber: string;
      matchId: string;
      buyOrderId: string;
      listingId: string;
      buyerOrganisationId: string;
      supplierOrganisationId: string;
      materialType: string;
      productForm: string | null;
      quantity: number;
      quantityUnit: string;
      currency: string;
      acceptedTotalAmount: number;
      incoterm: string | null;
      paymentTerms: string | null;
      acceptedAt: Date;
    },
    onAtomicActions?: (
      database: AuditEventDatabaseClient,
      context: { trade: { id: string; tradeNumber: string }; isFirstAcceptance: boolean },
    ) => Promise<void>,
  ): Promise<QuoteRecordWithRelations> {
    return (await this.prisma.$transaction(async (tx) => {
      const existingQuote = await tx.quote.findUnique({
        where: { id },
        include: quoteInclude,
      });

      if (!existingQuote) {
        throw new NotFoundException({
          type: "https://errors.idogrow.com/quotes/not-found",
          title: "Quote Not Found",
          status: 404,
          detail: `Quote with ID ${id} not found.`,
        });
      }

      // Idempotency: if already ACCEPTED, return existing without re-executing trade creation or audit
      if (existingQuote.status === "ACCEPTED") {
        const existingTrade = await tx.trade.findUnique({
          where: { quoteId: id },
        });

        if (existingTrade) {
          return existingQuote as unknown as QuoteRecordWithRelations;
        }
      }

      if (existingQuote.status !== "SENT") {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/quotes/invalid-transition",
          title: "Invalid Status Transition",
          status: 400,
          detail: `Only SENT quotes can be accepted. Current status: ${existingQuote.status}.`,
        });
      }

      // Atomic status guard: update status where status = SENT
      const updateResult = await tx.quote.updateMany({
        where: {
          id,
          status: "SENT",
        },
        data: {
          status: "ACCEPTED",
          acceptedAt: tradeData?.acceptedAt ?? new Date(),
          acceptedByUserId,
          acceptedVersionNumber,
          updatedAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        // Concurrent acceptance race
        const recheck = await tx.quote.findUnique({
          where: { id },
          include: quoteInclude,
        });
        if (recheck?.status === "ACCEPTED" && recheck.trade) {
          return recheck as unknown as QuoteRecordWithRelations;
        }
        throw new BadRequestException({
          type: "https://errors.idogrow.com/quotes/invalid-transition",
          title: "Invalid Status Transition",
          status: 400,
          detail: `Could not transition quote ${id} from status ${existingQuote.status} to ACCEPTED.`,
        });
      }

      let createdTrade: { id: string; tradeNumber: string } | null = null;

      if (tradeData) {
        const existingTrade = await tx.trade.findUnique({
          where: { quoteId: id },
        });

        if (!existingTrade) {
          const tradeRow = await tx.trade.create({
            data: {
              tradeNumber: tradeData.tradeNumber,
              quoteId: id,
              acceptedQuoteVersionNumber: acceptedVersionNumber,
              matchId: tradeData.matchId,
              buyOrderId: tradeData.buyOrderId,
              listingId: tradeData.listingId,
              buyerOrganisationId: tradeData.buyerOrganisationId,
              supplierOrganisationId: tradeData.supplierOrganisationId,
              createdByUserId: acceptedByUserId,
              materialType: tradeData.materialType,
              productForm: tradeData.productForm,
              quantity: tradeData.quantity,
              quantityUnit: tradeData.quantityUnit,
              currency: tradeData.currency,
              acceptedTotalAmount: tradeData.acceptedTotalAmount,
              incoterm: tradeData.incoterm,
              paymentTerms: tradeData.paymentTerms,
              acceptedAt: tradeData.acceptedAt,
            },
          });
          createdTrade = { id: tradeRow.id, tradeNumber: tradeRow.tradeNumber };
        } else {
          createdTrade = { id: existingTrade.id, tradeNumber: existingTrade.tradeNumber };
        }
      }

      // Execute atomic actions (such as audit persistence) inside the exact same transaction
      if (onAtomicActions && createdTrade) {
        await onAtomicActions(tx as unknown as AuditEventDatabaseClient, {
          trade: createdTrade,
          isFirstAcceptance: true,
        });
      }

      // Re-fetch to guarantee trade relation is loaded
      return (await tx.quote.findUnique({
        where: { id },
        include: quoteInclude,
      })) as unknown as QuoteRecordWithRelations;
    })) as unknown as QuoteRecordWithRelations;
  }

  async rejectQuote(
    id: string,
    rejectedByUserId: string,
    rejectionReason?: string | null,
  ): Promise<QuoteRecordWithRelations> {
    return (await this.prisma.quote.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectedByUserId,
        rejectionReason: rejectionReason ?? null,
        updatedAt: new Date(),
      },
      include: quoteInclude,
    })) as unknown as QuoteRecordWithRelations;
  }

  async createCounterOffer(
    data: CreateCounterOfferData,
  ): Promise<QuoteRecordWithRelations> {
    return (await this.prisma.$transaction(async (tx) => {
      await tx.quoteCounterOffer.create({
        data: {
          quoteId: data.quoteId,
          sourceVersionNumber: data.sourceVersionNumber,
          buyerOrganisationId: data.buyerOrganisationId,
          createdByUserId: data.createdByUserId,
          proposedProductValue: data.proposedProductValue ?? null,
          proposedTotalAmount: data.proposedTotalAmount ?? null,
          proposedIncoterm: data.proposedIncoterm ?? null,
          proposedPaymentTerms: data.proposedPaymentTerms ?? null,
          buyerNote: data.buyerNote,
        },
      });

      const updated = await tx.quote.update({
        where: { id: data.quoteId },
        data: {
          status: "COUNTERED",
          updatedAt: new Date(),
        },
        include: quoteInclude,
      });

      return updated;
    })) as unknown as QuoteRecordWithRelations;
  }
}
