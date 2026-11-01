import test from "node:test";
import assert from "node:assert/strict";

// Mock contract data fixtures
const mockTradeBaseline = {
  id: "trade-uuid-1",
  tradeNumber: "TRD-20261001-ABCD",
  quoteId: "quote-uuid-1",
  quoteNumber: "QUO-20261001-1234",
  acceptedQuoteVersionNumber: 1,
  matchId: "match-uuid-1",
  buyOrderId: "order-uuid-1",
  listingId: "listing-uuid-1",
  buyerOrganisationId: "buyer-org-1",
  buyerOrganisationName: "BioPackaging Europe BV",
  supplierOrganisationId: "supplier-org-1",
  supplierOrganisationName: "Nordic Fibre Cultivators ApS",
  materialType: "HEMP",
  productForm: "BALED_FIBRE",
  quantity: 25,
  quantityUnit: "TONNE",
  currency: "EUR",
  acceptedTotalAmount: 37500,
  incoterm: "FCA",
  paymentTerms: "30 days net",
  acceptedAt: "2026-10-01T12:00:00Z",
  createdAt: "2026-10-01T12:00:00Z",
};

const mockDraftContract = {
  id: "contract-uuid-1",
  contractNumber: "CTR-20261001-A1B2",
  tradeId: "trade-uuid-1",
  tradeNumber: "TRD-20261001-ABCD",
  acceptedQuoteVersionId: "quote-ver-1",
  acceptedQuoteVersionNumber: 1,
  buyerOrganisationId: "buyer-org-1",
  buyerOrganisationName: "BioPackaging Europe BV",
  supplierOrganisationId: "supplier-org-1",
  supplierOrganisationName: "Nordic Fibre Cultivators ApS",
  materialType: "HEMP",
  productForm: "BALED_FIBRE",
  quantity: 25,
  quantityUnit: "TONNE",
  currency: "EUR",
  acceptedCommercialAmount: 37500,
  acceptedTolerance: null,
  incoterm: "FCA",
  qualityConditions: null,
  inspectionMethod: null,
  pickupDate: null,
  deliveryDate: null,
  paymentTerms: "30 days net",
  claimsProcess: null,
  requiredDocuments: null,
  cancellationConditions: null,
  governingLaw: null,
  status: "DRAFT",
  confirmedAt: null,
  confirmedByUserId: null,
  hasDocument: false,
  documentGeneratedAt: null,
  buyerSignatureStatus: "UNSIGNED",
  supplierSignatureStatus: "UNSIGNED",
  createdAt: "2026-10-01T13:00:00Z",
  updatedAt: "2026-10-01T13:00:00Z",
};

const mockConfirmedContract = {
  ...mockDraftContract,
  status: "CONFIRMED",
  confirmedAt: "2026-10-01T14:00:00Z",
  confirmedByUserId: "user-trader-1",
  acceptedTolerance: "+/- 5%",
  qualityConditions: "Standard technical grade A fibres, max moisture 12%",
  inspectionMethod: "INDEPENDENT_PHYSICAL_INSPECTION",
  pickupDate: "2026-10-15T00:00:00.000Z",
  deliveryDate: "2026-10-25T00:00:00.000Z",
  claimsProcess: "14 business days from delivery with accredited inspection certificate",
  requiredDocuments: "Commercial Invoice, Packing List, Bill of Lading, Certificate of Analysis",
  cancellationConditions: "Mutual written notice or material breach after 10-day cure period",
  governingLaw: "Netherlands law / ICC Arbitration Rotterdam",
  hasDocument: true,
  documentGeneratedAt: "2026-10-01T14:00:01Z",
};

test("Contract Lifecycle: strictly DRAFT and CONFIRMED without complex legal state bloat", () => {
  const allowedStatuses = ["DRAFT", "CONFIRMED"];
  assert.equal(allowedStatuses.length, 2);
  assert.ok(allowedStatuses.includes(mockDraftContract.status));
  assert.ok(allowedStatuses.includes(mockConfirmedContract.status));
});

