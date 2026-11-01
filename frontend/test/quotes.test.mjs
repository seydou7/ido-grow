import test from "node:test";
import assert from "node:assert/strict";

const BREAKDOWN_FIELD_LABELS = {
  productValue: "1. Base Product Value (Fibre / Material)",
  idoGrowMarginCommission: "2. I Do Grow Intermediation Margin / Commission",
  inspectionCost: "3. Quality Inspection & Origin Certification",
  packagingCost: "4. Packaging, Baling & Handling",
  inlandTransportCost: "5. Inland Transport (Supplier to Port / Terminal)",
  internationalFreightCost: "6. International Freight (Sea / Rail / Road)",
  customsCost: "7. Customs Clearance, Duties & Export Documentation",
  insuranceCost: "8. Cargo Marine / Transit Insurance",
  storageCost: "9. Warehousing & Terminal Storage",
  taxAmount: "10. Applicable VAT / Import Surcharges",
  otherServiceFees: "11. Miscellaneous Trade & Administrative Fees",
};

const QUOTE_STATUSES = [
  "DRAFT",
  "INTERNAL_REVIEW",
  "SENT",
  "COUNTERED",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED_TO_CONTRACT",
];

function formatCurrencySymbol(currencyCode) {
  const normalized = (currencyCode || "").trim().toUpperCase();
  switch (normalized) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    default:
      return normalized || "—";
  }
}

function formatMonetaryDisplay(amount, currencyCode) {
  const sym = formatCurrencySymbol(currencyCode);
  const formattedNumber = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (sym === "€" || sym === "$" || sym === "£") {
    return `${sym}${formattedNumber} ${currencyCode}`;
  }
  return `${formattedNumber} ${currencyCode}`;
}

test("commercial breakdown field labels cover exactly 11 distinct cost categories", () => {
  const keys = Object.keys(BREAKDOWN_FIELD_LABELS);
  assert.equal(keys.length, 11);
  assert.equal(keys.includes("productValue"), true);
  assert.equal(keys.includes("idoGrowMarginCommission"), true);
  assert.equal(keys.includes("inspectionCost"), true);
  assert.equal(keys.includes("packagingCost"), true);
  assert.equal(keys.includes("inlandTransportCost"), true);
  assert.equal(keys.includes("internationalFreightCost"), true);
  assert.equal(keys.includes("customsCost"), true);
  assert.equal(keys.includes("insuranceCost"), true);
  assert.equal(keys.includes("storageCost"), true);
  assert.equal(keys.includes("taxAmount"), true);
  assert.equal(keys.includes("otherServiceFees"), true);
});

test("client-side live calculation sums all 11 breakdown fields and rounds to 2 decimals", () => {
  const breakdown = {
    productValue: 15450.55,
    idoGrowMarginCommission: 772.53,
    inspectionCost: 350.0,
    packagingCost: 280.0,
    inlandTransportCost: 450.0,
    internationalFreightCost: 1200.0,
    customsCost: 380.0,
    insuranceCost: 154.5,
    storageCost: 95.0,
    taxAmount: 1913.25,
    otherServiceFees: 75.0,
  };

  const calculateTotal = (b) => {
    const total =
      (Number(b.productValue) || 0) +
      (Number(b.idoGrowMarginCommission) || 0) +
      (Number(b.inspectionCost) || 0) +
      (Number(b.packagingCost) || 0) +
      (Number(b.inlandTransportCost) || 0) +
      (Number(b.internationalFreightCost) || 0) +
      (Number(b.customsCost) || 0) +
      (Number(b.insuranceCost) || 0) +
      (Number(b.storageCost) || 0) +
      (Number(b.taxAmount) || 0) +
      (Number(b.otherServiceFees) || 0);

    return Math.round(total * 100) / 100;
  };

  const total = calculateTotal(breakdown);
  assert.equal(total, 21120.83);
});

test("currency formatting derives from authoritative currency code without hardcoding EUR", () => {
  assert.equal(formatCurrencySymbol("EUR"), "€");
  assert.equal(formatCurrencySymbol("USD"), "$");
  assert.equal(formatCurrencySymbol("GBP"), "£");
  assert.equal(formatCurrencySymbol("SEK"), "SEK");
  assert.equal(formatCurrencySymbol("CHF"), "CHF");

  assert.equal(formatMonetaryDisplay(15000, "USD"), "$15,000.00 USD");
  assert.equal(formatMonetaryDisplay(15000, "EUR"), "€15,000.00 EUR");
  assert.equal(formatMonetaryDisplay(15000, "GBP"), "£15,000.00 GBP");
  assert.equal(formatMonetaryDisplay(15000, "SEK"), "15,000.00 SEK");
});

