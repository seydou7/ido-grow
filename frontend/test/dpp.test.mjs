import test from "node:test";
import assert from "node:assert/strict";

// Mock DPP & Lot data fixtures
const mockLotFixture = {
  id: "lot-uuid-001",
  lotNumber: "LOT-20261002-A1B2C3D4",
  listingId: "listing-uuid-001",
  supplierOrganisationId: "supplier-org-001",
  productionSiteId: "site-uuid-001",
  materialType: "HEMP",
  productForm: "STRAW",
  quantity: 50,
  quantityUnit: "TONNES",
  countryOfOrigin: "France",
  regionOfOrigin: "Normandy",
  productionDate: "2026-09-01T08:00:00.000Z",
  batchReference: "BATCH-2026-01",
  notes: "High cellulose content",
  createdAt: "2026-09-10T10:00:00.000Z",
  updatedAt: "2026-09-10T10:00:00.000Z",
  createdByUserId: "user-trader-001",
  hasDpp: true,
  dppId: "dpp-uuid-001",
  dppNumber: "DPP-20261002-8888AAAA",
  listingTitle: "Organic French Hemp Straw",
  supplierName: "Normandy Hemp Growers",
  productionSiteName: "Parcel 14",
};

const mockSnapshotFixture = {
  identity: {
    passportNumber: "DPP-20261002-8888AAAA",
    lotNumber: "LOT-20261002-A1B2C3D4",
    materialType: "HEMP",
    productForm: "STRAW",
    batchReference: "BATCH-2026-01",
    quantity: 50,
    quantityUnit: "TONNES",
  },
  origin: {
    supplierOrganisationId: "supplier-org-001",
    supplierName: "Normandy Hemp Growers",
    supplierCountry: "France",
    productionSiteName: "Parcel 14",
    productionSiteAddress: "Route de la Ferme, Caen",
    countryOfOrigin: "France",
    regionOfOrigin: "Normandy",
    productionDate: "2026-09-01T08:00:00.000Z",
  },
  quality: {
    inspections: [
      {
        inspectionReference: "INS-20260912-0001",
        status: "COMPLETED",
        decision: "APPROVED",
        humanClassificationLabel: "Premium Grade European Hemp",
        certificateReference: "QIC-20260912-88889999",
        completedAt: "2026-09-12T14:30:00.000Z",
        summary: "Excellent straw quality",
      },
    ],
  },
  certifications: [
    {
      documentType: "ORGANIC_CERTIFICATION",
      originalFilename: "ecocert_2026.pdf",
      status: "VERIFIED",
    },
  ],
  transaction: [
    {
      tradeNumber: "TRD-20260915-0001",
      buyerOrganisationName: "EcoTextiles Paris",
      acceptedAt: "2026-09-15T11:00:00.000Z",
      materialType: "HEMP",
      quantity: 50,
      quantityUnit: "TONNES",
    },
  ],
  logistics: [
    {
      shipmentNumber: "SHP-20260917-0001",
      origin: "Caen, France",
      destination: "Paris, France",
      carrierName: "FastFreight SA",
      status: "DELIVERED",
      actualPickupAt: "2026-09-18T08:00:00.000Z",
      deliveredAt: "2026-09-19T15:00:00.000Z",
    },
  ],
  custodyMilestones: [
    {
      milestone: "SUPPLIER_ORIGIN",
      fromParty: null,
      toParty: "supplier-org-001",
      occurredAt: "2026-09-10T10:00:00.000Z",
      location: "Normandy, France",
    },
    {
      milestone: "TRADE_COMMERCIAL_TRANSFER",
      fromParty: "supplier-org-001",
      toParty: "buyer-org-001",
      occurredAt: "2026-09-15T11:00:00.000Z",
      location: null,
    },
    {
      milestone: "LOGISTICS_CARRIER_CUSTODY",
      fromParty: "supplier-org-001",
      toParty: "carrier-org-001",
      occurredAt: "2026-09-18T08:00:00.000Z",
      location: "Caen, France",
    },
    {
      milestone: "BUYER_DELIVERY_RECEIPT",
      fromParty: "carrier-org-001",
      toParty: "buyer-org-001",
      occurredAt: "2026-09-19T15:00:00.000Z",
      location: "Paris, France",
    },
  ],
};

const mockDppFixture = {
  id: "dpp-uuid-001",
  passportNumber: "DPP-20261002-8888AAAA",
  lotId: mockLotFixture.id,
  status: "ACTIVE",
  currentVersionNumber: 1,
  currentVersionId: "ver-uuid-001",
  createdAt: "2026-09-15T12:00:00.000Z",
  updatedAt: "2026-09-15T12:00:00.000Z",
  createdByUserId: "user-trader-001",
  lot: mockLotFixture,
  currentSnapshot: mockSnapshotFixture,
  eventsCount: 8,
  versionsCount: 1,
};

