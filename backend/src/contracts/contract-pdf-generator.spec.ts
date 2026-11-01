import {
  escapePdfText,
  formatField,
  generateContractPdfBuffer,
  wrapLine,
  type ContractPdfSnapshot,
} from "./contract-pdf-generator";

describe("contract-pdf-generator", () => {
  const sampleSnapshot: ContractPdfSnapshot = {
    contractNumber: "CTR-20261001-TEST1234",
    tradeNumber: "TRD-20260918-0001",
    quoteNumber: "QUO-20260917-0001",
    quoteVersionNumber: 2,
    buyerName: "EcoBuild Processing BV",
    buyerAddress: "Keizersgracht 101",
    buyerCity: "Amsterdam",
    buyerCountry: "Netherlands",
    supplierName: "Coopérative Chanvre France",
    supplierAddress: "Route de Troyes 45",
    supplierCity: "Troyes",
    supplierCountry: "France",
    idoGrowEntity: "I Do Grow B.V. (Platform Intermediary / Active Commodity Trader)",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 50,
    quantityUnit: "TONNES",
    acceptedTolerance: "+/- 5% weight tolerance at weighbridge",
    priceAmount: 18500,
    currency: "EUR",
    incoterm: "FCA",
    qualityConditions:
      "Moisture max 15%, no visual mould or stone contamination. Verified by accredited inspector.",
    inspectionMethod: "ON_SITE_PORTABLE_MOISTURE_METER",
    pickupDate: "2026-10-15T08:00:00.000Z",
    deliveryDate: "2026-10-20T17:00:00.000Z",
    paymentTerms: "30% advance on signing, 70% within 14 days of delivery inspection",
    claimsProcess:
      "Notice of defect within 5 business days of delivery supported by accredited lab analysis.",
    requiredDocuments:
      "CMR bill of lading, Certificate of Quality Inspection, Commercial Invoice, Packing list",
    cancellationConditions:
      "Cancellation permitted prior to carrier dispatch subject to 10% liquidated damages.",
    governingLaw: "Netherlands law, jurisdiction Amsterdam District Court",
    buyerSignatureStatus: "UNSIGNED",
    supplierSignatureStatus: "UNSIGNED",
    generatedAt: "2026-10-01T14:30:00.000Z",
  };

  it("escapes special PDF characters correctly", () => {
    const raw = "Special (parentheses) and \\backslashes\\ and “curly quotes”";
    const escaped = escapePdfText(raw);
    expect(escaped).not.toContain("“");
    expect(escaped).not.toContain("”");
    expect(escaped).toContain("\\(");
    expect(escaped).toContain("\\)");
    expect(escaped).toContain("\\\\");
  });

  it("wraps long lines without dropping any words or characters", () => {
    const longText =
      "This is a long contractual clause detailing the governing law, dispute resolution, and arbitration mechanisms between Buyer and Supplier under the intermediary administration of I Do Grow B.V.";
    const wrapped = wrapLine(longText, 40);
    expect(wrapped.length).toBeGreaterThan(1);
    const joined = wrapped.join(" ");
    expect(joined).toContain("dispute resolution");
    expect(joined).toContain("I Do Grow B.V.");
  });

  it("formats labeled fields with clean indentation and no silent truncation", () => {
    const lines = formatField(
      "Quality Conditions",
      "Line 1 with technical notes\nLine 2 with extended moisture and contamination details that exceed standard width",
      50,
    );
    expect(lines.length).toBeGreaterThan(2);
    expect(lines[0]).toMatch(/^Quality Conditions: /);
    expect(lines[1]).toMatch(/^ {18}/); // indented
  });

  it("generates a valid standard PDF-1.4 buffer with correct header, objects, xref, and trailer", () => {
    const buffer = generateContractPdfBuffer(sampleSnapshot);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(500);

    const pdfString = buffer.toString("latin1");
    expect(pdfString.startsWith("%PDF-1.4\n")).toBe(true);
    expect(pdfString).toContain("CTR-20261001-TEST1234");
    expect(pdfString).toContain("TRD-20260918-0001");
    expect(pdfString).toContain("EcoBuild Processing BV");
    expect(pdfString).toContain("Coopérative Chanvre France");
    expect(pdfString).toContain("I Do Grow B.V.");
    expect(pdfString).toContain("STRAW_RETTED");
    expect(pdfString).toContain("50 TONNES");
    expect(pdfString).toContain("18,500.00 EUR");
    expect(pdfString).toContain("FCA");
    expect(pdfString).toContain("xref\n");
    expect(pdfString).toContain("trailer\n");
    expect(pdfString).toContain("startxref\n");
    expect(pdfString.trim().endsWith("%%EOF")).toBe(true);
  });

  it("supports multi-page pagination for contracts with voluminous terms", () => {
    const voluminousSnapshot: ContractPdfSnapshot = {
      ...sampleSnapshot,
      qualityConditions: "Quality term detail line.\n".repeat(40),
      claimsProcess: "Extended claim procedure step.\n".repeat(30),
      requiredDocuments: "Document requirement specification.\n".repeat(25),
    };

    const buffer = generateContractPdfBuffer(voluminousSnapshot);
    const pdfString = buffer.toString("latin1");
    // Count page objects: /Type /Page
    const pageMatches = pdfString.match(/\/Type \/Page /g);
    expect(pageMatches).not.toBeNull();
    expect(pageMatches!.length).toBeGreaterThanOrEqual(2);
  });
});