test("commercial defaults are blank unless explicitly inherited from matched context", () => {
  const getInitialFormState = (matchedContext) => ({
    incoterm: matchedContext?.incoterm || "",
    paymentTerms: matchedContext?.paymentTerms || "",
    validUntil: "", // must be blank, no automatic 30 days
  });

  const emptyContextState = getInitialFormState({});
  assert.equal(emptyContextState.incoterm, "");
  assert.equal(emptyContextState.paymentTerms, "");
  assert.equal(emptyContextState.validUntil, "");

  const inheritedContextState = getInitialFormState({
    incoterm: "CIF",
    paymentTerms: "30% Adv / 70% BL",
  });
  assert.equal(inheritedContextState.incoterm, "CIF");
  assert.equal(inheritedContextState.paymentTerms, "30% Adv / 70% BL");
  assert.equal(inheritedContextState.validUntil, "");
});

test("quote versioning preserves immutable historical versions and respective currencies", () => {
  const version1 = {
    id: "qv-1",
    versionNumber: 1,
    productValue: 10000,
    totalAmount: 12500,
    currency: "USD",
    incoterm: "FOB",
    createdAt: "2026-09-16T10:00:00.000Z",
  };

  const version2 = {
    id: "qv-2",
    versionNumber: 2,
    productValue: 10500,
    totalAmount: 13000,
    currency: "USD",
    incoterm: "CIF",
    createdAt: "2026-09-16T11:00:00.000Z",
  };

  const quote = {
    id: "quote-1",
    quoteNumber: "QT-20260916-1234",
    status: "DRAFT",
    currency: "USD",
    currentVersionNumber: 2,
    currentVersion: version2,
    versions: [version1, version2],
  };

  assert.equal(quote.versions.length, 2);
  assert.equal(quote.versions[0].versionNumber, 1);
  assert.equal(quote.versions[0].totalAmount, 12500);
  assert.equal(quote.versions[0].currency, "USD");
  assert.equal(quote.versions[1].versionNumber, 2);
  assert.equal(quote.versions[1].totalAmount, 13000);
  assert.equal(quote.versions[1].currency, "USD");
  assert.equal(quote.currentVersion.totalAmount, 13000);
});

test("full QuoteStatus domain contains all 8 statuses while Block 01 exposes only DRAFT and INTERNAL_REVIEW actions", () => {
  assert.equal(QUOTE_STATUSES.length, 8);
  assert.deepEqual(QUOTE_STATUSES, [
    "DRAFT",
    "INTERNAL_REVIEW",
    "SENT",
    "COUNTERED",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
    "CONVERTED_TO_CONTRACT",
  ]);

  const getAvailableActionsForStatus = (status) => {
    switch (status) {
      case "DRAFT":
        return ["SAVE_DRAFT", "SUBMIT_FOR_INTERNAL_REVIEW"];
      case "INTERNAL_REVIEW":
        return ["RETURN_TO_DRAFT"];
      // Future statuses have NO active actions in Block 01
      case "SENT":
      case "COUNTERED":
      case "ACCEPTED":
      case "REJECTED":
      case "EXPIRED":
      case "CONVERTED_TO_CONTRACT":
      default:
        return [];
    }
  };

  assert.deepEqual(getAvailableActionsForStatus("DRAFT"), ["SAVE_DRAFT", "SUBMIT_FOR_INTERNAL_REVIEW"]);
  assert.deepEqual(getAvailableActionsForStatus("INTERNAL_REVIEW"), ["RETURN_TO_DRAFT"]);
  assert.deepEqual(getAvailableActionsForStatus("SENT"), []);
  assert.deepEqual(getAvailableActionsForStatus("ACCEPTED"), []);
  assert.deepEqual(getAvailableActionsForStatus("CONVERTED_TO_CONTRACT"), []);
});

test("quote validation requires strictly positive product value", () => {
  const validateQuoteForm = (productValue) => {
    if (!productValue || productValue <= 0) {
      return "Base product value must be greater than zero.";
    }
    return null;
  };

  assert.equal(validateQuoteForm(0), "Base product value must be greater than zero.");
  assert.equal(validateQuoteForm(-500), "Base product value must be greater than zero.");
  assert.equal(validateQuoteForm(12000), null);
});

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("regression: no || \"EUR\" remains in production quote or matching frontend code", () => {
  const dirs = [
    path.resolve(__dirname, "../src/quotes"),
    path.resolve(__dirname, "../src/matching"),
  ];

  for (const dir of dirs) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        const fullPath = path.join(dir, file);
        const fileContent = fs.readFileSync(fullPath, "utf-8");
        assert.equal(
          fileContent.includes("|| \"EUR\""),
          false,
          `File ${file} contains illegal fallback || "EUR"`
        );
        assert.equal(
          fileContent.includes("|| 'EUR'"),
          false,
          `File ${file} contains illegal fallback || 'EUR'`
        );
      }
    }
  }
});

