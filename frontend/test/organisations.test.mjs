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
  };

  assert.equal(profile.organisationType, "SUPPLIER");
  assert.equal(profile.businessType, "cooperative");
  assert.equal(profile.sites.length, 1);
  assert.equal(profile.sites[0].facilityType, "farm");
  assert.equal(profile.sites[0].landAreaHectares, 120.5);
  assert.equal(profile.completenessPercent, 91);
});
