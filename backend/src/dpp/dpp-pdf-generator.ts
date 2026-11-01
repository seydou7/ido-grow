/**
 * Server-side Digital Product Passport (DPP) PDF Generator.
 * Generates a valid standard PDF document (PDF-1.4) with dynamically calculated
 * byte offsets for the xref table and startxref pointer.
 * Supports multi-page pagination and deterministic line wrapping without data loss.
 * Renders from an immutable DPPVersion snapshot and event timeline.
 */

import type { DPPSnapshot } from "./dpp.contracts";

export interface DppPdfEvent {
  eventType: string;
  occurredAt: string;
  responsibleParty?: string | null;
  location?: string | null;
  sourceReference: string;
  verificationStatus: string;
}

export interface DppPdfData {
  passportNumber: string;
  lotNumber: string;
  versionNumber: number;
  isHistorical: boolean;
  totalVersions: number;
  status: string;
  createdAt: string;
  versionCreatedAt: string;
  renderedAt: string;
  snapshot: DPPSnapshot;
  events: DppPdfEvent[];
  qrTargetUrl: string;
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

export function formatField(label: string, value: unknown, indent = 28): string[] {
  const raw = value !== null && value !== undefined && String(value).trim() !== ""
    ? String(value)
    : "Not recorded";

  const prefix = `${label}:`.padEnd(indent);
  const maxWidth = 75;
  const continuationIndent = " ".repeat(indent);
  const availableFirstLineWidth = maxWidth - indent;

  const paragraphs = raw.split("\n");
  const lines: string[] = [];

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    if (pIdx === 0) {
      if (para.length <= availableFirstLineWidth) {
        lines.push(`${prefix}${para}`);
      } else {
        const wrapped = wrapLine(para, maxWidth - indent);
        lines.push(`${prefix}${wrapped[0]}`);
        for (let i = 1; i < wrapped.length; i++) {
          lines.push(`${continuationIndent}${wrapped[i]}`);
        }
      }
    } else {
      const wrapped = wrapLine(para, maxWidth - indent);
      for (const w of wrapped) {
        lines.push(`${continuationIndent}${w}`);
      }
    }
  }

  return lines;
}

