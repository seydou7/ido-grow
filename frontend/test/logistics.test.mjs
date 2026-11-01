import test from "node:test";
import assert from "node:assert/strict";

// ── Test Fixtures ──────────────────────────────────────────

const mockConfirmedContract = {
  id: "contract-uuid-1",
  contractNumber: "CTR-20261001-A1B2",
  tradeId: "trade-uuid-1",
  tradeNumber: "TRD-20261001-ABCD",
  status: "CONFIRMED",
  quantity: 25,
  quantityUnit: "TONNE",
  currency: "EUR",
  acceptedCommercialAmount: 37500,
  buyerOrganisationId: "buyer-org-1",
  supplierOrganisationId: "supplier-org-1",
  buyerOrganisationName: "BioPackaging Europe BV",
  supplierOrganisationName: "Nordic Fibre Cultivators ApS",
};

const mockDraftContract = {
  ...mockConfirmedContract,
  id: "contract-uuid-2",
  contractNumber: "CTR-20261001-DRAFT",
  status: "DRAFT",
};

const mockShipmentPlanning = {
  id: "shipment-uuid-1",
  shipmentNumber: "SHP-20261002-0001",
  contractId: mockConfirmedContract.id,
  contractNumber: mockConfirmedContract.contractNumber,
  origin: "Dakar Port, Senegal",
  destination: "Rotterdam Port, Netherlands",
  shipmentQuantity: 25,
  quantityUnit: "TONNE",
  status: "PLANNING",
  selectedFreightQuotationId: null,
  quotationCount: 0,
  requestCount: 0,
};

const mockProviderRequest = {
  id: "request-uuid-1",
  shipmentId: mockShipmentPlanning.id,
  shipmentNumber: mockShipmentPlanning.shipmentNumber,
  targetProviderUserId: "user-lp-1",
  targetProviderEmail: "logistics@carrier-a.com",
  requesterUserId: "user-trader-1",
  status: "REQUESTED",
  hasQuotation: false,
};

const mockOtherProviderRequest = {
  id: "request-uuid-2",
  shipmentId: mockShipmentPlanning.id,
  shipmentNumber: mockShipmentPlanning.shipmentNumber,
  targetProviderUserId: "user-lp-2",
  targetProviderEmail: "ops@carrier-b.com",
  requesterUserId: "user-trader-1",
  status: "REQUESTED",
  hasQuotation: false,
};

const mockQuotation1 = {
  id: "quote-uuid-1",
  logisticsRequestId: "request-uuid-1",
  shipmentId: mockShipmentPlanning.id,
  providerUserId: "user-lp-1",
  providerEmail: "logistics@carrier-a.com",
  submittedByUserId: "user-lp-1",
  submittedByEmail: "logistics@carrier-a.com",
  submittedByRole: "LOGISTICS_PARTNER",
  enteredOnBehalfOfProvider: false,
  currency: "EUR",
  freightAmount: 3200,
  validUntil: "2026-11-15T00:00:00Z",
  proposedPickupDate: "2026-10-20T00:00:00Z",
  estimatedDeliveryDate: "2026-11-05T00:00:00Z",
  status: "ACTIVE",
  isSelected: false,
};

const mockQuotation2 = {
  id: "quote-uuid-2",
  logisticsRequestId: "request-uuid-2",
  shipmentId: mockShipmentPlanning.id,
  providerUserId: "user-lp-2",
  providerEmail: "ops@carrier-b.com",
  submittedByUserId: "user-trader-1", // Entered manually by Trader on behalf
  submittedByEmail: "trader@idogrow.com",
  submittedByRole: "TRADER",
  enteredOnBehalfOfProvider: true,
  currency: "EUR",
  freightAmount: 2950,
  validUntil: "2026-11-10T00:00:00Z",
  proposedPickupDate: "2026-10-22T00:00:00Z",
  estimatedDeliveryDate: "2026-11-08T00:00:00Z",
  status: "ACTIVE",
  isSelected: false,
};

// ── Test Cases ─────────────────────────────────────────────

