import {
  escapePdfText,
  formatField,
  generateDppPdf,
  wrapLine,
  type DppPdfData,
} from "./dpp-pdf-generator";
import type { DPPSnapshot } from "./dpp.contracts";

describe("DppPdfGenerator", () => {
  const mockSnapshot: DPPSnapshot = {
    identity: {
      passportNumber: "DPP-20261002-TEST1234",
      lotNumber: "LOT-20261002-ABCD1234",
      materialType: "HEMP",
      productForm: "STRAW_RETTED",
      batchReference: "BATCH-456",
      quantity: 25,
      quantityUnit: "TONNES",
    },
    origin: {
      supplierOrganisationId: "supp-org-1",
      supplierName: "Green Hemp Europe",
      supplierCountry: "France",
      productionSiteName: "Normandy Retting Facility",
      productionSiteAddress: "Route de Dieppe, 76200 Dieppe",
      countryOfOrigin: "France",
      regionOfOrigin: "Normandy",
      productionDate: "2026-08-15T00:00:00.000Z",
    },
    quality: {
      inspections: [
        {
          inspectionReference: "INSP-2026-001",
          status: "COMPLETED",
          decision: "APPROVED",
          humanClassificationLabel: "European Premium Retting Hemp Straw",
          certificateReference: "QIC-20261002-CERT9999",
          completedAt: "2026-09-01T10:00:00.000Z",
          summary: "Homogeneous straw, low moisture, superior fiber yield.",
        },
      ],
    },
    certifications: [
      {
        documentType: "ORGANIC_CERTIFICATE",
        originalFilename: "ecocert_hemp_2026.pdf",
        status: "VERIFIED",
      },
    ],
    transaction: [
      {
        tradeNumber: "TRD-2026-0088",
        buyerOrganisationName: "BioTextiles BV",
        acceptedAt: "2026-09-05T14:30:00.000Z",
        materialType: "HEMP",
        quantity: 25,
        quantityUnit: "TONNES",
      },
    ],
    logistics: [
      {
        shipmentNumber: "SHP-2026-0044",
        origin: "Dieppe, France",
        destination: "Ghent, Belgium",
        carrierName: "EcoFreight Logistics",
        status: "DELIVERED",
        actualPickupAt: "2026-09-10T08:00:00.000Z",
        deliveredAt: "2026-09-12T16:00:00.000Z",
      },
    ],
    custodyMilestones: [
      {
        milestone: "SUPPLIER_ORIGIN",
        fromParty: "Green Hemp Europe",
        toParty: null,
        occurredAt: "2026-08-15T00:00:00.000Z",
        location: "Dieppe, France",
      },
    ],
  };

  const sampleData: DppPdfData = {
    passportNumber: "DPP-20261002-TEST1234",
    lotNumber: "LOT-20261002-ABCD1234",
    versionNumber: 1,
    isHistorical: false,
    totalVersions: 1,
    status: "ACTIVE",
    createdAt: "2026-10-02T10:00:00.000Z",
    versionCreatedAt: "2026-10-02T10:00:00.000Z",
    renderedAt: "2026-10-02T11:00:00.000Z",
    snapshot: mockSnapshot,
    events: [
      {
        eventType: "LOT_CREATED",
        occurredAt: "2026-10-02T09:00:00.000Z",
        responsibleParty: "Green Hemp Europe",
        location: "Dieppe, France",
        sourceReference: "traceable_lot:lot-1",
        verificationStatus: "RECORDED",
      },
      {
        eventType: "QUALITY_RESULT_APPROVED",
        occurredAt: "2026-10-02T10:00:00.000Z",
        responsibleParty: "Quality Inspector",
        location: "Dieppe, France",
        sourceReference: "inspection:insp-1",
        verificationStatus: "VERIFIED",
      },
    ],
    qrTargetUrl: "https://217-182-252-225.sslip.io/dpp/dpp-1/passport",
  };

  it("should escape special PDF characters safely", () => {
    const raw = "Special (parentheses) and \\backslashes\\ and 'quotes'";
    const escaped = escapePdfText(raw);
    expect(escaped).toContain("\\(");
    expect(escaped).toContain("\\)");
    expect(escaped).toContain("\\\\");
  });

  it("should wrap long lines without silent truncation", () => {
    const long = "A".repeat(120);
    const wrapped = wrapLine(long, 75);
    expect(wrapped.length).toBe(2);
    expect(wrapped[0].length).toBe(75);
    expect(wrapped[1].length).toBe(45);
  });

  it("should display 'Not recorded' for null or empty values", () => {
    const formattedNull = formatField("Batch", null);
    expect(formattedNull[0]).toContain("Not recorded");

    const formattedEmpty = formatField("Region", "");
    expect(formattedEmpty[0]).toContain("Not recorded");
  });

  it("should generate a valid PDF buffer with PDF-1.4 header and %%EOF trailer", () => {
    const buffer = generateDppPdf(sampleData);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(500);

    const pdfString = buffer.toString("latin1");
    expect(pdfString.startsWith("%PDF-1.4")).toBe(true);
    expect(pdfString).toContain("xref");
    expect(pdfString).toContain("trailer");
    expect(pdfString).toContain("startxref");
    expect(pdfString.trim().endsWith("%%EOF")).toBe(true);
  });

  it("should contain DPP identifier and product details in PDF content", () => {
    const buffer = generateDppPdf(sampleData);
    const pdfString = buffer.toString("latin1");

    expect(pdfString).toContain("DPP-20261002-TEST1234");
    expect(pdfString).toContain("LOT-20261002-ABCD1234");
    expect(pdfString).toContain("Green Hemp Europe");
    expect(pdfString).toContain("BioTextiles BV");
    expect(pdfString).toContain("EcoFreight Logistics");
    expect(pdfString).toContain("QIC-20261002-CERT9999");
    expect(pdfString).toContain("LOT_CREATED");
    expect(pdfString).toContain("QUALITY_RESULT_APPROVED");
  });

  it("should render historical version label when isHistorical is true", () => {
    const historicalData: DppPdfData = {
      ...sampleData,
      versionNumber: 1,
      isHistorical: true,
      totalVersions: 2,
    };
    const buffer = generateDppPdf(historicalData);
    const pdfString = buffer.toString("latin1");

    expect(pdfString).toContain("HISTORICAL SNAPSHOT");
  });

  it("should never expose internal trader margins or bank details in PDF output", () => {
    const buffer = generateDppPdf(sampleData);
    const pdfString = buffer.toString("latin1");

    expect(pdfString).not.toContain("idoGrowMarginCommission");
    expect(pdfString).not.toContain("IBAN");
    expect(pdfString).not.toContain("bankAccount");
    expect(pdfString).not.toContain("swiftBic");
    expect(pdfString).not.toContain("settlementInstructions");
  });
});