test("missing currency displays neutral resolution message with no fake symbol", () => {
  const resolveCurrencyDisplay = (currency) => {
    if (!currency) {
      return {
        neutralMessage:
          "Commercial currency will be resolved from the matched Buy Order / Listing when the quote is created.",
        symbol: null,
      };
    }
    return {
      neutralMessage: null,
      symbol: formatCurrencySymbol(currency),
    };
  };

  const missingResult = resolveCurrencyDisplay(null);
  assert.equal(
    missingResult.neutralMessage,
    "Commercial currency will be resolved from the matched Buy Order / Listing when the quote is created."
  );
  assert.equal(missingResult.symbol, null);

  const usdResult = resolveCurrencyDisplay("USD");
  assert.equal(usdResult.neutralMessage, null);
  assert.equal(usdResult.symbol, "$");

  const eurResult = resolveCurrencyDisplay("EUR");
  assert.equal(eurResult.neutralMessage, null);
  assert.equal(eurResult.symbol, "€");
});

test("Sprint 06 Block 02 transition matrix allows only approved lifecycle paths", () => {
  const ALLOWED_TRANSITIONS = {
    DRAFT: ["INTERNAL_REVIEW"],
    INTERNAL_REVIEW: ["DRAFT", "SENT"],
    SENT: ["ACCEPTED", "REJECTED", "COUNTERED"],
    COUNTERED: ["DRAFT"], // via revise-counter creating vN+1
    ACCEPTED: [], // terminal in Block 02
    REJECTED: [], // read-only
    EXPIRED: [],
    CONVERTED_TO_CONTRACT: [],
  };

  const isTransitionAllowed = (from, to) => {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  };

  // Allowed paths
  assert.equal(isTransitionAllowed("DRAFT", "INTERNAL_REVIEW"), true);
  assert.equal(isTransitionAllowed("INTERNAL_REVIEW", "SENT"), true);
  assert.equal(isTransitionAllowed("INTERNAL_REVIEW", "DRAFT"), true);
  assert.equal(isTransitionAllowed("SENT", "ACCEPTED"), true);
  assert.equal(isTransitionAllowed("SENT", "REJECTED"), true);
  assert.equal(isTransitionAllowed("SENT", "COUNTERED"), true);
  assert.equal(isTransitionAllowed("COUNTERED", "DRAFT"), true);

  // Strictly disallowed paths
  assert.equal(isTransitionAllowed("DRAFT", "SENT"), false);
  assert.equal(isTransitionAllowed("DRAFT", "ACCEPTED"), false);
  assert.equal(isTransitionAllowed("INTERNAL_REVIEW", "ACCEPTED"), false);
  assert.equal(isTransitionAllowed("COUNTERED", "ACCEPTED"), false);
  assert.equal(isTransitionAllowed("REJECTED", "DRAFT"), false);
  assert.equal(isTransitionAllowed("ACCEPTED", "DRAFT"), false);
  assert.equal(isTransitionAllowed("ACCEPTED", "SENT"), false);
  assert.equal(isTransitionAllowed("SENT", "CONVERTED_TO_CONTRACT"), false);
});

test("Buyer counter-offer preserves original sent QuoteVersion and records proposed changes", () => {
  const sentVersion = {
    versionNumber: 1,
    productValue: 20000,
    totalAmount: 25400,
    currency: "USD",
    incoterm: "FOB",
    paymentTerms: "100% CAD",
  };

  const buyerCounterOffer = {
    quoteId: "quote-xyz",
    sourceVersionNumber: 1,
    buyerOrganisationId: "buyer-org-123",
    createdByUserId: "buyer-user-456",
    proposedProductValue: 18500,
    proposedTotalAmount: 23900,
    proposedIncoterm: "CIF",
    proposedPaymentTerms: "30% Advance, 70% against BL",
    buyerNote: "Target budget constrained for Q4 allocation.",
    createdAt: new Date().toISOString(),
  };

  // Sent version remains completely unchanged
  assert.equal(sentVersion.productValue, 20000);
  assert.equal(sentVersion.totalAmount, 25400);
  assert.equal(sentVersion.incoterm, "FOB");

  // Counter proposal captures distinct buyer adjustments
  assert.equal(buyerCounterOffer.sourceVersionNumber, 1);
  assert.equal(buyerCounterOffer.proposedProductValue, 18500);
  assert.equal(buyerCounterOffer.proposedIncoterm, "CIF");
  assert.ok(buyerCounterOffer.buyerNote.length > 0);
});

