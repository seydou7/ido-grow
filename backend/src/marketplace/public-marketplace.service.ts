import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../database";
import type {
  PublicMarketplaceCountryFacet,
  PublicMarketplaceFacetItem,
  PublicMarketplaceListing,
  PublicMarketplaceListingCollection,
  PublicMarketplaceListingDetail,
  PublicMarketplaceQuery,
} from "./public-marketplace.contracts";

const MATERIAL_LABELS: Record<string, string> = {
  HEMP: "Hemp",
  SISAL: "Sisal",
  COIR: "Coir",
  JUTE: "Jute",
  KENAF: "Kenaf",
  RAFFIA: "Raffia",
};

const PRODUCT_FORM_LABELS: Record<string, string> = {
  STRAW_RAW: "Raw Straw",
  STRAW_RETTED: "Retted Straw",
  FIBRE_TECHNICAL: "Technical Fibre",
  FIBRE_SHORT: "Short Fibre",
  HURD_SHIVES: "Hurd / Shives",
  DUST_PELLETS: "Dust / Pellets",
};

export function getPublicListingImages(
  materialType: string,
  productForm?: string | null,
): readonly string[] {
  const normMat = (materialType || "HEMP").toUpperCase();
  const normForm = (productForm || "STRAW_RAW").toUpperCase();

  // Curated, safe, high-resolution natural commodity asset photography
  if (normMat === "HEMP") {
    if (normForm.includes("RETTED") || normForm.includes("STRAW")) {
      return [
        "/images/materials/hemp-retted-straw-1.jpg",
        "/images/materials/hemp-technical-fibre-1.jpg",
      ];
    }
    return [
      "/images/materials/hemp-technical-fibre-1.jpg",
      "/images/materials/hemp-retted-straw-1.jpg",
    ];
  }

  if (normMat === "FLAX") {
    return [
      "/images/materials/flax-scutched-1.jpg",
      "/images/materials/hemp-technical-fibre-1.jpg",
    ];
  }

  if (normMat === "SISAL") {
    return [
      "/images/materials/sisal-fibre-1.jpg",
      "/images/materials/hemp-technical-fibre-1.jpg",
    ];
  }

  if (normMat === "JUTE") {
    return [
      "/images/materials/jute-fibre-1.jpg",
      "/images/materials/hemp-retted-straw-1.jpg",
    ];
  }

  if (normMat === "COIR") {
    return [
      "/images/materials/coir-fibre-1.jpg",
      "/images/materials/sisal-fibre-1.jpg",
    ];
  }

  return [
    "/images/materials/hemp-technical-fibre-1.jpg",
    "/images/materials/hemp-retted-straw-1.jpg",
  ];
}

