import {
  generateCertificatePdfBuffer,
  CertificateSnapshot,
  wrapLine,
  formatField,
  escapePdfText,
} from "./certificate-generator";
import { HEMP_STRAW_STANDARD_FIELDS } from "./contracts";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

describe("Certificate Generator — Hardening & Multi-Page", () => {
  describe("Deterministic Line Wrapping & Escaping", () => {
    it("escapes special PDF characters safely", () => {
      const raw = "Backslash \\ and (parentheses) and ‘curly’ “quotes” — em-dash";
      const escaped = escapePdfText(raw);
      expect(escaped).toContain("\\\\");
      expect(escaped).toContain("\\(");
      expect(escaped).toContain("\\)");
      expect(escaped).not.toContain("“");
      expect(escaped).not.toContain("—");
    });

    it("wraps lines without dropping any characters or words", () => {
      const input = "Word1 Word2 Word3 Word4 Word5 Word6 Word7 Word8 Word9 Word10";
      const wrapped = wrapLine(input, 25);
      expect(wrapped.length).toBeGreaterThan(1);
      const reconstructed = wrapped.join(" ");
      expect(reconstructed).toBe(input);
    });

    it("handles long unbroken words without data loss", () => {
      const longWord = "A".repeat(100);
      const wrapped = wrapLine(longWord, 40);
      expect(wrapped.length).toBe(3);
      expect(wrapped.join("")).toBe(longWord);
    });

    it("formats labeled fields with aligned continuation indentation", () => {
      const formatted = formatField("Decision Notes", "Line 1 note that extends well past the line margin limit and must be wrapped cleanly without losing any word.");
      expect(formatted.length).toBeGreaterThan(1);
      expect(formatted[0].startsWith("Decision Notes: ")).toBe(true);
      expect(formatted[1].startsWith(" ".repeat(16))).toBe(true);
    });
  });

  describe("Complete Measurement & Field Rendering (No Silent Truncation)", () => {
    it("renders all 14 Hemp standard measurements without slicing", () => {
      const measurements: Record<string, unknown> = {};
      for (const field of HEMP_STRAW_STANDARD_FIELDS) {
        measurements[field.id] = "TEST_VALUE_" + field.id;
      }

      const snapshot: CertificateSnapshot = {
        certificateNumber: "QIC-20260918-A1B2C3D4",
        inspectionReference: "INS-20260918-0001",
        materialType: "HEMP",
        quantity: 100,
        quantityUnit: "TONNES",
        inspectionMethod: "VISUAL_AND_SENSOR",
        templateName: "Hemp Straw Quality Standard",
        templateVersion: 1,
        measurements,
        evidenceCount: 3,
        classificationLabel: "Commercial Classification",
        decision: "APPROVED",
        issuedAt: new Date().toISOString(),
      };

      const buffer = generateCertificatePdfBuffer(snapshot);
      const pdfText = buffer.toString("latin1");

      for (const field of HEMP_STRAW_STANDARD_FIELDS) {
        expect(pdfText).toContain(field.id);
        expect(pdfText).toContain("TEST_VALUE_" + field.id);
      }
    });

    it("creates multi-page PDF when content exceeds single page without truncation", () => {
      const longAssessment = "Very long detailed preliminary assessment note. ".repeat(15);
      const longNotes = "Very long detailed final decision explanation. ".repeat(20) + "EXACT_TAIL_VERIFICATION_TOKEN";

      const snapshot: CertificateSnapshot = {
        certificateNumber: "QIC-20260918-12345678",
        inspectionReference: "INS-20260918-9999",
        materialType: "HEMP",
        quantity: 250,
        quantityUnit: "TONNES",
        inspectionMethod: "PHYSICAL_ON_SITE_SAMPLING",
        templateName: "Hemp Straw Standard",
        templateVersion: 1,
        measurements: {
          m1: "v1", m2: "v2", m3: "v3", m4: "v4", m5: "v5",
          m6: "v6", m7: "v7", m8: "v8", m9: "v9", m10: "v10",
          m11: "v11", m12: "v12", m13: "v13", m14: "v14",
        },
        evidenceCount: 8,
        preliminaryAssessmentSummary: longAssessment,
        observedIssues: "Minor issues observed on perimeter bales.",
        recommendedFollowUp: "Follow-up testing after scutching.",
        classificationLabel: "Inspection Classification",
        decision: "APPROVED",
        decisionNotes: longNotes,
        issuedAt: new Date().toISOString(),
      };

      const buffer = generateCertificatePdfBuffer(snapshot);
      const tempPdfPath = path.join(os.tmpdir(), `test-cert-${Date.now()}.pdf`);
      fs.writeFileSync(tempPdfPath, buffer);

      try {
        const pythonScript = [
          "from pypdf import PdfReader",
          `reader = PdfReader('${tempPdfPath}', strict=True)`,
          "pages = len(reader.pages)",
          "assert pages >= 2, f'Expected at least 2 pages, got {pages}'",
          "full_text = '\\n'.join([p.extract_text() for p in reader.pages])",
          "assert 'QIC-20260918-12345678' in full_text",
          "assert 'INS-20260918-9999' in full_text",
          "assert 'APPROVED' in full_text",
          "assert 'EXACT_TAIL_VERIFICATION_TOKEN' in full_text",
          "print('PYTHON_PYPDF_STRICT_PASSED')",
        ].join("; ");

        const output = execSync(`python3 -c "${pythonScript}"`, { encoding: "utf8" });
        expect(output).toContain("PYTHON_PYPDF_STRICT_PASSED");
      } finally {
        if (fs.existsSync(tempPdfPath)) {
          fs.unlinkSync(tempPdfPath);
        }
      }
    });
  });
});