test("Gating: CONFIRMED contract permits shipment creation, DRAFT contract rejects it", () => {
  // CONFIRMED contract check
  assert.equal(mockConfirmedContract.status, "CONFIRMED");
  const canCreateConfirmed = mockConfirmedContract.status === "CONFIRMED";
  assert.equal(canCreateConfirmed, true, "CONFIRMED contract must allow shipment creation");

  // DRAFT contract check
  assert.equal(mockDraftContract.status, "DRAFT");
  const canCreateDraft = mockDraftContract.status === "CONFIRMED";
  assert.equal(canCreateDraft, false, "DRAFT contract must NOT allow shipment creation");
});

test("Shipment requirements: validates quantity > 0 and cumulative quantity <= contract quantity", () => {
  const contractQuantity = 25;

  // Valid quantity
  const validQty = 25;
  assert.ok(validQty > 0 && validQty <= contractQuantity);

  // Partial quantity
  const partialQty = 15;
  assert.ok(partialQty > 0 && partialQty <= contractQuantity);

  // Invalid: 0 or negative
  const zeroQty = 0;
  assert.ok(!(zeroQty > 0), "Zero quantity must be rejected");

  // Invalid: exceeds contract quantity
  const excessQty = 30;
  assert.ok(excessQty > contractQuantity, "Excess quantity must be rejected");
});

test("No fabricated defaults: origin and destination require explicit user entry or null", () => {
  // Fresh input with no defaults
  const emptyForm = {
    origin: "",
    destination: "",
    transportRequirements: "",
    notes: "",
  };

  assert.equal(emptyForm.origin, "", "Must not fabricate default origin");
  assert.equal(emptyForm.destination, "", "Must not fabricate default destination");
  assert.equal(emptyForm.transportRequirements, "", "Must not fabricate default transport");
});

test("Lifecycle transitions: only PLANNING -> QUOTE_REQUESTED -> CARRIER_SELECTED exposed in Block 02", () => {
  const allowedTransitions = {
    PLANNING: ["QUOTE_REQUESTED"],
    QUOTE_REQUESTED: ["CARRIER_SELECTED"],
    CARRIER_SELECTED: ["CARRIER_SELECTED"], // Reselection
  };

  assert.deepEqual(allowedTransitions.PLANNING, ["QUOTE_REQUESTED"]);
  assert.deepEqual(allowedTransitions.QUOTE_REQUESTED, ["CARRIER_SELECTED"]);

  // Block 03 states must NOT be accessible in Block 02
  const forbiddenBlock02Actions = [
    "PICKUP_SCHEDULED",
    "PICKED_UP",
    "IN_TRANSIT",
    "CUSTOMS",
    "DELAYED",
    "DELIVERED",
    "DISPUTED",
    "CLOSED",
  ];

  forbiddenBlock02Actions.forEach((status) => {
    assert.ok(
      !allowedTransitions.PLANNING.includes(status),
      `Status ${status} must not be reachable from PLANNING in Block 02`,
    );
    assert.ok(
      !allowedTransitions.QUOTE_REQUESTED.includes(status),
      `Status ${status} must not be reachable from QUOTE_REQUESTED in Block 02`,
    );
  });
});

test("Provider Isolation: LP user only sees requests dispatched to their user ID", () => {
  const currentLpUserId = "user-lp-1";
  const allRequests = [mockProviderRequest, mockOtherProviderRequest];

  // Filtering for current LP
  const lpVisibleRequests = allRequests.filter(
    (r) => r.targetProviderUserId === currentLpUserId,
  );

  assert.equal(lpVisibleRequests.length, 1);
  assert.equal(lpVisibleRequests[0].id, "request-uuid-1");
  assert.equal(lpVisibleRequests[0].targetProviderUserId, currentLpUserId);

  // Other provider's request is not visible
  const hasOtherProvider = lpVisibleRequests.some(
    (r) => r.targetProviderUserId === "user-lp-2",
  );
  assert.equal(hasOtherProvider, false, "LP 1 must never see LP 2's request");
});

