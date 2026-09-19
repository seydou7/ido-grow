import { AuthenticationProblem } from "../authentication/authentication-problem";
import type { AuthenticationService } from "../authentication/authentication.service";
import { QuotesController } from "./quotes.controller";
import type { QuotesService } from "./quotes.service";
import type { QuoteDetail } from "./contracts";

describe("QuotesController", () => {
  let controller: QuotesController;
  let authenticationServiceMock: jest.Mocked<AuthenticationService>;
  let quotesServiceMock: jest.Mocked<QuotesService>;

  const traderUserId = "trader-user-1";
  const traderToken = "T".repeat(43);
  const validCookie = `ido_grow_session=${traderToken}`;
  const quoteId = "quote-123";
  const matchId = "match-456";

  const sampleQuoteDetail: QuoteDetail = {
    id: quoteId,
    quoteNumber: "QT-20260916-ABCD",
    matchId,
    buyOrderId: "bo-1",
    listingId: "lst-1",
    buyerOrganisationId: "org-b",
    buyerOrganisationName: "Buyer Inc",
    supplierOrganisationId: "org-s",
    supplierOrganisationName: "Supplier Inc",
    materialType: "HEMP",
    productForm: "FLAKES",
    quantity: 100,
    quantityUnit: "TONNES",
    status: "DRAFT",
    currency: "EUR",
    currentVersionNumber: 1,
    currentVersion: {
      id: "qv-1",
      quoteId,
      versionNumber: 1,
      productValue: 10000,
      idoGrowMarginCommission: 500,
      inspectionCost: 200,
      packagingCost: 100,
      inlandTransportCost: 300,
      internationalFreightCost: 600,
      customsCost: 200,
      insuranceCost: 100,
      storageCost: 50,
      taxAmount: 1200,
      otherServiceFees: 50,
      totalAmount: 13300,
      currency: "EUR",
      incoterm: "FOB",
      paymentTerms: "30_DAYS_NET",
      validUntil: "2026-10-15T00:00:00.000Z",
      commercialNotes: "Initial commercial proposal",
      createdByUserId: traderUserId,
      createdByUserEmail: "trader@idogrow.com",
      createdAt: "2026-09-16T12:00:00.000Z",
    },
    versionsCount: 1,
    createdAt: "2026-09-16T12:00:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z",
    sentAt: null,
    sentByUserId: null,
    sentVersionNumber: null,
    acceptedAt: null,
    acceptedByUserId: null,
    acceptedVersionNumber: null,
    rejectedAt: null,
    rejectedByUserId: null,
    rejectionReason: null,
    versions: [],
    counterOffers: [],
    timeline: [],
  };

  beforeEach(() => {
    authenticationServiceMock = {
      resolveIdentity: jest.fn().mockImplementation((rawToken: string | null) => {
        if (!rawToken || rawToken === "invalid-token") {
          throw new AuthenticationProblem(
            401,
            "AUTHENTICATION_REQUIRED",
            "Authentication required",
            "A valid application session is required.",
          );
        }
        return Promise.resolve({
          userId: traderUserId,
          email: "trader@idogrow.com",
          status: "ACTIVE",
        });
      }),
    } as unknown as jest.Mocked<AuthenticationService>;

    quotesServiceMock = {
      createQuote: jest.fn().mockResolvedValue(sampleQuoteDetail),
      getQuoteById: jest.fn().mockResolvedValue(sampleQuoteDetail),
      getQuoteByMatchId: jest.fn().mockResolvedValue(sampleQuoteDetail),
      updateQuote: jest.fn().mockResolvedValue(sampleQuoteDetail),
      submitForInternalReview: jest.fn().mockResolvedValue({
        ...sampleQuoteDetail,
        status: "INTERNAL_REVIEW",
      }),
      returnToDraft: jest.fn().mockResolvedValue({
        ...sampleQuoteDetail,
        status: "DRAFT",
      }),
      sendQuote: jest.fn().mockResolvedValue({
        ...sampleQuoteDetail,
        status: "SENT",
      }),
      reviseCounter: jest.fn().mockResolvedValue({
        ...sampleQuoteDetail,
        status: "DRAFT",
        currentVersionNumber: 2,
      }),
    } as unknown as jest.Mocked<QuotesService>;

    controller = new QuotesController(
      authenticationServiceMock,
      quotesServiceMock,
    );
  });

  it("rejects unauthenticated requests without cookie with 401", async () => {
    await expect(
      controller.createQuote(undefined, {
        matchId,
        commercialBreakdown: sampleQuoteDetail.currentVersion,
      }),
    ).rejects.toThrow(AuthenticationProblem);
  });

  it("resolves identity and delegates createQuote to QuotesService", async () => {
    const response = await controller.createQuote(validCookie, {
      matchId,
      commercialBreakdown: sampleQuoteDetail.currentVersion,
    });

    expect(authenticationServiceMock.resolveIdentity).toHaveBeenCalledWith(traderToken);
    expect(quotesServiceMock.createQuote).toHaveBeenCalledWith(
      traderUserId,
      expect.objectContaining({ matchId }),
    );
    expect(response.id).toBe(quoteId);
  });

  it("resolves identity and delegates getQuoteById to QuotesService", async () => {
    const response = await controller.getQuoteById(validCookie, quoteId);

    expect(quotesServiceMock.getQuoteById).toHaveBeenCalledWith(
      traderUserId,
      quoteId,
    );
    expect(response.id).toBe(quoteId);
  });

  it("resolves identity and delegates getQuoteByMatchId to QuotesService", async () => {
    const response = await controller.getQuoteByMatchId(validCookie, matchId);

    expect(quotesServiceMock.getQuoteByMatchId).toHaveBeenCalledWith(
      traderUserId,
      matchId,
    );
    expect(response?.id).toBe(quoteId);
  });

  it("resolves identity and delegates updateQuote to QuotesService", async () => {
    const response = await controller.updateQuote(validCookie, quoteId, {
      commercialBreakdown: sampleQuoteDetail.currentVersion,
    });

    expect(quotesServiceMock.updateQuote).toHaveBeenCalledWith(
      traderUserId,
      quoteId,
      expect.anything(),
    );
    expect(response.id).toBe(quoteId);
  });

  it("resolves identity and delegates submitForInternalReview to QuotesService", async () => {
    const response = await controller.submitForInternalReview(validCookie, quoteId);

    expect(quotesServiceMock.submitForInternalReview).toHaveBeenCalledWith(
      traderUserId,
      quoteId,
    );
    expect(response.status).toBe("INTERNAL_REVIEW");
  });

  it("resolves identity and delegates returnToDraft to QuotesService", async () => {
    const response = await controller.returnToDraft(validCookie, quoteId);

    expect(quotesServiceMock.returnToDraft).toHaveBeenCalledWith(
      traderUserId,
      quoteId,
    );
    expect(response.status).toBe("DRAFT");
  });

  it("resolves identity and delegates sendQuote to QuotesService", async () => {
    const response = await controller.sendQuote(validCookie, quoteId);

    expect(quotesServiceMock.sendQuote).toHaveBeenCalledWith(
      traderUserId,
      quoteId,
    );
    expect(response.status).toBe("SENT");
  });

  it("resolves identity and delegates reviseCounter to QuotesService", async () => {
    const response = await controller.reviseCounter(validCookie, quoteId, {
      commercialBreakdown: sampleQuoteDetail.currentVersion,
    });

    expect(quotesServiceMock.reviseCounter).toHaveBeenCalledWith(
      traderUserId,
      quoteId,
      expect.anything(),
    );
    expect(response.status).toBe("DRAFT");
  });

});