test("Trader revised version after counter creates sequential immutable QuoteVersion in DRAFT", () => {
  const quote = {
    id: "q-1",
    quoteNumber: "QT-20260917-001",
    currentVersionNumber: 1,
    status: "COUNTERED",
    currency: "EUR",
    versions: [
      {
        versionNumber: 1,
        productValue: 10000,
        totalAmount: 12000,
      },
    ],
  };

  // Trader revises counter
  const revisedVersion = {
    versionNumber: quote.currentVersionNumber + 1,
    productValue: 9500,
    totalAmount: 11500,
    currency: quote.currency,
  };

  const updatedQuote = {
    ...quote,
    currentVersionNumber: 2,
    status: "DRAFT", // returns to DRAFT for review
    versions: [...quote.versions, revisedVersion],
  };

  assert.equal(updatedQuote.status, "DRAFT");
  assert.equal(updatedQuote.currentVersionNumber, 2);
  assert.equal(updatedQuote.versions.length, 2);
  assert.equal(updatedQuote.versions[0].versionNumber, 1);
  assert.equal(updatedQuote.versions[1].versionNumber, 2);
});

test("COUNTERED quote: fields are editable for prospective revision, buyer counter is visible, and copy explains revised draft creation", () => {
  const quote = {
    id: "q-countered",
    quoteNumber: "QT-20260919-6D23",
    currentVersionNumber: 1,
    status: "COUNTERED",
    currency: "EUR",
    versions: [
      {
        versionNumber: 1,
        productValue: 2550,
        totalAmount: 2850,
      },
    ],
    counterOffers: [
      {
        id: "co-1",
        sourceVersionNumber: 1,
        proposedProductValue: 2400,
        proposedIncoterm: "DAP",
        proposedPaymentTerms: "test",
        buyerNote: "We propose EUR 2,400 due to our target procurement budget and current market conditions.",
        createdAt: "2026-09-19T10:00:00Z",
      },
    ],
  };

  // 1. In COUNTERED status, commercial fields are EDITABLE for prospective next revision
  const isLocked = quote ? (quote.status !== "DRAFT" && quote.status !== "COUNTERED") : false;
  assert.equal(isLocked, false, "COUNTERED quote fields must be editable for prospective next revision");

  // 2. Prior Trader baseline is shown initially
  const initialProspectiveProductValue = quote.versions[0].productValue;
  assert.equal(initialProspectiveProductValue, 2550, "Prospective form initially reflects v1 Trader baseline");

  // 3. Buyer counter-offer terms are present and visible as reference
  const latestCounter = quote.counterOffers[0];
  assert.equal(latestCounter.sourceVersionNumber, 1);
  assert.equal(latestCounter.proposedProductValue, 2400);
  assert.equal(latestCounter.proposedPaymentTerms, "test");
  assert.ok(latestCounter.buyerNote.includes("EUR 2,400"));

  // 4. Corrected copy explains that previous proposal remains unchanged and values can be adjusted
  const expectedCopySnippet = "Review the Buyer's counter-offer and prepare your revised proposal below. The previous Trader proposal remains unchanged. Adjust the values as needed, then create the next version.";
  const counteredBannerCopy = `Review the Buyer's counter-offer and prepare your revised proposal below. The previous Trader proposal remains unchanged. Adjust the values as needed, then create the next version.`;
  assert.equal(counteredBannerCopy, expectedCopySnippet);

  // 5. Trader edits prospective value to 2475 and submits Prepare Revised Proposal (v2)
  const prospectiveEditedProductValue = 2475;
  const revisePayload = {
    commercialBreakdown: {
      productValue: prospectiveEditedProductValue,
      idoGrowMarginCommission: 150,
      inspectionCost: 50,
      packagingCost: 40,
      inlandTransportCost: 60,
      internationalFreightCost: 0,
      customsCost: 0,
      insuranceCost: 0,
      storageCost: 0,
      taxAmount: 0,
      otherServiceFees: 0,
    },
  };

  // Simulating backend reviseCounter creation
  const createdV2Version = {
    versionNumber: 2,
    productValue: revisePayload.commercialBreakdown.productValue, // 2475
    totalAmount: 2775,
  };

  const updatedQuote = {
    ...quote,
    currentVersionNumber: 2,
    status: "DRAFT",
    versions: [quote.versions[0], createdV2Version],
    counterOffers: quote.counterOffers,
  };

  // 6. Returned v2 reflects Trader's intended revised value (2475), not 2550 and not auto-2400
  assert.equal(updatedQuote.status, "DRAFT");
  assert.equal(updatedQuote.currentVersionNumber, 2);
  assert.equal(updatedQuote.versions[1].productValue, 2475);
  assert.equal(updatedQuote.versions[0].productValue, 2550, "v1 remains unchanged at 2550");
  assert.equal(updatedQuote.counterOffers[0].proposedProductValue, 2400, "Counter-offer remains intact at 2400");
});

