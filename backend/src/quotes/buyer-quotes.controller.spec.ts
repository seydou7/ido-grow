import { AuthenticationProblem } from "../authentication/authentication-problem";
import type { AuthenticationService } from "../authentication/authentication.service";
import { BuyerQuotesController } from "./buyer-quotes.controller";
import type { QuotesService } from "./quotes.service";
import type { QuoteDetail, QuoteSummary } from "./contracts";

describe("BuyerQuotesController", () => {
  let controller: BuyerQuotesController;
  let authenticationServiceMock: jest.Mocked<AuthenticationService>;
  let quotesServiceMock: jest.Mocked<QuotesService>;

  const buyerUserId = "buyer-user-1";
  const buyerToken = "B".repeat(43);
  const validCookie = `ido_grow_session=${buyerToken}`;
  const quoteId = "quote-123";

  const sampleQuoteSummary: QuoteSummary = {
    id: quoteId,
    quoteNumber: "QT-20260917-0001",
    matchId: "match-1",
    buyOrderId: "bo-1",
    listingId: "lst-1",
    buyerOrganisationId: "buyer-org-1",
    buyerOrganisationName: "Buyer Corp",
    supplierOrganisationId: "supp-org-1",
    supplierOrganisationName: "Supplier Corp",
    materialType: "HEMP",
    productForm: "FLAKES",
    quantity: 50,
    quantityUnit: "TONNES",
    status: "SENT",
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
      commercialNotes: "Proposal",
      createdByUserId: "trader-1",
      createdByUserEmail: "trader@idogrow.com",
      createdAt: "2026-09-17T10:00:00.000Z",
    },
    versionsCount: 1,
    sentAt: "2026-09-17T11:00:00.000Z",
    sentByUserId: "trader-1",
    sentVersionNumber: 1,
    acceptedAt: null,
    acceptedByUserId: null,
    acceptedVersionNumber: null,
    rejectedAt: null,
    rejectedByUserId: null,
    rejectionReason: null,
    createdAt: "2026-09-17T10:00:00.000Z",
    updatedAt: "2026-09-17T11:00:00.000Z",
  };

  const sampleQuoteDetail: QuoteDetail = {
    ...sampleQuoteSummary,
    versions: [sampleQuoteSummary.currentVersion],
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
          userId: buyerUserId,
          email: "buyer@domain.com",
          status: "ACTIVE",
        });
      }),
    } as unknown as jest.Mocked<AuthenticationService>;

    quotesServiceMock = {
      getBuyerQuotes: jest.fn().mockResolvedValue([sampleQuoteSummary]),
      getBuyerQuoteById: jest.fn().mockResolvedValue(sampleQuoteDetail),
      acceptQuoteByBuyer: jest.fn().mockResolvedValue({
        ...sampleQuoteDetail,
        status: "ACCEPTED",
      }),
      rejectQuoteByBuyer: jest.fn().mockResolvedValue({
        ...sampleQuoteDetail,
        status: "REJECTED",
      }),
      counterQuoteByBuyer: jest.fn().mockResolvedValue({
        ...sampleQuoteDetail,
        status: "COUNTERED",
      }),
    } as unknown as jest.Mocked<QuotesService>;

    controller = new BuyerQuotesController(
      authenticationServiceMock,
      quotesServiceMock,
    );
  });

  it("rejects unauthenticated requests without cookie with 401", async () => {
    await expect(controller.getBuyerQuotes(undefined)).rejects.toThrow(
      AuthenticationProblem,
    );
  });

  it("delegates getBuyerQuotes to service", async () => {
    const res = await controller.getBuyerQuotes(validCookie);
    expect(quotesServiceMock.getBuyerQuotes).toHaveBeenCalledWith(buyerUserId);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(quoteId);
  });

  it("delegates getBuyerQuoteById to service", async () => {
    const res = await controller.getBuyerQuoteById(validCookie, quoteId);
    expect(quotesServiceMock.getBuyerQuoteById).toHaveBeenCalledWith(
      buyerUserId,
      quoteId,
    );
    expect(res.id).toBe(quoteId);
  });

  it("delegates acceptQuote to service", async () => {
    const res = await controller.acceptQuote(validCookie, quoteId);
    expect(quotesServiceMock.acceptQuoteByBuyer).toHaveBeenCalledWith(
      buyerUserId,
      quoteId,
    );
    expect(res.status).toBe("ACCEPTED");
  });

  it("delegates rejectQuote to service", async () => {
    const res = await controller.rejectQuote(validCookie, quoteId, {
      rejectionReason: "Too expensive",
    });
    expect(quotesServiceMock.rejectQuoteByBuyer).toHaveBeenCalledWith(
      buyerUserId,
      quoteId,
      { rejectionReason: "Too expensive" },
    );
    expect(res.status).toBe("REJECTED");
  });

  it("delegates counterQuote to service", async () => {
    const res = await controller.counterQuote(validCookie, quoteId, {
      buyerNote: "Please reduce freight by 200",
      proposedTotalAmount: 13100,
    });
    expect(quotesServiceMock.counterQuoteByBuyer).toHaveBeenCalledWith(
      buyerUserId,
      quoteId,
      expect.objectContaining({ buyerNote: "Please reduce freight by 200" }),
    );
    expect(res.status).toBe("COUNTERED");
  });
});