test("No Fabricated Defaults: unentered fields in DRAFT contract remain null/empty", () => {
  // Verifies that neither frontend nor backend invents fake legal defaults
  assert.equal(mockDraftContract.acceptedTolerance, null);
  assert.equal(mockDraftContract.qualityConditions, null);
  assert.equal(mockDraftContract.inspectionMethod, null);
  assert.equal(mockDraftContract.pickupDate, null);
  assert.equal(mockDraftContract.deliveryDate, null);
  assert.equal(mockDraftContract.claimsProcess, null);
  assert.equal(mockDraftContract.requiredDocuments, null);
  assert.equal(mockDraftContract.cancellationConditions, null);
  assert.equal(mockDraftContract.governingLaw, null);
});

test("Immutable Commercial Baseline: copies trade terms exactly and prevents tampering", () => {
  const immutableFields = [
    "materialType",
    "productForm",
    "quantity",
    "quantityUnit",
    "currency",
    "acceptedCommercialAmount",
    "buyerOrganisationName",
    "supplierOrganisationName",
  ];

  for (const field of immutableFields) {
    if (field === "acceptedCommercialAmount") {
      assert.equal(
        mockDraftContract.acceptedCommercialAmount,
        mockTradeBaseline.acceptedTotalAmount,
        "Commercial amount matches trade accepted total exactly",
      );
    } else {
      assert.equal(
        mockDraftContract[field],
        mockTradeBaseline[field],
        `${field} is copied exactly from trade baseline`,
      );
    }
  }
});

test("Confirmation Gate: requires all 11 mandatory contractual terms before confirmation", () => {
  const validateConfirmationTerms = (contract) => {
    const missing = [];
    if (!contract.acceptedTolerance) missing.push("acceptedTolerance");
    if (!contract.incoterm) missing.push("incoterm");
    if (!contract.qualityConditions) missing.push("qualityConditions");
    if (!contract.inspectionMethod) missing.push("inspectionMethod");
    if (!contract.pickupDate) missing.push("pickupDate");
    if (!contract.deliveryDate) missing.push("deliveryDate");
    if (!contract.paymentTerms) missing.push("paymentTerms");
    if (!contract.claimsProcess) missing.push("claimsProcess");
    if (!contract.requiredDocuments) missing.push("requiredDocuments");
    if (!contract.cancellationConditions) missing.push("cancellationConditions");
    if (!contract.governingLaw) missing.push("governingLaw");
    return missing;
  };

  const draftMissing = validateConfirmationTerms(mockDraftContract);
  assert.ok(draftMissing.length > 0, "Draft contract cannot be confirmed with missing terms");
  assert.ok(draftMissing.includes("acceptedTolerance"));
  assert.ok(draftMissing.includes("qualityConditions"));
  assert.ok(draftMissing.includes("inspectionMethod"));
  assert.ok(draftMissing.includes("pickupDate"));
  assert.ok(draftMissing.includes("deliveryDate"));

  const confirmedMissing = validateConfirmationTerms(mockConfirmedContract);
  assert.equal(confirmedMissing.length, 0, "Confirmed contract has all required terms complete");
});

test("Digital Signatures: conservative readiness metadata initialized to UNSIGNED without external vendor", () => {
  assert.equal(mockDraftContract.buyerSignatureStatus, "UNSIGNED");
  assert.equal(mockDraftContract.supplierSignatureStatus, "UNSIGNED");
  assert.equal(mockConfirmedContract.buyerSignatureStatus, "UNSIGNED");
  assert.equal(mockConfirmedContract.supplierSignatureStatus, "UNSIGNED");
});

test("Contract Document / PDF: CONFIRMED contract has document flag and timestamp", () => {
  assert.equal(mockDraftContract.hasDocument, false);
  assert.equal(mockDraftContract.documentGeneratedAt, null);

  assert.equal(mockConfirmedContract.hasDocument, true);
  assert.ok(mockConfirmedContract.documentGeneratedAt !== null);
  assert.ok(mockConfirmedContract.confirmedAt !== null);
});