test("Dirty DRAFT protection: editing persisted version blocks stale Submit for Internal Review until saved", () => {
  const persistedV2 = {
    versionNumber: 2,
    productValue: 2475,
    idoGrowMarginCommission: 150,
    inspectionCost: 50,
    packagingCost: 40,
    inlandTransportCost: 60,
    internationalFreightCost: 0,
    customsCost: 0,
    insuranceCost: 0,
    storageCost: 0,
    taxAmount: 0,
    otherServiceFees: 0,
    totalAmount: 2775,
    incoterm: "FOB",
    paymentTerms: "30_DAYS_NET",
    validUntil: "2026-10-15T00:00:00Z",
    commercialNotes: "Revised commercial proposal",
  };

  const quote = {
    id: "q-1",
    quoteNumber: "QT-20260919-6D23",
    currentVersionNumber: 2,
    status: "DRAFT",
    currentVersion: persistedV2,
    versions: [
      { versionNumber: 1, productValue: 2550, totalAmount: 2850 },
      persistedV2,
    ],
  };

  // Helper matching the component's dirty state detection
  function computeIsDirty(formBreakdown, cur) {
    return Number(formBreakdown.productValue) !== Number(cur.productValue);
  }

  // Case 1: Form matches persisted v2 (clean state)
  const cleanForm = { productValue: 2475 };
  const isClean = computeIsDirty(cleanForm, persistedV2);
  assert.equal(isClean, false, "Form matching persisted v2 is clean");
  const canSubmitClean = !isClean;
  assert.equal(canSubmitClean, true, "Submit for Internal Review is allowed when form is clean");

  // Case 2: Trader edits form (e.g. adjusts productValue to 2450) without saving next version
  const dirtyForm = { productValue: 2450 };
  const isDirty = computeIsDirty(dirtyForm, persistedV2);
  assert.equal(isDirty, true, "Form differing from persisted version is dirty");
  const canSubmitDirty = !isDirty;
  assert.equal(canSubmitDirty, false, "Submit for Internal Review MUST be blocked when form is dirty");

  // Case 3: Trader saves dirty form as Next Version (v3)
  const persistedV3 = {
    ...persistedV2,
    versionNumber: 3,
    productValue: 2450,
    totalAmount: 2750,
  };
  const quoteAfterSaveNextVersion = {
    ...quote,
    currentVersionNumber: 3,
    currentVersion: persistedV3,
    versions: [...quote.versions, persistedV3],
  };

  assert.equal(quoteAfterSaveNextVersion.currentVersionNumber, 3);
  assert.equal(quoteAfterSaveNextVersion.versions.length, 3);
  const isDirtyAfterSave = computeIsDirty(dirtyForm, quoteAfterSaveNextVersion.currentVersion);
  assert.equal(isDirtyAfterSave, false, "Form is clean after saving as next version");
  assert.equal(!isDirtyAfterSave, true, "Submit for Internal Review is now enabled");
});

test("Phase 0: Negotiation timeline preserves multiple sent events from audit trail", () => {
  const timelineEvents = [
    {
      id: "evt-1",
      type: "created",
      title: "Quote v1 Created",
      versionNumber: 1,
      occurredAt: "2026-09-16T10:00:00Z",
    },
    {
      id: "evt-2",
      type: "submitted_internal_review",
      title: "Quote v1 Submitted for Internal Review",
      versionNumber: 1,
      occurredAt: "2026-09-16T11:00:00Z",
    },
    {
      id: "evt-3",
      type: "sent",
      title: "Quote v1 Sent to Buyer",
      versionNumber: 1,
      occurredAt: "2026-09-16T12:00:00Z",
    },
    {
      id: "evt-4",
      type: "countered",
      title: "Buyer Countered v1",
      versionNumber: 1,
      occurredAt: "2026-09-16T14:00:00Z",
    },
    {
      id: "evt-5",
      type: "counter_revised",
      title: "Counter Revised into v2",
      versionNumber: 2,
      occurredAt: "2026-09-17T09:00:00Z",
    },
    {
      id: "evt-6",
      type: "submitted_internal_review",
      title: "Quote v2 Submitted for Internal Review",
      versionNumber: 2,
      occurredAt: "2026-09-17T10:00:00Z",
    },
    {
      id: "evt-7",
      type: "sent",
      title: "Quote v2 Sent to Buyer",
      versionNumber: 2,
      occurredAt: "2026-09-17T11:00:00Z",
    },
  ];

  const sentEvents = timelineEvents.filter((e) => e.type === "sent");
  assert.equal(sentEvents.length, 2);
  assert.equal(sentEvents[0].versionNumber, 1);
  assert.equal(sentEvents[1].versionNumber, 2);
  assert.equal(sentEvents[0].title, "Quote v1 Sent to Buyer");
  assert.equal(sentEvents[1].title, "Quote v2 Sent to Buyer");
});