@Injectable()
export class PublicMarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicListings(
    query: PublicMarketplaceQuery,
  ): Promise<PublicMarketplaceListingCollection> {
    const where: Prisma.ListingWhereInput = {
      status: "PUBLISHED",
    };

    // Text search
    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { materialType: { contains: term, mode: "insensitive" } },
        { productForm: { contains: term, mode: "insensitive" } },
        { originCountry: { contains: term, mode: "insensitive" } },
      ];
    }

    // Material filter
    if (query.materialType && query.materialType !== "ALL") {
      where.materialType = {
        equals: query.materialType,
        mode: "insensitive",
      };
    }

    // Product Form filter
    if (query.productForm && query.productForm !== "ALL") {
      where.productForm = {
        equals: query.productForm,
        mode: "insensitive",
      };
    }

    // Country filter
    if (query.originCountry && query.originCountry !== "ALL" && query.originCountry.trim().length > 0) {
      where.originCountry = {
        equals: query.originCountry.trim(),
        mode: "insensitive",
      };
    }

    // Harvest Year filter
    if (query.harvestYear && !Number.isNaN(Number(query.harvestYear))) {
      where.harvestYear = Number(query.harvestYear);
    }

    // Quantity range
    if (query.minQuantity !== undefined && !Number.isNaN(Number(query.minQuantity))) {
      where.quantity = {
        ...(typeof where.quantity === "object" ? where.quantity : {}),
        gte: Number(query.minQuantity),
      };
    }
    if (query.maxQuantity !== undefined && !Number.isNaN(Number(query.maxQuantity))) {
      where.quantity = {
        ...(typeof where.quantity === "object" ? where.quantity : {}),
        lte: Number(query.maxQuantity),
      };
    }
    if (query.quantityUnit && query.quantityUnit !== "ALL") {
      where.quantityUnit = query.quantityUnit;
    }

    // Price range
    if (query.hasPrice === true) {
      where.priceAmount = { not: null };
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
    if (query.priceUnit && query.priceUnit !== "ALL") {
      where.priceUnit = query.priceUnit;
    }

    // Certifications filter
    if (query.hasCertifications === true) {
      where.organisation = {
        complianceDocuments: {
          some: { status: "VERIFIED" },
        },
      };
    }

    // Quality Approved filter
    if (query.hasQualityApproved === true) {
      where.inspections = {
        some: {
          qualityResult: { decision: "APPROVED" },
        },
      };
    }

    // DPP filter
    if (query.hasDpp === true) {
      where.lots = {
        some: {
          dpp: { isNot: null },
        },
      };
    }

    // Sorting
    const orderBy: Prisma.ListingOrderByWithRelationInput[] = [];
    switch (query.sort?.toLowerCase()) {
      case "oldest":
        orderBy.push({ createdAt: "asc" }, { id: "asc" });
        break;
      case "price_asc":
        orderBy.push({ priceAmount: "asc" }, { id: "desc" });
        break;
      case "price_desc":
        orderBy.push({ priceAmount: "desc" }, { id: "desc" });
        break;
      case "quantity_desc":
        orderBy.push({ quantity: "desc" }, { id: "desc" });
        break;
      case "quantity_asc":
        orderBy.push({ quantity: "asc" }, { id: "desc" });
        break;
      case "newest":
      case "default":
      default:
        orderBy.push({ createdAt: "desc" }, { id: "desc" });
        break;
    }

    // Pagination
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 12));
    const skip = (page - 1) * pageSize;

    const [total, records, allPublished] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          organisation: {
            select: {
              id: true,
              country: true,
              verificationStatus: true,
              complianceDocuments: {
                where: { status: "VERIFIED" },
                select: { documentType: true, status: true },
              },
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
          inspections: {
            include: {
              qualityResult: true,
              certificate: true,
            },
          },
          lots: {
            include: {
              dpp: true,
            },
          },
        },
      }),
      // Aggregate facets across all published listings
      this.prisma.listing.findMany({
        where: { status: "PUBLISHED" },
        select: {
          materialType: true,
          productForm: true,
          originCountry: true,
          priceAmount: true,
          quantity: true,
          organisation: {
            select: {
              complianceDocuments: {
                where: { status: "VERIFIED" },
                select: { id: true },
              },
            },
          },
          inspections: {
            where: {
              qualityResult: { decision: "APPROVED" },
            },
            select: { id: true },
          },
          lots: {
            where: {
              dpp: { isNot: null },
            },
            select: { id: true },
          },
        },
      }),
    ]);

    // Build facets from all published records
    const materialCounts: Record<string, number> = {};
    const formCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    let minQuantity: number | null = null;
    let maxQuantity: number | null = null;
    let totalWithDpp = 0;
    let totalWithCertifications = 0;
    let totalQualityApproved = 0;

    for (const item of allPublished) {
      // Materials
      const mat = item.materialType.toUpperCase();
      materialCounts[mat] = (materialCounts[mat] || 0) + 1;

      // Forms
      if (item.productForm) {
        const form = item.productForm.toUpperCase();
        formCounts[form] = (formCounts[form] || 0) + 1;
      }

      // Countries
      if (item.originCountry) {
        const country = item.originCountry.trim();
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }

      // Price
      if (item.priceAmount !== null) {
        minPrice = minPrice === null ? item.priceAmount : Math.min(minPrice, item.priceAmount);
        maxPrice = maxPrice === null ? item.priceAmount : Math.max(maxPrice, item.priceAmount);
      }

      // Quantity
      minQuantity = minQuantity === null ? item.quantity : Math.min(minQuantity, item.quantity);
      maxQuantity = maxQuantity === null ? item.quantity : Math.max(maxQuantity, item.quantity);

      // Flags
      if (item.lots?.length > 0) totalWithDpp++;
      if (item.organisation?.complianceDocuments?.length > 0) totalWithCertifications++;
      if (item.inspections?.length > 0) totalQualityApproved++;
    }

    const materials: PublicMarketplaceFacetItem[] = Object.entries(materialCounts).map(
      ([value, count]) => ({
        value,
        label: MATERIAL_LABELS[value] || value,
        count,
      }),
    );

    const productForms: PublicMarketplaceFacetItem[] = Object.entries(formCounts).map(
      ([value, count]) => ({
        value,
        label: PRODUCT_FORM_LABELS[value] || value,
        count,
      }),
    );

    const countries: PublicMarketplaceCountryFacet[] = Object.entries(countryCounts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items: records.map((r) => this.toPublicListing(r)),
      total,
      page,
      pageSize,
      totalPages,
      facets: {
        materials,
        productForms,
        countries,
        priceRange: { min: minPrice, max: maxPrice },
        quantityRange: { min: minQuantity, max: maxQuantity },
        totalWithDpp,
        totalWithCertifications,
        totalQualityApproved,
      },
    };
  }

  async getPublicListing(listingId: string): Promise<PublicMarketplaceListingDetail> {
    const record = await this.prisma.listing.findFirst({
      where: {
        id: listingId,
        status: "PUBLISHED",
      },
      include: {
        organisation: {
          select: {
            id: true,
            country: true,
            verificationStatus: true,
            complianceDocuments: {
              where: { status: "VERIFIED" },
              select: { documentType: true, status: true },
            },
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
        inspections: {
          include: {
            qualityResult: true,
            certificate: true,
          },
        },
        lots: {
          include: {
            dpp: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/marketplace/listing-not-found",
        title: "Listing Not Found",
        status: 404,
        detail: "The requested listing was not found or is not currently published on the public marketplace.",
      });
    }

    // Fetch up to 3 related published listings (same material, different ID)
    const relatedRecords = await this.prisma.listing.findMany({
      where: {
        status: "PUBLISHED",
        materialType: record.materialType,
        id: { not: record.id },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        organisation: {
          select: {
            id: true,
            country: true,
            verificationStatus: true,
            complianceDocuments: {
              where: { status: "VERIFIED" },
              select: { documentType: true, status: true },
            },
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
        inspections: {
          include: {
            qualityResult: true,
            certificate: true,
          },
        },
        lots: {
          include: {
            dpp: true,
          },
        },
      },
    });

    return {
      ...this.toPublicListing(record),
      relatedListings: (relatedRecords || []).map((r) => this.toPublicListing(r)),
    };
  }

  private toPublicListing(record: {
    id: string;
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
    createdAt: Date;
    updatedAt: Date;
    organisation: {
      id: string;
      country: string | null;
      verificationStatus: string;
      complianceDocuments: Array<{ documentType: string; status: string }>;
    };
    site: {
      name: string;
      facilityType: string | null;
      country: string | null;
      city: string | null;
    } | null;
    inspections: Array<{
      qualityResult: { decision: string; classificationLabel: string | null } | null;
      certificate: { certificateNumber: string } | null;
    }>;
    lots: Array<{
      dpp: { passportNumber: string } | null;
    }>;
  }): PublicMarketplaceListing {
    const approvedInspection = record.inspections?.find(
      (i) => i.qualityResult?.decision === "APPROVED",
    );
    const lotWithDpp = record.lots?.find((l) => l.dpp !== null);
    const verifiedCertifications = record.organisation?.complianceDocuments || [];

    return {
      id: record.id,
      title: record.title,
      description: record.description,
      materialType: record.materialType,
      productForm: record.productForm,
      quantity: record.quantity,
      quantityUnit: record.quantityUnit,
      priceAmount: record.priceAmount,
      currency: record.currency || "EUR",
      priceUnit: record.priceUnit || "PER_TONNE",
      originCountry: record.originCountry,
      harvestYear: record.harvestYear,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      supplier: {
        isVerified: record.organisation?.verificationStatus === "VERIFIED",
        country: record.organisation?.country || record.originCountry || null,
      },
      site: record.site
        ? {
            name: record.site.name,
            facilityType: record.site.facilityType,
            country: record.site.country,
            city: record.site.city,
          }
        : null,
      certifications: verifiedCertifications.map((c) => ({
        documentType: c.documentType,
        status: c.status,
      })),
      quality: {
        hasInspection: (record.inspections?.length ?? 0) > 0,
        isApproved: Boolean(approvedInspection),
        classificationLabel: approvedInspection?.qualityResult?.classificationLabel ?? null,
        certificateNumber: approvedInspection?.certificate?.certificateNumber ?? null,
      },
      hasDpp: Boolean(lotWithDpp?.dpp),
      dppNumber: lotWithDpp?.dpp?.passportNumber ?? null,
      images: getPublicListingImages(record.materialType, record.productForm),
    };
  }
}
