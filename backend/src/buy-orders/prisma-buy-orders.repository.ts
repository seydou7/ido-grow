import { Injectable } from "@nestjs/common";
import { type Prisma } from "@prisma/client";

import { PrismaService } from "../database";
import type {
  BuyOrderQuery,
  BuyOrderStatus,
  CreateBuyOrderInput,
  UpdateBuyOrderInput,
} from "./contracts";
import {
  type BuyOrderRecord,
  BuyOrdersRepository,
} from "./buy-orders.repository";

@Injectable()
export class PrismaBuyOrdersRepository extends BuyOrdersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findBuyOrdersForOrganisation(
    buyerOrganisationId: string,
    query?: BuyOrderQuery,
  ): Promise<{ items: BuyOrderRecord[]; total: number }> {
    const where: Prisma.BuyOrderWhereInput = {
      buyerOrganisationId,
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.materialType) {
      where.materialType = query.materialType;
    }

    if (query?.deliveryCountry) {
      where.deliveryCountry = {
        contains: query.deliveryCountry,
        mode: "insensitive",
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.buyOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query?.limit,
        skip: query?.offset,
      }),
      this.prisma.buyOrder.count({ where }),
    ]);

    return { items, total };
  }

  async findBuyOrderById(id: string): Promise<BuyOrderRecord | null> {
    return this.prisma.buyOrder.findUnique({
      where: { id },
      include: {
        buyerOrganisation: {
          select: {
            id: true,
            name: true,
            country: true,
            verificationStatus: true,
          },
        },
      },
    });
  }

  async createBuyOrder(
    buyerOrganisationId: string,
    createdByUserId: string | null,
    input: CreateBuyOrderInput,
    initialStatus: BuyOrderStatus,
  ): Promise<BuyOrderRecord> {
    const deliveryDate = input.requestedDeliveryDate
      ? new Date(input.requestedDeliveryDate)
      : null;

    return this.prisma.buyOrder.create({
      data: {
        buyerOrganisationId,
        createdByUserId,
        materialType: input.materialType,
        productForm: input.productForm ?? null,
        quantity: input.quantity,
        quantityUnit: input.quantityUnit ?? "TONNES",
        deliveryCountry: input.deliveryCountry ?? null,
        deliveryDestination: input.deliveryDestination ?? null,
        requestedDeliveryDate: deliveryDate,
        targetPriceAmount: input.targetPriceAmount ?? null,
        currency: input.currency ?? "EUR",
        targetPriceUnit: input.targetPriceUnit ?? "PER_TONNE",
        acceptableOriginCountries: input.acceptableOriginCountries ?? null,
        qualityRequirements: input.qualityRequirements ?? null,
        packagingRequirements: input.packagingRequirements ?? null,
        certificationRequirements: input.certificationRequirements ?? null,
        transportPreferences: input.transportPreferences ?? null,
        paymentTerms: input.paymentTerms ?? null,
        status: initialStatus,
      },
    });
  }

  async updateBuyOrder(
    id: string,
    input: UpdateBuyOrderInput,
  ): Promise<BuyOrderRecord> {
    const data: Prisma.BuyOrderUpdateInput = {};

    if (input.materialType !== undefined) {
      data.materialType = input.materialType;
    }
    if (input.productForm !== undefined) {
      data.productForm = input.productForm;
    }
    if (input.quantity !== undefined) {
      data.quantity = input.quantity;
    }
    if (input.quantityUnit !== undefined) {
      data.quantityUnit = input.quantityUnit;
    }
    if (input.deliveryCountry !== undefined) {
      data.deliveryCountry = input.deliveryCountry;
    }
    if (input.deliveryDestination !== undefined) {
      data.deliveryDestination = input.deliveryDestination;
    }
    if (input.requestedDeliveryDate !== undefined) {
      data.requestedDeliveryDate = input.requestedDeliveryDate
        ? new Date(input.requestedDeliveryDate)
        : null;
    }
    if (input.targetPriceAmount !== undefined) {
      data.targetPriceAmount = input.targetPriceAmount;
    }
    if (input.currency !== undefined) {
      data.currency = input.currency;
    }
    if (input.targetPriceUnit !== undefined) {
      data.targetPriceUnit = input.targetPriceUnit;
    }
    if (input.acceptableOriginCountries !== undefined) {
      data.acceptableOriginCountries = input.acceptableOriginCountries;
    }
    if (input.qualityRequirements !== undefined) {
      data.qualityRequirements = input.qualityRequirements;
    }
    if (input.packagingRequirements !== undefined) {
      data.packagingRequirements = input.packagingRequirements;
    }
    if (input.certificationRequirements !== undefined) {
      data.certificationRequirements = input.certificationRequirements;
    }
    if (input.transportPreferences !== undefined) {
      data.transportPreferences = input.transportPreferences;
    }
    if (input.paymentTerms !== undefined) {
      data.paymentTerms = input.paymentTerms;
    }

    return this.prisma.buyOrder.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    newStatus: BuyOrderStatus,
  ): Promise<BuyOrderRecord> {
    return this.prisma.buyOrder.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async findOpenBuyOrdersForTrader(
    query?: BuyOrderQuery,
  ): Promise<{ items: BuyOrderRecord[]; total: number }> {
    const where: Prisma.BuyOrderWhereInput = {
      status: "OPEN",
    };

    if (query?.materialType) {
      where.materialType = query.materialType;
    }

    if (query?.deliveryCountry) {
      where.deliveryCountry = {
        contains: query.deliveryCountry,
        mode: "insensitive",
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.buyOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query?.limit,
        skip: query?.offset,
        include: {
          buyerOrganisation: {
            select: {
              id: true,
              name: true,
              country: true,
              verificationStatus: true,
            },
          },
        },
      }),
      this.prisma.buyOrder.count({ where }),
    ]);

    return { items, total };
  }

  async findDraftBuyOrdersForTrader(
    traderUserId: string,
    query?: BuyOrderQuery,
  ): Promise<{ items: BuyOrderRecord[]; total: number }> {
    const where: Prisma.BuyOrderWhereInput = {
      status: "DRAFT",
      createdByUserId: traderUserId,
    };

    if (query?.materialType) {
      where.materialType = query.materialType;
    }

    if (query?.deliveryCountry) {
      where.deliveryCountry = {
        contains: query.deliveryCountry,
        mode: "insensitive",
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.buyOrder.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: query?.limit,
        skip: query?.offset,
        include: {
          buyerOrganisation: {
            select: {
              id: true,
              name: true,
              country: true,
              verificationStatus: true,
            },
          },
        },
      }),
      this.prisma.buyOrder.count({ where }),
    ]);

    return { items, total };
  }

  async deleteBuyOrder(id: string): Promise<void> {
    await this.prisma.buyOrder.delete({
      where: { id },
    });
  }
}
