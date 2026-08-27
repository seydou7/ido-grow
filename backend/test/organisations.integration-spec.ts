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
        },
      }),
      prisma.organisation.create({
        data: {
          id: otherOrganisationId,
          name: "Other Synthetic Integration Organisation",
        },
      }),
    ]);
    await prisma.site.create({
      data: {
        id: siteId,
        organisationId,
        name: "Synthetic Integration Site",
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
    await prisma.membership.deleteMany({
      where: { id: { in: [membershipId, otherMembershipId] } },
    });
    await prisma.site.deleteMany({ where: { id: siteId } });
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
        sites: [{ id: siteId }],
      },
    });
    expect(JSON.stringify(memberships)).not.toContain(otherMembershipId);
    expect(JSON.stringify(memberships)).not.toContain(otherOrganisationId);
  });

  it("persists the User-Membership-Organisation and Site-Organisation relations", async () => {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: {
        user: { select: { id: true, email: true } },
        organisation: { include: { sites: true } },
      },
    });

    expect(membership).toMatchObject({
      id: membershipId,
      user: { id: userId },
      organisation: {
        id: organisationId,
        name: "Synthetic Integration Organisation",
        sites: [
          {
            id: siteId,
            organisationId,
            name: "Synthetic Integration Site",
          },
        ],
      },
    });
  });

  it("prevents duplicate membership for the same User and Organisation", async () => {
    await expect(
      prisma.membership.create({ data: { userId, organisationId } }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("restricts deletion while membership and site relations still exist", async () => {
    await expect(prisma.user.delete({ where: { id: userId } })).rejects.toMatchObject(
      { code: "P2003" },
    );
    await expect(
      prisma.organisation.delete({ where: { id: organisationId } }),
    ).rejects.toMatchObject({ code: "P2003" });
  });
});