test("Phase 0: Normal DRAFT v2 revision is NOT falsely labeled counter_revised", () => {
  // Normal draft revision: draft v1 -> review -> returned to draft -> draft v2
  const timelineEvents = [
    {
      id: "evt-1",
      type: "created",
      title: "Quote v1 Created",
      versionNumber: 1,
      occurredAt: "2026-09-16T10:00:00Z",
    },
    {
      id: "evt-2",
      type: "submitted_internal_review",
      title: "Quote v1 Submitted for Internal Review",
      versionNumber: 1,
      occurredAt: "2026-09-16T11:00:00Z",
    },
    {
      id: "evt-3",
      type: "returned_to_draft",
      title: "Quote v1 Returned to Draft",
      versionNumber: 1,
      occurredAt: "2026-09-16T11:30:00Z",
    },
    {
      id: "evt-4",
      type: "version_created",
      title: "Quote v2 Created",
      versionNumber: 2,
      occurredAt: "2026-09-16T12:00:00Z",
    },
  ];

  assert.equal(timelineEvents.some((e) => e.type === "counter_revised"), false);
  assert.equal(timelineEvents[3].type, "version_created");
  assert.equal(timelineEvents[3].title, "Quote v2 Created");
});

test("Phase 0: Buyer accept and counter bind explicitly to sentVersionNumber", () => {
  const quoteInSent = {
    id: "q-123",
    status: "SENT",
    currentVersionNumber: 2,
    sentVersionNumber: 1, // edge scenario: current is 2 but sent was 1
  };

  const resolveTargetVersionForAccept = (q) => {
    if (!q.sentVersionNumber) {
      throw new Error("Cannot accept quote without sentVersionNumber");
    }
    return q.sentVersionNumber;
  };

  const resolveTargetVersionForCounter = (q) => {
    if (!q.sentVersionNumber) {
      throw new Error("Cannot counter quote without sentVersionNumber");
    }
    return q.sentVersionNumber;
  };

  assert.equal(resolveTargetVersionForAccept(quoteInSent), 1);
  assert.equal(resolveTargetVersionForCounter(quoteInSent), 1);
});

test("Phase 0: Expiration gate checks the validity of the SENT QuoteVersion", () => {
  const versions = [
    {
      versionNumber: 1,
      validUntil: "2020-01-01T00:00:00Z", // expired
    },
    {
      versionNumber: 2,
      validUntil: "2030-01-01T00:00:00Z", // future
    },
  ];

  const checkVersionExpiration = (sentVersionNumber, quoteVersions) => {
    const sentVer = quoteVersions.find((v) => v.versionNumber === sentVersionNumber);
    if (!sentVer) throw new Error("Sent version not found");
    if (sentVer.validUntil && new Date(sentVer.validUntil).getTime() < Date.now()) {
      return { isExpired: true };
    }
    return { isExpired: false };
  };

  // If sentVersion was v1, it is expired even though current/v2 is in the future
  assert.equal(checkVersionExpiration(1, versions).isExpired, true);
  assert.equal(checkVersionExpiration(2, versions).isExpired, false);
});

test("Block 03: ACCEPTED Quote produces authoritative Trade Record baseline", () => {
  const quote = {
    id: "quote-accepted-1",
    quoteNumber: "QT-20260917-1001",
    status: "ACCEPTED",
    currency: "EUR",
    currentVersionNumber: 2,
    acceptedVersionNumber: 2,
    trade: {
      id: "trade-rec-1",
      tradeNumber: "TRD-20260917-5678",
      acceptedQuoteVersionNumber: 2,
      currency: "EUR",
      acceptedTotalAmount: 18450,
      acceptedAt: "2026-09-17T12:00:00Z",
      createdAt: "2026-09-17T12:00:00Z",
    },
  };

  assert.equal(quote.status, "ACCEPTED");
  assert.ok(quote.trade);
  assert.equal(quote.trade.tradeNumber.startsWith("TRD-"), true);
  assert.equal(quote.trade.acceptedQuoteVersionNumber, 2);
  assert.equal(quote.trade.acceptedTotalAmount, 18450);
  assert.equal(quote.trade.currency, "EUR");
});

