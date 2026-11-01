import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { AuditEventWriter } from "../audit/audit-event.writer";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import {
  APPROVED_MATERIAL_TYPES,
  APPROVED_PRODUCT_FORMS,
  APPROVED_QUANTITY_UNITS,
  APPROVED_TARGET_PRICE_UNITS,
  type BuyOrderCollection,
  type BuyOrderDetail,
  type BuyOrderQuery,
  type BuyOrderStatus,
  type BuyOrderSummary,
  type CreateBuyOrderInput,
  type TraderDemandCollection,
  type UpdateBuyOrderInput,
} from "./contracts";
import {
  type BuyOrderRecord,
  BuyOrdersRepository,
} from "./buy-orders.repository";

@Injectable()
export class BuyOrdersService {
  constructor(
    private readonly organisationsRepository: OrganisationsRepository,
    private readonly buyOrdersRepository: BuyOrdersRepository,
    private readonly auditEventWriter: AuditEventWriter,
  ) {}

  private async assertBuyerAccess(
    userId: string,
    buyerOrganisationId?: string,
  ): Promise<{ buyerOrgId: string; isTrader: boolean }> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    if (!memberships || memberships.length === 0) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/buy-orders/access-denied",
        title: "Forbidden",
        status: 403,
        detail: "User does not belong to any organisation.",
      });
    }

    const isTrader = memberships.some(
      (m) => m.organisation.organisationType.toUpperCase() === "TRADER",
    );

    const buyerMemberships = memberships.filter((m) => {
      const orgType = m.organisation.organisationType.toUpperCase();
      return orgType === "BUYER" || orgType === "TRADER";
    });

    if (buyerMemberships.length === 0) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/buy-orders/access-denied",
        title: "Forbidden",
        status: 403,
        detail: "Buy Order access is reserved for Buyers and Traders.",
      });
    }

    if (buyerOrganisationId) {
      if (isTrader) {
        const targetOrg =
          await this.organisationsRepository.findOrganisationById(
            buyerOrganisationId,
          );
        if (!targetOrg) {
          throw new NotFoundException(
            `Organisation with ID ${buyerOrganisationId} not found.`,
          );
        }
        if (targetOrg.organisationType.toUpperCase() !== "BUYER") {
          throw new BadRequestException(
            "Trader can only create or manage Buy Orders on behalf of Buyer organisations.",
          );
        }
        return { buyerOrgId: buyerOrganisationId, isTrader };
      }

      const match = buyerMemberships.find(
        (m) => m.organisationId === buyerOrganisationId,
      );
      if (!match) {
        throw new ForbiddenException({
          type: "https://errors.idogrow.com/buy-orders/tenant-mismatch",
          title: "Forbidden",
          status: 403,
          detail: "User does not have access to this Buyer organisation.",
        });
      }
      return { buyerOrgId: buyerOrganisationId, isTrader };
    }

    if (isTrader) {
      throw new BadRequestException(
        "Target Buyer organisation must be specified when Trader creates or manages Buy Orders.",
      );
    }

    return { buyerOrgId: buyerMemberships[0].organisationId, isTrader };
  }

  private async assertTraderAccess(userId: string): Promise<void> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    const isTrader = memberships?.some(
      (m) => m.organisation.organisationType.toUpperCase() === "TRADER",
    );

    if (!isTrader) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/buy-orders/trader-access-required",
        title: "Forbidden",
        status: 403,
        detail: "Cross-organisation demand review is reserved for Traders.",
      });
    }
  }

  private validateCreateInput(input: CreateBuyOrderInput): void {
    if (!input.materialType || !APPROVED_MATERIAL_TYPES.includes(input.materialType)) {
      throw new BadRequestException(
        `Invalid material type. Allowed values: ${APPROVED_MATERIAL_TYPES.join(", ")}`,
      );
    }

    if (
      input.productForm &&
      !APPROVED_PRODUCT_FORMS.includes(input.productForm)
    ) {
      throw new BadRequestException(
        `Invalid product form. Allowed values: ${APPROVED_PRODUCT_FORMS.join(", ")}`,
      );
    }

    if (typeof input.quantity !== "number" || input.quantity <= 0) {
      throw new BadRequestException("Quantity must be a positive number.");
    }

    if (
      input.quantityUnit &&
      !APPROVED_QUANTITY_UNITS.includes(input.quantityUnit)
    ) {
      throw new BadRequestException(
        `Invalid quantity unit. Allowed values: ${APPROVED_QUANTITY_UNITS.join(", ")}`,
      );
    }

    if (
      input.targetPriceAmount !== undefined &&
      input.targetPriceAmount !== null &&
      (typeof input.targetPriceAmount !== "number" || input.targetPriceAmount <= 0)
    ) {
      throw new BadRequestException("Target price must be a positive number.");
    }

    if (
      input.targetPriceUnit &&
      !APPROVED_TARGET_PRICE_UNITS.includes(input.targetPriceUnit)
    ) {
      throw new BadRequestException(
        `Invalid target price unit. Allowed values: ${APPROVED_TARGET_PRICE_UNITS.join(", ")}`,
      );
    }
  }

  async createBuyOrder(
    userId: string,
    buyerOrganisationId: string,
    input: CreateBuyOrderInput,
  ): Promise<BuyOrderDetail> {
    const { buyerOrgId } = await this.assertBuyerAccess(
      userId,
      buyerOrganisationId && buyerOrganisationId.trim() !== ""
        ? buyerOrganisationId
        : undefined,
    );
    this.validateCreateInput(input);

    const initialStatus: BuyOrderStatus = input.submitDirectly ? "OPEN" : "DRAFT";

    const record = await this.buyOrdersRepository.createBuyOrder(
      buyerOrgId,
      userId,
      input,
      initialStatus,
    );

    const correlationId = randomUUID();
    const occurredAt = new Date();

    await this.auditEventWriter.append({
      eventType: "buyer.buy_order.created",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "buy_order", id: record.id },
      correlationId,
      occurredAt,
      metadata: {
        buyerOrganisationId: buyerOrgId,
        materialType: record.materialType,
        status: initialStatus,
      },
    });

    if (initialStatus === "OPEN") {
      await this.auditEventWriter.append({
        eventType: "buyer.buy_order.submitted",
        outcome: "succeeded",
        actor: { type: "user", userId },
        target: { type: "buy_order", id: record.id },
        correlationId: randomUUID(),
        occurredAt: new Date(),
        metadata: {
          buyerOrganisationId: buyerOrgId,
          previousStatus: "DRAFT",
          newStatus: "OPEN",
        },
      });
    }

    return this.mapToDetail(record);
  }

  async listBuyOrders(
    userId: string,
    buyerOrganisationId: string,
    query?: BuyOrderQuery,
  ): Promise<BuyOrderCollection> {
    const { buyerOrgId } = await this.assertBuyerAccess(
      userId,
      buyerOrganisationId && buyerOrganisationId.trim() !== ""
        ? buyerOrganisationId
        : undefined,
    );

    const { items, total } =
      await this.buyOrdersRepository.findBuyOrdersForOrganisation(
        buyerOrgId,
        query,
      );

    return {
      items: items.map((r) => this.mapToSummary(r)),
      total,
    };
  }

  async getBuyOrder(
    userId: string,
    buyOrderId: string,
  ): Promise<BuyOrderDetail> {
    const record = await this.buyOrdersRepository.findBuyOrderById(buyOrderId);

    if (!record) {
      throw new NotFoundException(`Buy Order with ID ${buyOrderId} not found.`);
    }

    await this.assertBuyerAccess(userId, record.buyerOrganisationId);

    return this.mapToDetail(record);
  }

  async updateBuyOrder(
    userId: string,
    buyOrderId: string,
    input: UpdateBuyOrderInput,
  ): Promise<BuyOrderDetail> {
    const existing = await this.buyOrdersRepository.findBuyOrderById(buyOrderId);

    if (!existing) {
      throw new NotFoundException(`Buy Order with ID ${buyOrderId} not found.`);
    }

    await this.assertBuyerAccess(userId, existing.buyerOrganisationId);

    if (existing.status !== "DRAFT") {
      throw new BadRequestException(
        `Only DRAFT buy orders can be edited. Current status is ${existing.status}.`,
      );
    }

    if (
      input.materialType &&
      !APPROVED_MATERIAL_TYPES.includes(input.materialType)
    ) {
      throw new BadRequestException(
        `Invalid material type. Allowed values: ${APPROVED_MATERIAL_TYPES.join(", ")}`,
      );
    }

    if (
      input.productForm &&
      !APPROVED_PRODUCT_FORMS.includes(input.productForm)
    ) {
      throw new BadRequestException(
        `Invalid product form. Allowed values: ${APPROVED_PRODUCT_FORMS.join(", ")}`,
      );
    }

    if (
      input.quantity !== undefined &&
      (typeof input.quantity !== "number" || input.quantity <= 0)
    ) {
      throw new BadRequestException("Quantity must be a positive number.");
    }

    if (
      input.quantityUnit &&
      !APPROVED_QUANTITY_UNITS.includes(input.quantityUnit)
    ) {
      throw new BadRequestException(
        `Invalid quantity unit. Allowed values: ${APPROVED_QUANTITY_UNITS.join(", ")}`,
      );
    }

    if (
      input.targetPriceAmount !== undefined &&
      input.targetPriceAmount !== null &&
      (typeof input.targetPriceAmount !== "number" || input.targetPriceAmount <= 0)
    ) {
      throw new BadRequestException("Target price must be a positive number.");
    }

    if (
      input.targetPriceUnit &&
      !APPROVED_TARGET_PRICE_UNITS.includes(input.targetPriceUnit)
    ) {
      throw new BadRequestException(
        `Invalid target price unit. Allowed values: ${APPROVED_TARGET_PRICE_UNITS.join(", ")}`,
      );
    }

    const updated = await this.buyOrdersRepository.updateBuyOrder(
      buyOrderId,
      input,
    );

    await this.auditEventWriter.append({
      eventType: "buyer.buy_order.updated",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "buy_order", id: buyOrderId },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        buyerOrganisationId: existing.buyerOrganisationId,
        materialType: updated.materialType,
        status: updated.status,
      },
    });

    return this.mapToDetail(updated);
  }

  async submitBuyOrder(
    userId: string,
    buyOrderId: string,
  ): Promise<BuyOrderDetail> {
    const existing = await this.buyOrdersRepository.findBuyOrderById(buyOrderId);

    if (!existing) {
      throw new NotFoundException(`Buy Order with ID ${buyOrderId} not found.`);
    }

    await this.assertBuyerAccess(userId, existing.buyerOrganisationId);

    if (existing.status !== "DRAFT") {
      throw new BadRequestException(
        `Only DRAFT buy orders can be submitted. Current status is ${existing.status}.`,
      );
    }

    const updated = await this.buyOrdersRepository.updateStatus(
      buyOrderId,
      "OPEN",
    );

    await this.auditEventWriter.append({
      eventType: "buyer.buy_order.submitted",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "buy_order", id: buyOrderId },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        buyerOrganisationId: existing.buyerOrganisationId,
        previousStatus: "DRAFT",
        newStatus: "OPEN",
      },
    });

    return this.mapToDetail(updated);
  }

  async cancelBuyOrder(
    userId: string,
    buyOrderId: string,
  ): Promise<BuyOrderDetail> {
    const existing = await this.buyOrdersRepository.findBuyOrderById(buyOrderId);

    if (!existing) {
      throw new NotFoundException(`Buy Order with ID ${buyOrderId} not found.`);
    }

    await this.assertBuyerAccess(userId, existing.buyerOrganisationId);

    if (existing.status === "CANCELLED") {
      throw new BadRequestException("Buy Order is already cancelled.");
    }

    const previousStatus = existing.status;
    const updated = await this.buyOrdersRepository.updateStatus(
      buyOrderId,
      "CANCELLED",
    );

    await this.auditEventWriter.append({
      eventType: "buyer.buy_order.cancelled",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "buy_order", id: buyOrderId },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        buyerOrganisationId: existing.buyerOrganisationId,
        previousStatus,
        newStatus: "CANCELLED",
      },
    });

    return this.mapToDetail(updated);
  }

  async deleteBuyOrder(userId: string, buyOrderId: string): Promise<void> {
    const existing = await this.buyOrdersRepository.findBuyOrderById(buyOrderId);

    if (!existing) {
      throw new NotFoundException(`Buy Order with ID ${buyOrderId} not found.`);
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestException(
        `Only DRAFT buy orders can be deleted. Current status is ${existing.status}.`,
      );
    }

    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    const isTrader = memberships.some(
      (m) => m.organisation?.organisationType.toUpperCase() === "TRADER",
    );

    const isBuyerMember = memberships.some(
      (m) =>
        m.organisationId === existing.buyerOrganisationId &&
        m.organisation?.organisationType.toUpperCase() === "BUYER",
    );

    if (isTrader) {
      if (existing.createdByUserId !== userId) {
        throw new ForbiddenException({
          type: "https://errors.idogrow.com/buy-orders/forbidden",
          title: "Forbidden",
          status: 403,
          detail:
            "Traders can only delete draft buy orders created by themselves on behalf of buyers.",
        });
      }
    } else if (!isBuyerMember) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/buy-orders/forbidden",
        title: "Forbidden",
        status: 403,
        detail: "You do not have permission to delete this draft buy order.",
      });
    }

    await this.buyOrdersRepository.deleteBuyOrder(buyOrderId);

    await this.auditEventWriter.append({
      eventType: "buyer.buy_order.deleted",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "buy_order", id: buyOrderId },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        buyerOrganisationId: existing.buyerOrganisationId,
        deletedStatus: "DRAFT",
      },
    });
  }

  async listTraderDemand(
    userId: string,
    query?: BuyOrderQuery,
  ): Promise<TraderDemandCollection> {
    await this.assertTraderAccess(userId);

    const { items, total } =
      await this.buyOrdersRepository.findOpenBuyOrdersForTrader(query);

    return {
      items: items.map((item) => ({
        ...this.mapToDetail(item),
        buyerOrganisation: item.buyerOrganisation ?? {
          id: item.buyerOrganisationId,
          name: "Unknown Buyer Organisation",
          country: null,
          verificationStatus: "PENDING",
        },
      })),
      total,
    };
  }

  async listBuyerOrganisationsForTrader(
    userId: string,
  ): Promise<{
    items: Array<{
      id: string;
      name: string;
      country: string | null;
      verificationStatus: string;
    }>;
  }> {
    await this.assertTraderAccess(userId);

    const orgs =
      await this.organisationsRepository.findOrganisationsByType("BUYER");

    return {
      items: orgs.map((o) => ({
        id: o.id,
        name: o.name,
        country: o.country,
        verificationStatus: o.verificationStatus,
      })),
    };
  }

  async listTraderDrafts(
    userId: string,
    query?: BuyOrderQuery,
  ): Promise<TraderDemandCollection> {
    await this.assertTraderAccess(userId);

    const { items, total } =
      await this.buyOrdersRepository.findDraftBuyOrdersForTrader(userId, query);

    return {
      items: items.map((item) => ({
        ...this.mapToDetail(item),
        buyerOrganisation: item.buyerOrganisation ?? {
          id: item.buyerOrganisationId,
          name: "Unknown Buyer Organisation",
          country: null,
          verificationStatus: "PENDING",
        },
      })),
      total,
    };
  }

  private mapToSummary(record: BuyOrderRecord): BuyOrderSummary {
    return {
      id: record.id,
      buyerOrganisationId: record.buyerOrganisationId,
      buyerOrganisationName: record.buyerOrganisation?.name,
      materialType: record.materialType,
      productForm: record.productForm,
      quantity: record.quantity,
      quantityUnit: record.quantityUnit,
      deliveryCountry: record.deliveryCountry,
      deliveryDestination: record.deliveryDestination,
      requestedDeliveryDate: record.requestedDeliveryDate
        ? record.requestedDeliveryDate.toISOString()
        : null,
      targetPriceAmount: record.targetPriceAmount,
      currency: record.currency,
      targetPriceUnit: record.targetPriceUnit,
      status: record.status as BuyOrderStatus,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private mapToDetail(record: BuyOrderRecord): BuyOrderDetail {
    return {
      ...this.mapToSummary(record),
      acceptableOriginCountries: record.acceptableOriginCountries,
      qualityRequirements: record.qualityRequirements,
      packagingRequirements: record.packagingRequirements,
      certificationRequirements: record.certificationRequirements,
      transportPreferences: record.transportPreferences,
      paymentTerms: record.paymentTerms,
      createdByUserId: record.createdByUserId,
    };
  }
}
