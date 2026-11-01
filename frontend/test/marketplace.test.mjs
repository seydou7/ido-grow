import assert from "node:assert/strict";
import test from "node:test";

test("marketplace contracts expose published listings with safe intermediated supplier information", async () => {
  const item = {
    id: "marketplace-listing-1",
    title: "Premium French Retted Hemp Straw",
    description: "Dew-retted industrial hemp straw in large rectangular bales.",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 120,
    quantityUnit: "TONNES",
    priceAmount: 340,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "France",
    harvestYear: 2026,
    createdAt: "2026-08-30T10:00:00.000Z",
    supplier: {
      id: "org-supplier-1",
      name: "Normandy Hemp Farm",
      country: "France",
      verificationStatus: "VERIFIED",
    },
  };

  assert.equal(item.materialType, "HEMP");
  assert.equal(item.productForm, "STRAW_RETTED");
  assert.equal(item.quantity, 120);
  assert.equal(item.priceAmount, 340);
  assert.equal(item.supplier.name, "Normandy Hemp Farm");
  assert.equal(item.supplier.verificationStatus, "VERIFIED");

  // Verify direct supplier contact data is NOT present in the contract
  assert.equal(item.supplier.contactEmail, undefined);
  assert.equal(item.supplier.contactPhone, undefined);
  assert.equal(item.supplier.vatNumber, undefined);
});

test("marketplace contracts support missing prices with null priceAmount", async () => {
  const item = {
    id: "marketplace-listing-2",
    title: "Unpriced Technical Sisal Fibre",
    description: "Sisal fibre technical grade, pricing available on inquiry.",
    materialType: "SISAL",
    productForm: "FIBRE_TECHNICAL",
    quantity: 45,
    quantityUnit: "TONNES",
    priceAmount: null,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "Kenya",
    harvestYear: 2026,
    createdAt: "2026-08-30T10:00:00.000Z",
    supplier: {
      id: "org-supplier-2",
      name: "East Africa Sisal Estate",
      country: "Kenya",
      verificationStatus: "VERIFIED",
    },
  };

  assert.equal(item.priceAmount, null);
  assert.equal(item.materialType, "SISAL");
});

test("marketplace listing detail contract includes optional site production context", async () => {
  const detail = {
    id: "marketplace-listing-3",
    title: "Dutch Hemp Hurd Shives",
    description: "Clean dust-free hemp hurds for construction and bedding.",
    materialType: "HEMP",
    productForm: "HURD_SHIVES",
    quantity: 80,
    quantityUnit: "TONNES",
    priceAmount: 420,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "Netherlands",
    harvestYear: 2026,
    createdAt: "2026-08-30T10:00:00.000Z",
    supplier: {
      id: "org-supplier-3",
      name: "Groningen Fibre Processing",
      country: "Netherlands",
      verificationStatus: "VERIFIED",
    },
    site: {
      name: "Groningen Mill Facility",
      facilityType: "PROCESSING_PLANT",
      country: "Netherlands",
      city: "Groningen",
    },
  };

  assert.equal(detail.site.name, "Groningen Mill Facility");
  assert.equal(detail.site.facilityType, "PROCESSING_PLANT");
  assert.equal(detail.site.city, "Groningen");
});