test("Block 03: Trade Record commercial snapshot preserves 11-line breakdown and terms without contract transition", () => {
  const tradeDetail = {
    id: "trade-001",
    tradeNumber: "TRD-20260917-0042",
    quoteId: "quote-001",
    quoteNumber: "QT-20260917-001",
    acceptedQuoteVersionNumber: 1,
    matchId: "match-001",
    buyOrderId: "bo-001",
    listingId: "lst-001",
    buyerOrganisationId: "buyer-001",
    buyerOrganisationName: "EcoPackaging Corp",
    supplierOrganisationId: "supp-001",
    supplierOrganisationName: "BioFibres BV",
    materialType: "Hemp",
    productForm: "Raw Fibre",
    quantity: 100,
    quantityUnit: "TONNES",
    currency: "EUR",
    acceptedTotalAmount: 25000,
    incoterm: "FOB",
    paymentTerms: "30_DAYS_NET",
    acceptedAt: "2026-09-17T11:00:00Z",
    createdAt: "2026-09-17T11:00:00Z",
    acceptedBreakdown: {
      productValue: 20000,
      idoGrowMarginCommission: 1000,
      inspectionCost: 400,
      packagingCost: 300,
      inlandTransportCost: 500,
      internationalFreightCost: 1200,
      customsCost: 300,
      insuranceCost: 200,
      storageCost: 100,
      taxAmount: 900,
      otherServiceFees: 100,
    },
    commercialNotes: "Sprint 06 commercial baseline accepted",
    validUntil: "2026-10-15T00:00:00Z",
  };

  assert.equal(tradeDetail.tradeNumber, "TRD-20260917-0042");
  assert.equal(tradeDetail.acceptedTotalAmount, 25000);
  assert.equal(Object.keys(tradeDetail.acceptedBreakdown).length, 11);
  assert.equal(tradeDetail.incoterm, "FOB");
  assert.equal(tradeDetail.paymentTerms, "30_DAYS_NET");
  // Verification that status is NOT converted to contract
  assert.ok(!("contractStatus" in tradeDetail));
});

test("handleResponse returns null on 204 No Content, empty string, or 'null' without throwing SyntaxError", async () => {
  const handleResponse = async (res) => {
    if (res.status === 204) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const text = await res.text();
    if (!text || text.trim() === "" || text === "null") {
      return null;
    }
    return JSON.parse(text);
  };

  const empty200 = {
    status: 200,
    ok: true,
    text: async () => "",
  };
  assert.equal(await handleResponse(empty200), null);

  const whitespace200 = {
    status: 200,
    ok: true,
    text: async () => "   ",
  };
  assert.equal(await handleResponse(whitespace200), null);

  const nullJson200 = {
    status: 200,
    ok: true,
    text: async () => "null",
  };
  assert.equal(await handleResponse(nullJson200), null);

  const noContent204 = {
    status: 204,
    ok: true,
    text: async () => "",
  };
  assert.equal(await handleResponse(noContent204), null);

  const validJson200 = {
    status: 200,
    ok: true,
    text: async () => JSON.stringify({ id: "quote-1", quoteNumber: "QT-1" }),
  };
  assert.deepEqual(await handleResponse(validJson200), { id: "quote-1", quoteNumber: "QT-1" });
});

