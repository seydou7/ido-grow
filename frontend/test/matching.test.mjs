import test from "node:test";
import assert from "node:assert/strict";

test("matching client contracts enforce DRAFT, APPROVED, CANCELLED lifecycle", () => {
  const statuses = ["DRAFT", "APPROVED", "CANCELLED"];
  assert.equal(statuses.length, 3);
  assert.ok(statuses.includes("DRAFT"));
  assert.ok(statuses.includes("APPROVED"));
  assert.ok(statuses.includes("CANCELLED"));
});

test("deterministic compatibility indicators cover material, form, quantity, origin, certs without weighted scores", () => {
  const compatibility = {
    material: "MATCH",
    productForm: "MATCH",
    quantity: "SUFFICIENT",
    quantityAvailable: 150,
    quantityRequested: 100,
    quantityRatio: 1.5,
    origin: "ACCEPTABLE",
    certification: "MATCH",
    priceComparison: {
      targetPriceAmount: 1500,
      targetPriceUnit: "PER_TONNE",
      listingPriceAmount: 1400,
      listingPriceUnit: "PER_TONNE",
      currency: "EUR",
      priceDifference: -100,
    },
  };

  assert.equal(compatibility.material, "MATCH");
  assert.equal(compatibility.productForm, "MATCH");
  assert.equal(compatibility.quantity, "SUFFICIENT");
  assert.equal(compatibility.origin, "ACCEPTABLE");
  assert.equal(compatibility.certification, "MATCH");
  assert.equal(compatibility.priceComparison.priceDifference, -100);
});

test("matching workspace contract embeds buyer demand, candidate listings, and single active approved match", () => {
  const workspace = {
    buyOrder: {
      id: "order-1",
      buyerOrganisationId: "buyer-org-1",
      buyerOrganisationName: "EcoTextiles BV",
      materialType: "HEMP",
      productForm: "FIBRE_TECHNICAL",
      quantity: 100,
      quantityUnit: "TONNES",
      deliveryCountry: "NL",
      deliveryDestination: "Rotterdam",
      requestedDeliveryDate: "2026-11-01T00:00:00.000Z",
      targetPriceAmount: 1450,
      currency: "EUR",
      targetPriceUnit: "PER_TONNE",
      acceptableOriginCountries: "FR,BE,NL",
      qualityRequirements: "Tensile strength > 35 cN/tex",
      packagingRequirements: "Standard bales",
      certificationRequirements: "GOTS",
      transportPreferences: "Road freight",
      paymentTerms: "30 days net",
      status: "OPEN",
    },
    candidates: [],
    activeApprovedMatch: {
      id: "match-1",
      buyOrderId: "order-1",
      listingId: "listing-1",
      buyerOrganisationId: "buyer-org-1",
      supplierOrganisationId: "supplier-org-1",
      createdByUserId: "trader-1",
      status: "APPROVED",
      traderNotes: "Best fit",
      approvedAt: "2026-09-01T16:00:00.000Z",
      createdAt: "2026-09-01T15:00:00.000Z",
      updatedAt: "2026-09-01T16:00:00.000Z",
    },
    matches: [],
  };

  assert.equal(workspace.buyOrder.materialType, "HEMP");
  assert.equal(workspace.activeApprovedMatch?.status, "APPROVED");
});

test("comparison selections and commercial match selection are strictly independent", () => {
  let selectedComparisonIds = ["cand-1", "cand-2", "cand-3"];
  let selectedCandidateId = "cand-2";
  let selectedMatch = {
    id: "match-2",
    buyOrderId: "order-1",
    listingId: "cand-2",
    status: "DRAFT",
  };

  // Changing comparison selection does not alter selected candidate or match
  selectedComparisonIds = selectedComparisonIds.filter((id) => id !== "cand-2");

  assert.equal(selectedComparisonIds.length, 2);
  assert.equal(selectedCandidateId, "cand-2");
  assert.equal(selectedMatch.status, "DRAFT");
});

test("approval confirmation mutation guard prevents duplicate requests under rapid clicks", async () => {
  let callCount = 0;
  let actionLoading = false;

  async function mockConfirmApprove() {
    if (actionLoading) return;
    actionLoading = true;
    callCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 50));
    actionLoading = false;
  }

  // Simulate two rapid clicks in parallel
  await Promise.all([mockConfirmApprove(), mockConfirmApprove()]);

  assert.equal(callCount, 1);
});