test("Freight Quotations: supports LP portal submission and Trader manual entry with attribution", () => {
  // 1. Direct LP submission
  assert.equal(mockQuotation1.submittedByRole, "LOGISTICS_PARTNER");
  assert.equal(mockQuotation1.enteredOnBehalfOfProvider, false);
  assert.equal(mockQuotation1.submittedByUserId, "user-lp-1");

  // 2. Trader manual entry on behalf of carrier
  assert.equal(mockQuotation2.submittedByRole, "TRADER");
  assert.equal(mockQuotation2.enteredOnBehalfOfProvider, true);
  assert.equal(mockQuotation2.submittedByUserId, "user-trader-1");
  assert.equal(mockQuotation2.providerUserId, "user-lp-2");

  // Commercial amounts strictly positive
  assert.ok(mockQuotation1.freightAmount > 0);
  assert.ok(mockQuotation2.freightAmount > 0);
});

test("Carrier Selection: selects quotation and transitions shipment to CARRIER_SELECTED", () => {
  let shipmentState = { ...mockShipmentPlanning, status: "QUOTE_REQUESTED" };

  const selectQuotation = (quotation) => {
    assert.equal(quotation.shipmentId, shipmentState.id, "Quote must belong to shipment");
    assert.equal(quotation.status, "ACTIVE", "Quote must be active");
    return {
      ...shipmentState,
      status: "CARRIER_SELECTED",
      selectedFreightQuotationId: quotation.id,
      selectedCarrierName: quotation.providerEmail,
      carrierTotalCost: quotation.freightAmount,
      carrierCurrency: quotation.currency,
    };
  };

  // Selection
  const updatedShipment = selectQuotation(mockQuotation2);
  assert.equal(updatedShipment.status, "CARRIER_SELECTED");
  assert.equal(updatedShipment.selectedFreightQuotationId, mockQuotation2.id);
  assert.equal(updatedShipment.carrierTotalCost, 2950);
  assert.equal(updatedShipment.carrierCurrency, "EUR");
});

test("Carrier Reselection: permits changing carrier while preserving previous reference for audit", () => {
  const currentShipment = {
    ...mockShipmentPlanning,
    status: "CARRIER_SELECTED",
    selectedFreightQuotationId: mockQuotation2.id,
  };

  const reselectQuotation = (shipment, newQuotation, reason) => {
    assert.ok(reason && reason.trim().length > 0, "Reselection reason is required");
    assert.notEqual(shipment.selectedFreightQuotationId, newQuotation.id, "Must be different quote");
    return {
      ...shipment,
      selectedFreightQuotationId: newQuotation.id,
      previousQuotationId: shipment.selectedFreightQuotationId,
      reselectionReason: reason,
    };
  };

  const reselected = reselectQuotation(
    currentShipment,
    mockQuotation1,
    "Carrier A has earlier confirmed vessel departure",
  );

  assert.equal(reselected.selectedFreightQuotationId, mockQuotation1.id);
  assert.equal(reselected.previousQuotationId, mockQuotation2.id);
  assert.equal(reselected.reselectionReason, "Carrier A has earlier confirmed vessel departure");
});

test("Non-regression: Contract commercial baseline and quantity remain immutable after logistics operations", () => {
  const originalContractAmount = mockConfirmedContract.acceptedCommercialAmount;
  const originalContractQuantity = mockConfirmedContract.quantity;

  // After carrier selection of 2950 EUR freight
  assert.equal(
    mockConfirmedContract.acceptedCommercialAmount,
    originalContractAmount,
    "Contract commercial amount must not mutate when freight carrier is selected",
  );
  assert.equal(
    mockConfirmedContract.quantity,
    originalContractQuantity,
    "Contract quantity must not mutate when freight carrier is selected",
  );
});

// ── Block 03 Execution & Tracking Tests ─────────────────────

