/**
 * Server-side Inspection Certificate PDF Generator.
 * Generates a valid standard PDF document (PDF-1.4) with dynamically calculated
 * byte offsets for the xref table and startxref pointer.
 * Supports multi-page pagination and deterministic line wrapping without data loss.
 */

export interface CertificateSnapshot {
  certificateNumber: string;
  inspectionReference: string;
  tradeNumber?: string | null;
  supplierName?: string | null;
  buyerName?: string | null;
  materialType: string;
  productForm?: string | null;
  quantity: number;
  quantityUnit: string;
  inspectionMethod: string;
  inspectorEmail?: string | null;
  completedAt?: string | null;
  templateName: string;
  templateVersion: number;
  measurements: Record<string, unknown>;
  evidenceCount: number;
  preliminaryAssessmentSummary?: string | null;
  observedIssues?: string | null;
  recommendedFollowUp?: string | null;
  classificationLabel: string;
  decision: "APPROVED" | "REJECTED";
  decisionNotes?: string | null;
  issuedAt: string;
}

export function escapePdfText(text: string): string {
  const sanitized = text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, "\"")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

  return Array.from(sanitized)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return (code >= 0 && code < 32) || code === 127 ? " " : ch;
    })
    .join("");
}

/**
 * Wraps arbitrary text to a maximum line length without dropping any characters.
 */
export function wrapLine(text: string, maxWidth = 75): string[] {
  if (text.length <= maxWidth) {
    return [text];
  }
  const words = text.split(" ");
  const result: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      if (word.length > maxWidth) {
        let rem = word;
        while (rem.length > maxWidth) {
          result.push(rem.slice(0, maxWidth));
          rem = rem.slice(maxWidth);
        }
        current = rem;
      } else {
        current = word;
      }
    } else {
      if ((current + " " + word).length <= maxWidth) {
        current += " " + word;
      } else {
        result.push(current);
        if (word.length > maxWidth) {
          let rem = word;
          while (rem.length > maxWidth) {
            result.push(rem.slice(0, maxWidth));
            rem = rem.slice(maxWidth);
          }
          current = rem;
        } else {
          current = word;
        }
      }
    }
  }
  if (current.length > 0) {
    result.push(current);
  }
  return result;
}

/**
 * Formats a labeled field, handling paragraphs and wrapping continuation lines
 * with consistent alignment indent without silent truncation.
 */
export function formatField(label: string, value: unknown, maxWidth = 75): string[] {
  const val = value != null && value !== "" ? String(value) : "N/A";
  const prefix = `${label}: `;
  const indent = " ".repeat(Math.min(prefix.length, 24));
  const rawParagraphs = val.split(/\r?\n/);
  const result: string[] = [];

  for (let i = 0; i < rawParagraphs.length; i++) {
    const raw = rawParagraphs[i].trim();
    if (!raw) {
      if (i > 0) result.push("");
      continue;
    }
    const currentPrefix = i === 0 ? prefix : indent;
    const words = raw.split(/\s+/);
    let cur = currentPrefix;

    for (const w of words) {
      const candidate = cur === currentPrefix ? `${cur}${w}` : `${cur} ${w}`;
      if (candidate.length <= maxWidth) {
        cur = candidate;
      } else {
        result.push(cur);
        const subLimit = maxWidth - indent.length;
        if (w.length > subLimit) {
          let rem = w;
          while (rem.length > subLimit) {
            result.push(`${indent}${rem.slice(0, subLimit)}`);
            rem = rem.slice(subLimit);
          }
          cur = `${indent}${rem}`;
        } else {
          cur = `${indent}${w}`;
        }
      }
    }
    if (cur.trim().length > 0) {
      result.push(cur);
    }
  }
  return result;
}

