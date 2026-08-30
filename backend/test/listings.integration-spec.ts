import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { PrismaService } from "../src/database";
import { PrismaListingsRepository } from "../src/listings/prisma-listings.repository";

describe("supplier listings persistence (integration)", () => {
  const prisma = new PrismaClient();
  const repository = new PrismaListingsRepository(prisma as PrismaService);
  const userId = randomUUID();
  const organisationId = randomUUID();
  const otherOrganisationId = randomUUID();
  const siteId = randomUUID();
  let listingId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          email: `listing-user-${userId}@example.test`,
          passwordHash: "integration-test-only-password-hash",
        },
      }),
      prisma.organisation.create({
        data: {
          id: organisationId,
          name: "Listing Integration Org",
          legalName: "Listing Integration Org BV",
          organisationType: "SUPPLIER",
          country: "Netherlands",
          verificationStatus: "PENDING",
        },
      }),
      prisma.organisation.create({
        data: {
          id: otherOrganisationId,
          name: "Other Listing Integration Org",
          organisationType: "SUPPLIER",
          country: "France",
          verificationStatus: "PENDING",
        },
      }),
    ]);
    await prisma.site.create({
      data: {
        id: siteId,
        organisationId,
        name: "Listing Production Plot A",
        facilityType: "farm",
        country: "Netherlands",
      },
    });
  });

  afterAll(async () => {
    await prisma.listing.deleteMany({
      where: {
        organisationId: { in: [organisationId, otherOrganisationId] },
      },
    });
    await prisma.site.deleteMany({
      where: { organisationId: { in: [organisationId, otherOrganisationId] } },
    });
    await prisma.organisation.deleteMany({
      where: { id: { in: [organisationId, otherOrganisationId] } },
    });
    await prisma.user.deleteMany({
      where: { id: userId },
    });
    await prisma.$disconnect();
  });

  it("creates a listing record with site relation", async () => {
    const created = await repository.createListing(organisationId, {
      title: "Retted Hemp Straw 2026",
      description: "High quality rectangular bales, moisture < 14%",
      materialType: "HEMP",
      productForm: "STRAW_RETTED",
      quantity: 120,
      quantityUnit: "TONNES",
      priceAmount: 210,
      currency: "EUR",
      priceUnit: "PER_TONNE",
      originCountry: "Netherlands",
      harvestYear: 2026,
      siteId,
      status: "DRAFT",
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe("Retted Hemp Straw 2026");
    expect(created.materialType).toBe("HEMP");
    expect(created.quantity).toBe(120);
    expect(created.siteId).toBe(siteId);
    expect(created.site?.name).toBe("Listing Production Plot A");

    listingId = created.id;
  });

  it("finds listings for organisation", async () => {
    const list = await repository.findListingsByOrganisationId(organisationId);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some((l) => l.id === listingId)).toBe(true);

    const otherList =
      await repository.findListingsByOrganisationId(otherOrganisationId);
    expect(otherList.some((l) => l.id === listingId)).toBe(false);
  });

  it("finds listing by id scoped to organisation", async () => {
    const found = await repository.findListingById(organisationId, listingId);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(listingId);

    const notFoundInOtherOrg = await repository.findListingById(
      otherOrganisationId,
      listingId,
    );
    expect(notFoundInOtherOrg).toBeNull();
  });

  it("updates listing status and fields", async () => {
    const updated = await repository.updateListing(organisationId, listingId, {
      title: "Updated Retted Hemp Straw 2026",
      quantity: 150,
      status: "PUBLISHED",
    });

    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Updated Retted Hemp Straw 2026");
    expect(updated?.quantity).toBe(150);
    expect(updated?.status).toBe("PUBLISHED");
  });
});
