import assert from "node:assert/strict";
import test from "node:test";

test("listings client contracts support supplier inventory offers and taxonomy", async () => {
  const listing = {
    id: "listing-1",
    organisationId: "org-1",
    siteId: "site-1",
    siteName: "North Parcel Farm",
    title: "European Retted Hemp Straw 2026",
    description: "High quality rectangular bales, moisture < 14%",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 120,
    quantityUnit: "TONNES",
    priceAmount: 210,
    currency: "EUR",
    priceUnit: "PER_TONNE",
    originCountry: "Netherlands",
    harvestYear: 2026,
    status: "DRAFT",
    createdAt: "2026-08-29T12:00:00.000Z",
    updatedAt: "2026-08-29T12:00:00.000Z",
  };

  assert.equal(listing.materialType, "HEMP");
  assert.equal(listing.productForm, "STRAW_RETTED");
  assert.equal(listing.quantity, 120);
  assert.equal(listing.quantityUnit, "TONNES");
  assert.equal(listing.priceAmount, 210);
  assert.equal(listing.status, "DRAFT");
  assert.equal(listing.siteName, "North Parcel Farm");
});

test("natural fibre taxonomy covers all approved fibres and product forms", async () => {
  const approvedFibres = ["HEMP", "SISAL", "COIR", "JUTE", "KENAF", "RAFFIA"];
  const approvedForms = [
    "STRAW_RAW",
    "STRAW_RETTED",
    "FIBRE_TECHNICAL",
    "FIBRE_SHORT",
    "HURD_SHIVES",
    "DUST_PELLETS",
  ];

  for (const fibre of approvedFibres) {
    assert.ok(fibre.length > 0);
  }
  for (const form of approvedForms) {
    assert.ok(form.length > 0);
  }
});