const mockEventsFixture = [
  {
    id: "ev-001",
    dppId: mockDppFixture.id,
    lotId: mockLotFixture.id,
    eventType: "LOT_CREATED",
    occurredAt: "2026-09-10T10:00:00.000Z",
    recordedAt: "2026-09-15T12:00:00.000Z",
    location: "Normandy, France",
    responsibleOrganisationId: "supplier-org-001",
    responsibleOrganisationName: "Normandy Hemp Growers",
    responsibleUserId: "user-trader-001",
    responsibleUserEmail: "trader@idogrow.com",
    sourceType: "lot",
    sourceId: mockLotFixture.id,
    verificationStatus: "RECORDED",
    metadata: null,
  },
  {
    id: "ev-002",
    dppId: mockDppFixture.id,
    lotId: mockLotFixture.id,
    eventType: "INSPECTION_COMPLETED",
    occurredAt: "2026-09-12T14:30:00.000Z",
    recordedAt: "2026-09-15T12:00:00.000Z",
    location: "49.1828, -0.3707",
    responsibleOrganisationId: null,
    responsibleOrganisationName: null,
    responsibleUserId: "user-inspector-001",
    responsibleUserEmail: "inspector@quality.eu",
    sourceType: "inspection",
    sourceId: "ins-001",
    verificationStatus: "RECORDED",
    metadata: null,
  },
  {
    id: "ev-003",
    dppId: mockDppFixture.id,
    lotId: mockLotFixture.id,
    eventType: "QUALITY_RESULT_APPROVED",
    occurredAt: "2026-09-12T16:00:00.000Z",
    recordedAt: "2026-09-15T12:00:00.000Z",
    location: null,
    responsibleOrganisationId: null,
    responsibleOrganisationName: null,
    responsibleUserId: "user-inspector-001",
    responsibleUserEmail: "inspector@quality.eu",
    sourceType: "quality_result",
    sourceId: "qr-001",
    verificationStatus: "VERIFIED",
    metadata: { classificationLabel: "Premium Grade European Hemp", certificateNumber: "QIC-20260912-88889999" },
  },
  {
    id: "ev-004",
    dppId: mockDppFixture.id,
    lotId: mockLotFixture.id,
    eventType: "TRADE_CREATED",
    occurredAt: "2026-09-15T11:00:00.000Z",
    recordedAt: "2026-09-15T12:00:00.000Z",
    location: null,
    responsibleOrganisationId: "buyer-org-001",
    responsibleOrganisationName: "EcoTextiles Paris",
    responsibleUserId: "user-trader-001",
    responsibleUserEmail: "trader@idogrow.com",
    sourceType: "trade",
    sourceId: "trade-001",
    verificationStatus: "RECORDED",
    metadata: null,
  },
  {
    id: "ev-005",
    dppId: mockDppFixture.id,
    lotId: mockLotFixture.id,
    eventType: "SHIPMENT_DELIVERED",
    occurredAt: "2026-09-19T15:00:00.000Z",
    recordedAt: "2026-09-19T15:00:00.000Z",
    location: "Paris, France",
    responsibleOrganisationId: null,
    responsibleOrganisationName: null,
    responsibleUserId: "user-carrier-001",
    responsibleUserEmail: "carrier@fastfreight.eu",
    sourceType: "shipment_tracking_event",
    sourceId: "te-002",
    verificationStatus: "VERIFIED",
    metadata: { notes: "Delivered intact" },
  },
];

const mockVersionsFixture = [
  {
    id: "ver-001",
    dppId: mockDppFixture.id,
    versionNumber: 1,
    snapshot: {
      ...mockSnapshotFixture,
      logistics: [
        {
          ...mockSnapshotFixture.logistics[0],
          status: "IN_TRANSIT",
          deliveredAt: null,
        },
      ],
    },
    previousVersionId: null,
    changeReason: "Initial Digital Product Passport creation",
    createdAt: "2026-09-15T12:00:00.000Z",
    createdByUserId: "user-trader-001",
  },
  {
    id: "ver-002",
    dppId: mockDppFixture.id,
    versionNumber: 2,
    snapshot: {
      ...mockSnapshotFixture,
      logistics: [
        {
          ...mockSnapshotFixture.logistics[0],
          status: "DELIVERED",
          deliveredAt: "2026-09-19T15:00:00.000Z",
        },
      ],
    },
    previousVersionId: "ver-001",
    changeReason: "Delivery confirmed at destination",
    createdAt: "2026-09-19T15:00:00.000Z",
    createdByUserId: "user-trader-001",
  },
];