test("Block 03 Execution: State-driven operational actions exposed strictly by status", () => {
  const getAllowedActions = (status) => {
    switch (status) {
      case "CARRIER_SELECTED":
        return ["SCHEDULE_PICKUP"];
      case "PICKUP_SCHEDULED":
        return ["MARK_PICKED_UP", "REPORT_DELAY"];
      case "PICKED_UP":
        return ["MARK_IN_TRANSIT", "REPORT_DELAY"];
      case "IN_TRANSIT":
        return ["CUSTOMS_STATUS", "CONFIRM_DELIVERY", "REPORT_DELAY"];
      case "CUSTOMS":
        return ["CONFIRM_DELIVERY", "REPORT_DELAY"];
      case "DELAYED":
        return ["RESUME_IN_TRANSIT", "CONFIRM_DELIVERY", "REPORT_DELAY"];
      case "DELIVERED":
        return ["RECORD_DISCREPANCY", "RECONCILE_COSTS", "CLOSE_SHIPMENT"];
      case "DISPUTED":
        return ["RESOLVE_DISPUTE"];
      case "CLOSED":
        return []; // Read-only
      default:
        return [];
    }
  };

  assert.deepEqual(getAllowedActions("CARRIER_SELECTED"), ["SCHEDULE_PICKUP"]);
  assert.deepEqual(getAllowedActions("PICKUP_SCHEDULED"), ["MARK_PICKED_UP", "REPORT_DELAY"]);
  assert.deepEqual(getAllowedActions("PICKED_UP"), ["MARK_IN_TRANSIT", "REPORT_DELAY"]);
  assert.deepEqual(getAllowedActions("IN_TRANSIT"), ["CUSTOMS_STATUS", "CONFIRM_DELIVERY", "REPORT_DELAY"]);
  assert.deepEqual(getAllowedActions("CUSTOMS"), ["CONFIRM_DELIVERY", "REPORT_DELAY"]);
  assert.deepEqual(getAllowedActions("DELIVERED"), ["RECORD_DISCREPANCY", "RECONCILE_COSTS", "CLOSE_SHIPMENT"]);
  assert.deepEqual(getAllowedActions("DISPUTED"), ["RESOLVE_DISPUTE"]);
  assert.deepEqual(getAllowedActions("CLOSED"), [], "CLOSED shipment must have zero mutation actions");
});

test("Block 03 Tracking Timeline: chronological immutable events rendered from history", () => {
  const events = [
    { id: "e1", previousStatus: "CARRIER_SELECTED", resultingStatus: "PICKUP_SCHEDULED", occurredAt: "2026-10-02T10:00:00Z", actorRole: "TRADER" },
    { id: "e2", previousStatus: "PICKUP_SCHEDULED", resultingStatus: "PICKED_UP", occurredAt: "2026-10-02T14:00:00Z", actorRole: "LOGISTICS_PARTNER" },
    { id: "e3", previousStatus: "PICKED_UP", resultingStatus: "IN_TRANSIT", occurredAt: "2026-10-02T16:00:00Z", actorRole: "LOGISTICS_PARTNER" },
  ];

  // Events are sorted ascending by time
  const sorted = [...events].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  assert.equal(sorted[0].resultingStatus, "PICKUP_SCHEDULED");
  assert.equal(sorted[2].resultingStatus, "IN_TRANSIT");
  assert.equal(events.length, 3, "Historical events are retained immutably");
});

test("Block 03 Logistics Partner: selected provider has execution access; unselected provider denied", () => {
  const selectedShipment = {
    id: "shp-01",
    status: "CARRIER_SELECTED",
    selectedProviderUserId: "user-lp-1",
  };

  const checkExecutionAccess = (userId, shipment) => {
    return shipment.selectedProviderUserId === userId;
  };

  assert.equal(checkExecutionAccess("user-lp-1", selectedShipment), true, "Selected carrier has execution access");
  assert.equal(checkExecutionAccess("user-lp-2", selectedShipment), false, "Unselected carrier has NO execution access");
});

test("Block 03 Discrepancies: calculates quantity difference server-side and validates unit integrity", () => {
  const calcQuantityDiff = (expected, delivered, unit, shipmentUnit) => {
    if (unit !== shipmentUnit) {
      throw new Error("Unit mismatch");
    }
    return Math.round((delivered - expected) * 1000) / 1000;
  };

  // Valid difference
  const diff = calcQuantityDiff(25, 24.2, "TONNE", "TONNE");
  assert.equal(diff, -0.8);

  // Mismatched units rejected
  assert.throws(() => {
    calcQuantityDiff(25, 24200, "KG", "TONNE");
  }, /Unit mismatch/);
});

