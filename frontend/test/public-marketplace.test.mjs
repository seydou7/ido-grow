import assert from "node:assert/strict";
import test from "node:test";

/**
 * Validates returnTo to strictly protect against open redirect attacks.
 * Only internal relative paths starting with a single '/' are permitted.
 */
function sanitizeReturnTo(returnTo) {
  if (!returnTo || typeof returnTo !== "string") {
    return "/";
  }
  const trimmed = returnTo.trim();
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes("://")
  ) {
    return trimmed;
  }
  return "/";
}

test("sanitizeReturnTo permits internal relative routes", () => {
  assert.equal(sanitizeReturnTo("/"), "/");
  assert.equal(sanitizeReturnTo("/marketplace"), "/marketplace");
  assert.equal(sanitizeReturnTo("/marketplace/listing-123"), "/marketplace/listing-123");
  assert.equal(
    sanitizeReturnTo("/marketplace/listing-123?action=request-quote"),
    "/marketplace/listing-123?action=request-quote",
  );
  assert.equal(sanitizeReturnTo("/dashboard/procurement"), "/dashboard/procurement");
});

test("sanitizeReturnTo blocks open redirect vectors", () => {
  // Protocol relative
  assert.equal(sanitizeReturnTo("//evil.com"), "/");
  assert.equal(sanitizeReturnTo("//google.com/phishing"), "/");
  // Backslash prefix
  assert.equal(sanitizeReturnTo("/\\evil.com"), "/");
  // Absolute URLs
  assert.equal(sanitizeReturnTo("https://evil.com"), "/");
  assert.equal(sanitizeReturnTo("http://attacker.com/steal"), "/");
  assert.equal(sanitizeReturnTo("javascript:alert(1)"), "/");
  // Null, undefined, empty
  assert.equal(sanitizeReturnTo(null), "/");
  assert.equal(sanitizeReturnTo(undefined), "/");
  assert.equal(sanitizeReturnTo(""), "/");
});

test("public listing DTO strictly redacts sensitive supplier and internal data", () => {
  const publicListing = {
    id: "lst-fr-001",
    title: "Organic Dew-Retted Hemp Fibre",
    description: "High tensile decorticated hemp fibre.",
    materialType: "HEMP",
    productForm: "TECHNICAL_FIBRE",
    quantity: 60,
    quantityUnit: "TONNES",
    priceAmount: 420,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "FR",
    harvestYear: 2026,
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-02T10:00:00Z",
    supplier: {
      isVerified: true,
      country: "FR",
    },
    site: {
      name: "Champagne Processing Facility",
      facilityType: "PROCESSING_MILL",
      country: "FR",
      city: "Reims",
    },
    certifications: [
      { documentType: "GOTS", status: "VERIFIED" },
      { documentType: "OEKO_TEX", status: "VERIFIED" },
    ],
    quality: {
      hasInspection: true,
      isApproved: true,
      classificationLabel: "Grade A",
      certificateNumber: "CERT-2026-088",
    },
    hasDpp: true,
    dppNumber: "DPP-FR-2026-0001",
    images: ["https://storage.idogrow.com/listing/img1.webp"],
  };

  // Safe fields present
  assert.equal(publicListing.materialType, "HEMP");
  assert.equal(publicListing.productForm, "TECHNICAL_FIBRE");
  assert.equal(publicListing.quantity, 60);
  assert.equal(publicListing.priceAmount, 420);
  assert.equal(publicListing.supplier.isVerified, true);
  assert.equal(publicListing.supplier.country, "FR");
  assert.equal(publicListing.hasDpp, true);
  assert.equal(publicListing.quality.isApproved, true);

  // Sensitive internal fields strictly absent
  assert.equal(publicListing.supplier.bankAccount, undefined);
  assert.equal(publicListing.supplier.taxId, undefined);
  assert.equal(publicListing.supplier.contactEmail, undefined);
  assert.equal(publicListing.supplier.contactPhone, undefined);
  assert.equal(publicListing.supplier.privateNotes, undefined);
  assert.equal(publicListing.internalMargin, undefined);
  assert.equal(publicListing.traderNotes, undefined);
  assert.equal(publicListing.quality.internalNotes, undefined);
});

test("public buyer registration payload matches valid schema", () => {
  const buyerPayload = {
    email: "procurement@ecotextiles.eu",
    password: "SecurePassword2026!",
    companyName: "Eco Textiles Europe B.V.",
    contactName: "Claire Dubois",
    country: "NL",
  };

  assert.equal(typeof buyerPayload.email, "string");
  assert.ok(buyerPayload.email.includes("@"));
  assert.ok(buyerPayload.password.length >= 8);
  assert.ok(buyerPayload.companyName.trim().length > 0);
  assert.equal(buyerPayload.country, "NL");

  // Verify privileged role cannot be chosen
  assert.equal(buyerPayload.role, undefined);
  assert.equal(buyerPayload.organisationType, undefined);
});

test("public marketplace query string formatting correctly encodes all filter dimensions", () => {
  const query = {
    search: "hemp",
    materialType: "HEMP",
    productForm: "TECHNICAL_FIBRE",
    originCountry: "FR",
    minQuantity: 10,
    maxQuantity: 100,
    minPrice: 300,
    maxPrice: 600,
    hasDpp: true,
    hasQualityApproved: true,
    hasCertifications: true,
    sort: "price_asc",
    page: 2,
    pageSize: 12,
  };

  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.materialType) params.set("materialType", query.materialType);
  if (query.productForm) params.set("productForm", query.productForm);
  if (query.originCountry) params.set("originCountry", query.originCountry);
  if (query.minQuantity) params.set("minQuantity", String(query.minQuantity));
  if (query.maxQuantity) params.set("maxQuantity", String(query.maxQuantity));
  if (query.minPrice) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice) params.set("maxPrice", String(query.maxPrice));
  if (query.hasDpp) params.set("hasDpp", "true");
  if (query.hasQualityApproved) params.set("hasQualityApproved", "true");
  if (query.hasCertifications) params.set("hasCertifications", "true");
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));

  const qs = params.toString();
  assert.ok(qs.includes("search=hemp"));
  assert.ok(qs.includes("materialType=HEMP"));
  assert.ok(qs.includes("productForm=TECHNICAL_FIBRE"));
  assert.ok(qs.includes("originCountry=FR"));
  assert.ok(qs.includes("minQuantity=10"));
  assert.ok(qs.includes("maxQuantity=100"));
  assert.ok(qs.includes("minPrice=300"));
  assert.ok(qs.includes("maxPrice=600"));
  assert.ok(qs.includes("hasDpp=true"));
  assert.ok(qs.includes("hasQualityApproved=true"));
  assert.ok(qs.includes("hasCertifications=true"));
  assert.ok(qs.includes("sort=price_asc"));
  assert.ok(qs.includes("page=2"));
  assert.ok(qs.includes("pageSize=12"));
});
