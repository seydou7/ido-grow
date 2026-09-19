import { Injectable } from "@nestjs/common";

import { PrismaService } from "../database";
import type { MatchStatus } from "./contracts";
import { type MatchRecord, MatchingRepository } from "./matching.repository";

@Injectable()
export class PrismaMatchingRepository extends MatchingRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMatchesForBuyOrder(buyOrderId: string): Promise<MatchRecord[]> {
    return this.prisma.match.findMany({
      where: { buyOrderId },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });
  }

  async findApprovedMatchForBuyOrder(
    buyOrderId: string,
  ): Promise<MatchRecord | null> {
    return this.prisma.match.findFirst({
      where: {
        buyOrderId,
        status: "APPROVED",
      },
    });
  }

  async findMatchById(id: string): Promise<MatchRecord | null> {
    return this.prisma.match.findUnique({
      where: { id },
    });
  }

  async findMatchByBuyOrderAndListing(
    buyOrderId: string,
    listingId: string,
  ): Promise<MatchRecord | null> {
    return this.prisma.match.findFirst({
      where: {
        buyOrderId,
        listingId,
        status: { in: ["DRAFT", "APPROVED"] },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createMatch(data: {
    buyOrderId: string;
    listingId: string;
    buyerOrganisationId: string;
    supplierOrganisationId: string;
    createdByUserId: string;
    status: MatchStatus;
    traderNotes?: string | null;
  }): Promise<MatchRecord> {
    return this.prisma.match.create({
      data: {
        buyOrderId: data.buyOrderId,
        listingId: data.listingId,
        buyerOrganisationId: data.buyerOrganisationId,
        supplierOrganisationId: data.supplierOrganisationId,
        createdByUserId: data.createdByUserId,
        status: data.status,
        traderNotes: data.traderNotes,
      },
    });
  }

  async updateMatchStatus(
    id: string,
    status: MatchStatus,
    approvedAt?: Date | null,
    traderNotes?: string | null,
  ): Promise<MatchRecord> {
    return this.prisma.match.update({
      where: { id },
      data: {
        status,
        approvedAt: approvedAt !== undefined ? approvedAt : undefined,
        traderNotes: traderNotes !== undefined ? traderNotes : undefined,
      },
    });
  }
}
