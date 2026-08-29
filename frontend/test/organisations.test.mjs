import assert from "node:assert/strict";
import test from "node:test";

test("organisations client contracts support supplier profile and production sites", async () => {
  const profile = {
    id: "org-1",
    name: "Green Fields Hemp Cooperative",
    legalName: "Green Fields Hemp Coop B.V.",
    organisationType: "SUPPLIER",
    businessType: "cooperative",
    registrationNumber: "KVK-12345678",
    vatNumber: "NL12345678B01",
    address: "Hemp Road 42",
    city: "Groningen",
    postalCode: "9700AB",
    country: "Netherlands",
    contactName: "Jan de Vries",
    contactEmail: "jan@greenfields.nl",
    contactPhone: "+31612345678",
    verificationStatus: "PENDING",
    completenessPercent: 91,
    missingFields: ["productionSites"],
    createdAt: "2026-08-29T12:00:00.000Z",
    updatedAt: "2026-08-29T12:00:00.000Z",
    sites: [
      {
        id: "site-1",
        organisationId: "org-1",
        name: "North Parcel Farm",
        facilityType: "farm",
        address: "Parcel 4",
        city: "Groningen",
        postalCode: "9700AB",
        country: "Netherlands",
        latitude: 53.2194,
        longitude: 6.5665,
        landAreaHectares: 120.5,
        createdAt: "2026-08-29T12:00:00.000Z",
        updatedAt: "2026-08-29T12:00:00.000Z",
      },
    ],
    complianceDocuments: [
      {
        id: "doc-1",
        organisationId: "org-1",
        documentType: "COMPANY_REGISTRATION",
        originalFilename: "kvk_extract_2026.pdf",
        mimeType: "application/pdf",
        fileSize: 10240,
        status: "PENDING_REVIEW",
        createdAt: "2026-08-29T12:00:00.000Z",
        updatedAt: "2026-08-29T12:00:00.000Z",
      },
    ],
  };

  assert.equal(profile.organisationType, "SUPPLIER");
  assert.equal(profile.businessType, "cooperative");
  assert.equal(profile.sites.length, 1);
  assert.equal(profile.sites[0].facilityType, "farm");
  assert.equal(profile.sites[0].landAreaHectares, 120.5);
  assert.equal(profile.complianceDocuments.length, 1);
  assert.equal(profile.complianceDocuments[0].documentType, "COMPANY_REGISTRATION");
  assert.equal(profile.complianceDocuments[0].status, "PENDING_REVIEW");
  assert.equal(profile.completenessPercent, 91);
});

test("organisations client contracts support organisation member collections", async () => {
  const memberCollection = {
    items: [
      {
        id: "mem-1",
        userId: "user-1",
        organisationId: "org-1",
        userEmail: "supplier-owner@example.test",
        createdAt: "2026-08-29T12:00:00.000Z",
        updatedAt: "2026-08-29T12:00:00.000Z",
      },
      {
        id: "mem-2",
        userId: "user-2",
        organisationId: "org-1",
        userEmail: "supplier-colleague@example.test",
        createdAt: "2026-08-29T13:00:00.000Z",
        updatedAt: "2026-08-29T13:00:00.000Z",
      },
    ],
  };

  assert.equal(memberCollection.items.length, 2);
  assert.equal(memberCollection.items[0].userEmail, "supplier-owner@example.test");
  assert.equal(memberCollection.items[1].userEmail, "supplier-colleague@example.test");
});
