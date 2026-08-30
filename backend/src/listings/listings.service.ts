import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";

import { AuditEventWriter } from "../audit";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import {
  APPROVED_LISTING_STATUSES,
  APPROVED_MATERIAL_TYPES,
  APPROVED_PRICE_UNITS,
  APPROVED_PRODUCT_FORMS,
  APPROVED_QUANTITY_UNITS,
  type CreateListingInput,
  type ListingCollection,
  type ListingSummary,
  type UpdateListingInput,
} from "./contracts";
import { type ListingRecord, ListingsRepository } from "./listings.repository";

@Injectable()
export class ListingsService {
  constructor(
    private readonly repository: ListingsRepository,
    private readonly organisationsRepository: OrganisationsRepository,
    private readonly auditEvents: AuditEventWriter,
  ) {}

  async listListings(
    userId: string,
    organisationId: string,
  ): Promise<ListingCollection> {
    await this.assertOrganisationMembership(userId, organisationId);
    const records =
      await this.repository.findListingsByOrganisationId(organisationId);
    return {
      items: records.map((r) => this.toSummary(r)),
    };
  }

  async getListing(
    userId: string,
    organisationId: string,
    listingId: string,
  ): Promise<ListingSummary> {
    await this.assertOrganisationMembership(userId, organisationId);
    const record = await this.repository.findListingById(
      organisationId,
      listingId,
    );
    if (!record) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/listings/not-found",
        title: "Listing Not Found",
        status: 404,
        detail: "The requested listing does not exist for this organisation.",
      });
    }
    return this.toSummary(record);
  }

  async createListing(
    userId: string,
    organisationId: string,
    input: CreateListingInput,
  ): Promise<ListingSummary> {
    await this.assertOrganisationMembership(userId, organisationId);
    this.validateCreateInput(input);

    if (input.siteId) {
      const site = await this.organisationsRepository.findSiteById(
        organisationId,
        input.siteId,
      );
      if (!site) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/listings/invalid-site",
          title: "Invalid Site",
          status: 400,
          detail: "The specified production site does not belong to this organisation.",
        });
      }
    }

    const record = await this.repository.createListing(organisationId, {
      ...input,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      originCountry: input.originCountry?.trim() || null,
    });

    await this.auditEvents.append({
      eventType: "organisation.listing.created",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "listing", id: record.id },
      correlationId: randomUUID(),
      occurredAt: record.createdAt,
      metadata: {
        organisationId,
        title: record.title,
        materialType: record.materialType,
      },
    });

    return this.toSummary(record);
  }

  async updateListing(
    userId: string,
    organisationId: string,
    listingId: string,
    input: UpdateListingInput,
  ): Promise<ListingSummary> {
    await this.assertOrganisationMembership(userId, organisationId);
    this.validateUpdateInput(input);

    if (input.siteId) {
      const site = await this.organisationsRepository.findSiteById(
        organisationId,
        input.siteId,
      );
      if (!site) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/listings/invalid-site",
          title: "Invalid Site",
          status: 400,
          detail: "The specified production site does not belong to this organisation.",
        });
      }
    }

    const existing = await this.repository.findListingById(
      organisationId,
      listingId,
    );
    if (!existing) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/listings/not-found",
        title: "Listing Not Found",
        status: 404,
        detail: "The requested listing does not exist for this organisation.",
      });
    }

    const updated = await this.repository.updateListing(
      organisationId,
      listingId,
      {
        ...input,
        title: input.title ? input.title.trim() : undefined,
        description:
          input.description !== undefined
            ? input.description?.trim() || null
            : undefined,
        originCountry:
          input.originCountry !== undefined
            ? input.originCountry?.trim() || null
            : undefined,
      },
    );

    if (!updated) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/listings/not-found",
        title: "Listing Not Found",
        status: 404,
        detail: "The requested listing does not exist for this organisation.",
      });
    }

    await this.auditEvents.append({
      eventType: "organisation.listing.updated",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "listing", id: updated.id },
      correlationId: randomUUID(),
      occurredAt: updated.updatedAt,
      metadata: {
        organisationId,
        title: updated.title,
        status: updated.status,
      },
    });

    return this.toSummary(updated);
  }

  private async assertOrganisationMembership(
    userId: string,
    organisationId: string,
  ): Promise<void> {
    const membership = await this.organisationsRepository.findMembership(
      userId,
      organisationId,
    );
    if (!membership) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/organisations/membership-required",
        title: "Membership Required",
        status: 403,
        detail: "User is not a member of the requested organisation.",
      });
    }
  }

  private validateCreateInput(input: CreateListingInput): void {
    if (!input.title || input.title.trim().length === 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-title",
        title: "Invalid Title",
        status: 400,
        detail: "Listing title is required.",
      });
    }
    if (input.title.trim().length > 200) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-title",
        title: "Invalid Title",
        status: 400,
        detail: "Listing title cannot exceed 200 characters.",
      });
    }
    if (
      !input.materialType ||
      !APPROVED_MATERIAL_TYPES.includes(input.materialType)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-material-type",
        title: "Invalid Material Type",
        status: 400,
        detail: `Material type must be one of: ${APPROVED_MATERIAL_TYPES.join(", ")}`,
      });
    }
    if (
      input.productForm &&
      !APPROVED_PRODUCT_FORMS.includes(input.productForm)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-product-form",
        title: "Invalid Product Form",
        status: 400,
        detail: `Product form must be one of: ${APPROVED_PRODUCT_FORMS.join(", ")}`,
      });
    }
    if (
      typeof input.quantity !== "number" ||
      Number.isNaN(input.quantity) ||
      input.quantity <= 0
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-quantity",
        title: "Invalid Quantity",
        status: 400,
        detail: "Quantity must be a positive number.",
      });
    }
    if (
      input.quantityUnit &&
      !APPROVED_QUANTITY_UNITS.includes(input.quantityUnit)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-quantity-unit",
        title: "Invalid Quantity Unit",
        status: 400,
        detail: `Quantity unit must be one of: ${APPROVED_QUANTITY_UNITS.join(", ")}`,
      });
    }
    if (
      input.priceAmount !== undefined &&
      input.priceAmount !== null &&
      (typeof input.priceAmount !== "number" ||
        Number.isNaN(input.priceAmount) ||
        input.priceAmount < 0)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-price",
        title: "Invalid Price",
        status: 400,
        detail: "Price amount must be a non-negative number.",
      });
    }
    if (input.priceUnit && !APPROVED_PRICE_UNITS.includes(input.priceUnit)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-price-unit",
        title: "Invalid Price Unit",
        status: 400,
        detail: `Price unit must be one of: ${APPROVED_PRICE_UNITS.join(", ")}`,
      });
    }
    if (input.status && !APPROVED_LISTING_STATUSES.includes(input.status)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-status",
        title: "Invalid Status",
        status: 400,
        detail: `Status must be one of: ${APPROVED_LISTING_STATUSES.join(", ")}`,
      });
    }
    if (
      input.harvestYear !== undefined &&
      input.harvestYear !== null &&
      (!Number.isInteger(input.harvestYear) ||
        input.harvestYear < 2000 ||
        input.harvestYear > 2100)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-harvest-year",
        title: "Invalid Harvest Year",
        status: 400,
        detail: "Harvest year must be a valid 4-digit year between 2000 and 2100.",
      });
    }
  }

  private validateUpdateInput(input: UpdateListingInput): void {
    if (input.title !== undefined) {
      if (input.title.trim().length === 0) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/listings/invalid-title",
          title: "Invalid Title",
          status: 400,
          detail: "Listing title cannot be empty.",
        });
      }
      if (input.title.trim().length > 200) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/listings/invalid-title",
          title: "Invalid Title",
          status: 400,
          detail: "Listing title cannot exceed 200 characters.",
        });
      }
    }
    if (
      input.materialType !== undefined &&
      !APPROVED_MATERIAL_TYPES.includes(input.materialType)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-material-type",
        title: "Invalid Material Type",
        status: 400,
        detail: `Material type must be one of: ${APPROVED_MATERIAL_TYPES.join(", ")}`,
      });
    }
    if (
      input.productForm !== undefined &&
      input.productForm !== null &&
      !APPROVED_PRODUCT_FORMS.includes(input.productForm)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-product-form",
        title: "Invalid Product Form",
        status: 400,
        detail: `Product form must be one of: ${APPROVED_PRODUCT_FORMS.join(", ")}`,
      });
    }
    if (
      input.quantity !== undefined &&
      (typeof input.quantity !== "number" ||
        Number.isNaN(input.quantity) ||
        input.quantity <= 0)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-quantity",
        title: "Invalid Quantity",
        status: 400,
        detail: "Quantity must be a positive number.",
      });
    }
    if (
      input.quantityUnit !== undefined &&
      !APPROVED_QUANTITY_UNITS.includes(input.quantityUnit)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-quantity-unit",
        title: "Invalid Quantity Unit",
        status: 400,
        detail: `Quantity unit must be one of: ${APPROVED_QUANTITY_UNITS.join(", ")}`,
      });
    }
    if (
      input.priceAmount !== undefined &&
      input.priceAmount !== null &&
      (typeof input.priceAmount !== "number" ||
        Number.isNaN(input.priceAmount) ||
        input.priceAmount < 0)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-price",
        title: "Invalid Price",
        status: 400,
        detail: "Price amount must be a non-negative number.",
      });
    }
    if (
      input.priceUnit !== undefined &&
      !APPROVED_PRICE_UNITS.includes(input.priceUnit)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-price-unit",
        title: "Invalid Price Unit",
        status: 400,
        detail: `Price unit must be one of: ${APPROVED_PRICE_UNITS.join(", ")}`,
      });
    }
    if (
      input.status !== undefined &&
      !APPROVED_LISTING_STATUSES.includes(input.status)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-status",
        title: "Invalid Status",
        status: 400,
        detail: `Status must be one of: ${APPROVED_LISTING_STATUSES.join(", ")}`,
      });
    }
    if (
      input.harvestYear !== undefined &&
      input.harvestYear !== null &&
      (!Number.isInteger(input.harvestYear) ||
        input.harvestYear < 2000 ||
        input.harvestYear > 2100)
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/listings/invalid-harvest-year",
        title: "Invalid Harvest Year",
        status: 400,
        detail: "Harvest year must be a valid 4-digit year between 2000 and 2100.",
      });
    }
  }

  private toSummary(record: ListingRecord): ListingSummary {
    return {
      id: record.id,
      organisationId: record.organisationId,
      siteId: record.siteId,
      siteName: record.site?.name ?? null,
      title: record.title,
      description: record.description,
      materialType: record.materialType,
      productForm: record.productForm,
      quantity: record.quantity,
      quantityUnit: record.quantityUnit,
      priceAmount: record.priceAmount,
      currency: record.currency,
      priceUnit: record.priceUnit,
      originCountry: record.originCountry,
      harvestYear: record.harvestYear,
      status: record.status,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