export function generateDppPdf(data: DppPdfData): Buffer {
  const lines: string[] = [];
  const s = data.snapshot;

  // Header Banner
  lines.push("===========================================================================");
  lines.push("                  I DO GROW - DIGITAL PRODUCT PASSPORT                     ");
  lines.push("                 Authoritative Natural-Fibre Traceability                  ");
  lines.push("===========================================================================");
  lines.push("");

  // Document Info
  lines.push(...formatField("Passport Number", data.passportNumber));
  lines.push(...formatField("Traceable Lot Number", data.lotNumber));
  lines.push(...formatField("Passport Version", `v${data.versionNumber} ${data.isHistorical ? "(HISTORICAL SNAPSHOT)" : "(CURRENT VERSION)"}`));
  lines.push(...formatField("Passport Status", data.status));
  lines.push(...formatField("Version Created At", data.versionCreatedAt));
  lines.push(...formatField("Generated At", data.renderedAt));
  lines.push(...formatField("Protected Route", data.qrTargetUrl));
  lines.push(...formatField("Access Requirement", "Authorised Counterparty Authentication Required"));
  lines.push("");

  // Section 1: Product Identity
  lines.push("---------------------------------------------------------------------------");
  lines.push("1. PRODUCT IDENTITY");
  lines.push("---------------------------------------------------------------------------");
  lines.push(...formatField("Material Type", s.identity?.materialType));
  lines.push(...formatField("Product Form", s.identity?.productForm));
  lines.push(...formatField("Batch Reference", s.identity?.batchReference));
  lines.push(...formatField("Quantity", `${s.identity?.quantity ?? "Not recorded"} ${s.identity?.quantityUnit ?? ""}`.trim()));
  lines.push("");

  // Section 2: Origin & Production
  lines.push("---------------------------------------------------------------------------");
  lines.push("2. ORIGIN & PRODUCTION");
  lines.push("---------------------------------------------------------------------------");
  lines.push(...formatField("Supplier / Producer", s.origin?.supplierName));
  lines.push(...formatField("Country of Origin", s.origin?.countryOfOrigin || s.origin?.supplierCountry));
  lines.push(...formatField("Region of Origin", s.origin?.regionOfOrigin));
  lines.push(...formatField("Production Site", s.origin?.productionSiteName));
  lines.push(...formatField("Site Address", s.origin?.productionSiteAddress));
  lines.push(...formatField("Production Date", s.origin?.productionDate));
  lines.push("");

  // Section 3: Quality & Inspection
  lines.push("---------------------------------------------------------------------------");
  lines.push("3. QUALITY & INSPECTION RESULTS");
  lines.push("---------------------------------------------------------------------------");
  if (!s.quality?.inspections || s.quality.inspections.length === 0) {
    lines.push("  No inspection records attached.");
  } else {
    for (let i = 0; i < s.quality.inspections.length; i++) {
      const insp = s.quality.inspections[i];
      lines.push(`  [Inspection ${i + 1}]`);
      lines.push(...formatField("  Reference", insp.inspectionReference, 30));
      lines.push(...formatField("  Inspection Status", insp.status, 30));
      lines.push(...formatField("  Human Decision", insp.decision, 30));
      lines.push(...formatField("  Classification", insp.humanClassificationLabel, 30));
      lines.push(...formatField("  Certificate Ref", insp.certificateReference, 30));
      lines.push(...formatField("  Completed At", insp.completedAt, 30));
      if (insp.summary) {
        lines.push(...formatField("  Summary", insp.summary, 30));
      }
      lines.push("");
    }
  }

  // Section 4: Certifications & Compliance
  lines.push("---------------------------------------------------------------------------");
  lines.push("4. CERTIFICATIONS & COMPLIANCE");
  lines.push("---------------------------------------------------------------------------");
  if (!s.certifications || s.certifications.length === 0) {
    lines.push("  No compliance certificates recorded.");
  } else {
    for (const cert of s.certifications) {
      lines.push(`  * ${cert.documentType}: ${cert.originalFilename} [Status: ${cert.status}]`);
    }
  }
  lines.push("");

  // Section 5: Commercial Transaction Milestone
  lines.push("---------------------------------------------------------------------------");
  lines.push("5. COMMERCIAL TRANSACTION");
  lines.push("---------------------------------------------------------------------------");
  if (!s.transaction || s.transaction.length === 0) {
    lines.push("  No commercial transaction linked yet.");
  } else {
    for (const tr of s.transaction) {
      lines.push(...formatField("Trade Reference", tr.tradeNumber));
      lines.push(...formatField("Buyer Organisation", tr.buyerOrganisationName));
      lines.push(...formatField("Accepted At", tr.acceptedAt));
      lines.push(...formatField("Contracted Volume", `${tr.quantity} ${tr.quantityUnit}`));
      lines.push("");
    }
  }

  // Section 6: Logistics & Chain of Custody
  lines.push("---------------------------------------------------------------------------");
  lines.push("6. LOGISTICS & SHIPMENT");
  lines.push("---------------------------------------------------------------------------");
  if (!s.logistics || s.logistics.length === 0) {
    lines.push("  No shipment execution linked yet.");
  } else {
    for (const sh of s.logistics) {
      lines.push(...formatField("Shipment Reference", sh.shipmentNumber));
      lines.push(...formatField("Origin Location", sh.origin));
      lines.push(...formatField("Destination Location", sh.destination));
      lines.push(...formatField("Selected Carrier", sh.carrierName));
      lines.push(...formatField("Execution Status", sh.status));
      lines.push(...formatField("Pickup Timestamp", sh.actualPickupAt));
      lines.push(...formatField("Delivered Timestamp", sh.deliveredAt));
      lines.push("");
    }
  }

  // Section 7: Provenance Event Timeline
  lines.push("---------------------------------------------------------------------------");
  lines.push("7. PROVENANCE EVENT TIMELINE (IMMUTABLE AUDIT TRAIL)");
  lines.push("---------------------------------------------------------------------------");
  if (!data.events || data.events.length === 0) {
    lines.push("  No provenance events recorded for this passport.");
  } else {
    for (let i = 0; i < data.events.length; i++) {
      const evt = data.events[i];
      lines.push(`  [Event ${i + 1}] ${evt.eventType} - ${evt.occurredAt}`);
      lines.push(...formatField("    Verification", evt.verificationStatus, 30));
      lines.push(...formatField("    Source Reference", evt.sourceReference, 30));
      if (evt.responsibleParty) {
        lines.push(...formatField("    Responsible Party", evt.responsibleParty, 30));
      }
      if (evt.location) {
        lines.push(...formatField("    Location", evt.location, 30));
      }
      lines.push("");
    }
  }

  // Footer
  lines.push("===========================================================================");
  lines.push("  Official Immutable Provenance Document - I Do Grow Natural Fibre B2B    ");
  lines.push("  Verification: Scan QR / visit protected portal with authenticated login  ");
  lines.push("===========================================================================");

  // Split lines into pages (50 lines per page fits comfortably within 780 pt down to ~140 pt)
  const LINES_PER_PAGE = 48;
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
  const offsets: number[] = [0];

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

    let streamContent = "BT\n/F1 9 Tf\n40 790 Td\n13 TL\n";
    for (const line of pageLines) {
      const escaped = escapePdfText(line);
      streamContent += `(${escaped}) '\n`;
    }
    // Add page number at bottom
    streamContent += `(Page ${k + 1} of ${numPages}) '\n`;
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
