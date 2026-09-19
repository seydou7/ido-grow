import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { PrismaService } from "../database";
import { AuditEventWriter } from "../audit";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import { BuyOrdersRepository } from "../buy-orders/buy-orders.repository";
import { evaluateDeterministicCompatibility } from "./matching-calculator";
import type {
  ApproveMatchInput,
  CandidateListing,
  CancelMatchInput,
  MatchingWorkspace,
  MatchStatus,
  MatchSummary,
  SelectMatchInput,
  CockpitApprovedMatch,
  CockpitBuyOrder,
  OperationalQueueItem,
  TraderCockpitResponse,
  TraderSupplierCollection,
  TraderSupplierDetail,
  TraderBuyerCollection,
  TraderBuyerDetail,
} from "./contracts";
import { type MatchRecord, MatchingRepository } from "./matching.repository";

@Injectable()
export class MatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingRepository: MatchingRepository,
    private readonly buyOrdersRepository: BuyOrdersRepository,
    private readonly organisationsRepository: OrganisationsRepository,
    private readonly auditEventWriter: AuditEventWriter,
  ) {}

  async assertTraderAccess(userId: string): Promise<void> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    const isTrader = memberships?.some(
      (m) => m.organisation.organisationType.toUpperCase() === "TRADER",
    );

    if (!isTrader) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/matching/trader-access-required",
        title: "Forbidden",
        status: 403,
        detail: "Matching workspace and candidate discovery is reserved for Traders.",
      });
    }
  }

  async getMatchingWorkspace(
    userId: string,
    buyOrderId: string,
  ): Promise<MatchingWorkspace> {
    await this.assertTraderAccess(userId);

    const buyOrder =
      await this.buyOrdersRepository.findBuyOrderById(buyOrderId);
    if (!buyOrder) {
      throw new NotFoundException(`Buy Order with ID ${buyOrderId} not found.`);
    }

    // Fetch published listings for this material type
    const listings = await this.prisma.listing.findMany({
      where: {
        materialType: buyOrder.materialType,
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
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch all existing matches for this buy order
    const existingMatches =
      await this.matchingRepository.findMatchesForBuyOrder(buyOrderId);

    const activeApprovedRecord =
      existingMatches.find((m) => m.status === "APPROVED") ?? null;

    const matchByListingMap = new Map<string, MatchRecord>();
    for (const m of existingMatches) {
      // Keep most active match per listing (APPROVED > DRAFT > CANCELLED)
      const current = matchByListingMap.get(m.listingId);
      if (!current) {
        matchByListingMap.set(m.listingId, m);
      } else if (m.status === "APPROVED") {
        matchByListingMap.set(m.listingId, m);
      } else if (m.status === "DRAFT" && current.status === "CANCELLED") {
        matchByListingMap.set(m.listingId, m);
      }
    }

    const candidates: CandidateListing[] = listings.map((listing) => {
      const match = matchByListingMap.get(listing.id) ?? null;

      const compatibility = evaluateDeterministicCompatibility(
        {
          materialType: buyOrder.materialType,
          productForm: buyOrder.productForm,
          quantity: buyOrder.quantity,
          quantityUnit: buyOrder.quantityUnit,
          deliveryCountry: buyOrder.deliveryCountry,
          targetPriceAmount: buyOrder.targetPriceAmount,
          currency: buyOrder.currency,
          targetPriceUnit: buyOrder.targetPriceUnit,
          acceptableOriginCountries: buyOrder.acceptableOriginCountries,
          certificationRequirements: buyOrder.certificationRequirements,
        },
        {
          materialType: listing.materialType,
          productForm: listing.productForm,
          quantity: listing.quantity,
          quantityUnit: listing.quantityUnit,
          priceAmount: listing.priceAmount,
          currency: listing.currency,
          priceUnit: listing.priceUnit,
          originCountry: listing.originCountry,
          description: listing.description,
        },
      );

      return {
        id: listing.id,
        organisationId: listing.organisation.id,
        organisationName: listing.organisation.name,
        organisationCountry: listing.organisation.country,
        verificationStatus: listing.organisation.verificationStatus,
        siteId: listing.site?.id ?? null,
        siteName: listing.site?.name ?? null,
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
        compatibility,
        match: match ? this.mapMatchToSummary(match) : null,
      };
    });

    // Sort: APPROVED match first, then DRAFT match, then alphabetical title
    candidates.sort((a, b) => {
      const aApproved = a.match?.status === "APPROVED" ? 2 : a.match?.status === "DRAFT" ? 1 : 0;
      const bApproved = b.match?.status === "APPROVED" ? 2 : b.match?.status === "DRAFT" ? 1 : 0;
      if (aApproved !== bApproved) return bApproved - aApproved;
      return a.title.localeCompare(b.title);
    });

    return {
      buyOrder: {
        id: buyOrder.id,
        buyerOrganisationId: buyOrder.buyerOrganisationId,
        buyerOrganisationName:
          buyOrder.buyerOrganisation?.name ?? "Buyer Organisation",
        materialType: buyOrder.materialType,
        productForm: buyOrder.productForm,
        quantity: buyOrder.quantity,
        quantityUnit: buyOrder.quantityUnit,
        deliveryCountry: buyOrder.deliveryCountry,
        deliveryDestination: buyOrder.deliveryDestination,
        requestedDeliveryDate: buyOrder.requestedDeliveryDate
          ? buyOrder.requestedDeliveryDate.toISOString()
          : null,
        targetPriceAmount: buyOrder.targetPriceAmount,
        currency: buyOrder.currency,
        targetPriceUnit: buyOrder.targetPriceUnit,
        acceptableOriginCountries: buyOrder.acceptableOriginCountries,
        qualityRequirements: buyOrder.qualityRequirements,
        packagingRequirements: buyOrder.packagingRequirements,
        certificationRequirements: buyOrder.certificationRequirements,
        transportPreferences: buyOrder.transportPreferences,
        paymentTerms: buyOrder.paymentTerms,
        status: buyOrder.status,
      },
      candidates,
      activeApprovedMatch: activeApprovedRecord
        ? this.mapMatchToSummary(activeApprovedRecord)
        : null,
      matches: existingMatches.map((m) => this.mapMatchToSummary(m)),
    };
  }

  async selectCandidateAsMatch(
    userId: string,
    buyOrderId: string,
    input: SelectMatchInput,
  ): Promise<MatchSummary> {
    await this.assertTraderAccess(userId);

    const buyOrder =
      await this.buyOrdersRepository.findBuyOrderById(buyOrderId);
    if (!buyOrder) {
      throw new NotFoundException(`Buy Order with ID ${buyOrderId} not found.`);
    }

    if (buyOrder.status !== "OPEN") {
      throw new BadRequestException(
        `Matching can only operate against OPEN buy orders. Current status: ${buyOrder.status}.`,
      );
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: input.listingId },
      include: { organisation: true },
    });
    if (!listing) {
      throw new NotFoundException(`Listing with ID ${input.listingId} not found.`);
    }

    if (listing.status !== "PUBLISHED") {
      throw new BadRequestException(
        "Only PUBLISHED supplier listings can be matched against buy orders.",
      );
    }

    // Check if an existing draft or approved match exists
    const existing = await this.matchingRepository.findMatchByBuyOrderAndListing(
      buyOrderId,
      input.listingId,
    );

    if (existing) {
      const updated = await this.matchingRepository.updateMatchStatus(
        existing.id,
        existing.status as MatchStatus,
        existing.approvedAt,
        input.traderNotes !== undefined ? input.traderNotes : (existing.traderNotes ?? null),
      );
      return this.mapMatchToSummary(updated);
    }

    const record = await this.matchingRepository.createMatch({
      buyOrderId,
      listingId: input.listingId,
      buyerOrganisationId: buyOrder.buyerOrganisationId,
      supplierOrganisationId: listing.organisationId,
      createdByUserId: userId,
      status: "DRAFT",
      traderNotes: input.traderNotes ?? null,
    });

    const correlationId = randomUUID();
    const occurredAt = new Date();

    await this.auditEventWriter.append({
      eventType: "buyer.buy_order.match.created",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "match", id: record.id },
      correlationId,
      occurredAt,
      metadata: {
        buyOrderId,
        listingId: input.listingId,
        status: "DRAFT",
      },
    });

    return this.mapMatchToSummary(record);
  }

  async approveMatch(
    userId: string,
    matchId: string,
    input: ApproveMatchInput = {},
  ): Promise<MatchSummary> {
    await this.assertTraderAccess(userId);

    const match = await this.matchingRepository.findMatchById(matchId);
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found.`);
    }

    const buyOrder = await this.buyOrdersRepository.findBuyOrderById(
      match.buyOrderId,
    );
    if (!buyOrder) {
      throw new NotFoundException(
        `Parent Buy Order with ID ${match.buyOrderId} not found.`,
      );
    }

    if (buyOrder.status !== "OPEN") {
      throw new BadRequestException(
        `Matching can only operate against OPEN buy orders. Current status: ${buyOrder.status}.`,
      );
    }

    // Check Single Approved Match Invariant
    const existingApproved =
      await this.matchingRepository.findApprovedMatchForBuyOrder(
        match.buyOrderId,
      );

    if (existingApproved && existingApproved.id !== match.id) {
      throw new ConflictException(
        "An approved match already exists for this Buy Order. Please cancel the existing approved match before approving a new candidate.",
      );
    }

    if (match.status === "APPROVED") {
      return this.mapMatchToSummary(match);
    }

    const approvedAt = new Date();
    const updated = await this.matchingRepository.updateMatchStatus(
      match.id,
      "APPROVED",
      approvedAt,
      input.traderNotes !== undefined ? input.traderNotes : match.traderNotes,
    );

    const correlationId = randomUUID();
    const occurredAt = new Date();

    await this.auditEventWriter.append({
      eventType: "buyer.buy_order.match.approved",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "match", id: match.id },
      correlationId,
      occurredAt,
      metadata: {
        buyOrderId: match.buyOrderId,
        listingId: match.listingId,
        status: "APPROVED",
      },
    });

    return this.mapMatchToSummary(updated);
  }

  async cancelMatch(
    userId: string,
    matchId: string,
    input: CancelMatchInput = {},
  ): Promise<MatchSummary> {
    await this.assertTraderAccess(userId);

    const match = await this.matchingRepository.findMatchById(matchId);
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found.`);
    }

    const buyOrder = await this.buyOrdersRepository.findBuyOrderById(
      match.buyOrderId,
    );
    if (!buyOrder) {
      throw new NotFoundException(
        `Parent Buy Order with ID ${match.buyOrderId} not found.`,
      );
    }

    if (match.status === "CANCELLED") {
      return this.mapMatchToSummary(match);
    }

    const updated = await this.matchingRepository.updateMatchStatus(
      match.id,
      "CANCELLED",
      null,
      input.reason ? `Cancelled: ${input.reason}` : match.traderNotes,
    );

    const correlationId = randomUUID();
    const occurredAt = new Date();

    await this.auditEventWriter.append({
      eventType: "buyer.buy_order.match.cancelled",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "match", id: match.id },
      correlationId,
      occurredAt,
      metadata: {
        buyOrderId: match.buyOrderId,
        listingId: match.listingId,
        status: "CANCELLED",
      },
    });

    return this.mapMatchToSummary(updated);
  }

  private mapMatchToSummary(record: MatchRecord): MatchSummary {
    return {
      id: record.id,
      buyOrderId: record.buyOrderId,
      listingId: record.listingId,
      buyerOrganisationId: record.buyerOrganisationId,
      supplierOrganisationId: record.supplierOrganisationId,
      createdByUserId: record.createdByUserId,
      status: record.status as MatchStatus,
      traderNotes: record.traderNotes,
      approvedAt: record.approvedAt ? record.approvedAt.toISOString() : null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async getTraderCockpit(userId: string): Promise<TraderCockpitResponse> {
    await this.assertTraderAccess(userId);

    const [
      supplierOnboardingCount,
      pendingListingsCount,
      publishedListingsCount,
      openBuyOrdersCount,
      approvedMatchesCount,
    ] = await Promise.all([
      this.prisma.organisation.count({
        where: {
          organisationType: "SUPPLIER",
          verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] },
        },
      }),
      this.prisma.listing.count({
        where: {
          status: "DRAFT",
        },
      }),
      this.prisma.listing.count({
        where: {
          status: "PUBLISHED",
        },
      }),
      this.prisma.buyOrder.count({
        where: {
          status: "OPEN",
        },
      }),
      this.prisma.match.count({
        where: {
          status: "APPROVED",
        },
      }),
    ]);

    const rawOpenBuyOrders = await this.prisma.buyOrder.findMany({
      where: { status: "OPEN" },
      include: {
        buyerOrganisation: {
          select: { id: true, name: true, country: true },
        },
        matches: {
          select: {
            id: true,
            status: true,
            listingId: true,
            createdAt: true,
            approvedAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const openBuyOrders: CockpitBuyOrder[] = rawOpenBuyOrders.map((bo) => {
      const approvedMatch = bo.matches.find((m) => m.status === "APPROVED");
      const draftMatch = bo.matches.find((m) => m.status === "DRAFT");

      let matchStatus: "No Match" | "Draft Match" | "Approved Match" = "No Match";
      let activeMatchId: string | null = null;

      if (approvedMatch) {
        matchStatus = "Approved Match";
        activeMatchId = approvedMatch.id;
      } else if (draftMatch) {
        matchStatus = "Draft Match";
        activeMatchId = draftMatch.id;
      }

      return {
        id: bo.id,
        buyerOrganisationId: bo.buyerOrganisationId,
        buyerOrganisationName: bo.buyerOrganisation.name,
        buyerCountry: bo.buyerOrganisation.country ?? bo.deliveryCountry,
        materialType: bo.materialType,
        productForm: bo.productForm,
        quantity: bo.quantity,
        quantityUnit: bo.quantityUnit,
        deliveryCountry: bo.deliveryCountry,
        deliveryDestination: bo.deliveryDestination,
        requestedDeliveryDate: bo.requestedDeliveryDate
          ? bo.requestedDeliveryDate.toISOString()
          : null,
        status: bo.status,
        matchStatus,
        activeMatchId,
        createdAt: bo.createdAt.toISOString(),
      };
    });

    const rawApprovedMatches = await this.prisma.match.findMany({
      where: { status: "APPROVED" },
      include: {
        buyerOrganisation: {
          select: { id: true, name: true },
        },
        supplierOrganisation: {
          select: { id: true, name: true },
        },
        buyOrder: {
          select: {
            id: true,
            quantity: true,
            quantityUnit: true,
            materialType: true,
            productForm: true,
            currency: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            materialType: true,
            productForm: true,
          },
        },
      },
      orderBy: [
        { approvedAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    const approvedMatches: CockpitApprovedMatch[] = rawApprovedMatches.map((m) => ({
      id: m.id,
      buyOrderId: m.buyOrderId,
      listingId: m.listingId,
      buyerOrganisationId: m.buyerOrganisationId,
      buyerOrganisationName: m.buyerOrganisation?.name ?? "Unknown Buyer",
      supplierOrganisationId: m.supplierOrganisationId,
      supplierOrganisationName: m.supplierOrganisation?.name ?? "Unknown Supplier",
      materialType: m.listing.materialType,
      productForm: m.listing.productForm,
      quantity: m.buyOrder.quantity,
      quantityUnit: m.buyOrder.quantityUnit,
      currency: m.buyOrder.currency,
      status: "APPROVED",
      approvedAt: m.approvedAt ? m.approvedAt.toISOString() : m.updatedAt.toISOString(),
      nextStep: "Ready for Quotation",
      createdAt: m.createdAt.toISOString(),
    }));

    const [pendingSuppliers, draftListings] = await Promise.all([
      this.prisma.organisation.findMany({
        where: {
          organisationType: "SUPPLIER",
          verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] },
        },
        select: {
          id: true,
          name: true,
          verificationStatus: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
      this.prisma.listing.findMany({
        where: { status: "DRAFT" },
        include: {
          organisation: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
    ]);

    const queueItems: OperationalQueueItem[] = [];

    for (const bo of openBuyOrders) {
      if (bo.matchStatus === "No Match") {
        queueItems.push({
          id: `queue-demand-${bo.id}`,
          category: "buyer_demand",
          referenceId: bo.id,
          referenceDisplay: `Demand · ${bo.materialType} (${bo.quantity} ${bo.quantityUnit})`,
          organisationName: bo.buyerOrganisationName,
          organisationType: "BUYER",
          currentStatus: "OPEN",
          createdAt: bo.createdAt,
          updatedAt: bo.createdAt,
          attentionReason: "Open buyer demand awaiting candidate matching",
          nextActionLabel: "Find Match",
          nextActionUrl: `/matching/workspace?buyOrderId=${bo.id}`,
          meta: {
            buyOrderId: bo.id,
            materialType: bo.materialType,
            quantity: bo.quantity,
            quantityUnit: bo.quantityUnit,
          },
        });
      } else if (bo.matchStatus === "Draft Match") {
        queueItems.push({
          id: `queue-demand-${bo.id}`,
          category: "buyer_demand",
          referenceId: bo.id,
          referenceDisplay: `Demand · ${bo.materialType} (${bo.quantity} ${bo.quantityUnit})`,
          organisationName: bo.buyerOrganisationName,
          organisationType: "BUYER",
          currentStatus: "DRAFT_MATCH",
          createdAt: bo.createdAt,
          updatedAt: bo.createdAt,
          attentionReason: "Draft match selected — awaiting Trader approval",
          nextActionLabel: "Review Match",
          nextActionUrl: `/matching/workspace?buyOrderId=${bo.id}`,
          meta: {
            buyOrderId: bo.id,
            matchId: bo.activeMatchId ?? undefined,
            materialType: bo.materialType,
            quantity: bo.quantity,
            quantityUnit: bo.quantityUnit,
          },
        });
      }
    }

    for (const sup of pendingSuppliers) {
      queueItems.push({
        id: `queue-supplier-${sup.id}`,
        category: "supplier_onboarding",
        referenceId: sup.id,
        referenceDisplay: `Supplier · ${sup.name}`,
        organisationName: sup.name,
        organisationType: "SUPPLIER",
        currentStatus: sup.verificationStatus,
        createdAt: sup.createdAt.toISOString(),
        updatedAt: sup.updatedAt.toISOString(),
        attentionReason:
          sup.verificationStatus === "UNDER_REVIEW"
            ? "Supplier verification under review"
            : "Supplier registration pending onboarding review",
        nextActionLabel: "Review Supplier",
        nextActionUrl: `/trader/suppliers/${sup.id}`,
        meta: {
          organisationId: sup.id,
        },
      });
    }

    for (const lst of draftListings) {
      queueItems.push({
        id: `queue-listing-${lst.id}`,
        category: "listing_review",
        referenceId: lst.id,
        referenceDisplay: `Listing · ${lst.title}`,
        organisationName: lst.organisation.name,
        organisationType: "SUPPLIER",
        currentStatus: "DRAFT",
        createdAt: lst.createdAt.toISOString(),
        updatedAt: lst.updatedAt.toISOString(),
        attentionReason: "Draft listing awaiting completeness review or publication",
        nextActionLabel: "Review Listing",
        nextActionUrl: `/trader/suppliers/${lst.organisation.id}`,
        meta: {
          organisationId: lst.organisation.id,
          listingId: lst.id,
          materialType: lst.materialType,
          quantity: lst.quantity,
          quantityUnit: lst.quantityUnit,
        },
      });
    }

    for (const m of approvedMatches) {
      queueItems.push({
        id: `queue-match-${m.id}`,
        category: "approved_match",
        referenceId: m.id,
        referenceDisplay: `Match · ${m.materialType} (${m.quantity} ${m.quantityUnit})`,
        organisationName: `${m.buyerOrganisationName} ↔ ${m.supplierOrganisationName}`,
        organisationType: "PARTNERSHIP",
        currentStatus: "APPROVED",
        createdAt: m.createdAt,
        updatedAt: m.approvedAt ?? m.createdAt,
        attentionReason: "Match approved — ready for commercial quotation (Sprint 06)",
        nextActionLabel: "View Workspace",
        nextActionUrl: `/matching/workspace?buyOrderId=${m.buyOrderId}`,
        meta: {
          matchId: m.id,
          buyOrderId: m.buyOrderId,
          listingId: m.listingId,
          materialType: m.materialType,
          productForm: m.productForm,
          quantity: m.quantity,
          quantityUnit: m.quantityUnit,
          currency: m.currency,
          buyerOrganisationName: m.buyerOrganisationName,
          supplierOrganisationName: m.supplierOrganisationName,
        },
      });
    }


    const activeQuotes = this.prisma.quote
      ? await this.prisma.quote.findMany({
          where: {
            status: { in: ["INTERNAL_REVIEW", "COUNTERED", "SENT", "ACCEPTED", "REJECTED"] },
          },
          include: {
            buyerOrganisation: { select: { id: true, name: true } },
            supplierOrganisation: { select: { id: true, name: true } },
            buyOrder: { select: { materialType: true, quantity: true, quantityUnit: true } },
            trade: { select: { id: true, tradeNumber: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 50,
        })
      : [];

    for (const q of activeQuotes) {
      if (q.status === "INTERNAL_REVIEW") {
        queueItems.push({
          id: `queue-quote-${q.id}`,
          category: "quote_internal_review",
          referenceId: q.id,
          referenceDisplay: `Quote · ${q.quoteNumber} (v${q.currentVersionNumber})`,
          organisationName: `${q.buyerOrganisation.name} (Supplier: ${q.supplierOrganisation.name})`,
          organisationType: "TRADER",
          currentStatus: "INTERNAL_REVIEW",
          createdAt: q.createdAt.toISOString(),
          updatedAt: q.updatedAt.toISOString(),
          attentionReason: "Quote submitted for internal review prior to dispatch",
          nextActionLabel: "Review Quote",
          nextActionUrl: `/matching/workspace?buyOrderId=${q.buyOrderId}`,
          meta: {
            buyOrderId: q.buyOrderId,
            matchId: q.matchId,
            materialType: q.buyOrder.materialType,
            quantity: q.buyOrder.quantity,
            quantityUnit: q.buyOrder.quantityUnit,
          },
        });
      } else if (q.status === "COUNTERED") {
        queueItems.push({
          id: `queue-quote-${q.id}`,
          category: "quote_countered",
          referenceId: q.id,
          referenceDisplay: `Quote · ${q.quoteNumber} (Countered)`,
          organisationName: q.buyerOrganisation.name,
          organisationType: "BUYER",
          currentStatus: "COUNTERED",
          createdAt: q.createdAt.toISOString(),
          updatedAt: q.updatedAt.toISOString(),
          attentionReason: "Buyer submitted commercial counter-offer awaiting Trader review",
          nextActionLabel: "Review Counter",
          nextActionUrl: `/matching/workspace?buyOrderId=${q.buyOrderId}`,
          meta: {
            buyOrderId: q.buyOrderId,
            matchId: q.matchId,
            materialType: q.buyOrder.materialType,
            quantity: q.buyOrder.quantity,
            quantityUnit: q.buyOrder.quantityUnit,
          },
        });
      } else if (q.status === "SENT") {
        queueItems.push({
          id: `queue-quote-${q.id}`,
          category: "quote_awaiting_buyer",
          referenceId: q.id,
          referenceDisplay: `Quote · ${q.quoteNumber} (Sent)`,
          organisationName: q.buyerOrganisation.name,
          organisationType: "BUYER",
          currentStatus: "SENT",
          createdAt: q.createdAt.toISOString(),
          updatedAt: q.updatedAt.toISOString(),
          attentionReason: "Quote sent — awaiting Buyer decision",
          nextActionLabel: "View Quote",
          nextActionUrl: `/matching/workspace?buyOrderId=${q.buyOrderId}`,
          meta: {
            buyOrderId: q.buyOrderId,
            matchId: q.matchId,
            materialType: q.buyOrder.materialType,
            quantity: q.buyOrder.quantity,
            quantityUnit: q.buyOrder.quantityUnit,
          },
        });
      } else if (q.status === "ACCEPTED") {
        const hasTrade = q.trade;
        queueItems.push({
          id: `queue-quote-${q.id}`,
          category: "quote_accepted",
          referenceId: hasTrade ? hasTrade.id : q.id,
          referenceDisplay: hasTrade
            ? `Trade · ${hasTrade.tradeNumber} (Quote ${q.quoteNumber})`
            : `Quote · ${q.quoteNumber} (Accepted)`,
          organisationName: `${q.buyerOrganisation.name} ↔ ${q.supplierOrganisation.name}`,
          organisationType: "PARTNERSHIP",
          currentStatus: "ACCEPTED",
          createdAt: q.createdAt.toISOString(),
          updatedAt: q.updatedAt.toISOString(),
          attentionReason: hasTrade
            ? `Accepted commercial baseline — Trade ${hasTrade.tradeNumber} active`
            : "Quote accepted by Buyer — commercial baseline established",
          nextActionLabel: hasTrade ? "View Transaction" : "View Quote",
          nextActionUrl: hasTrade
            ? `/trades/${hasTrade.id}`
            : `/matching/workspace?buyOrderId=${q.buyOrderId}`,
          meta: {
            buyOrderId: q.buyOrderId,
            matchId: q.matchId,
            tradeId: hasTrade?.id,
            tradeNumber: hasTrade?.tradeNumber,
            materialType: q.buyOrder.materialType,
            quantity: q.buyOrder.quantity,
            quantityUnit: q.buyOrder.quantityUnit,
          },
        });
      }
    }


    const rawInspections = this.prisma.inspection
      ? await this.prisma.inspection.findMany({
          include: {
            supplierOrganisation: { select: { id: true, name: true } },
            trade: { select: { id: true, tradeNumber: true, materialType: true, quantity: true, quantityUnit: true } },
            assignedInspectorUser: { select: { id: true, email: true } },
            evidence: { select: { id: true } },
            nonConformities: { select: { id: true, status: true } },
            qualityResult: { select: { decision: true, classificationLabel: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }).catch(() => [])
      : [];

    if (rawInspections && Array.isArray(rawInspections)) {
      for (const ins of rawInspections) {
        let statusLabel = "Inspection Unassigned";
        let attentionReason = "Inspection created — awaiting inspector assignment";
        let nextActionLabel = "Assign Inspector";

        if (ins.physicalInspectionRequired) {
          statusLabel = "Physical Inspection Required";
          attentionReason = ins.physicalInspectionReason || "Physical inspection escalation requested";
          nextActionLabel = "Review Physical Inspection";
        } else if (ins.nonConformities?.some((nc: { status: string }) => nc.status === "OPEN")) {
          statusLabel = "Non-Conformity Open";
          attentionReason = "Open quality non-conformity requires review";
          nextActionLabel = "Review Non-Conformity";
        } else if (ins.status === "COMPLETED") {
          if (ins.qualityResult) {
            statusLabel = `Quality Decision: ${ins.qualityResult.decision}`;
            attentionReason = `Final quality result recorded (${ins.qualityResult.classificationLabel})`;
            nextActionLabel = "View Inspection";
          } else {
            statusLabel = "Quality Decision Required";
            attentionReason = "Inspection data complete — awaiting final quality decision";
            nextActionLabel = "Review & Finalize";
          }
        } else if (ins.status === "IN_PROGRESS") {
          if (!ins.evidence || ins.evidence.length === 0) {
            statusLabel = "Inspection Awaiting Evidence";
            attentionReason = "Inspection in progress — awaiting evidence capture";
          } else {
            statusLabel = "Inspection In Progress";
            attentionReason = "Inspection in progress — measurement entry ongoing";
          }
          nextActionLabel = "View Inspection";
        } else if (ins.status === "ASSIGNED") {
          statusLabel = "Inspection Assigned";
          attentionReason = "Inspection assigned — awaiting inspector start";
          nextActionLabel = "View Inspection";
        }

        queueItems.push({
          id: `queue-inspection-${ins.id}`,
          category: "quality_inspection",
          referenceId: ins.id,
          referenceDisplay: `Inspection · ${ins.inspectionReference} (${ins.trade?.tradeNumber ?? "Trade"})`,
          organisationName: ins.supplierOrganisation?.name ?? "Supplier",
          organisationType: "SUPPLIER",
          currentStatus: statusLabel,
          createdAt: ins.createdAt.toISOString(),
          updatedAt: ins.updatedAt.toISOString(),
          attentionReason,
          nextActionLabel,
          nextActionUrl: `/quality/inspections/${ins.id}`,
          meta: {
            inspectionId: ins.id,
            tradeId: ins.tradeId ?? undefined,
            inspectionReference: ins.inspectionReference,
            status: ins.status,
          },
        });
      }
    }

    const categoryRank: Record<string, number> = {
      quote_countered: 1,
      quote_internal_review: 2,
      buyer_demand_open: 3,
      buyer_demand_draft: 4,
      supplier_onboarding: 5,
      listing_review: 6,
      approved_match: 7,
      quality_inspection: 8,
      quote_awaiting_buyer: 9,
      quote_accepted: 10,
      quote_rejected: 11,
    };

    queueItems.sort((a, b) => {
      const getRank = (item: OperationalQueueItem) => {
        if (item.category === "buyer_demand") {
          return item.currentStatus === "OPEN"
            ? categoryRank.buyer_demand_open
            : categoryRank.buyer_demand_draft;
        }
        return categoryRank[item.category] ?? 99;
      };

      const rankDiff = getRank(a) - getRank(b);
      if (rankDiff !== 0) return rankDiff;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return {
      summary: {
        supplierOnboardingCount,
        pendingListingsCount,
        publishedListingsCount,
        openBuyOrdersCount,
        approvedMatchesCount,
      },
      operationalQueue: queueItems,
      openBuyOrders,
      approvedMatches,
    };
  }


  async listSuppliersForTrader(
    userId: string,
    query?: { search?: string; country?: string; verificationStatus?: string },
  ): Promise<TraderSupplierCollection> {
    await this.assertTraderAccess(userId);

    const where: Record<string, unknown> = {
      organisationType: "SUPPLIER",
    };

    if (query?.country && query.country.trim() !== "") {
      where.country = { equals: query.country.trim(), mode: "insensitive" };
    }
    if (query?.verificationStatus && query.verificationStatus.trim() !== "") {
      where.verificationStatus = query.verificationStatus.trim();
    }
    if (query?.search && query.search.trim() !== "") {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { legalName: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ];
    }

    const suppliers = await this.prisma.organisation.findMany({
      where,
      select: {
        id: true,
        name: true,
        legalName: true,
        country: true,
        city: true,
        verificationStatus: true,
        createdAt: true,
        _count: {
          select: { sites: true },
        },
        listings: {
          select: { status: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const items = suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      legalName: s.legalName,
      country: s.country,
      city: s.city,
      verificationStatus: s.verificationStatus,
      publishedListingCount: s.listings.filter((l) => l.status === "PUBLISHED").length,
      draftListingCount: s.listings.filter((l) => l.status === "DRAFT").length,
      siteCount: s._count.sites,
      createdAt: s.createdAt.toISOString(),
    }));

    return { items, total: items.length };
  }

  async getSupplierDetailForTrader(
    userId: string,
    organisationId: string,
  ): Promise<TraderSupplierDetail> {
    await this.assertTraderAccess(userId);

    const org = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      include: {
        sites: {
          orderBy: { createdAt: "asc" },
        },
        listings: {
          include: {
            site: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        complianceDocuments: {
          select: {
            id: true,
            documentType: true,
            originalFilename: true,
            mimeType: true,
            fileSize: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!org || org.organisationType.toUpperCase() !== "SUPPLIER") {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/trader/supplier-not-found",
        title: "Supplier Not Found",
        status: 404,
        detail: `Supplier organisation with ID ${organisationId} not found.`,
      });
    }

    const publishedCount = org.listings.filter((l) => l.status === "PUBLISHED").length;
    const draftCount = org.listings.filter((l) => l.status === "DRAFT").length;

    return {
      id: org.id,
      name: org.name,
      legalName: org.legalName,
      businessType: org.businessType,
      registrationNumber: org.registrationNumber,
      vatNumber: org.vatNumber,
      address: org.address,
      city: org.city,
      postalCode: org.postalCode,
      country: org.country,
      contactName: org.contactName,
      contactEmail: org.contactEmail,
      contactPhone: org.contactPhone,
      verificationStatus: org.verificationStatus,
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString(),
      summary: {
        publishedListingCount: publishedCount,
        draftListingCount: draftCount,
        siteCount: org.sites.length,
        documentCount: org.complianceDocuments.length,
      },
      sites: org.sites.map((s) => ({
        id: s.id,
        name: s.name,
        facilityType: s.facilityType,
        address: s.address,
        city: s.city,
        postalCode: s.postalCode,
        country: s.country,
        landAreaHectares: s.landAreaHectares,
        createdAt: s.createdAt.toISOString(),
      })),
      listings: org.listings.map((l) => ({
        id: l.id,
        siteId: l.siteId,
        siteName: l.site?.name ?? null,
        title: l.title,
        description: l.description,
        materialType: l.materialType,
        productForm: l.productForm,
        quantity: l.quantity,
        quantityUnit: l.quantityUnit,
        priceAmount: l.priceAmount,
        currency: l.currency,
        priceUnit: l.priceUnit,
        originCountry: l.originCountry,
        harvestYear: l.harvestYear,
        status: l.status,
        createdAt: l.createdAt.toISOString(),
      })),
      complianceDocuments: org.complianceDocuments.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        originalFilename: d.originalFilename,
        mimeType: d.mimeType,
        fileSize: d.fileSize,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
      })),
    };
  }

  async listBuyersForTrader(
    userId: string,
    query?: { search?: string; country?: string; verificationStatus?: string },
  ): Promise<TraderBuyerCollection> {
    await this.assertTraderAccess(userId);

    const where: Record<string, unknown> = {
      organisationType: "BUYER",
    };

    if (query?.country && query.country.trim() !== "") {
      where.country = { equals: query.country.trim(), mode: "insensitive" };
    }
    if (query?.verificationStatus && query.verificationStatus.trim() !== "") {
      where.verificationStatus = query.verificationStatus.trim();
    }
    if (query?.search && query.search.trim() !== "") {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { legalName: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ];
    }

    const rawBuyers = await this.prisma.organisation.findMany({
      where,
      select: {
        id: true,
        name: true,
        legalName: true,
        country: true,
        city: true,
        verificationStatus: true,
        createdAt: true,
        buyOrders: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        buyerMatches: {
          where: { status: "APPROVED" },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const items = rawBuyers.map((b) => ({
      id: b.id,
      name: b.name,
      legalName: b.legalName,
      country: b.country,
      city: b.city,
      verificationStatus: b.verificationStatus,
      totalBuyOrderCount: b.buyOrders.length,
      openBuyOrderCount: b.buyOrders.filter((o) => o.status === "OPEN").length,
      approvedMatchCount: b.buyerMatches.length,
      mostRecentDemandDate: b.buyOrders[0]?.createdAt.toISOString() ?? null,
      createdAt: b.createdAt.toISOString(),
    }));

    return { items, total: items.length };
  }

  async getBuyerDetailForTrader(
    userId: string,
    organisationId: string,
  ): Promise<TraderBuyerDetail> {
    await this.assertTraderAccess(userId);

    const org = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      include: {
        buyOrders: {
          include: {
            matches: {
              select: { id: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        buyerMatches: {
          where: { status: "APPROVED" },
          include: {
            supplierOrganisation: { select: { id: true, name: true } },
            buyOrder: { select: { quantity: true, quantityUnit: true, currency: true } },
            listing: {
              select: {
                id: true,
                title: true,
                materialType: true,
                productForm: true,
              },
            },
          },
          orderBy: { approvedAt: "desc" },
        },
      },
    });

    if (!org || org.organisationType.toUpperCase() !== "BUYER") {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/trader/buyer-not-found",
        title: "Buyer Not Found",
        status: 404,
        detail: `Buyer organisation with ID ${organisationId} not found.`,
      });
    }

    const openCount = org.buyOrders.filter((o) => o.status === "OPEN").length;
    const draftCount = org.buyOrders.filter((o) => o.status === "DRAFT").length;

    const buyOrders = org.buyOrders.map((bo) => {
      let matchStatus: "No Match" | "Draft Match" | "Approved Match" = "No Match";
      let activeMatchId: string | null = null;
      const approvedMatch = bo.matches.find((m) => m.status === "APPROVED");
      const draftMatch = bo.matches.find((m) => m.status === "DRAFT");

      if (approvedMatch) {
        matchStatus = "Approved Match";
        activeMatchId = approvedMatch.id;
      } else if (draftMatch) {
        matchStatus = "Draft Match";
        activeMatchId = draftMatch.id;
      }

      return {
        id: bo.id,
        materialType: bo.materialType,
        productForm: bo.productForm,
        quantity: bo.quantity,
        quantityUnit: bo.quantityUnit,
        deliveryCountry: bo.deliveryCountry,
        deliveryDestination: bo.deliveryDestination,
        requestedDeliveryDate: bo.requestedDeliveryDate
          ? bo.requestedDeliveryDate.toISOString()
          : null,
        targetPriceAmount: bo.targetPriceAmount,
        currency: bo.currency,
        targetPriceUnit: bo.targetPriceUnit,
        status: bo.status,
        matchStatus,
        activeMatchId,
        createdByTrader: bo.createdByUserId === userId,
        createdAt: bo.createdAt.toISOString(),
      };
    });

    const approvedMatches = org.buyerMatches.map((m) => ({
      id: m.id,
      buyOrderId: m.buyOrderId,
      listingId: m.listingId,
      supplierOrganisationId: m.supplierOrganisationId,
      supplierOrganisationName: m.supplierOrganisation?.name ?? "Unknown Supplier",
      materialType: m.listing.materialType,
      productForm: m.listing.productForm,
      quantity: m.buyOrder.quantity,
      quantityUnit: m.buyOrder.quantityUnit,
      currency: m.buyOrder.currency,
      approvedAt: m.approvedAt ? m.approvedAt.toISOString() : null,
      nextStep: "Ready for Quotation" as const,
      createdAt: m.createdAt.toISOString(),
    }));

    const quotes = this.prisma.quote
      ? await this.prisma.quote.findMany({
          where: { buyerOrganisationId: organisationId },
          include: {
            buyOrder: { select: { materialType: true } },
            versions: {
              select: { versionNumber: true, totalAmount: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        })
      : [];

    const quotesList = quotes.map((q) => {
      const currentVer = q.versions.find((v) => v.versionNumber === q.currentVersionNumber) ?? q.versions[0];
      return {
        id: q.id,
        quoteNumber: q.quoteNumber,
        currentVersionNumber: q.currentVersionNumber,
        totalAmount: currentVer ? Number(currentVer.totalAmount) : 0,
        currency: q.currency,
        status: q.status,
        materialType: q.buyOrder?.materialType || "Commercial Material",
        lastActivity: (q.updatedAt || q.createdAt).toISOString(),
      };
    });

    return {
      id: org.id,
      name: org.name,
      legalName: org.legalName,
      businessType: org.businessType,
      registrationNumber: org.registrationNumber,
      vatNumber: org.vatNumber,
      address: org.address,
      city: org.city,
      postalCode: org.postalCode,
      country: org.country,
      contactName: org.contactName,
      contactEmail: org.contactEmail,
      contactPhone: org.contactPhone,
      verificationStatus: org.verificationStatus,
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString(),
      summary: {
        totalBuyOrders: org.buyOrders.length,
        openBuyOrders: openCount,
        draftBuyOrders: draftCount,
        approvedMatchesCount: org.buyerMatches.length,
      },
      buyOrders,
      approvedMatches,
      quotes: quotesList,
    };
  }

}