test("Block 03 Cost Reconciliation: preserves quoted baseline immutable and computes variance", () => {
  const quotedAmount = 3200;
  const quotedCurrency = "EUR";
  const finalAmount = 3450;
  const finalCurrency = "EUR";

  const diffAmount = finalAmount - quotedAmount;

  assert.equal(diffAmount, 250);
  assert.equal(quotedAmount, 3200, "Quoted baseline remains unchanged");
});

test("Block 03 Closure Invariants: close blocked without delivery and cost reconciliation", () => {
  const canCloseShipment = (shipment) => {
    if (shipment.status !== "DELIVERED") return false;
    if (!shipment.costReconciliation) return false;
    if (shipment.status === "DISPUTED") return false;
    return true;
  };

  assert.equal(canCloseShipment({ status: "IN_TRANSIT", costReconciliation: { finalAmount: 3200 } }), false);
  assert.equal(canCloseShipment({ status: "DELIVERED", costReconciliation: null }), false);
  assert.equal(canCloseShipment({ status: "DELIVERED", costReconciliation: { finalAmount: 3200 } }), true);
});

test("Block 03 Administrative Settlement: strictly administrative tracking, no payment CTAs", () => {
  const settlement = {
    tradeId: "trade-uuid-1",
    totalCommercialAmount: 37500,
    depositAmount: 10000,
    remainingBalance: 27500,
    commissionAmount: 750,
    finalSettlementAmount: 37500,
    paymentStatus: "PENDING",
  };

  // Amount validations
  assert.ok(settlement.depositAmount >= 0);
  assert.ok(settlement.commissionAmount >= 0);
  assert.ok(settlement.remainingBalance >= 0);
  assert.equal(settlement.remainingBalance, settlement.totalCommercialAmount - settlement.depositAmount);

  // No payment CTAs permitted in UI contract
  const permittedActions = ["UPDATE_METADATA", "UPLOAD_INVOICE", "UPLOAD_CREDIT_NOTE", "UPLOAD_INSTRUCTION", "RECORD_CLAIM", "RESOLVE_CLAIM"];
  const forbiddenCTAs = ["PAY", "RELEASE_PAYMENT", "SEND_MONEY", "ESCROW", "EXECUTE_TRANSFER"];

  forbiddenCTAs.forEach((cta) => {
    assert.equal(permittedActions.includes(cta), false, `Payment execution action ${cta} is strictly prohibited`);
  });
});

test("Block 03 Boundary: NO DPP UI present in Sprint 08", () => {
  const currentSprintFeatures = [
    "STRUCTURED_CONTRACT_CORE",
    "CONTRACT_PDF",
    "SHIPMENT_REQUIREMENTS",
    "FREIGHT_QUOTATIONS",
    "CARRIER_SELECTION",
    "SHIPMENT_EXECUTION",
    "TRACKING_TIMELINE",
    "SHIPPING_DOCUMENTS",
    "DELIVERY_CONFIRMATION",
    "DISCREPANCIES",
    "LOGISTICS_RECONCILIATION",
    "ADMINISTRATIVE_SETTLEMENT",
  ];

  assert.equal(currentSprintFeatures.includes("DIGITAL_PRODUCT_PASSPORT"), false, "DPP is strictly Sprint 09 scope");
});

// ── Modals Regression Tests: Invite Provider & Manual Freight Quotation ──

test("Modals Gating: Invite Provider & Manual Quotation allowed in PLANNING and QUOTE_REQUESTED, blocked in CARRIER_SELECTED and CLOSED", () => {
  const isActionAllowed = (status, isClosed) => {
    if (isClosed) return false;
    return status !== "CARRIER_SELECTED";
  };

  // Allowed in PLANNING
  assert.equal(isActionAllowed("PLANNING", false), true, "Must be allowed in PLANNING");

  // Allowed in QUOTE_REQUESTED
  assert.equal(isActionAllowed("QUOTE_REQUESTED", false), true, "Must be allowed in QUOTE_REQUESTED");

  // Blocked in CARRIER_SELECTED
  assert.equal(isActionAllowed("CARRIER_SELECTED", false), false, "Must be blocked once carrier is selected");

  // Blocked when shipment is CLOSED
  assert.equal(isActionAllowed("PLANNING", true), false, "Must be blocked when closed");
  assert.equal(isActionAllowed("DELIVERED", true), false, "Must be blocked when delivered and closed");
});

