import { Injectable } from "@nestjs/common";

import { PrismaService } from "../database";
import type { CreateListingInput, UpdateListingInput } from "./contracts";
import { type ListingRecord, ListingsRepository } from "./listings.repository";

@Injectable()
export class PrismaListingsRepository extends ListingsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findListingsByOrganisationId(
    organisationId: string,
  ): Promise<ListingRecord[]> {
    const records = await this.prisma.listing.findMany({
      where: { organisationId },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return records.map((r) => ({
      id: r.id,
      organisationId: r.organisationId,
      siteId: r.siteId,
      site: r.site,
      title: r.title,
      description: r.description,
      materialType: r.materialType,
      productForm: r.productForm,
      quantity: r.quantity,
      quantityUnit: r.quantityUnit,
      priceAmount: r.priceAmount,
      currency: r.currency,
      priceUnit: r.priceUnit,
      originCountry: r.originCountry,
      harvestYear: r.harvestYear,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async findListingById(
    organisationId: string,
    listingId: string,
  ): Promise<ListingRecord | null> {
    const record = await this.prisma.listing.findFirst({
      where: {
        id: listingId,
        organisationId,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      organisationId: record.organisationId,
      siteId: record.siteId,
      site: record.site,
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
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async createListing(
    organisationId: string,
    input: CreateListingInput,
  ): Promise<ListingRecord> {
    const record = await this.prisma.listing.create({
      data: {
        organisationId,
        siteId: input.siteId ?? null,
        title: input.title,
        description: input.description ?? null,
        materialType: input.materialType,
        productForm: input.productForm ?? null,
        quantity: input.quantity,
        quantityUnit: input.quantityUnit ?? "TONNES",
        priceAmount: input.priceAmount !== undefined ? input.priceAmount : null,
        currency: input.currency ?? "EUR",
        priceUnit: input.priceUnit ?? "PER_TONNE",
        originCountry: input.originCountry ?? null,
        harvestYear: input.harvestYear ?? null,
        status: input.status ?? "DRAFT",
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: record.id,
      organisationId: record.organisationId,
      siteId: record.siteId,
      site: record.site,
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
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async updateListing(
    organisationId: string,
    listingId: string,
    input: UpdateListingInput,
  ): Promise<ListingRecord | null> {
    const existing = await this.prisma.listing.findFirst({
      where: {
        id: listingId,
        organisationId,
      },
    });

    if (!existing) {
      return null;
    }

    const record = await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        title: input.title !== undefined ? input.title : undefined,
        description:
          input.description !== undefined ? input.description : undefined,
        materialType:
          input.materialType !== undefined ? input.materialType : undefined,
        productForm:
          input.productForm !== undefined ? input.productForm : undefined,
        quantity: input.quantity !== undefined ? input.quantity : undefined,
        quantityUnit:
          input.quantityUnit !== undefined ? input.quantityUnit : undefined,
        priceAmount:
          input.priceAmount !== undefined ? input.priceAmount : undefined,
        currency: input.currency !== undefined ? input.currency : undefined,
        priceUnit: input.priceUnit !== undefined ? input.priceUnit : undefined,
        originCountry:
          input.originCountry !== undefined ? input.originCountry : undefined,
        harvestYear:
          input.harvestYear !== undefined ? input.harvestYear : undefined,
        siteId: input.siteId !== undefined ? input.siteId : undefined,
        status: input.status !== undefined ? input.status : undefined,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: record.id,
      organisationId: record.organisationId,
      siteId: record.siteId,
      site: record.site,
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
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