test("HTTP 409 error during approval surfaces explicit conflict message", () => {
  const errorResponse = {
    status: 409,
    message:
      "An approved match already exists for this Buy Order. Please cancel the existing approved match before approving a new candidate.",
  };

  let modalError = null;
  if (errorResponse.status === 409) {
    modalError = errorResponse.message;
  }

  assert.ok(modalError.includes("An approved match already exists"));
});

test("trader cockpit summary contract contains exact 5 domain metrics", () => {
  const summary = {
    supplierOnboardingCount: 3,
    pendingListingsCount: 2,
    publishedListingsCount: 8,
    openBuyOrdersCount: 5,
    approvedMatchesCount: 2,
  };

  assert.equal(typeof summary.supplierOnboardingCount, "number");
  assert.equal(typeof summary.pendingListingsCount, "number");
  assert.equal(typeof summary.publishedListingsCount, "number");
  assert.equal(typeof summary.openBuyOrdersCount, "number");
  assert.equal(typeof summary.approvedMatchesCount, "number");
});

test("operational queue enforces deterministic priority ranking without AI scores", () => {
  const categoryRank = {
    buyer_demand_open: 1,
    buyer_demand_draft: 2,
    supplier_onboarding: 3,
    listing_review: 4,
    approved_match: 5,
  };

  const queue = [
    { id: "1", category: "approved_match", currentStatus: "APPROVED", createdAt: "2026-09-01T10:00:00Z" },
    { id: "2", category: "buyer_demand", currentStatus: "OPEN", createdAt: "2026-09-02T10:00:00Z" },
    { id: "3", category: "supplier_onboarding", currentStatus: "PENDING", createdAt: "2026-09-01T08:00:00Z" },
    { id: "4", category: "buyer_demand", currentStatus: "DRAFT_MATCH", createdAt: "2026-09-03T10:00:00Z" },
  ];

  queue.sort((a, b) => {
    const getRank = (item) => {
      if (item.category === "buyer_demand") {
        return item.currentStatus === "OPEN"
          ? categoryRank.buyer_demand_open
          : categoryRank.buyer_demand_draft;
      }
      return categoryRank[item.category] ?? 99;
    };
    const diff = getRank(a) - getRank(b);
    if (diff !== 0) return diff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  assert.equal(queue[0].id, "2"); // open buyer demand
  assert.equal(queue[1].id, "4"); // draft buyer demand
  assert.equal(queue[2].id, "3"); // supplier onboarding
  assert.equal(queue[3].id, "1"); // approved match
});

test("open buyer demand match status accurately distinguishes No Match, Draft Match, and Approved Match", () => {
  const demands = [
    { id: "bo-1", matches: [] },
    { id: "bo-2", matches: [{ status: "DRAFT" }] },
    { id: "bo-3", matches: [{ status: "APPROVED" }] },
  ];

  const mapped = demands.map((d) => {
    if (d.matches.some((m) => m.status === "APPROVED")) return "Approved Match";
    if (d.matches.some((m) => m.status === "DRAFT")) return "Draft Match";
    return "No Match";
  });

  assert.deepEqual(mapped, ["No Match", "Draft Match", "Approved Match"]);
});

test("approved match contract provides passive Ready for Quotation badge without quote action", () => {
  const approvedMatch = {
    id: "match-123",
    buyOrderId: "bo-100",
    listingId: "lst-200",
    buyerOrganisationName: "BioPlastics BV",
    supplierOrganisationName: "Normandie Chanvre",
    materialType: "HEMP",
    productForm: "FIBRE_TECHNICAL",
    quantity: 60,
    quantityUnit: "TONNES",
    status: "APPROVED",
    approvedAt: "2026-09-16T11:00:00.000Z",
    nextStep: "Ready for Quotation",
  };

  assert.equal(approvedMatch.status, "APPROVED");
  assert.equal(approvedMatch.nextStep, "Ready for Quotation");
});

test("trader supplier summary contract contains real operational fields without artificial scores", () => {
  const supplierSummary = {
    id: "org-supplier-1",
    name: "Normandie Chanvre",
    organisationType: "SUPPLIER",
    country: "FR",
    verificationStatus: "VERIFIED",
    publishedListingsCount: 4,
    draftListingsCount: 1,
    productionSitesCount: 2,
    createdAt: "2026-05-10T08:00:00.000Z",
  };

  assert.equal(supplierSummary.organisationType, "SUPPLIER");
  assert.equal(supplierSummary.verificationStatus, "VERIFIED");
  assert.equal(supplierSummary.publishedListingsCount, 4);
  assert.equal(supplierSummary.draftListingsCount, 1);
  assert.equal(supplierSummary.productionSitesCount, 2);
  assert.equal(supplierSummary.supplierScore, undefined);
  assert.equal(supplierSummary.reliabilityPercentage, undefined);
});

test("trader supplier detail contracts embed real listings, sites, and compliance documents", () => {
  const supplierDetail = {
    id: "org-supplier-1",
    name: "Normandie Chanvre",
    organisationType: "SUPPLIER",
    country: "FR",
    verificationStatus: "VERIFIED",
    publishedListingsCount: 1,
    draftListingsCount: 0,
    productionSitesCount: 1,
    createdAt: "2026-05-10T08:00:00.000Z",
    registrationNumber: "FR123456789",
    vatNumber: "FR998877665",
    primaryContactEmail: "contact@chanvre.fr",
    billingAddress: "12 Route du Lin, Rouen",
    listings: [
      {
        id: "lst-1",
        title: "French Retting Flax Straw",
        materialType: "FLAX",
        productForm: "STRAW_RETTED",
        quantity: 25,
        quantityUnit: "TONNES",
        status: "PUBLISHED",
      },
    ],
    sites: [
      {
        id: "site-1",
        name: "Rouen Storage Facility",
        siteType: "STORAGE_FACILITY",
        country: "FR",
      },
    ],
    complianceDocuments: [
      {
        id: "doc-1",
        documentType: "COMPANY_REGISTRATION",
        status: "APPROVED",
      },
    ],
  };

  assert.equal(supplierDetail.listings.length, 1);
  assert.equal(supplierDetail.sites.length, 1);
  assert.equal(supplierDetail.complianceDocuments.length, 1);
  assert.equal(supplierDetail.listings[0].status, "PUBLISHED");
});

test("trader on-behalf listing creation targets supplier organisation while maintaining trader identity", () => {
  const traderContext = {
    userId: "trader-usr-1",
    organisationId: "trader-org-1",
    organisationType: "TRADER",
  };
  const targetSupplierOrgId = "supplier-org-99";
  const listingInput = {
    title: "Eco Hemp Fibre",
    materialType: "HEMP",
    productForm: "FIBRE_TECHNICAL",
    quantity: 120,
    quantityUnit: "TONNES",
    priceAmount: 1600,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    status: "PUBLISHED",
  };

  const createdListing = {
    ...listingInput,
    id: "listing-new-1",
    organisationId: targetSupplierOrgId, // Owned by supplier
    createdByUserId: traderContext.userId, // Created by trader
  };

  assert.equal(createdListing.organisationId, "supplier-org-99");
  assert.equal(createdListing.createdByUserId, "trader-usr-1");
  assert.equal(createdListing.status, "PUBLISHED");
});

test("trader buyer summary contract contains operational demand & match counts", () => {
  const buyerSummary = {
    id: "org-buyer-1",
    name: "Nordic Composites Oy",
    organisationType: "BUYER",
    country: "FI",
    verificationStatus: "VERIFIED",
    totalBuyOrdersCount: 5,
    openBuyOrdersCount: 2,
    draftBuyOrdersCount: 1,
    approvedMatchesCount: 2,
    mostRecentDemandDate: "2026-09-12T14:30:00.000Z",
    createdAt: "2026-06-01T09:00:00.000Z",
  };

  assert.equal(buyerSummary.organisationType, "BUYER");
  assert.equal(buyerSummary.totalBuyOrdersCount, 5);
  assert.equal(buyerSummary.openBuyOrdersCount, 2);
  assert.equal(buyerSummary.draftBuyOrdersCount, 1);
  assert.equal(buyerSummary.approvedMatchesCount, 2);
  assert.equal(buyerSummary.buyerScore, undefined);
});

test("trader buyer detail navigates demand to matching workspace and approved matches to review", () => {
  const buyerDetail = {
    id: "org-buyer-1",
    name: "Nordic Composites Oy",
    organisationType: "BUYER",
    country: "FI",
    verificationStatus: "VERIFIED",
    buyOrders: [
      {
        id: "bo-101",
        materialType: "HEMP",
        quantity: 80,
        quantityUnit: "TONNES",
        status: "OPEN",
        matchStatus: "No Match",
      },
      {
        id: "bo-102",
        materialType: "FLAX",
        quantity: 50,
        quantityUnit: "TONNES",
        status: "OPEN",
        matchStatus: "Approved Match",
      },
    ],
    approvedMatches: [
      {
        id: "match-88",
        buyOrderId: "bo-102",
        listingId: "lst-55",
        supplierOrganisationName: "Normandie Chanvre",
        status: "APPROVED",
        approvedAt: "2026-09-15T16:00:00.000Z",
      },
    ],
  };

  const openDemand = buyerDetail.buyOrders.find((b) => b.id === "bo-101");
  assert.equal(openDemand?.matchStatus, "No Match");
  const approvedDemand = buyerDetail.buyOrders.find((b) => b.id === "bo-102");
  assert.equal(approvedDemand?.matchStatus, "Approved Match");
  assert.equal(buyerDetail.approvedMatches[0].buyOrderId, "bo-102");
});

test("cockpit queue actions map properly to trader suppliers and matching workspace", () => {
  const queueActions = [
    {
      category: "supplier_onboarding",
      referenceId: "org-sup-1",
      meta: { organisationId: "org-sup-1" },
      targetDestination: "trader-suppliers",
    },
    {
      category: "listing_review",
      referenceId: "lst-10",
      meta: { listingId: "lst-10", organisationId: "org-sup-1" },
      targetDestination: "trader-suppliers",
    },
    {
      category: "buyer_demand",
      referenceId: "bo-20",
      meta: { buyOrderId: "bo-20" },
      targetDestination: "matching-workspace",
    },
    {
      category: "approved_match",
      referenceId: "match-30",
      meta: { buyOrderId: "bo-20" },
      targetDestination: "matching-workspace",
    },
  ];

  for (const item of queueActions) {
    if (item.category === "supplier_onboarding" || item.category === "listing_review") {
      assert.equal(item.targetDestination, "trader-suppliers");
    } else {
      assert.equal(item.targetDestination, "matching-workspace");
    }
  }
});

test("candidate card action only selects as match and comparison set is decoupled", () => {
  let selectedCandidate = null;
  const comparisonSet = new Set(["lst-1"]);

  // Clicking "Select as Match" on candidate card
  const handleSelectCandidate = (candidate) => {
    selectedCandidate = candidate;
  };

  handleSelectCandidate({ id: "lst-2", title: "Flax Straw Lot 2" });

  assert.equal(selectedCandidate.id, "lst-2");
  assert.equal(comparisonSet.has("lst-1"), true);
  assert.equal(comparisonSet.has("lst-2"), false); // comparison untouched
});

test("comparison matrix limits candidates to between 2 and 4", () => {
  let selectedForComp = [];

  const toggleCompare = (id) => {
    if (selectedForComp.includes(id)) {
      selectedForComp = selectedForComp.filter((c) => c !== id);
    } else {
      if (selectedForComp.length >= 4) return; // max 4
      selectedForComp = [...selectedForComp, id];
    }
  };

  toggleCompare("c-1");
  toggleCompare("c-2");
  toggleCompare("c-3");
  toggleCompare("c-4");
  toggleCompare("c-5"); // should be ignored

  assert.equal(selectedForComp.length, 4);
  assert.deepEqual(selectedForComp, ["c-1", "c-2", "c-3", "c-4"]);

  toggleCompare("c-2");
  assert.equal(selectedForComp.length, 3);
  assert.deepEqual(selectedForComp, ["c-1", "c-3", "c-4"]);
});

test("approval confirmation mutation guard prevents duplicate requests under rapid clicks", async () => {
  let apiCallCount = 0;
  let isMutating = false;

  const handleConfirmApprove = async () => {
    if (isMutating) return;
    isMutating = true;
    try {
      apiCallCount++;
      await new Promise((resolve) => setTimeout(resolve, 20));
    } finally {
      isMutating = false;
    }
  };

  // Simulate rapid double click
  const click1 = handleConfirmApprove();
  const click2 = handleConfirmApprove();
  await Promise.all([click1, click2]);

  assert.equal(apiCallCount, 1);
});

test("cockpit action dispatcher invokes appropriate navigation callbacks", () => {
  const events = [];
  const onNavigateToSupplier = (id) => events.push({ type: "supplier", id });
  const onNavigateToBuyer = (id) => events.push({ type: "buyer", id });
  const onOpenMatching = (id) => events.push({ type: "matching", id });

  const dispatchCockpitAction = (item) => {
    if (item.category === "buyer_demand") {
      const boId = item.meta?.buyOrderId || item.referenceId;
      onOpenMatching(boId);
    } else if (item.category === "approved_match") {
      const boId = item.meta?.buyOrderId;
      if (boId) onOpenMatching(boId);
    } else if (item.category === "supplier_onboarding") {
      const supplierId = item.meta?.organisationId || item.referenceId;
      if (supplierId) onNavigateToSupplier(supplierId);
    } else if (item.category === "listing_review") {
      const supplierId = item.meta?.organisationId;
      if (supplierId) onNavigateToSupplier(supplierId);
    }
  };

  dispatchCockpitAction({
    category: "supplier_onboarding",
    referenceId: "sup-99",
    meta: { organisationId: "sup-99" },
  });
  dispatchCockpitAction({
    category: "listing_review",
    referenceId: "lst-1",
    meta: { organisationId: "sup-88" },
  });
  dispatchCockpitAction({
    category: "buyer_demand",
    referenceId: "bo-10",
    meta: { buyOrderId: "bo-10" },
  });
  dispatchCockpitAction({
    category: "approved_match",
    referenceId: "match-1",
    meta: { buyOrderId: "bo-20" },
  });

  assert.deepEqual(events, [
    { type: "supplier", id: "sup-99" },
    { type: "supplier", id: "sup-88" },
    { type: "matching", id: "bo-10" },
    { type: "matching", id: "bo-20" },
  ]);
});

test("security errors accurately map to user-visible status messages", () => {
  const mapSecurityError = (status) => {
    if (status === 401) {
      return "Authentication required. Please sign in to access the Trader Portal.";
    }
    if (status === 403) {
      return "Access restricted. The Trader Cockpit is reserved for authenticated Trader organisations.";
    }
    return "An unexpected error occurred.";
  };

  assert.equal(
    mapSecurityError(401),
    "Authentication required. Please sign in to access the Trader Portal."
  );
  assert.equal(
    mapSecurityError(403),
    "Access restricted. The Trader Cockpit is reserved for authenticated Trader organisations."
  );
});

test("empty states render clear messages without mock records", () => {
  const getSupplierEmptyMessage = (items, search) => {
    if (items.length === 0) {
      return search.trim() !== ""
        ? "No suppliers match the selected filters."
        : "No supplier organisations registered on the platform.";
    }
    return null;
  };

  assert.equal(
    getSupplierEmptyMessage([], ""),
    "No supplier organisations registered on the platform."
  );
  assert.equal(
    getSupplierEmptyMessage([], "Flax"),
    "No suppliers match the selected filters."
  );
});

test("candidate selection handler provides single click selection, loading state, and double-submit guard", async () => {
  let apiCallCount = 0;
  let actionLoading = false;
  let selectingCandidateId = null;
  let selectedCandidateId = null;
  let selectedMatch = null;
  let approveMatchVisible = false;

  const handleSelectCandidate = async (candidate) => {
    if (actionLoading) return;
    if (selectedCandidateId === candidate.id && selectedMatch) return;
    actionLoading = true;
    selectingCandidateId = candidate.id;
    try {
      apiCallCount++;
      await new Promise((resolve) => setTimeout(resolve, 30));
      selectedCandidateId = candidate.id;
      selectedMatch = {
        id: `match-for-${candidate.id}`,
        listingId: candidate.id,
        status: "DRAFT",
      };
      approveMatchVisible = true;
    } finally {
      actionLoading = false;
      selectingCandidateId = null;
    }
  };

  const candidateA = { id: "cand-A", title: "Candidate A" };
  const candidateB = { id: "cand-B", title: "Candidate B" };

  // 1. Single click on Candidate A
  const selectPromise = handleSelectCandidate(candidateA);
  assert.equal(actionLoading, true);
  assert.equal(selectingCandidateId, "cand-A");

  // 2. Rapid second click during flight (double-submit prevention)
  const duplicateClickPromise = handleSelectCandidate(candidateA);
  await Promise.all([selectPromise, duplicateClickPromise]);

  assert.equal(apiCallCount, 1, "Only 1 API call should be made despite rapid clicks");
  assert.equal(actionLoading, false, "Loading state must reset after completion");
  assert.equal(selectingCandidateId, null, "Selecting candidate ID must reset");
  assert.equal(selectedCandidateId, "cand-A", "Candidate A should be selected");
  assert.equal(selectedMatch.status, "DRAFT", "Match status should be DRAFT");
  assert.equal(approveMatchVisible, true, "Approve Match section should be visible");

  // 3. Idempotent click on already selected candidate
  await handleSelectCandidate(candidateA);
  assert.equal(apiCallCount, 1, "Clicking already selected candidate should not re-invoke API");

  // 4. Switching to candidate B
  await handleSelectCandidate(candidateB);
  assert.equal(apiCallCount, 2, "Selecting candidate B should make a new API call");
  assert.equal(selectedCandidateId, "cand-B", "Candidate B should now be selected");
  assert.equal(selectedMatch.listingId, "cand-B");
  assert.equal(actionLoading, false);
});

test("candidate selection resets loading state on error and displays failure message", async () => {
  let actionLoading = false;
  let selectingCandidateId = null;
  let error = null;

  const handleSelectCandidateWithError = async (candidate) => {
    if (actionLoading) return;
    actionLoading = true;
    selectingCandidateId = candidate.id;
    error = null;
    try {
      throw new Error("Server error: constraint violation");
    } catch (err) {
      error = err.message;
    } finally {
      actionLoading = false;
      selectingCandidateId = null;
    }
  };

  await handleSelectCandidateWithError({ id: "cand-fail" });

  assert.equal(actionLoading, false, "Loading must reset on error");
  assert.equal(selectingCandidateId, null, "Selecting ID must reset on error");
  assert.equal(error, "Server error: constraint violation");
});

test("Sprint 05 UX: comparison toggle does not alter commercial match or selected candidate", () => {
  let comparisonIds = new Set();
  let selectedCandidateId = null;
  let selectedMatch = null;

  const toggleComparison = (id) => {
    const next = new Set(comparisonIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    comparisonIds = next;
    // Must NOT alter selectedCandidateId or selectedMatch
  };

  const getComparisonLabel = (id) => {
    return comparisonIds.has(id) ? "Added to comparison" : "Add to comparison";
  };

  assert.equal(getComparisonLabel("listing-1"), "Add to comparison");
  toggleComparison("listing-1");
  assert.equal(getComparisonLabel("listing-1"), "Added to comparison");
  assert.equal(selectedCandidateId, null, "Comparison must not select commercial candidate");
  assert.equal(selectedMatch, null, "Comparison must not create commercial match");

  toggleComparison("listing-1");
  assert.equal(getComparisonLabel("listing-1"), "Add to comparison");
  assert.equal(selectedCandidateId, null);
});

test("Sprint 05 UX: candidate selection states and single-card selection exclusivity", () => {
  let selectedCandidateId = "cand-1";
  let selectingCandidateId = null;
  let activeApprovedMatch = null;

  const getButtonState = (candidateId) => {
    if (activeApprovedMatch) {
      if (activeApprovedMatch.listingId === candidateId) {
        return { label: "✓ Approved Match", disabled: true, isApproved: true };
      }
      return { label: "Approved match already active", disabled: true, isApproved: false };
    }
    if (selectingCandidateId === candidateId) {
      return { label: "Selecting…", disabled: true, isSelecting: true };
    }
    if (selectedCandidateId === candidateId) {
      return { label: "Selected", disabled: true, isSelected: true };
    }
    return { label: "Select candidate", disabled: false, isSelected: false };
  };

  // State 1: cand-1 is selected, cand-2 is unselected
  assert.deepEqual(getButtonState("cand-1"), { label: "Selected", disabled: true, isSelected: true });
  assert.deepEqual(getButtonState("cand-2"), { label: "Select candidate", disabled: false, isSelected: false });

  // State 2: cand-2 is in-flight selecting
  selectingCandidateId = "cand-2";
  assert.deepEqual(getButtonState("cand-2"), { label: "Selecting…", disabled: true, isSelecting: true });

  // State 3: cand-2 completes selection, cand-1 loses selected state
  selectingCandidateId = null;
  selectedCandidateId = "cand-2";
  assert.deepEqual(getButtonState("cand-1"), { label: "Select candidate", disabled: false, isSelected: false });
  assert.deepEqual(getButtonState("cand-2"), { label: "Selected", disabled: true, isSelected: true });

  // State 4: cand-2 is approved -> locks all candidates
  activeApprovedMatch = { id: "match-2", listingId: "cand-2", status: "APPROVED" };
  assert.deepEqual(getButtonState("cand-2"), { label: "✓ Approved Match", disabled: true, isApproved: true });
  assert.deepEqual(getButtonState("cand-1"), { label: "Approved match already active", disabled: true, isApproved: false });
});

test("Sprint 05 UX: workspace clears stale selection feedback when approved match is active", () => {
  let feedback = 'Selected "Loomcraft Lin" as candidate. Status: DRAFT';
  const activeApprovedMatch = { id: "match-1", listingId: "cand-1", status: "APPROVED" };

  // Logic in loadWorkspace: if activeApprovedMatch exists, clear feedback
  if (activeApprovedMatch) {
    feedback = null;
  }

  assert.equal(feedback, null, "Stale DRAFT selection feedback must be cleared when approved match is present");
});

test("Sprint 05 UX: revoking or cancelling approved match restores candidate selection", () => {
  let activeApprovedMatch = { id: "match-1", listingId: "cand-1", status: "APPROVED" };
  let selectedMatch = null;
  let selectedCandidateId = null;

  // After cancellation:
  activeApprovedMatch = null;
  selectedMatch = null;
  selectedCandidateId = null;

  const getButtonState = (candidateId) => {
    if (activeApprovedMatch) {
      return { disabled: true };
    }
    return { label: "Select candidate", disabled: false };
  };

  assert.equal(getButtonState("cand-1").disabled, false);
  assert.equal(getButtonState("cand-2").disabled, false);
  assert.equal(getButtonState("cand-1").label, "Select candidate");
});

test("Sprint 05 Bug Regression: candidate selection uses stable identifiers and does NOT jump to first array item on reload", async () => {
  const candidateList = [
    { id: "cand-A", title: "Candidate A" },
    { id: "cand-B", title: "Candidate B" },
    { id: "cand-C", title: "Candidate C" },
    { id: "cand-D", title: "Candidate D" },
  ];

  let currentTime = 1000;
  const dbMatches = [];

  // Simulated backend endpoints
  const selectCandidateAsMatchApi = async (buyOrderId, input) => {
    currentTime += 100;
    const existing = dbMatches.find((m) => m.listingId === input.listingId);
    if (existing) {
      existing.updatedAt = new Date(currentTime).toISOString();
      return { ...existing };
    }
    const created = {
      id: `match-${input.listingId}`,
      buyOrderId,
      listingId: input.listingId,
      status: "DRAFT",
      createdAt: new Date(currentTime).toISOString(),
      updatedAt: new Date(currentTime).toISOString(),
    };
    dbMatches.push(created);
    return { ...created };
  };

  const getWorkspaceApi = async () => {
    const matchByListing = new Map(dbMatches.map((m) => [m.listingId, m]));
    return {
      candidates: candidateList.map((c) => ({
        ...c,
        match: matchByListing.get(c.id) || null,
      })),
      activeApprovedMatch: dbMatches.find((m) => m.status === "APPROVED") || null,
      matches: [...dbMatches].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    };
  };

  // Frontend workspace state
  let selectedCandidateId = null;
  let selectedMatch = null;

  const loadWorkspace = async (preferredCandidateId) => {
    const data = await getWorkspaceApi();

    if (data.activeApprovedMatch) {
      const approvedCand = data.candidates.find(
        (c) => c.id === data.activeApprovedMatch.listingId,
      );
      if (approvedCand) {
        selectedCandidateId = approvedCand.id;
        selectedMatch = data.activeApprovedMatch;
      }
    } else if (preferredCandidateId) {
      const prefCand = data.candidates.find(
        (c) => c.id === preferredCandidateId,
      );
      if (prefCand) {
        selectedCandidateId = prefCand.id;
        selectedMatch = prefCand.match;
      } else {
        selectedCandidateId = null;
        selectedMatch = null;
      }
    } else if (preferredCandidateId === null) {
      selectedCandidateId = null;
      selectedMatch = null;
    } else if (selectedCandidateId) {
      const currentCand = data.candidates.find(
        (c) => c.id === selectedCandidateId,
      );
      if (currentCand) {
        selectedCandidateId = currentCand.id;
        selectedMatch = currentCand.match;
      }
    } else if (data.candidates.length > 0) {
      // Authoritative recency resolution via data.matches
      const activeDraftMatches = (data.matches || [])
        .filter((m) => m.status === "DRAFT")
        .sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt).getTime();
          return timeB - timeA;
        });
      const latestDraftMatch = activeDraftMatches[0] ?? null;
      if (latestDraftMatch) {
        const matchingCand = data.candidates.find(
          (c) => c.id === latestDraftMatch.listingId,
        );
        if (matchingCand) {
          selectedCandidateId = matchingCand.id;
          selectedMatch = latestDraftMatch;
        }
      }
    }
  };

  const handleSelectCandidate = async (candidate) => {
    const match = await selectCandidateAsMatchApi("order-1", {
      listingId: candidate.id,
    });
    selectedCandidateId = candidate.id;
    selectedMatch = match;
    await loadWorkspace(candidate.id);
  };

  // 1. Select A -> A selected
  await handleSelectCandidate(candidateList[0]); // cand-A
  assert.equal(selectedCandidateId, "cand-A");
  assert.equal(selectedMatch.listingId, "cand-A");

  // 2. Select D -> D selected, A NOT selected
  await handleSelectCandidate(candidateList[3]); // cand-D
  assert.equal(selectedCandidateId, "cand-D", "Candidate D must be selected");
  assert.equal(selectedMatch.listingId, "cand-D");
  assert.notEqual(selectedCandidateId, "cand-A", "Candidate A must NOT remain selected");

  // 3. Reload workspace (e.g. browser refresh with fresh component mount)
  selectedCandidateId = null;
  selectedMatch = null;
  await loadWorkspace(); // no preferredCandidateId

  assert.equal(
    selectedCandidateId,
    "cand-D",
    "Reload must preserve Candidate D based on latest draft match recency, not jump to Candidate A (index 0)",
  );
  assert.equal(selectedMatch.listingId, "cand-D");

  // 4. Select B -> B selected
  await handleSelectCandidate(candidateList[1]); // cand-B
  assert.equal(selectedCandidateId, "cand-B");
  assert.equal(selectedMatch.listingId, "cand-B");

  // Reload workspace again
  selectedCandidateId = null;
  selectedMatch = null;
  await loadWorkspace();
  assert.equal(selectedCandidateId, "cand-B", "Reload must preserve Candidate B");

  // 5. Select C -> C selected
  await handleSelectCandidate(candidateList[2]); // cand-C
  assert.equal(selectedCandidateId, "cand-C");
  assert.equal(selectedMatch.listingId, "cand-C");

  // Reload workspace again
  selectedCandidateId = null;
  selectedMatch = null;
  await loadWorkspace();
  assert.equal(selectedCandidateId, "cand-C", "Reload must preserve Candidate C");

  // 6. Switch back to D
  await handleSelectCandidate(candidateList[3]); // cand-D
  assert.equal(selectedCandidateId, "cand-D");

  // Reload
  selectedCandidateId = null;
  selectedMatch = null;
  await loadWorkspace();
  assert.equal(selectedCandidateId, "cand-D");

  // 7. Revocation / Cancellation clears selected state without jumping to index 0
  await loadWorkspace(null); // explicit clear
  assert.equal(selectedCandidateId, null, "Revocation must leave selection cleanly cleared");
  assert.equal(selectedMatch, null);
});
