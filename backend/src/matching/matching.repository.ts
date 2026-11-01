import type { MatchStatus } from "./contracts";

export interface MatchRecord {
  id: string;
  buyOrderId: string;
  listingId: string;
  buyerOrganisationId: string | null;
  supplierOrganisationId: string | null;
  createdByUserId: string | null;
  status: string;
  traderNotes: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class MatchingRepository {
  abstract findMatchesForBuyOrder(buyOrderId: string): Promise<MatchRecord[]>;
  abstract findApprovedMatchForBuyOrder(
    buyOrderId: string,
  ): Promise<MatchRecord | null>;
  abstract findMatchById(id: string): Promise<MatchRecord | null>;
  abstract findMatchByBuyOrderAndListing(
    buyOrderId: string,
    listingId: string,
  ): Promise<MatchRecord | null>;
  abstract createMatch(data: {
    buyOrderId: string;
    listingId: string;
    buyerOrganisationId: string;
    supplierOrganisationId: string;
    createdByUserId: string;
    status: MatchStatus;
    traderNotes?: string | null;
  }): Promise<MatchRecord>;
  abstract updateMatchStatus(
    id: string,
    status: MatchStatus,
    approvedAt?: Date | null,
    traderNotes?: string | null,
  ): Promise<MatchRecord>;
}