export function generateCertificatePdfBuffer(snapshot: CertificateSnapshot): Buffer {
  const lines: string[] = [
    "============================================================",
    "              I DO GROW - CERTIFICATE OF QUALITY INSPECTION",
    "============================================================",
    "",
  ];

  lines.push(...formatField("Certificate Number", snapshot.certificateNumber));
  lines.push(...formatField("Issued Date", snapshot.issuedAt));
  lines.push(...formatField("Inspection Reference", snapshot.inspectionReference));
  lines.push(...formatField("Trade Number", snapshot.tradeNumber || "N/A"));
  lines.push(...formatField("Supplier", snapshot.supplierName || "Confidential / Platform Intermediated"));
  lines.push(...formatField("Buyer", snapshot.buyerName || "Confidential / Platform Intermediated"));
  lines.push(...formatField("Material", snapshot.materialType));
  lines.push(...formatField("Product Form", snapshot.productForm || "N/A"));
  lines.push(...formatField("Quantity", `${snapshot.quantity} ${snapshot.quantityUnit}`));
  lines.push(...formatField("Inspection Method", snapshot.inspectionMethod));
  lines.push(...formatField("Quality Inspector", snapshot.inspectorEmail || "Verified Quality Inspector"));
  lines.push(...formatField("Template Applied", `${snapshot.templateName} (v${snapshot.templateVersion})`));
  lines.push(...formatField("Inspection Completed", snapshot.completedAt || "N/A"));
  lines.push(...formatField("Attached Evidence", `${snapshot.evidenceCount} verified file(s)`));

  lines.push("");
  lines.push("------------------------------------------------------------");
  lines.push("                   TECHNICAL MEASUREMENTS");
  lines.push("------------------------------------------------------------");

  const measurementKeys = Object.keys(snapshot.measurements || {});
  if (measurementKeys.length === 0) {
    lines.push("  (No measurements recorded)");
  } else {
    for (const key of measurementKeys) {
      const val = snapshot.measurements[key];
      const displayVal = typeof val === "boolean" ? (val ? "Yes" : "No") : String(val);
      lines.push(...formatField(`  * ${key}`, displayVal));
    }
  }

  lines.push("");
  lines.push("------------------------------------------------------------");
  lines.push("                   PRELIMINARY HUMAN ASSESSMENT");
  lines.push("------------------------------------------------------------");
  lines.push(...formatField("Summary", snapshot.preliminaryAssessmentSummary || "Assessment recorded"));
  if (snapshot.observedIssues) {
    lines.push(...formatField("Issues", snapshot.observedIssues));
  }
  if (snapshot.recommendedFollowUp) {
    lines.push(...formatField("Follow-up", snapshot.recommendedFollowUp));
  }

  lines.push("");
  lines.push("------------------------------------------------------------");
  lines.push("                   FINAL HUMAN QUALITY DECISION");
  lines.push("------------------------------------------------------------");
  lines.push(...formatField("DECISION", snapshot.decision));
  lines.push(...formatField("CLASSIFICATION", snapshot.classificationLabel));
  if (snapshot.decisionNotes) {
    lines.push(...formatField("Decision Notes", snapshot.decisionNotes));
  }
  lines.push("");
  lines.push("============================================================");
  lines.push("  Official Immutable Record - Authorized by Quality Inspector");
  lines.push("============================================================");

  // Split lines into pages (50 lines per page fits comfortably within 780 pt down to ~140 pt)
  const LINES_PER_PAGE = 50;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + LINES_PER_PAGE));
  }
  if (pages.length === 0) {
    pages.push([""]);
  }

  const numPages = pages.length;
  const pageObjIds: number[] = [];
  const contentObjIds: number[] = [];

  for (let k = 1; k <= numPages; k++) {
    pageObjIds.push(1 + 2 * k);
    contentObjIds.push(2 + 2 * k);
  }
  const fontObjId = 2 * numPages + 3;
  const totalObjs = fontObjId;

  // Dynamic object construction with exact byte tracking
  const header = "%PDF-1.4\n";
  let pdf = header;
  const offsets: number[] = [0]; // obj 0 is dummy

  // obj 1: Catalog
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;

  // obj 2: Pages
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  const kidsStr = pageObjIds.map((id) => `${id} 0 R`).join(" ");
  pdf += `2 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${numPages} >>\nendobj\n`;

  // Page and Content objects
  for (let k = 0; k < numPages; k++) {
    const pageObjId = pageObjIds[k];
    const contentObjId = contentObjIds[k];
    const pageLines = pages[k];

    let streamContent = "BT\n/F1 9 Tf\n45 780 Td\n13 TL\n";
    for (const line of pageLines) {
      const escaped = escapePdfText(line);
      streamContent += `(${escaped}) '\n`;
    }
    streamContent += "ET\n";

    const streamLength = Buffer.byteLength(streamContent, "latin1");

    // Page obj
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${fontObjId} 0 R >> >> >>\nendobj\n`;

    // Content obj
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${contentObjId} 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}endstream\nendobj\n`;
  }

  // Font obj
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${fontObjId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`;

  // xref section
  const startXref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${totalObjs + 1}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 1; i <= totalObjs; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  // trailer
  pdf += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}
