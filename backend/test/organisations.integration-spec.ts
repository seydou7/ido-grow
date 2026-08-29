import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { PrismaService } from "../src/database";
import { PrismaOrganisationsRepository } from "../src/organisations/prisma-organisations.repository";

describe("organisation and membership persistence (integration)", () => {
  const prisma = new PrismaClient();
  const repository = new PrismaOrganisationsRepository(prisma as PrismaService);
  const userId = randomUUID();
  const otherUserId = randomUUID();
  const organisationId = randomUUID();
  const otherOrganisationId = randomUUID();
  const siteId = randomUUID();
  const membershipId = randomUUID();
  const otherMembershipId = randomUUID();
  let documentId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          email: `membership-${userId}@example.test`,
          passwordHash: "integration-test-only-password-hash",
        },
      }),
      prisma.user.create({
        data: {
          id: otherUserId,
          email: `membership-${otherUserId}@example.test`,
          passwordHash: "integration-test-only-password-hash",
        },
      }),
      prisma.organisation.create({
        data: {
          id: organisationId,
          name: "Synthetic Integration Organisation",
          legalName: "Synthetic Integration Legal Entity",
          organisationType: "SUPPLIER",
          businessType: "farmer",
          country: "Netherlands",
          verificationStatus: "PENDING",
        },
      }),
      prisma.organisation.create({
        data: {
          id: otherOrganisationId,
          name: "Other Synthetic Integration Organisation",
          organisationType: "SUPPLIER",
          verificationStatus: "PENDING",
        },
      }),
    ]);
    await prisma.site.create({
      data: {
        id: siteId,
        organisationId,
        name: "Synthetic Integration Site",
        facilityType: "farm",
        city: "Groningen",
        country: "Netherlands",
        landAreaHectares: 85.0,
      },
    });
    await prisma.membership.create({
      data: { id: membershipId, userId, organisationId },
    });
    await prisma.membership.create({
      data: {
        id: otherMembershipId,
        userId: otherUserId,
        organisationId: otherOrganisationId,
      },
    });
  });

  afterAll(async () => {
    await prisma.complianceDocument.deleteMany({
      where: { organisationId: { in: [organisationId, otherOrganisationId] } },
    });
    await prisma.membership.deleteMany({
      where: { id: { in: [membershipId, otherMembershipId] } },
    });
    await prisma.site.deleteMany({
      where: { organisationId: { in: [organisationId, otherOrganisationId] } },
    });
    await prisma.organisation.deleteMany({
      where: { id: { in: [organisationId, otherOrganisationId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userId, otherUserId] } },
    });
    await prisma.$disconnect();
  });

  it("queries only the authenticated User's persisted memberships", async () => {
    const memberships = await repository.findMembershipsForUser(userId);

    expect(memberships).toHaveLength(1);
    expect(memberships[0]).toMatchObject({
      id: membershipId,
      organisation: {
        id: organisationId,
        name: "Synthetic Integration Organisation",
        legalName: "Synthetic Integration Legal Entity",
        businessType: "farmer",
        sites: [{ id: siteId, facilityType: "farm" }],
      },
    });
    expect(JSON.stringify(memberships)).not.toContain(otherMembershipId);
    expect(JSON.stringify(memberships)).not.toContain(otherOrganisationId);
  });

  it("finds single membership by userId and organisationId", async () => {
    const membership = await repository.findMembership(userId, organisationId);
    expect(membership).not.toBeNull();
    expect(membership?.organisation.id).toBe(organisationId);

    const nonMember = await repository.findMembership(userId, otherOrganisationId);
    expect(nonMember).toBeNull();
  });

  it("updates organisation profile fields successfully", async () => {
    const updated = await repository.updateOrganisationProfile(organisationId, {
      registrationNumber: "KVK-99887766",
      vatNumber: "NL99887766B01",
      city: "Utrecht",
      contactName: "Pieter de Boer",
      contactEmail: "pieter@deboer.nl",
    });

    expect(updated.registrationNumber).toBe("KVK-99887766");
    expect(updated.vatNumber).toBe("NL99887766B01");
    expect(updated.city).toBe("Utrecht");
    expect(updated.contactName).toBe("Pieter de Boer");
  });

  it("creates and retrieves sites for the organisation", async () => {
    const newSite = await repository.createSite(organisationId, {
      name: "South Processing Facility",
      facilityType: "processing_facility",
      city: "Breda",
      country: "Netherlands",
      latitude: 51.5719,
      longitude: 4.7683,
    });

    expect(newSite.name).toBe("South Processing Facility");
    expect(newSite.facilityType).toBe("processing_facility");

    const sites = await repository.findSitesByOrganisationId(organisationId);
    expect(sites.length).toBe(2);

    const retrieved = await repository.findSiteById(organisationId, newSite.id);
    expect(retrieved?.id).toBe(newSite.id);
    expect(retrieved?.latitude).toBe(51.5719);
  });

  it("creates, queries, and deletes compliance documents for organisation", async () => {
    const doc = await repository.createComplianceDocument(organisationId, {
      documentType: "COMPANY_REGISTRATION",
      originalFilename: "kvk_extract_2026.pdf",
      storageKey: `test-${randomUUID()}.pdf`,
      mimeType: "application/pdf",
      fileSize: 10240,
    });

    expect(doc.documentType).toBe("COMPANY_REGISTRATION");
    expect(doc.status).toBe("PENDING_REVIEW");
    documentId = doc.id;

    const docs = await repository.findComplianceDocumentsByOrganisationId(organisationId);
    expect(docs.length).toBe(1);
    expect(docs[0].id).toBe(documentId);

    const singleDoc = await repository.findComplianceDocumentById(organisationId, documentId);
    expect(singleDoc).not.toBeNull();
    expect(singleDoc?.originalFilename).toBe("kvk_extract_2026.pdf");

    const deleted = await repository.deleteComplianceDocument(organisationId, documentId);
    expect(deleted).toBe(true);

    const afterDelete = await repository.findComplianceDocumentsByOrganisationId(organisationId);
    expect(afterDelete.length).toBe(0);
  });
});