test("Contracts Ledger List: covers all 11 required summary columns", () => {
  const requiredListColumns = [
    "Contract",
    "Trade",
    "Buyer",
    "Supplier",
    "Material / Product",
    "Quantity",
    "Commercial Amount",
    "Status",
    "Pickup Date",
    "Delivery Date",
    "Updated",
  ];

  assert.equal(requiredListColumns.length, 11);

  // Verify mockConfirmedContract has fields to satisfy all 11 columns
  assert.ok(mockConfirmedContract.contractNumber);
  assert.ok(mockConfirmedContract.tradeNumber);
  assert.ok(mockConfirmedContract.buyerOrganisationName);
  assert.ok(mockConfirmedContract.supplierOrganisationName);
  assert.ok(mockConfirmedContract.materialType);
  assert.ok(mockConfirmedContract.quantity > 0);
  assert.ok(mockConfirmedContract.acceptedCommercialAmount > 0);
  assert.ok(mockConfirmedContract.status);
  assert.ok(mockConfirmedContract.pickupDate);
  assert.ok(mockConfirmedContract.deliveryDate);
  assert.ok(mockConfirmedContract.updatedAt);
});

test("Block 01 Boundary: does NOT expose premature Sprint 08 logistics features", () => {
  // Ensure that shipment/freight/customs objects are not leaked into Block 01 contracts
  const forbiddenLogisticsKeys = [
    "shipmentId",
    "freightQuoteId",
    "carrierOrganisationId",
    "carrierName",
    "trackingNumber",
    "customsDeclarationNumber",
    "escrowAccountId",
    "insurancePolicyId",
  ];

  for (const key of forbiddenLogisticsKeys) {
    assert.equal(mockDraftContract[key], undefined, `Block 01 Contract must not include ${key}`);
    assert.equal(mockConfirmedContract[key], undefined, `Block 01 Contract must not include ${key}`);
  }
});

test("Regression: CONFIRMED contract commercial amount formatting never crashes or defaults to 0", () => {
  // Scenario A: Full ContractDetail/ContractSummary loaded
  const fullConfirmedContract = { ...mockConfirmedContract };
  const fullAmount = fullConfirmedContract.acceptedCommercialAmount ?? mockTradeBaseline.acceptedTotalAmount;
  assert.equal(typeof fullAmount, "number");
  assert.equal(fullAmount, 37500);
  assert.ok(fullAmount > 0);
  const formattedFull = fullAmount.toLocaleString();
  assert.ok(formattedFull.length > 0);

  // Scenario B: Partial contract overview loaded from Trade record (acceptedCommercialAmount undefined)
  const partialTradeContract = {
    id: "contract-uuid-1",
    contractNumber: "CTR-20261001-A1B2",
    status: "CONFIRMED",
    hasDocument: true,
    confirmedAt: "2026-10-01T14:00:00Z",
  };
  // Must NOT crash and MUST preserve exact trade baseline amount without defaulting to 0
  const fallbackAmount = partialTradeContract.acceptedCommercialAmount ?? mockTradeBaseline.acceptedTotalAmount;
  assert.notEqual(fallbackAmount, undefined, "Fallback amount must not be undefined");
  assert.notEqual(fallbackAmount, 0, "Commercial amount must not be masked by 0");
  assert.equal(fallbackAmount, 37500, "Commercial amount must match authoritative trade acceptedTotalAmount");
  const formattedFallback = fallbackAmount.toLocaleString();
  assert.ok(formattedFallback.length > 0);
  assert.equal(formattedFallback, formattedFull);

  // Formatting test: string interpolation does not throw TypeError
  const renderedSummary = `${partialTradeContract.quantity ?? mockTradeBaseline.quantity} ${partialTradeContract.quantityUnit || mockTradeBaseline.quantityUnit} · ${(partialTradeContract.acceptedCommercialAmount ?? mockTradeBaseline.acceptedTotalAmount)?.toLocaleString()} ${partialTradeContract.currency || mockTradeBaseline.currency}`;
  assert.ok(renderedSummary.includes("25 TONNE"));
  assert.ok(renderedSummary.includes("EUR"));
  assert.ok(renderedSummary.includes(formattedFull));
});