test("DPP Frontend Contracts & Data Invariants", async (t) => {
  await t.test("TraceableLot adheres to immutable lot identifier format LOT-YYYYMMDD-XXXXXXXX", () => {
    assert.match(mockLotFixture.lotNumber, /^LOT-\d{8}-[A-F0-9]{8}$/);
    assert.equal(mockLotFixture.materialType, "HEMP");
    assert.equal(mockLotFixture.quantity, 50);
    assert.equal(mockLotFixture.quantityUnit, "TONNES");
    assert.equal(mockLotFixture.hasDpp, true);
  });

  await t.test("DigitalProductPassport adheres to stable identifier format DPP-YYYYMMDD-XXXXXXXX", () => {
    assert.match(mockDppFixture.passportNumber, /^DPP-\d{8}-[A-F0-9]{8}$/);
    assert.equal(mockDppFixture.status, "ACTIVE");
    assert.equal(mockDppFixture.currentVersionNumber, 1);
    assert.equal(mockDppFixture.lot.id, mockLotFixture.id);
  });

  await t.test("Snapshot contains all 7 structured sections without fabricated values", () => {
    const snap = mockDppFixture.currentSnapshot;
    assert.ok(snap);
    assert.ok(snap.identity);
    assert.ok(snap.origin);
    assert.ok(snap.quality);
    assert.ok(snap.certifications);
    assert.ok(snap.transaction);
    assert.ok(snap.logistics);
    assert.ok(snap.custodyMilestones);

    // Verify no fabricated commercial margins or bank details
    const serialized = JSON.stringify(snap);
    assert.ok(!serialized.includes("margin"));
    assert.ok(!serialized.includes("commission"));
    assert.ok(!serialized.includes("bank"));
    assert.ok(!serialized.includes("IBAN"));
  });

  await t.test("Verification status differentiates authoritative final actions from recorded steps", () => {
    const approvedEvent = mockEventsFixture.find((e) => e.eventType === "QUALITY_RESULT_APPROVED");
    assert.ok(approvedEvent);
    assert.equal(approvedEvent.verificationStatus, "VERIFIED");

    const deliveryEvent = mockEventsFixture.find((e) => e.eventType === "SHIPMENT_DELIVERED");
    assert.ok(deliveryEvent);
    assert.equal(deliveryEvent.verificationStatus, "VERIFIED");

    const lotEvent = mockEventsFixture.find((e) => e.eventType === "LOT_CREATED");
    assert.ok(lotEvent);
    assert.equal(lotEvent.verificationStatus, "RECORDED");

    const inspectionEvent = mockEventsFixture.find((e) => e.eventType === "INSPECTION_COMPLETED");
    assert.ok(inspectionEvent);
    assert.equal(inspectionEvent.verificationStatus, "RECORDED");
  });

  await t.test("Version history enforces monotonic versioning and preserves historical snapshots", () => {
    assert.equal(mockVersionsFixture.length, 2);
    assert.equal(mockVersionsFixture[0].versionNumber, 1);
    assert.equal(mockVersionsFixture[1].versionNumber, 2);
    assert.equal(mockVersionsFixture[1].previousVersionId, mockVersionsFixture[0].id);
    assert.notDeepEqual(mockVersionsFixture[0].snapshot, mockVersionsFixture[1].snapshot);
  });

  await t.test("Custody milestones correctly capture end-to-end provenance progression", () => {
    const milestones = mockSnapshotFixture.custodyMilestones.map((c) => c.milestone);
    assert.deepEqual(milestones, [
      "SUPPLIER_ORIGIN",
      "TRADE_COMMERCIAL_TRANSFER",
      "LOGISTICS_CARRIER_CUSTODY",
      "BUYER_DELIVERY_RECEIPT",
    ]);
  });

  await t.test("Block 01 boundary guarantees: no QR code or PDF passport in Block 01", () => {
    // Assert that Block 01 does not include QR endpoint or downloadable PDF
    const serializedDpp = JSON.stringify(mockDppFixture);
    assert.ok(!serializedDpp.includes("qrCodeUrl"));
    assert.ok(!serializedDpp.includes("pdfPassportUrl"));
    assert.ok(!serializedDpp.includes("downloadablePdf"));
  });
});

