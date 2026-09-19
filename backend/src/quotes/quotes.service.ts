import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes, randomUUID } from "node:crypto";
import { AuditEventWriter } from "../audit";
import { PrismaService } from "../database";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import type {
  CommercialBreakdown,
  CreateQuoteInput,
  QuoteCounterOfferInput,
  QuoteCounterOfferSummary,
  QuoteDetail,
  QuoteStatus,
  QuoteSummary,
  QuoteTimelineEvent,
  QuoteVersionSummary,
  RejectQuoteInput,
  ReviseCounterQuoteInput,
  UpdateQuoteInput,
} from "./contracts";
import { validateAndCalculateQuoteTotal } from "./quotes.calculator";
import {
  type QuoteRecordWithRelations,
  QuotesRepository,
} from "./quotes.repository";

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotesRepository: QuotesRepository,
    private readonly organisationsRepository: OrganisationsRepository,
    private readonly auditEvents: AuditEventWriter,
  ) {}

  async createQuote(
    userId: string,
    input: CreateQuoteInput,
  ): Promise<QuoteDetail> {
    await this.assertTraderAccess(userId);

    const match = await this.prisma.match.findUnique({
      where: { id: input.matchId },
      include: {
        buyOrder: true,
        listing: true,
        buyerOrganisation: true,
        supplierOrganisation: true,
      },
    });

    if (!match) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/match-not-found",
        title: "Match Not Found",
        status: 404,
        detail: `Match with ID ${input.matchId} does not exist.`,
      });
    }

    if (match.status !== "APPROVED") {
      throw new ConflictException({
        type: "https://errors.idogrow.com/quotes/match-not-approved",
        title: "Match Not Approved",
        status: 409,
        detail: "A quotation can only be prepared for an APPROVED commercial match.",
      });
    }

    const existingQuote = await this.quotesRepository.findQuoteByMatchId(
      input.matchId,
    );
    if (existingQuote) {
      throw new ConflictException({
        type: "https://errors.idogrow.com/quotes/already-exists",
        title: "Quote Already Exists",
        status: 409,
        detail: `A quotation already exists for match ${input.matchId} (${existingQuote.quoteNumber}). Revisions must be made via versioning.`,
      });
    }

    const currency = this.resolveQuoteCurrency(
      match.buyOrder.currency,
      match.listing.currency,
    );

    const { totalAmount, validatedBreakdown } = validateAndCalculateQuoteTotal(
      input.commercialBreakdown,
    );

    const validUntilDate = input.validUntil
      ? new Date(input.validUntil)
      : null;

    const quoteNumber = this.generateQuoteNumber();

    const record = await this.quotesRepository.createQuote({
      quoteNumber,
      matchId: match.id,
      buyOrderId: match.buyOrderId,
      listingId: match.listingId,
      buyerOrganisationId: match.buyerOrganisationId || match.buyOrder.buyerOrganisationId,
      supplierOrganisationId: match.supplierOrganisationId || match.listing.organisationId,
      createdByUserId: userId,
      currency,
      breakdown: validatedBreakdown,
      totalAmount,
      incoterm: input.incoterm?.trim() || null,
      paymentTerms: input.paymentTerms?.trim() || null,
      validUntil: validUntilDate,
      commercialNotes: input.commercialNotes?.trim() || null,
    });

    await this.auditEvents.append({
      eventType: "quote.created",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "quote", id: record.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        quoteNumber: record.quoteNumber,
        matchId: record.matchId,
        versionNumber: "1",
        totalAmount: String(totalAmount),
        currency,
        status: "DRAFT",
      },
    });

    await this.auditEvents.append({
      eventType: "quote.version.created",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "quote", id: record.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        quoteNumber: record.quoteNumber,
        versionNumber: "1",
        totalAmount: String(totalAmount),
        currency,
      },
    });

    return await this.mapToDetail(record);
  }

  async getQuoteById(userId: string, quoteId: string): Promise<QuoteDetail> {
    await this.assertTraderAccess(userId);

    const record = await this.quotesRepository.findQuoteById(quoteId);
    if (!record) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/not-found",
        title: "Quote Not Found",
        status: 404,
        detail: `Quote with ID ${quoteId} not found.`,
      });
    }

    return await this.mapToDetail(record);
  }

  async getQuoteByMatchId(
    userId: string,
    matchId: string,
  ): Promise<QuoteDetail | null> {
    await this.assertTraderAccess(userId);

    const record = await this.quotesRepository.findQuoteByMatchId(matchId);
    if (!record) {
      return null;
    }

    return await this.mapToDetail(record);
  }

  async updateQuote(
    userId: string,
    quoteId: string,
    input: UpdateQuoteInput,
  ): Promise<QuoteDetail> {
    await this.assertTraderAccess(userId);

    const existing = await this.quotesRepository.findQuoteById(quoteId);
    if (!existing) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/not-found",
        title: "Quote Not Found",
        status: 404,
        detail: `Quote with ID ${quoteId} not found.`,
      });
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/immutable-version",
        title: "Quote Immutable",
        status: 400,
        detail: `Quotes cannot be edited in ${existing.status} status. Only DRAFT proposals can be updated.`,
      });
    }

    const { totalAmount, validatedBreakdown } = validateAndCalculateQuoteTotal(
      input.commercialBreakdown,
    );

    const nextVersionNumber = existing.currentVersionNumber + 1;
    const validUntilDate = input.validUntil
      ? new Date(input.validUntil)
      : null;

    const updatedRecord = await this.quotesRepository.createQuoteVersion(
      quoteId,
      nextVersionNumber,
      {
        quoteId,
        versionNumber: nextVersionNumber,
        breakdown: validatedBreakdown,
        totalAmount,
        currency: existing.currency,
        incoterm: input.incoterm?.trim() || null,
        paymentTerms: input.paymentTerms?.trim() || null,
        validUntil: validUntilDate,
        commercialNotes: input.commercialNotes?.trim() || null,
        createdByUserId: userId,
      },
    );

    await this.auditEvents.append({
      eventType: "quote.version.created",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "quote", id: updatedRecord.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        quoteNumber: updatedRecord.quoteNumber,
        versionNumber: String(nextVersionNumber),
        totalAmount: String(totalAmount),
        currency: existing.currency,
      },
    });

    return await this.mapToDetail(updatedRecord);
  }

  async submitForInternalReview(
    userId: string,
    quoteId: string,
  ): Promise<QuoteDetail> {
    await this.assertTraderAccess(userId);

    const existing = await this.quotesRepository.findQuoteById(quoteId);
    if (!existing) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/not-found",
        title: "Quote Not Found",
        status: 404,
        detail: `Quote with ID ${quoteId} not found.`,
      });
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/invalid-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: `Only DRAFT quotes can be submitted for internal review. Current status: ${existing.status}.`,
      });
    }

    const updated = await this.quotesRepository.updateQuoteStatus(
      quoteId,
      "INTERNAL_REVIEW",
    );

    await this.auditEvents.append({
      eventType: "quote.submitted_for_internal_review",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "quote", id: updated.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        quoteNumber: updated.quoteNumber,
        versionNumber: String(updated.currentVersionNumber),
        status: "INTERNAL_REVIEW",
      },
    });

    return await this.mapToDetail(updated);
  }

  async returnToDraft(userId: string, quoteId: string): Promise<QuoteDetail> {
    await this.assertTraderAccess(userId);

    const existing = await this.quotesRepository.findQuoteById(quoteId);
    if (!existing) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/not-found",
        title: "Quote Not Found",
        status: 404,
        detail: `Quote with ID ${quoteId} not found.`,
      });
    }

    if (existing.status !== "INTERNAL_REVIEW") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/invalid-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: `Only quotes under INTERNAL_REVIEW can be returned to DRAFT. Current status: ${existing.status}.`,
      });
    }

    const updated = await this.quotesRepository.updateQuoteStatus(
      quoteId,
      "DRAFT",
    );

    await this.auditEvents.append({
      eventType: "quote.returned_to_draft",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "quote", id: updated.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        quoteNumber: updated.quoteNumber,
        versionNumber: String(updated.currentVersionNumber),
        status: "DRAFT",
      },
    });

    return await this.mapToDetail(updated);
  }

  // ==========================================
  // BLOCK 02: TRADER ACTIONS
  // ==========================================

  async sendQuote(userId: string, quoteId: string): Promise<QuoteDetail> {
    await this.assertTraderAccess(userId);

    const existing = await this.quotesRepository.findQuoteById(quoteId);
    if (!existing) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/not-found",
        title: "Quote Not Found",
        status: 404,
        detail: `Quote with ID ${quoteId} not found.`,
      });
    }

    if (existing.status !== "INTERNAL_REVIEW") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/invalid-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: `Only quotes under INTERNAL_REVIEW can be sent to Buyer. Current status: ${existing.status}.`,
      });
    }

    if (!existing.versions || existing.versions.length === 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/no-versions",
        title: "No Quote Versions",
        status: 400,
        detail: "Cannot send a quotation without an immutable commercial version.",
      });
    }

    const updated = await this.quotesRepository.sendQuote(
      quoteId,
      userId,
      existing.currentVersionNumber,
    );

    await this.auditEvents.append({
      eventType: "quote.sent",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "quote", id: updated.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        quoteNumber: updated.quoteNumber,
        versionNumber: String(updated.currentVersionNumber),
        status: "SENT",
        currency: updated.currency,
      },
    });

    return await this.mapToDetail(updated);
  }

  async reviseCounter(
    userId: string,
    quoteId: string,
    input: ReviseCounterQuoteInput,
  ): Promise<QuoteDetail> {
    await this.assertTraderAccess(userId);

    const existing = await this.quotesRepository.findQuoteById(quoteId);
    if (!existing) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/not-found",
        title: "Quote Not Found",
        status: 404,
        detail: `Quote with ID ${quoteId} not found.`,
      });
    }

    if (existing.status !== "COUNTERED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/invalid-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: `Only COUNTERED quotes can be revised. Current status: ${existing.status}.`,
      });
    }

    // Latest version for base breakdown fallback
    const latestVersion =
      existing.versions.find((v) => v.versionNumber === existing.currentVersionNumber) ||
      existing.versions[0];

    const breakdown: CommercialBreakdown = input.commercialBreakdown || {
      productValue: latestVersion.productValue,
      idoGrowMarginCommission: latestVersion.idoGrowMarginCommission,
      inspectionCost: latestVersion.inspectionCost,
      packagingCost: latestVersion.packagingCost,
      inlandTransportCost: latestVersion.inlandTransportCost,
      internationalFreightCost: latestVersion.internationalFreightCost,
      customsCost: latestVersion.customsCost,
      insuranceCost: latestVersion.insuranceCost,
      storageCost: latestVersion.storageCost,
      taxAmount: latestVersion.taxAmount,
      otherServiceFees: latestVersion.otherServiceFees,
    };

    const { totalAmount, validatedBreakdown } = validateAndCalculateQuoteTotal(breakdown);
    const nextVersionNumber = existing.currentVersionNumber + 1;
    const validUntilDate = input.validUntil
      ? new Date(input.validUntil)
      : latestVersion.validUntil;

    const updatedRecord = await this.quotesRepository.createQuoteVersion(
      quoteId,
      nextVersionNumber,
      {
        quoteId,
        versionNumber: nextVersionNumber,
        breakdown: validatedBreakdown,
        totalAmount,
        currency: existing.currency,
        incoterm: input.incoterm !== undefined ? input.incoterm?.trim() || null : latestVersion.incoterm,
        paymentTerms: input.paymentTerms !== undefined ? input.paymentTerms?.trim() || null : latestVersion.paymentTerms,
        validUntil: validUntilDate,
        commercialNotes: input.commercialNotes !== undefined ? input.commercialNotes?.trim() || null : latestVersion.commercialNotes,
        createdByUserId: userId,
      },
    );

    await this.auditEvents.append({
      eventType: "quote.version.created",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "quote", id: updatedRecord.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        quoteNumber: updatedRecord.quoteNumber,
        versionNumber: String(nextVersionNumber),
        totalAmount: String(totalAmount),
        currency: existing.currency,
      },
    });

    await this.auditEvents.append({
      eventType: "quote.counter.revised",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "quote", id: updatedRecord.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        quoteNumber: updatedRecord.quoteNumber,
        versionNumber: String(nextVersionNumber),
        status: "DRAFT",
        currency: existing.currency,
      },
    });

    return await this.mapToDetail(updatedRecord);
  }

  // ==========================================
  // BLOCK 02: BUYER ACTIONS & INBOX
  // ==========================================

  async getBuyerQuotes(userId: string): Promise<QuoteSummary[]> {
    const buyerOrgId = await this.assertBuyerAccess(userId);

    const records = await this.quotesRepository.findQuotesByBuyer(buyerOrgId, [
      "SENT",
      "COUNTERED",
      "ACCEPTED",
      "REJECTED",
    ]);

    return records.map((r) => this.mapToSummary(r));
  }

  async getBuyerQuoteById(userId: string, quoteId: string): Promise<QuoteDetail> {
    const buyerOrgId = await this.assertBuyerAccess(userId);

    const record = await this.quotesRepository.findQuoteById(quoteId);
    if (
      !record ||
      record.buyerOrganisationId !== buyerOrgId ||
      record.status === "DRAFT" ||
      record.status === "INTERNAL_REVIEW"
    ) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/not-found",
        title: "Quote Not Found",
        status: 404,
        detail: `Quote with ID ${quoteId} not found or not accessible.`,
      });
    }

    return await this.mapToDetail(record);
  }

  async acceptQuoteByBuyer(userId: string, quoteId: string): Promise<QuoteDetail> {
    const buyerOrgId = await this.assertBuyerAccess(userId);

    const record = await this.quotesRepository.findQuoteById(quoteId);
    if (!record || record.buyerOrganisationId !== buyerOrgId) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/not-found",
        title: "Quote Not Found",
        status: 404,
        detail: `Quote with ID ${quoteId} not found.`,
      });
    }

    if (record.status !== "SENT") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/invalid-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: `Only SENT quotes can be accepted by the Buyer. Current status: ${record.status}.`,
      });
    }

    if (!record.sentVersionNumber) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/not-sent",
        title: "Quote Not Dispatched",
        status: 400,
        detail: "Quote has no recorded dispatched version number.",
      });
    }

    const sentVersion = record.versions.find(
      (v) => v.versionNumber === record.sentVersionNumber,
    );

    if (!sentVersion) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/sent-version-not-found",
        title: "Dispatched Version Not Found",
        status: 400,
        detail: `Dispatched quote version ${record.sentVersionNumber} could not be found.`,
      });
    }

    if (
      sentVersion.validUntil &&
      new Date(sentVersion.validUntil).getTime() < Date.now()
    ) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/expired",
        title: "Quote Expired",
        status: 400,
        detail:
          "Quote expired. This quotation has passed its validity date and can no longer be accepted.",
      });
    }

    const acceptedAt = new Date();
    const tradeNumber = this.generateTradeNumber();

    const updated = await this.quotesRepository.acceptQuote(
      quoteId,
      userId,
      record.sentVersionNumber,
      {
        tradeNumber,
        matchId: record.matchId,
        buyOrderId: record.buyOrderId,
        listingId: record.listingId,
        buyerOrganisationId: record.buyerOrganisationId,
        supplierOrganisationId: record.supplierOrganisationId,
        materialType: record.buyOrder?.materialType || record.listing?.materialType || "Natural Fibre",
        productForm: record.buyOrder?.productForm || record.listing?.productForm || null,
        quantity: record.buyOrder?.quantity || 0,
        quantityUnit: record.buyOrder?.quantityUnit || "TONNES",
        currency: record.currency,
        acceptedTotalAmount: sentVersion.totalAmount,
        incoterm: sentVersion.incoterm || null,
        paymentTerms: sentVersion.paymentTerms || null,
        acceptedAt,
      },
      async (txDb, { trade, isFirstAcceptance }) => {
        if (!isFirstAcceptance) {
          return;
        }

        await this.auditEvents.append(
          {
            eventType: "quote.accepted",
            outcome: "succeeded",
            actor: { type: "user", userId },
            target: { type: "quote", id: record.id },
            correlationId: randomUUID(),
            occurredAt: acceptedAt,
            metadata: {
              quoteNumber: record.quoteNumber,
              versionNumber: String(record.sentVersionNumber),
              status: "ACCEPTED",
              currency: record.currency,
            },
          },
          txDb,
        );

        await this.auditEvents.append(
          {
            eventType: "trade.created",
            outcome: "succeeded",
            actor: { type: "user", userId },
            target: { type: "trade", id: trade.id },
            correlationId: randomUUID(),
            occurredAt: acceptedAt,
            metadata: {
              tradeNumber: trade.tradeNumber,
              quoteNumber: record.quoteNumber,
              acceptedVersionNumber: String(record.sentVersionNumber),
              currency: record.currency,
              acceptedTotalAmount: String(sentVersion.totalAmount),
            },
          },
          txDb,
        );
      },
    );

    return await this.mapToDetail(updated);
  }

  async rejectQuoteByBuyer(
    userId: string,
    quoteId: string,
    input?: RejectQuoteInput,
  ): Promise<QuoteDetail> {
    const buyerOrgId = await this.assertBuyerAccess(userId);

    const record = await this.quotesRepository.findQuoteById(quoteId);
    if (!record || record.buyerOrganisationId !== buyerOrgId) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/not-found",
        title: "Quote Not Found",
        status: 404,
        detail: `Quote with ID ${quoteId} not found.`,
      });
    }

    if (record.status !== "SENT") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/invalid-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: `Only SENT quotes can be rejected by the Buyer. Current status: ${record.status}.`,
      });
    }

    if (!record.sentVersionNumber) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/not-sent",
        title: "Quote Not Dispatched",
        status: 400,
        detail: "Quote has no recorded dispatched version number.",
      });
    }

    const updated = await this.quotesRepository.rejectQuote(
      quoteId,
      userId,
      input?.rejectionReason,
    );

    await this.auditEvents.append({
      eventType: "quote.rejected",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "quote", id: updated.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        quoteNumber: updated.quoteNumber,
        versionNumber: String(record.sentVersionNumber),
        status: "REJECTED",
        currency: updated.currency,
        reason: input?.rejectionReason ?? "",
      },
    });

    return await this.mapToDetail(updated);
  }

  async counterQuoteByBuyer(
    userId: string,
    quoteId: string,
    input: QuoteCounterOfferInput,
  ): Promise<QuoteDetail> {
    const buyerOrgId = await this.assertBuyerAccess(userId);

    const record = await this.quotesRepository.findQuoteById(quoteId);
    if (!record || record.buyerOrganisationId !== buyerOrgId) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quotes/not-found",
        title: "Quote Not Found",
        status: 404,
        detail: `Quote with ID ${quoteId} not found.`,
      });
    }

    if (record.status !== "SENT") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/invalid-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: `Only SENT quotes can be countered by the Buyer. Current status: ${record.status}.`,
      });
    }

    if (!record.sentVersionNumber) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/not-sent",
        title: "Quote Not Dispatched",
        status: 400,
        detail: "Quote has no recorded dispatched version number.",
      });
    }

    if (!input.buyerNote?.trim()) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/missing-counter-note",
        title: "Counter-offer Note Required",
        status: 400,
        detail: "A counter-offer note / commercial rationale is required.",
      });
    }

    const updated = await this.quotesRepository.createCounterOffer({
      quoteId,
      sourceVersionNumber: record.sentVersionNumber,
      buyerOrganisationId: buyerOrgId,
      createdByUserId: userId,
      proposedProductValue: input.proposedProductValue ?? null,
      proposedTotalAmount: input.proposedTotalAmount ?? null,
      proposedIncoterm: input.proposedIncoterm?.trim() || null,
      proposedPaymentTerms: input.proposedPaymentTerms?.trim() || null,
      buyerNote: input.buyerNote.trim(),
    });

    await this.auditEvents.append({
      eventType: "quote.countered",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "quote", id: updated.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: {
        quoteNumber: updated.quoteNumber,
        versionNumber: String(record.sentVersionNumber),
        status: "COUNTERED",
        currency: updated.currency,
      },
    });

    return await this.mapToDetail(updated);
  }

  // ==========================================
  // HELPERS & RESOLVERS
  // ==========================================

  private resolveQuoteCurrency(
    buyOrderCurrency: string | null | undefined,
    listingCurrency: string | null | undefined,
  ): string {
    const boCurr = buyOrderCurrency?.trim().toUpperCase() || null;
    const lstCurr = listingCurrency?.trim().toUpperCase() || null;

    if (boCurr && lstCurr) {
      if (boCurr === lstCurr) {
        return boCurr;
      }
      throw new ConflictException({
        type: "https://errors.idogrow.com/quotes/currency-conflict",
        title: "PROJECT OWNER DECISION REQUIRED — QUOTE CURRENCY CONFLICT",
        status: 409,
        detail: `Commercial currency conflict between BuyOrder (${boCurr}) and Listing (${lstCurr}). No FX conversion permitted.`,
        buyOrderCurrency: boCurr,
        listingCurrency: lstCurr,
      });
    }

    if (boCurr) return boCurr;
    if (lstCurr) return lstCurr;

    throw new BadRequestException({
      type: "https://errors.idogrow.com/quotes/missing-currency",
      title: "Commercial Currency Missing",
      status: 400,
      detail: "No valid commercial currency found on matched BuyOrder or Listing.",
    });
  }

  private async assertTraderAccess(userId: string): Promise<void> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    const isTrader = memberships?.some(
      (m) => m.organisation.organisationType.toUpperCase() === "TRADER",
    );

    if (!isTrader) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quotes/trader-access-required",
        title: "Trader Access Required",
        status: 403,
        detail: "Only authenticated Trader organisations can manage quotations.",
      });
    }
  }

  private async assertBuyerAccess(userId: string): Promise<string> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);

    const buyerMembership = memberships?.find(
      (m) => m.organisation.organisationType.toUpperCase() === "BUYER",
    );

    if (!buyerMembership) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quotes/buyer-access-required",
        title: "Buyer Access Required",
        status: 403,
        detail: "Only authenticated Buyer organisations can access Buyer quotations.",
      });
    }

    return buyerMembership.organisationId;
  }

  private generateTradeNumber(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const randomHex = randomBytes(2).toString("hex").toUpperCase();
    return `TRD-${yyyy}${mm}${dd}-${randomHex}`;
  }

  private generateQuoteNumber(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const randomHex = randomBytes(2).toString("hex").toUpperCase();
    return `QT-${yyyy}${mm}${dd}-${randomHex}`;
  }

  private mapToSummary(record: QuoteRecordWithRelations): QuoteSummary {
    const versions: QuoteVersionSummary[] = (record.versions || []).map((v) => ({
      id: v.id,
      quoteId: v.quoteId,
      versionNumber: v.versionNumber,
      productValue: v.productValue,
      idoGrowMarginCommission: v.idoGrowMarginCommission,
      inspectionCost: v.inspectionCost,
      packagingCost: v.packagingCost,
      inlandTransportCost: v.inlandTransportCost,
      internationalFreightCost: v.internationalFreightCost,
      customsCost: v.customsCost,
      insuranceCost: v.insuranceCost,
      storageCost: v.storageCost,
      taxAmount: v.taxAmount,
      otherServiceFees: v.otherServiceFees,
      totalAmount: v.totalAmount,
      currency: v.currency,
      incoterm: v.incoterm,
      paymentTerms: v.paymentTerms,
      validUntil: v.validUntil ? v.validUntil.toISOString() : null,
      commercialNotes: v.commercialNotes,
      createdByUserId: v.createdByUserId,
      createdByUserEmail: v.createdByUser?.email ?? null,
      createdAt: v.createdAt.toISOString(),
    }));

    const currentVersion =
      versions.find((v) => v.versionNumber === record.currentVersionNumber) ||
      versions[0];

    return {
      id: record.id,
      quoteNumber: record.quoteNumber,
      matchId: record.matchId,
      buyOrderId: record.buyOrderId,
      listingId: record.listingId,
      buyerOrganisationId: record.buyerOrganisationId,
      buyerOrganisationName: record.buyerOrganisation?.name ?? "Unknown Buyer",
      supplierOrganisationId: record.supplierOrganisationId,
      supplierOrganisationName: record.supplierOrganisation?.name ?? "Unknown Supplier",
      materialType: record.buyOrder?.materialType ?? record.listing?.materialType ?? "Unknown",
      productForm: record.buyOrder?.productForm ?? record.listing?.productForm ?? null,
      quantity: record.buyOrder?.quantity ?? 0,
      quantityUnit: record.buyOrder?.quantityUnit ?? "TONNES",
      status: record.status as QuoteStatus,
      currency: record.currency,
      currentVersionNumber: record.currentVersionNumber,
      currentVersion,
      versionsCount: versions.length,
      sentAt: record.sentAt ? record.sentAt.toISOString() : null,
      sentByUserId: record.sentByUserId,
      sentVersionNumber: record.sentVersionNumber,
      acceptedAt: record.acceptedAt ? record.acceptedAt.toISOString() : null,
      acceptedByUserId: record.acceptedByUserId,
      acceptedVersionNumber: record.acceptedVersionNumber,
      rejectedAt: record.rejectedAt ? record.rejectedAt.toISOString() : null,
      rejectedByUserId: record.rejectedByUserId,
      rejectionReason: record.rejectionReason,
      trade: record.trade
        ? {
            id: record.trade.id,
            tradeNumber: record.trade.tradeNumber,
            acceptedQuoteVersionNumber: record.trade.acceptedQuoteVersionNumber,
            currency: record.trade.currency,
            acceptedTotalAmount: record.trade.acceptedTotalAmount,
            acceptedAt: record.trade.acceptedAt.toISOString(),
            createdAt: record.trade.createdAt.toISOString(),
          }
        : null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private async mapToDetail(record: QuoteRecordWithRelations): Promise<QuoteDetail> {
    const summary = this.mapToSummary(record);

    const versions: QuoteVersionSummary[] = (record.versions || []).map((v) => ({
      id: v.id,
      quoteId: v.quoteId,
      versionNumber: v.versionNumber,
      productValue: v.productValue,
      idoGrowMarginCommission: v.idoGrowMarginCommission,
      inspectionCost: v.inspectionCost,
      packagingCost: v.packagingCost,
      inlandTransportCost: v.inlandTransportCost,
      internationalFreightCost: v.internationalFreightCost,
      customsCost: v.customsCost,
      insuranceCost: v.insuranceCost,
      storageCost: v.storageCost,
      taxAmount: v.taxAmount,
      otherServiceFees: v.otherServiceFees,
      totalAmount: v.totalAmount,
      currency: v.currency,
      incoterm: v.incoterm,
      paymentTerms: v.paymentTerms,
      validUntil: v.validUntil ? v.validUntil.toISOString() : null,
      commercialNotes: v.commercialNotes,
      createdByUserId: v.createdByUserId,
      createdByUserEmail: v.createdByUser?.email ?? null,
      createdAt: v.createdAt.toISOString(),
    }));

    const counterOffers: QuoteCounterOfferSummary[] = (record.counterOffers || []).map((co) => ({
      id: co.id,
      quoteId: co.quoteId,
      sourceVersionNumber: co.sourceVersionNumber,
      buyerOrganisationId: co.buyerOrganisationId,
      buyerOrganisationName: co.buyerOrganisation?.name ?? summary.buyerOrganisationName,
      createdByUserId: co.createdByUserId,
      createdByUserEmail: co.createdByUser?.email ?? null,
      proposedProductValue: co.proposedProductValue,
      proposedTotalAmount: co.proposedTotalAmount,
      proposedIncoterm: co.proposedIncoterm,
      proposedPaymentTerms: co.proposedPaymentTerms,
      buyerNote: co.buyerNote,
      createdAt: co.createdAt.toISOString(),
    }));

    // Build Chronological Timeline from persisted Audit Events
    const timeline: QuoteTimelineEvent[] = [];
    const persistedAuditEvents = typeof this.auditEvents?.findEventsByTarget === "function" ? await this.auditEvents.findEventsByTarget("quote", record.id) : [];

    if (persistedAuditEvents && persistedAuditEvents.length > 0) {
      for (const event of persistedAuditEvents) {
        const metadata = (event.metadata || {}) as Record<string, string>;
        const versionNumber = metadata.versionNumber ? Number(metadata.versionNumber) : undefined;
        const actorEmail = event.actorUserEmail || null;
        const occurredAt = event.occurredAt.toISOString();

        switch (event.eventType) {
          case "quote.created":
            timeline.push({
              id: `audit-${event.id}`,
              type: "created",
              title: versionNumber ? `Quote v${versionNumber} Created` : "Quote Created",
              description: metadata.totalAmount && metadata.currency
                ? `Commercial proposal initialized (${metadata.totalAmount} ${metadata.currency})`
                : "Commercial proposal initialized",
              versionNumber: versionNumber ?? 1,
              actorEmail,
              occurredAt,
            });
            break;

          case "quote.version.created":
            if (versionNumber && versionNumber > 1) {
              timeline.push({
                id: `audit-${event.id}`,
                type: "version_created",
                title: `Quote v${versionNumber} Created`,
                description: metadata.totalAmount && metadata.currency
                  ? `Commercial revision drafted (${metadata.totalAmount} ${metadata.currency})`
                  : "Commercial revision drafted",
                versionNumber,
                actorEmail,
                occurredAt,
              });
            }
            break;

          case "quote.submitted_for_internal_review":
            timeline.push({
              id: `audit-${event.id}`,
              type: "submitted_internal_review",
              title: versionNumber ? `Quote v${versionNumber} Submitted for Internal Review` : "Quote Submitted for Internal Review",
              description: "Proposal submitted for internal compliance and margin review",
              versionNumber,
              actorEmail,
              occurredAt,
            });
            break;

          case "quote.returned_to_draft":
            timeline.push({
              id: `audit-${event.id}`,
              type: "returned_to_draft",
              title: versionNumber ? `Quote v${versionNumber} Returned to Draft` : "Quote Returned to Draft",
              description: "Proposal returned to draft status for adjustments",
              versionNumber,
              actorEmail,
              occurredAt,
            });
            break;

          case "quote.sent":
            timeline.push({
              id: `audit-${event.id}`,
              type: "sent",
              title: versionNumber ? `Quote v${versionNumber} Sent to Buyer` : "Quote Sent to Buyer",
              description: `Proposal officially dispatched to ${summary.buyerOrganisationName}`,
              versionNumber,
              actorEmail,
              occurredAt,
            });
            break;

          case "quote.countered": {
            const matchingCounter = counterOffers.find(
              (co) => versionNumber && co.sourceVersionNumber === versionNumber,
            );
            timeline.push({
              id: `audit-${event.id}`,
              type: "countered",
              title: versionNumber ? `Buyer Countered v${versionNumber}` : "Buyer Counter-Offer",
              description: matchingCounter?.buyerNote || "Buyer proposed revised commercial terms",
              versionNumber,
              actorEmail,
              occurredAt,
            });
            break;
          }

          case "quote.counter.revised":
            timeline.push({
              id: `audit-${event.id}`,
              type: "counter_revised",
              title: versionNumber ? `Counter Revised into v${versionNumber}` : "Counter Revised",
              description: "Trader prepared revised commercial proposal in response to buyer counter-offer",
              versionNumber,
              actorEmail,
              occurredAt,
            });
            break;

          case "quote.accepted":
            timeline.push({
              id: `audit-${event.id}`,
              type: "accepted",
              title: versionNumber ? `Buyer Accepted v${versionNumber}` : "Quote Accepted",
              description: `Commercial proposal accepted by ${summary.buyerOrganisationName}`,
              versionNumber,
              actorEmail,
              occurredAt,
            });
            break;

          case "quote.rejected":
            timeline.push({
              id: `audit-${event.id}`,
              type: "rejected",
              title: versionNumber ? `Buyer Rejected v${versionNumber}` : "Quote Rejected",
              description: metadata.reason ? `Reason: ${metadata.reason}` : "Proposal declined by Buyer organisation",
              versionNumber,
              actorEmail,
              occurredAt,
            });
            break;

          default:
            break;
        }
      }
    } else {
      // Fallback reconstruction if no audit events are found
      for (const v of versions) {
        if (v.versionNumber === 1) {
          timeline.push({
            id: `event-v1-${v.id}`,
            type: "created",
            title: "Quote v1 Created",
            description: `Commercial proposal initialized (${v.totalAmount} ${v.currency})`,
            versionNumber: 1,
            actorEmail: v.createdByUserEmail,
            occurredAt: v.createdAt,
          });
        } else {
          timeline.push({
            id: `event-v${v.versionNumber}-${v.id}`,
            type: "version_created",
            title: `Quote v${v.versionNumber} Created`,
            description: `Commercial revision drafted (${v.totalAmount} ${v.currency})`,
            versionNumber: v.versionNumber,
            actorEmail: v.createdByUserEmail,
            occurredAt: v.createdAt,
          });
        }
      }

      if (record.sentAt) {
        timeline.push({
          id: `event-sent-${record.id}`,
          type: "sent",
          title: `Quote v${record.sentVersionNumber || record.currentVersionNumber} Sent to Buyer`,
          description: `Proposal officially dispatched to ${summary.buyerOrganisationName}`,
          versionNumber: record.sentVersionNumber || record.currentVersionNumber,
          occurredAt: record.sentAt.toISOString(),
        });
      }

      for (const co of counterOffers) {
        timeline.push({
          id: `event-counter-${co.id}`,
          type: "countered",
          title: `Buyer Countered v${co.sourceVersionNumber}`,
          description: co.buyerNote,
          versionNumber: co.sourceVersionNumber,
          actorEmail: co.createdByUserEmail,
          occurredAt: co.createdAt,
        });
      }

      if (record.acceptedAt) {
        timeline.push({
          id: `event-accepted-${record.id}`,
          type: "accepted",
          title: `Buyer Accepted v${record.acceptedVersionNumber || record.currentVersionNumber}`,
          description: `Commercial proposal accepted by ${summary.buyerOrganisationName}`,
          versionNumber: record.acceptedVersionNumber || record.currentVersionNumber,
          occurredAt: record.acceptedAt.toISOString(),
        });
      }

      if (record.rejectedAt) {
        timeline.push({
          id: `event-rejected-${record.id}`,
          type: "rejected",
          title: `Buyer Rejected v${record.sentVersionNumber || record.currentVersionNumber}`,
          description: record.rejectionReason
            ? `Reason: ${record.rejectionReason}`
            : "Proposal declined by Buyer organisation",
          versionNumber: record.sentVersionNumber || record.currentVersionNumber,
          occurredAt: record.rejectedAt.toISOString(),
        });
      }
    }

    // Sort chronologically ascending
    timeline.sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
    );

    return {
      ...summary,
      versions,
      counterOffers,
      timeline,
    };
  }
}