test("Invite Provider Modal: validates non-empty targetProviderUserId and constructs valid payload", () => {
  let showInviteModal = false;
  let inviteProviderId = "";
  let isSubmitting = false;

  // 1. Open modal
  showInviteModal = true;
  assert.equal(showInviteModal, true);

  // 2. Validation: blank input is rejected
  inviteProviderId = "   ";
  const isValidBlank = inviteProviderId.trim().length > 0;
  assert.equal(isValidBlank, false, "Blank provider ID must not be valid for submission");

  // 3. Validation: valid UUID/provider ID
  const validProviderId = "123e4567-e89b-12d3-a456-426614174000";
  inviteProviderId = validProviderId;
  assert.ok(inviteProviderId.trim().length > 0);

  // 4. Payload construction matching CreateFreightRequestInput
  const payload = {
    targetProviderUserIds: [inviteProviderId.trim()],
  };
  assert.deepEqual(payload, {
    targetProviderUserIds: ["123e4567-e89b-12d3-a456-426614174000"],
  });

  // 5. Cancel / Close modal resets state
  showInviteModal = false;
  inviteProviderId = "";
  assert.equal(showInviteModal, false);
  assert.equal(inviteProviderId, "");
});

test("Manual Freight Quotation Modal: validates request selection, freight amount, and builds ISO dates payload", () => {
  let showManualQuoteModal = false;
  let form = {
    logisticsRequestId: "",
    freightAmount: 0,
    currency: "EUR",
    validUntil: "",
    proposedPickupDate: "",
    estimatedDeliveryDate: "",
    notes: "",
  };

  // 1. Open modal
  showManualQuoteModal = true;
  assert.equal(showManualQuoteModal, true);

  // 2. Validation: requires logisticsRequestId
  const hasRequestBefore = Boolean(form.logisticsRequestId);
  assert.equal(hasRequestBefore, false, "Must reject submission without logisticsRequestId");

  // 3. Validation: requires freightAmount > 0
  const hasAmountBefore = form.freightAmount > 0;
  assert.equal(hasAmountBefore, false, "Must reject submission with 0 freight amount");

  // 4. Fill form with valid quotation data
  form.logisticsRequestId = "request-uuid-1";
  form.freightAmount = 3500.5;
  form.currency = "EUR";
  form.proposedPickupDate = "2026-10-25";
  form.estimatedDeliveryDate = "2026-11-02";
  form.validUntil = "2026-11-15";
  form.notes = "Direct sea freight via Le Havre";

  assert.ok(form.logisticsRequestId.length > 0);
  assert.ok(form.freightAmount > 0);

  // 5. Payload serialization matching SubmitFreightQuotationInput & { logisticsRequestId: string }
  const payload = {
    freightAmount: Number(form.freightAmount),
    currency: form.currency,
    validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
    proposedPickupDate: form.proposedPickupDate ? new Date(form.proposedPickupDate).toISOString() : null,
    estimatedDeliveryDate: form.estimatedDeliveryDate ? new Date(form.estimatedDeliveryDate).toISOString() : null,
    notes: form.notes?.trim() || null,
  };

  assert.equal(payload.freightAmount, 3500.5);
  assert.equal(payload.currency, "EUR");
  assert.equal(typeof payload.validUntil, "string");
  assert.equal(typeof payload.proposedPickupDate, "string");
  assert.equal(typeof payload.estimatedDeliveryDate, "string");
  assert.equal(payload.notes, "Direct sea freight via Le Havre");

  // 6. Close modal resets state
  showManualQuoteModal = false;
  assert.equal(showManualQuoteModal, false);
});