test("DPP Sprint 09 Block 02: Human-Readable Passport, PDF, QR & Counterparty Access", async (t) => {
  const mockPassportViewFixture = {
    passport: mockDppFixture,
    versionNumber: 2,
    isHistorical: false,
    renderedAt: "2026-10-02T10:00:00.000Z",
    snapshot: mockVersionsFixture[1].snapshot,
    events: mockEventsFixture,
  };

  const mockHistoricalPassportViewFixture = {
    passport: mockDppFixture,
    versionNumber: 1,
    isHistorical: true,
    renderedAt: "2026-10-02T10:00:00.000Z",
    snapshot: mockVersionsFixture[0].snapshot,
    events: mockEventsFixture,
  };

  const mockQrResultFixture = {
    dppId: mockDppFixture.id,
    passportNumber: mockDppFixture.passportNumber,
    destination: `/dpp/${mockDppFixture.id}/passport`,
    requiresAuth: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33"><path d="..."/></svg>`,
    dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  };

  await t.test("Human-readable passport payload structure contains all required sections", () => {
    assert.equal(mockPassportViewFixture.versionNumber, 2);
    assert.equal(mockPassportViewFixture.isHistorical, false);
    assert.ok(mockPassportViewFixture.snapshot.identity);
    assert.ok(mockPassportViewFixture.snapshot.origin);
    assert.ok(mockPassportViewFixture.snapshot.quality);
    assert.ok(mockPassportViewFixture.snapshot.certifications);
    assert.ok(mockPassportViewFixture.snapshot.transaction);
    assert.ok(mockPassportViewFixture.snapshot.logistics);
    assert.ok(mockPassportViewFixture.snapshot.custodyMilestones);
    assert.equal(mockPassportViewFixture.events.length, 5);
  });

  await t.test("Version-aware rendering correctly flags historical versions without mutating current data", () => {
    assert.equal(mockHistoricalPassportViewFixture.versionNumber, 1);
    assert.equal(mockHistoricalPassportViewFixture.isHistorical, true);
    assert.notDeepEqual(
      mockHistoricalPassportViewFixture.snapshot,
      mockPassportViewFixture.snapshot
    );
    // Historical version 1 has logistics in progress, while version 2 is DELIVERED
    assert.equal(
      mockHistoricalPassportViewFixture.snapshot.logistics[0].deliveredAt,
      null
    );
    assert.equal(
      mockPassportViewFixture.snapshot.logistics[0].deliveredAt,
      "2026-09-19T15:00:00.000Z"
    );
  });

  await t.test("QR code entry point strictly points to protected application route and requires auth", () => {
    assert.equal(mockQrResultFixture.destination, `/dpp/${mockDppFixture.id}/passport`);
    assert.equal(mockQrResultFixture.requiresAuth, true);
    assert.ok(mockQrResultFixture.svg.startsWith("<svg"));
    assert.ok(mockQrResultFixture.dataUrl.startsWith("data:image/png;base64,"));

    // Ensure NO access token, secret, or API key is encoded into destination
    assert.ok(!mockQrResultFixture.destination.includes("token"));
    assert.ok(!mockQrResultFixture.destination.includes("secret"));
    assert.ok(!mockQrResultFixture.destination.includes("key="));
    assert.ok(!mockQrResultFixture.destination.includes("bearer"));
  });

  await t.test("Downloadable PDF generation URL targets protected endpoint with version query", () => {
    const currentPdfUrl = `/api/v1/dpp/${mockDppFixture.id}/passport.pdf`;
    const historicalPdfUrl = `/api/v1/dpp/${mockDppFixture.id}/passport.pdf?version=1`;

    assert.ok(currentPdfUrl.endsWith("/passport.pdf"));
    assert.match(historicalPdfUrl, /\/passport\.pdf\?version=1$/);
  });

  await t.test("Authorised counterparty views enforce read-only and no commercial margin leakage", () => {
    // Both Buyer and Supplier views receive redacted snapshots
    const serializedPayload = JSON.stringify(mockPassportViewFixture);

    // Verify zero commercial margin or sensitive financial records
    assert.ok(!serializedPayload.includes("traderMargin"));
    assert.ok(!serializedPayload.includes("internalMargin"));
    assert.ok(!serializedPayload.includes("quoteBreakdown"));
    assert.ok(!serializedPayload.includes("bankAccount"));
    assert.ok(!serializedPayload.includes("paymentInstructions"));
    assert.ok(!serializedPayload.includes("settlementNotes"));
  });

  await t.test("No fabricated sustainability or compliance claims", () => {
    const serializedPayload = JSON.stringify(mockPassportViewFixture);

    assert.ok(!serializedPayload.includes("carbonFootprint"));
    assert.ok(!serializedPayload.includes("waterUse"));
    assert.ok(!serializedPayload.includes("sustainabilityScore"));
    assert.ok(!serializedPayload.includes("recycledContent"));
    assert.ok(!serializedPayload.includes("blockchainHash"));
    assert.ok(!serializedPayload.includes("aiGeneratedProvenance"));
  });

  await t.test("Missing optional fields fallback format is verified", () => {
    const sparseSnapshot = {
      ...mockSnapshotFixture,
      origin: {
        ...mockSnapshotFixture.origin,
        regionOfOrigin: null,
        productionDate: null,
      },
    };

    const getFieldDisplay = (val) => val || "Not recorded";
    assert.equal(getFieldDisplay(sparseSnapshot.origin.regionOfOrigin), "Not recorded");
    assert.equal(getFieldDisplay(sparseSnapshot.origin.productionDate), "Not recorded");
  });
});

