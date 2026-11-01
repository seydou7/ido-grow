import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../database";
import type { MarketplaceQuery } from "./contracts";
import {
  type MarketplaceListingRecord,
  MarketplaceRepository,
} from "./marketplace.repository";

@Injectable()
export class PrismaMarketplaceRepository extends MarketplaceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findPublishedListings(
    query: MarketplaceQuery,
  ): Promise<{ items: MarketplaceListingRecord[]; total: number }> {
    const where: Prisma.ListingWhereInput = {
      status: "PUBLISHED",
    };

    if (query.materialType && query.materialType !== "ALL") {
      where.materialType = query.materialType;
    }

    if (query.productForm && query.productForm !== "ALL") {
      where.productForm = query.productForm;
    }

    if (query.originCountry && query.originCountry.trim().length > 0) {
      where.originCountry = {
        equals: query.originCountry.trim(),
        mode: "insensitive",
      };
    }

    if (query.harvestYear && !Number.isNaN(Number(query.harvestYear))) {
      where.harvestYear = Number(query.harvestYear);
    }

    if (query.quantityUnit && query.quantityUnit !== "ALL") {
      where.quantityUnit = query.quantityUnit;
    }

    if (
      query.minQuantity !== undefined &&
      !Number.isNaN(Number(query.minQuantity))
    ) {
      where.quantity = {
        ...(typeof where.quantity === "object" ? where.quantity : {}),
        gte: Number(query.minQuantity),
      };
    }

    if (
      query.maxQuantity !== undefined &&
      !Number.isNaN(Number(query.maxQuantity))
    ) {
      where.quantity = {
        ...(typeof where.quantity === "object" ? where.quantity : {}),
        lte: Number(query.maxQuantity),
      };
    }

    if (query.hasPrice === true) {
      where.priceAmount = {
        not: null,
      };
    }

    if (query.priceUnit && query.priceUnit !== "ALL") {
      where.priceUnit = query.priceUnit;
    }

    if (query.minPrice !== undefined && !Number.isNaN(Number(query.minPrice))) {
      where.priceAmount = {
        ...(typeof where.priceAmount === "object" ? where.priceAmount : {}),
        gte: Number(query.minPrice),
      };
    }

    if (query.maxPrice !== undefined && !Number.isNaN(Number(query.maxPrice))) {
      where.priceAmount = {
        ...(typeof where.priceAmount === "object" ? where.priceAmount : {}),
        lte: Number(query.maxPrice),
      };
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { materialType: { contains: term, mode: "insensitive" } },
        { originCountry: { contains: term, mode: "insensitive" } },
      ];
    }

    const [total, records] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          organisation: {
            select: {
              id: true,
              name: true,
              country: true,
              verificationStatus: true,
            },
          },
          site: {
            select: {
              name: true,
              facilityType: true,
              country: true,
              city: true,
            },
          },
        },
      }),
    ]);

    return {
      items: records.map(toMarketplaceListingRecord),
      total,
    };
  }

  async findPublishedListingById(
    listingId: string,
  ): Promise<MarketplaceListingRecord | null> {
    const record = await this.prisma.listing.findFirst({
      where: {
        id: listingId,
        status: "PUBLISHED",
      },
      include: {
        organisation: {
          select: {
            id: true,
            name: true,
            country: true,
            verificationStatus: true,
          },
        },
        site: {
          select: {
            name: true,
            facilityType: true,
            country: true,
            city: true,
          },
        },
      },
    });

    if (!record) {
      return null;
    }

    return toMarketplaceListingRecord(record);
  }
}

function toMarketplaceListingRecord(record: {
  id: string;
  organisationId: string;
  siteId: string | null;
  title: string;
  description: string | null;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  priceAmount: number | null;
  currency: string;
  priceUnit: string;
  originCountry: string | null;
  harvestYear: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  organisation: {
    id: string;
    name: string;
    country: string | null;
    verificationStatus: string;
  };
  site: {
    name: string;
    facilityType: string | null;
    country: string | null;
    city: string | null;
  } | null;
}): MarketplaceListingRecord {
  return {
    id: record.id,
    organisationId: record.organisationId,
    siteId: record.siteId,
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
    organisation: {
      id: record.organisation.id,
      name: record.organisation.name,
      country: record.organisation.country,
      verificationStatus: record.organisation.verificationStatus,
    },
    site: record.site
      ? {
          name: record.site.name,
          facilityType: record.site.facilityType,
          country: record.site.country,
          city: record.site.city,
        }
      : null,
  };
}
