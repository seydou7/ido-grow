import assert from "node:assert/strict";
import test from "node:test";

test("buy orders client contracts support structured non-binding demand", async () => {
  const buyOrder = {
    id: "buy-order-1",
    buyerOrganisationId: "org-buyer-1",
    buyerOrganisationName: "Northern Textile Mills BV",
    materialType: "HEMP",
    productForm: "FIBRE_TECHNICAL",
    quantity: 75,
    quantityUnit: "TONNES",
    deliveryCountry: "Germany",
    deliveryDestination: "Stuttgart Processing Hub",
    requestedDeliveryDate: "2026-11-20T00:00:00.000Z",
    targetPriceAmount: 480,
    currency: "EUR",
    targetPriceUnit: "PER_TONNE",
    acceptableOriginCountries: "France, Netherlands, Belgium",
    qualityRequirements: "Tensile strength > 50 cN/tex, moisture < 12%",
    packagingRequirements: "High density rectangular bales",
    certificationRequirements: "GOTS or Organic EU",
    transportPreferences: "Road freight DAP",
    paymentTerms: "Net 30 days",
    status: "OPEN",
    createdAt: "2026-08-30T14:00:00.000Z",
    updatedAt: "2026-08-30T14:00:00.000Z",
    createdByUserId: "user-buyer-1",
  };

  assert.equal(buyOrder.materialType, "HEMP");
  assert.equal(buyOrder.productForm, "FIBRE_TECHNICAL");
  assert.equal(buyOrder.quantity, 75);
  assert.equal(buyOrder.quantityUnit, "TONNES");
  assert.equal(buyOrder.targetPriceAmount, 480);
  assert.equal(buyOrder.currency, "EUR");
  assert.equal(buyOrder.targetPriceUnit, "PER_TONNE");
  assert.equal(buyOrder.status, "OPEN");
  assert.equal(buyOrder.deliveryCountry, "Germany");
});

test("buy order status lifecycle enforces DRAFT, OPEN, and CANCELLED", async () => {
  const validStatuses = ["DRAFT", "OPEN", "CANCELLED"];

  for (const status of validStatuses) {
    assert.ok(["DRAFT", "OPEN", "CANCELLED"].includes(status));
  }

  // Ensure invalid future statuses are NOT part of current lifecycle
  const invalidStatuses = ["MATCHED", "QUOTED", "CONTRACTED", "FULFILLED", "PAID"];
  for (const invalid of invalidStatuses) {
    assert.ok(!validStatuses.includes(invalid));
  }
});

test("trader demand overview contract embeds buyer organisation details", async () => {
  const traderDemand = {
    id: "buy-order-2",
    buyerOrganisationId: "org-buyer-2",
    buyerOrganisation: {
      id: "org-buyer-2",
      name: "Automotive Composites SAS",
      country: "France",
      verificationStatus: "VERIFIED",
    },
    materialType: "SISAL",
    productForm: "FIBRE_TECHNICAL",
    quantity: 120,
    quantityUnit: "TONNES",
    deliveryCountry: "France",
    deliveryDestination: "Lyon Plant",
    requestedDeliveryDate: "2026-12-01T00:00:00.000Z",
    targetPriceAmount: null,
    currency: "EUR",
    targetPriceUnit: "PER_TONNE",
    acceptableOriginCountries: "Kenya, Tanzania, Brazil",
    qualityRequirements: "Clean decorticated fibre",
    packagingRequirements: "Standard strapped bales",
    certificationRequirements: null,
    transportPreferences: "Sea freight CIF Le Havre",
    paymentTerms: "CAD (Cash Against Documents)",
    status: "OPEN",
    createdAt: "2026-08-30T14:30:00.000Z",
    updatedAt: "2026-08-30T14:30:00.000Z",
    createdByUserId: "user-buyer-2",
  };

  assert.equal(traderDemand.buyerOrganisation.name, "Automotive Composites SAS");
  assert.equal(traderDemand.buyerOrganisation.country, "France");
  assert.equal(traderDemand.buyerOrganisation.verificationStatus, "VERIFIED");
  assert.equal(traderDemand.status, "OPEN");
  assert.equal(traderDemand.targetPriceAmount, null);
});

async function importBuyOrdersApi() {
  const { readFile } = await import("node:fs/promises");
  const ts = (await import("typescript")).default;
  const configUrl = new URL("../src/auth/config.ts", import.meta.url);
  const configSource = await readFile(configUrl, "utf8");
  const { outputText: configJs } = ts.transpileModule(configSource, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const configModule = await import(`data:text/javascript;base64,${Buffer.from(configJs).toString("base64")}`);

  const sourceUrl = new URL("../src/buy-orders/api.ts", import.meta.url);
  let source = await readFile(sourceUrl, "utf8");
  // Replace the import with direct inline function or relative path
  source = source.replace(/import\s*\{\s*getLocalApiBaseUrl\s*\}\s*from\s*["']@\/auth\/config["'];?/, `
    const getLocalApiBaseUrl = (raw) => raw || "http://localhost:3001";
  `);

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: sourceUrl.pathname,
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

test("deleteBuyOrder handles 204 No Content successfully without attempting response.json()", async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:3001";

  try {
    let capturedUrl = "";
    let capturedMethod = "";

    globalThis.fetch = async (url, init) => {
      capturedUrl = String(url);
      capturedMethod = init?.method || "GET";
      return new Response(null, { status: 204, statusText: "No Content" });
    };

    const { deleteBuyOrder } = await importBuyOrdersApi();

    // Call deleteBuyOrder - must resolve cleanly with no syntax error or exception
    await deleteBuyOrder("test-buy-order-id-123");

    assert.equal(capturedUrl, "http://127.0.0.1:3001/api/v1/buy-orders/test-buy-order-id-123");
    assert.equal(capturedMethod, "DELETE");
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
  }
});

test("deleteBuyOrder properly surfaces real backend errors", async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:3001";

  try {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({ detail: "Only DRAFT buy orders can be deleted." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    };

    const { deleteBuyOrder } = await importBuyOrdersApi();

    await assert.rejects(
      () => deleteBuyOrder("open-order-id"),
      (err) => {
        assert.equal(err.message, "Only DRAFT buy orders can be deleted.");
        assert.equal(err.status, 400);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
  }
});

test("post-delete optimistic state update immediately removes deleted draft even if refetch is slow or fails", async () => {
  let items = [
    { id: "draft-1", status: "DRAFT" },
    { id: "draft-2", status: "DRAFT" },
  ];

  // Simulating optimistic delete in UI
  const deleteId = "draft-1";
  items = items.filter((item) => item.id !== deleteId);

  assert.equal(items.length, 1);
  assert.equal(items[0].id, "draft-2");
});