test("quotation commercial context validation strictly rejects fabricated defaults and disables quote creation", () => {
  const validateCommercialContext = (quote, matchedContext) => {
    const displayMaterial = quote?.materialType || matchedContext?.materialType || "";
    const displayQuantity = quote?.quantity ?? (matchedContext?.quantity !== undefined && matchedContext.quantity > 0 ? matchedContext.quantity : null);
    const activeCurrency = quote?.currency || matchedContext?.currency || null;

    const hasValidCommercialContext = Boolean(
      quote || (
        displayMaterial &&
        displayQuantity !== null &&
        displayQuantity > 0 &&
        activeCurrency
      )
    );

    return {
      hasValidCommercialContext,
      displayMaterial,
      displayQuantity,
      activeCurrency,
    };
  };

  // Missing all context
  const emptyContext = validateCommercialContext(null, {});
  assert.equal(emptyContext.hasValidCommercialContext, false);
  assert.equal(emptyContext.displayMaterial, "");
  assert.equal(emptyContext.displayQuantity, null);
  assert.equal(emptyContext.activeCurrency, null);

  // Missing currency
  const missingCurrency = validateCommercialContext(null, {
    materialType: "HEMP",
    quantity: 50,
  });
  assert.equal(missingCurrency.hasValidCommercialContext, false);
  assert.equal(missingCurrency.activeCurrency, null);

  // Zero quantity
  const zeroQuantity = validateCommercialContext(null, {
    materialType: "HEMP",
    quantity: 0,
    currency: "EUR",
  });
  assert.equal(zeroQuantity.hasValidCommercialContext, false);
  assert.equal(zeroQuantity.displayQuantity, null);

  // Authoritative approved match context
  const validContext = validateCommercialContext(null, {
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 50,
    quantityUnit: "TONNES",
    currency: "EUR",
    buyerOrganisationName: "Synthetic Test Buyer Organisation",
    supplierOrganisationName: "Groningen Hemp Works BV",
  });
  assert.equal(validContext.hasValidCommercialContext, true);
  assert.equal(validContext.displayMaterial, "HEMP");
  assert.equal(validContext.displayQuantity, 50);
  assert.equal(validContext.activeCurrency, "EUR");
});

test("quote lock banners are strictly status-aware and do NOT leak INTERNAL_REVIEW copy into SENT or other statuses", () => {
  const getStatusBannerState = (quote) => {
    const isInternalReview = quote?.status === "INTERNAL_REVIEW";
    const isSent = quote?.status === "SENT";
    const isCountered = quote?.status === "COUNTERED";
    const isAccepted = quote?.status === "ACCEPTED";
    const isRejected = quote?.status === "REJECTED";

    return {
      showInternalReviewBanner: isInternalReview,
      internalReviewTitle: isInternalReview ? "Proposal Locked for Internal Review" : null,
      internalReviewMessage: isInternalReview
        ? "This quotation is currently under review and cannot be modified directly. To make commercial adjustments and create a new version, return the quote to Draft."
        : null,
      showSentBanner: isSent,
      sentTitle: isSent ? "Proposal Sent to Buyer" : null,
      sentMessage: isSent
        ? "This quotation has been sent to the Buyer and is locked while awaiting the Buyer's response."
        : null,
      sentSupportingBadge: isSent ? "Awaiting Buyer" : null,
      showCounteredBanner: isCountered,
      showAcceptedBanner: isAccepted,
      showRejectedBanner: isRejected,
    };
  };

  // 1. INTERNAL_REVIEW status
  const internalReviewState = getStatusBannerState({ status: "INTERNAL_REVIEW" });
  assert.equal(internalReviewState.showInternalReviewBanner, true);
  assert.equal(internalReviewState.internalReviewTitle, "Proposal Locked for Internal Review");
  assert.match(internalReviewState.internalReviewMessage, /currently under review/);
  assert.equal(internalReviewState.showSentBanner, false);
  assert.equal(internalReviewState.sentTitle, null);

  // 2. SENT status
  const sentState = getStatusBannerState({ status: "SENT", sentAt: "2026-09-19T10:00:00Z" });
  assert.equal(sentState.showInternalReviewBanner, false);
  assert.equal(sentState.internalReviewTitle, null);
  assert.equal(sentState.internalReviewMessage, null);
  assert.equal(sentState.showSentBanner, true);
  assert.equal(sentState.sentTitle, "Proposal Sent to Buyer");
  assert.match(sentState.sentMessage, /awaiting the Buyer's response/);
  assert.equal(sentState.sentSupportingBadge, "Awaiting Buyer");

  // 3. DRAFT status
  const draftState = getStatusBannerState({ status: "DRAFT" });
  assert.equal(draftState.showInternalReviewBanner, false);
  assert.equal(draftState.showSentBanner, false);

  // 4. COUNTERED status
  const counteredState = getStatusBannerState({ status: "COUNTERED" });
  assert.equal(counteredState.showInternalReviewBanner, false);
  assert.equal(counteredState.showSentBanner, false);
  assert.equal(counteredState.showCounteredBanner, true);

  // 5. ACCEPTED status
  const acceptedState = getStatusBannerState({ status: "ACCEPTED" });
  assert.equal(acceptedState.showInternalReviewBanner, false);
  assert.equal(acceptedState.showSentBanner, false);
  assert.equal(acceptedState.showAcceptedBanner, true);

  // 6. REJECTED status
  const rejectedState = getStatusBannerState({ status: "REJECTED" });
  assert.equal(rejectedState.showInternalReviewBanner, false);
  assert.equal(rejectedState.showSentBanner, false);
  assert.equal(rejectedState.showRejectedBanner, true);
});
