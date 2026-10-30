import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database";

@Injectable()
export class AiContextRetrieverService {
  constructor(private readonly prisma: PrismaService) {}

  async retrieveContextForResource(
    resourceType: string,
    resourceId: string,
    userId: string,
  ): Promise<Record<string, unknown>> {
    const normType = resourceType.trim().toLowerCase();

    if (normType === "trade") {
      return this.retrieveTradeContext(resourceId, userId);
    }

    throw new NotFoundException({
      type: "https://errors.idogrow.com/ai/unsupported-context-resource",
      title: "Unsupported Context Resource",
      status: 404,
      detail: `Context retrieval for resource type '${resourceType}' is not supported in Sprint 10.`,
    });
  }

  private async retrieveTradeContext(
    tradeId: string,
    _userId: string,
  ): Promise<Record<string, unknown>> {
    const trade = await this.prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        buyerOrganisation: {
          select: { id: true, name: true, country: true, verificationStatus: true },
        },
        supplierOrganisation: {
          select: { id: true, name: true, country: true, verificationStatus: true },
        },
        buyOrder: {
          select: {
            id: true,
            materialType: true,
            quantity: true,
            quantityUnit: true,
            deliveryCountry: true,
            status: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            materialType: true,
            productForm: true,
            originCountry: true,
            harvestYear: true,
          },
        },
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            status: true,
            currentVersionNumber: true,
          },
        },
      },
    });

    if (!trade) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/trades/trade-not-found",
        title: "Trade Not Found",
        status: 404,
        detail: `Trade record with ID '${tradeId}' does not exist.`,
      });
    }

    // Retrieve associated contract if exists
    const contract = await this.prisma.contract.findUnique({
      where: { tradeId },
      select: {
        id: true,
        contractNumber: true,
        status: true,
        incoterm: true,
        confirmedAt: true,
        storageKey: true,
      },
    });

    // Retrieve associated inspection and quality result if exists
    const inspection = await this.prisma.inspection.findFirst({
      where: { tradeId },
      include: {
        qualityResult: {
          select: {
            id: true,
            decision: true,
            classificationLabel: true,
            decidedAt: true,
          },
        },
        certificate: {
          select: {
            id: true,
            certificateNumber: true,
            issuedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Retrieve associated shipment if exists
    const shipment = contract
      ? await this.prisma.shipment.findFirst({
          where: { contractId: contract.id },
          select: {
            id: true,
            shipmentNumber: true,
            status: true,
            requestedPickupDate: true,
            deliveredAt: true,
          },
          orderBy: { createdAt: "desc" },
        })
      : null;

    // Retrieve associated settlement if exists
    const settlement = await this.prisma.settlement.findUnique({
      where: { tradeId },
      select: {
        id: true,
        currency: true,
        totalCommercialAmount: true,
        depositAmount: true,
        remainingBalance: true,
        paymentStatus: true,
        paymentDueDate: true,
      },
    });

    // Retrieve associated DPP if exists via Listing -> Lot
    const traceableLot = await this.prisma.traceableLot.findFirst({
      where: { listingId: trade.listingId },
      include: {
        dpp: {
          select: {
            id: true,
            passportNumber: true,
            status: true,
            currentVersionNumber: true,
          },
        },
      },
    });

    return {
      trade: {
        id: trade.id,
        tradeNumber: trade.tradeNumber,
        materialType: trade.materialType,
        quantity: trade.quantity,
        quantityUnit: trade.quantityUnit,
        acceptedTotalAmount: trade.acceptedTotalAmount,
        currency: trade.currency,
        buyer: trade.buyerOrganisation,
        supplier: trade.supplierOrganisation,
        createdAt: trade.createdAt.toISOString(),
      },
      contract: contract
        ? {
            id: contract.id,
            contractNumber: contract.contractNumber,
            status: contract.status,
            incoterm: contract.incoterm,
            confirmedAt: contract.confirmedAt?.toISOString() ?? null,
            hasDocument: Boolean(contract.storageKey),
          }
        : null,
      inspection: inspection
        ? {
            id: inspection.id,
            inspectionReference: inspection.inspectionReference,
            status: inspection.status,
            qualityResult: inspection.qualityResult
              ? {
                  id: inspection.qualityResult.id,
                  decision: inspection.qualityResult.decision,
                  classificationLabel: inspection.qualityResult.classificationLabel,
                  decidedAt: inspection.qualityResult.decidedAt.toISOString(),
                }
              : null,
            certificateNumber: inspection.certificate?.certificateNumber ?? null,
          }
        : null,
      shipment: shipment
        ? {
            id: shipment.id,
            shipmentNumber: shipment.shipmentNumber,
            status: shipment.status,
            requestedPickupDate: shipment.requestedPickupDate?.toISOString() ?? null,
            deliveredAt: shipment.deliveredAt?.toISOString() ?? null,
          }
        : null,
      settlement: settlement
        ? {
            id: settlement.id,
            currency: settlement.currency,
            totalCommercialAmount: settlement.totalCommercialAmount,
            remainingBalance: settlement.remainingBalance,
            paymentStatus: settlement.paymentStatus,
            paymentDueDate: settlement.paymentDueDate?.toISOString() ?? null,
          }
        : null,
      dpp: traceableLot?.dpp
        ? {
            id: traceableLot.dpp.id,
            passportNumber: traceableLot.dpp.passportNumber,
            status: traceableLot.dpp.status,
            currentVersionNumber: traceableLot.dpp.currentVersionNumber,
          }
        : null,
    };
  }
}
