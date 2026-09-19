import { PrismaClient } from "@prisma/client";

import { isLocalRuntime } from "../authentication/runtime-config";

export const FIXTURE_SUPPLIER_ORGS = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Normandie Chanvre Coop",
    country: "France",
    verificationStatus: "VERIFIED",
    siteId: "10000000-0000-4000-8000-000000000002",
    siteName: "Normandie Retting Facility",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Groningen Hemp Works BV",
    country: "Netherlands",
    verificationStatus: "VERIFIED",
    siteId: "10000000-0000-4000-8000-000000000004",
    siteName: "Groningen Agricultural Center",
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    name: "Occitanie Fibres Naturelles",
    country: "France",
    verificationStatus: "VERIFIED",
    siteId: "10000000-0000-4000-8000-000000000006",
    siteName: "Toulouse Processing Plant",
  },
];

export const FIXTURE_MATCHING_CANDIDATE_LISTINGS = [
  {
    id: "c1000000-0000-4000-8000-000000000001",
    organisationId: "10000000-0000-4000-8000-000000000001",
    siteId: "10000000-0000-4000-8000-000000000002",
    title: "Normandie Premium Retted Hemp Straw - Lot A",
    description:
      "High-grade field-retted hemp straw from Normandy, moisture <14%. Ideal for decortication, technical fibre, and non-woven applications.",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 80,
    quantityUnit: "TONNES",
    priceAmount: 42,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "France",
    harvestYear: 2026,
    status: "PUBLISHED",
  },
  {
    id: "c1000000-0000-4000-8000-000000000002",
    organisationId: "10000000-0000-4000-8000-000000000003",
    siteId: "10000000-0000-4000-8000-000000000004",
    title: "Dutch Field-Retted Hemp Stems - Grade 1",
    description:
      "Consistent European certified industrial hemp stems. Uniform retted quality, high cellulose content, ready for prompt dispatch.",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 55,
    quantityUnit: "TONNES",
    priceAmount: 46,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "Netherlands",
    harvestYear: 2026,
    status: "PUBLISHED",
  },
  {
    id: "c1000000-0000-4000-8000-000000000003",
    organisationId: "10000000-0000-4000-8000-000000000005",
    siteId: "10000000-0000-4000-8000-000000000006",
    title: "Occitanie Organic Retted Hemp Stems",
    description:
      "Ecologically cultivated hemp stems from Occitanie region. Stored under ventilated dry warehouse, biological natural retting.",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 30,
    quantityUnit: "TONNES",
    priceAmount: 39,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "France",
    harvestYear: 2026,
    status: "PUBLISHED",
  },
  {
    id: "c1000000-0000-4000-8000-000000000004",
    organisationId: "10000000-0000-4000-8000-000000000003",
    siteId: "10000000-0000-4000-8000-000000000004",
    title: "Northern Netherlands Bulk Industrial Retted Straw",
    description:
      "High volume supply of industrial retted hemp straw. Bale compressed for optimized container transport, harvest 2026.",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 120,
    quantityUnit: "TONNES",
    priceAmount: 51,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "Netherlands",
    harvestYear: 2026,
    status: "PUBLISHED",
  },
];

export async function seedLocalMatchingData(): Promise<void> {
  if (!isLocalRuntime()) {
    throw new Error("Synthetic matching data creation is strictly restricted to the local runtime.");
  }

  const prisma = new PrismaClient();

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Upsert Supplier Organisations & Sites
      for (const org of FIXTURE_SUPPLIER_ORGS) {
        await tx.organisation.upsert({
          where: { id: org.id },
          update: {
            name: org.name,
            country: org.country,
            organisationType: "SUPPLIER",
            verificationStatus: org.verificationStatus,
          },
          create: {
            id: org.id,
            name: org.name,
            country: org.country,
            organisationType: "SUPPLIER",
            verificationStatus: org.verificationStatus,
          },
        });

        await tx.site.upsert({
          where: { id: org.siteId },
          update: {
            organisationId: org.id,
            name: org.siteName,
            country: org.country,
          },
          create: {
            id: org.siteId,
            organisationId: org.id,
            name: org.siteName,
            country: org.country,
            facilityType: "PROCESSING_PLANT",
          },
        });
      }

      // 2. Upsert Published Candidate Listings
      for (const listing of FIXTURE_MATCHING_CANDIDATE_LISTINGS) {
        await tx.listing.upsert({
          where: { id: listing.id },
          update: {
            organisationId: listing.organisationId,
            siteId: listing.siteId,
            title: listing.title,
            description: listing.description,
            materialType: listing.materialType,
            productForm: listing.productForm,
            quantity: listing.quantity,
            quantityUnit: listing.quantityUnit,
            priceAmount: listing.priceAmount,
            currency: listing.currency,
            priceUnit: listing.priceUnit,
            originCountry: listing.originCountry,
            harvestYear: listing.harvestYear,
            status: listing.status,
          },
          create: {
            id: listing.id,
            organisationId: listing.organisationId,
            siteId: listing.siteId,
            title: listing.title,
            description: listing.description,
            materialType: listing.materialType,
            productForm: listing.productForm,
            quantity: listing.quantity,
            quantityUnit: listing.quantityUnit,
            priceAmount: listing.priceAmount,
            currency: listing.currency,
            priceUnit: listing.priceUnit,
            originCountry: listing.originCountry,
            harvestYear: listing.harvestYear,
            status: listing.status,
          },
        });
      }
    });

        console.log("Successfully seeded 4 published matching candidate listings in local PostgreSQL.");
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedLocalMatchingData().catch((err) => {
        console.error("Failed to seed local matching data:", err);
    process.exit(1);
  });
}
