/**
 * Server-side Contract Document PDF Generator.
 * Generates a valid standard PDF document (PDF-1.4) with dynamically calculated
 * byte offsets for the xref table and startxref pointer.
 * Supports multi-page pagination and deterministic line wrapping without data loss.
 */

export interface ContractPdfSnapshot {
  contractNumber: string;
  tradeNumber: string;
  quoteNumber: string;
  quoteVersionNumber: number;
  buyerName: string;
  buyerAddress?: string | null;
  buyerCity?: string | null;
  buyerCountry?: string | null;
  supplierName: string;
  supplierAddress?: string | null;
  supplierCity?: string | null;
  supplierCountry?: string | null;
  idoGrowEntity: string;
  materialType: string;
  productForm?: string | null;
  quantity: number;
  quantityUnit: string;
  acceptedTolerance: string;
  priceAmount: number;
  currency: string;
  incoterm: string;
  qualityConditions: string;
  inspectionMethod: string;
  pickupDate: string;
  deliveryDate: string;
  paymentTerms: string;
  claimsProcess: string;
  requiredDocuments: string;
  cancellationConditions: string;
  governingLaw: string;
  buyerSignatureStatus: string;
  supplierSignatureStatus: string;
  generatedAt: string;
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

export function generateContractPdfBuffer(snapshot: ContractPdfSnapshot): Buffer {
  const lines: string[] = [
    "============================================================",
    "              I DO GROW - COMMERCIAL CONTRACT",
    "============================================================",
    "",
  ];

  lines.push(...formatField("Contract Reference", snapshot.contractNumber));
  lines.push(...formatField("Trade Reference", snapshot.tradeNumber));
  lines.push(
    ...formatField(
      "Accepted Quotation",
      `${snapshot.quoteNumber} (v${snapshot.quoteVersionNumber})`,
    ),
  );
  lines.push(...formatField("Generated Timestamp", snapshot.generatedAt));
  lines.push("");

  lines.push("------------------------------------------------------------");
  lines.push("                   CONTRACTING PARTIES");
  lines.push("------------------------------------------------------------");
  lines.push(...formatField("Platform Intermediary", snapshot.idoGrowEntity));
  lines.push(...formatField("Buyer", snapshot.buyerName));
  if (snapshot.buyerAddress || snapshot.buyerCity || snapshot.buyerCountry) {
    const buyerLoc = [snapshot.buyerAddress, snapshot.buyerCity, snapshot.buyerCountry]
      .filter(Boolean)
      .join(", ");
    lines.push(...formatField("Buyer Location", buyerLoc));
  }
  lines.push(...formatField("Supplier", snapshot.supplierName));
  if (snapshot.supplierAddress || snapshot.supplierCity || snapshot.supplierCountry) {
    const supplierLoc = [snapshot.supplierAddress, snapshot.supplierCity, snapshot.supplierCountry]
      .filter(Boolean)
      .join(", ");
    lines.push(...formatField("Supplier Location", supplierLoc));
  }
  lines.push("");

  lines.push("------------------------------------------------------------");
  lines.push("               PRODUCT & COMMERCIAL SPECIFICATION");
  lines.push("------------------------------------------------------------");
  lines.push(...formatField("Material Type", snapshot.materialType));
  lines.push(...formatField("Product Form", snapshot.productForm || "N/A"));
  lines.push(...formatField("Contracted Quantity", `${snapshot.quantity} ${snapshot.quantityUnit}`));
  lines.push(...formatField("Accepted Tolerance", snapshot.acceptedTolerance));
  lines.push(
    ...formatField(
      "Commercial Price",
      `${snapshot.priceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${snapshot.currency}`,
    ),
  );
  lines.push(...formatField("Incoterm", snapshot.incoterm));
  lines.push("");

  lines.push("------------------------------------------------------------");
  lines.push("                 QUALITY & INSPECTION");
  lines.push("------------------------------------------------------------");
  lines.push(...formatField("Quality Conditions", snapshot.qualityConditions));
  lines.push(...formatField("Inspection Method", snapshot.inspectionMethod));
  lines.push("");

  lines.push("------------------------------------------------------------");
  lines.push("                   DATES & SCHEDULE");
  lines.push("------------------------------------------------------------");
  lines.push(...formatField("Agreed Pickup Date", snapshot.pickupDate));
  lines.push(...formatField("Agreed Delivery Date", snapshot.deliveryDate));
  lines.push("");

  lines.push("------------------------------------------------------------");
  lines.push("               TERMS, DOCUMENTS & GOVERNING LAW");
  lines.push("------------------------------------------------------------");
  lines.push(...formatField("Payment Terms", snapshot.paymentTerms));
  lines.push(...formatField("Claims Process", snapshot.claimsProcess));
  lines.push(...formatField("Required Documents", snapshot.requiredDocuments));
  lines.push(...formatField("Cancellation Conditions", snapshot.cancellationConditions));
  lines.push(...formatField("Governing Law", snapshot.governingLaw));
  lines.push("");

  lines.push("------------------------------------------------------------");
  lines.push("                   SIGNATURE SECTION");
  lines.push("------------------------------------------------------------");
  lines.push(...formatField("Buyer Signature", `[${snapshot.buyerSignatureStatus}] - ${snapshot.buyerName}`));
  lines.push(...formatField("Supplier Signature", `[${snapshot.supplierSignatureStatus}] - ${snapshot.supplierName}`));
  lines.push(...formatField("I Do Grow Endorsement", `[CONFIRMED] - ${snapshot.idoGrowEntity}`));
  lines.push("");
  lines.push("============================================================");
  lines.push("  Official Immutable Record - Confirmed on I Do Grow Platform");
  lines.push("============================================================");

  // Paginate lines: 50 lines per page fits within 780 pt down to 140 pt with 13 pt leading
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

  // Build PDF structure with exact byte tracking
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

  // Pages and Content
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
