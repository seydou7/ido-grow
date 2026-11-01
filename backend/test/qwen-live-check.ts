import * as fs from "node:fs";
import * as path from "node:path";
import { ExternalLlmAiProvider } from "../src/ai/external-llm-ai.provider";
import { DeterministicFakeAiProvider } from "../src/ai/deterministic-fake-ai.provider";
import { getPromptTemplate } from "../src/ai/copilot-prompts";
import type { StructuredAiOutputEnvelope } from "../src/ai/contracts";

// Safe local env loader
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath) && typeof (process as any).loadEnvFile === "function") {
  (process as any).loadEnvFile(envPath);
}

const endpoint = process.env.AI_API_ENDPOINT;
const apiKey = process.env.AI_API_KEY;
const modelName = process.env.AI_MODEL_NAME || "qwen3.8-27b";
const timeoutMs = process.env.AI_TIMEOUT_MS ? Number.parseInt(process.env.AI_TIMEOUT_MS, 10) : 10000;

function maskEndpoint(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    const hostParts = parsed.host.split(".");
    if (hostParts.length > 2) {
      // mask workspace id: e.g. ws-xyz123 -> ws-***
      const maskedWs = hostParts[0].slice(0, 3) + "***";
      return `https://${maskedWs}.${hostParts.slice(1).join(".")}${parsed.pathname}`;
    }
    return parsed.origin + parsed.pathname;
  } catch {
    return "https://[masked-endpoint]";
  }
}

function envelopeValidator(raw: unknown) {
  if (!raw || typeof raw !== "object") return { valid: false, errors: ["Not an object"] };
  const obj = raw as Record<string, any>;
  const valid = typeof obj.summary === "string" && typeof obj.confidence === "number";
  return { valid, data: obj as StructuredAiOutputEnvelope };
}

async function runLiveCheck() {
  console.log("================================================================================");
  console.log("I DO GROW — QWEN LIVE NETWORK VALIDATION RUNNER (TRADER-AI-03B)");
  console.log("================================================================================");

  if (!endpoint || !apiKey || apiKey === "..." || endpoint.includes("{WorkspaceId}")) {
    console.log("\n[STATUS: MISSING_CREDENTIALS]");
    console.log("No live Alibaba Cloud Model Studio credentials configured in backend/.env.");
    console.log("Target Model API ID :", modelName);
    console.log("Target Region       : ap-southeast-1 (Singapore)");
    console.log("Endpoint Template   : https://{WorkspaceId}.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions");
    console.log("\nPlease populate backend/.env with your Workspace ID and API key to execute live calls.");
    return;
  }

  console.log("\n[CONFIGURATION DETECTED]");
  console.log("Provider            : qwen (via ExternalLlmAiProvider)");
  console.log("Target Model        : " + modelName);
  console.log("Masked Endpoint     : " + maskEndpoint(endpoint));
  console.log("API Key Present     : YES (Secret protected, never logged)");
  console.log("Timeout             : " + timeoutMs + "ms");

  const fallback = new DeterministicFakeAiProvider();
  const provider = new ExternalLlmAiProvider(
    {
      providerName: "qwen",
      modelName,
      endpointUrl: endpoint,
      apiKey,
      timeoutMs,
    },
    fallback,
  );

  // --------------------------------------------------------------------------
  // TEST 1: Dashboard Briefing
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("1. TEST LIVE: TRADER_DASHBOARD_BRIEFING");
  console.log("--------------------------------------------------------------------------------");

  const t1 = getPromptTemplate("TRADER_DASHBOARD_BRIEFING");
  const p1 = {
    systemPrompt: t1.buildSystemPrompt(),
    untrustedBusinessContext: {
      demandsNeedingOffers48h: 2,
      counterOffersReceived: 1,
      blockedShipments: 1,
      reviewsPending: 3,
      inspectionsPending: 2,
      priorityItem: {
        id: "DEMAND-2026-0042",
        title: "Demande urgente Chanvre Industriel Textile 120T",
        counterparty: "EcoTextile SAS",
        ageHours: 52,
      },
    },
    query: "Que dois-je traiter en premier aujourd'hui ?",
  };

  const start1 = Date.now();
  const r1 = await provider.generateStructured<StructuredAiOutputEnvelope>(p1, envelopeValidator);
  const dur1 = Date.now() - start1;

  console.log(`Duration: ${dur1}ms`);
  console.log(`Provider: ${r1.provider}`);
  console.log(`Model   : ${r1.model}`);
  console.log(`Confidence: ${r1.output.confidence}`);
  console.log(`Summary : ${r1.output.summary}`);
  console.log(`Proposed Actions: ${r1.output.proposedActions?.length || 0}`);

  // --------------------------------------------------------------------------
  // TEST 2: Matching — Pourquoi ce lot ?
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("2. TEST LIVE: TRADER_LOT_EXPLANATION (Matching)");
  console.log("--------------------------------------------------------------------------------");

  const t2 = getPromptTemplate("TRADER_LOT_EXPLANATION");
  const p2 = {
    systemPrompt: t2.buildSystemPrompt(),
    untrustedBusinessContext: {
      demand: {
        id: "DEMAND-2026-0042",
        materialType: "HEMP",
        targetPriceAmount: 1500,
        currency: "EUR",
        quantity: 100,
        quantityUnit: "TONNES",
        incoterm: "DAP",
        destinationCountry: "FR",
      },
      candidateListing: {
        id: "LOT-20261030-HEMP-001",
        producerOrganisation: "Coopérative Chanvre de Normandie",
        priceAmount: 1410,
        currency: "EUR",
        availableQuantity: 120,
        quantityUnit: "TONNES",
        incoterm: "FCA",
        originCountry: "FR",
        moisturePercentage: 9.8,
        impurityPercentage: 1.2,
      },
    },
    query: "Pourquoi ce lot ?",
  };

  const start2 = Date.now();
  const r2 = await provider.generateStructured<StructuredAiOutputEnvelope>(p2, envelopeValidator);
  const dur2 = Date.now() - start2;

  console.log(`Duration: ${dur2}ms`);
  console.log(`Provider: ${r2.provider}`);
  console.log(`Model   : ${r2.model}`);
  console.log(`Confidence: ${r2.output.confidence}`);
  console.log(`Summary : ${r2.output.summary}`);

  // --------------------------------------------------------------------------
  // TEST 3: Quote — Aide à la marge
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("3. TEST LIVE: TRADER_QUOTE_MARGIN (Quote Pricing)");
  console.log("--------------------------------------------------------------------------------");

  const t3 = getPromptTemplate("TRADER_QUOTE_MARGIN");
  const p3 = {
    systemPrompt: t3.buildSystemPrompt(),
    untrustedBusinessContext: {
      quote: {
        id: "QUOTE-2026-0091",
        quoteNumber: "Q-2026-0091-V1",
        materialType: "HEMP",
        volume: 80,
        unit: "TONNES",
        rawMaterialCost: 112800, // 1410 EUR/T
        transportCost: 4800,     // 60 EUR/T
        qualityAssuranceCost: 1200,
        insuranceCost: 600,
        totalLandedCost: 119400, // ~1492.5 EUR/T
        targetBuyerMaxBudget: 136000, // 1700 EUR/T max
      },
    },
    query: "Suggérer une marge optimale pour ce devis",
  };

  const start3 = Date.now();
  const r3 = await provider.generateStructured<StructuredAiOutputEnvelope>(p3, envelopeValidator);
  const dur3 = Date.now() - start3;

  console.log(`Duration: ${dur3}ms`);
  console.log(`Provider: ${r3.provider}`);
  console.log(`Model   : ${r3.model}`);
  console.log(`Confidence: ${r3.output.confidence}`);
  console.log(`Summary : ${r3.output.summary}`);
  console.log(`Proposed Actions: ${JSON.stringify(r3.output.proposedActions)}`);

  // --------------------------------------------------------------------------
  // TEST 4: Fallback Invariance Test
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("4. TEST LIVE: SIMULATION DE PANNE PROVIDER (FALLBACK INVARIANCE)");
  console.log("--------------------------------------------------------------------------------");

  const brokenProvider = new ExternalLlmAiProvider(
    {
      providerName: "qwen",
      modelName,
      endpointUrl: "https://invalid-unreachable-qwen-subdomain.aliyuncs.com/v1/chat/completions",
      apiKey: "invalid-key",
      timeoutMs: 800,
    },
    fallback,
  );

  const start4 = Date.now();
  const r4 = await brokenProvider.generateStructured<StructuredAiOutputEnvelope>(p1, envelopeValidator);
  const dur4 = Date.now() - start4;

  console.log(`Duration: ${dur4}ms`);
  console.log(`Fallback Provider Returned: ${r4.provider}`);
  console.log(`Fallback Model: ${r4.model}`);
  console.log(`Fallback Summary: ${r4.output.summary.slice(0, 100)}...`);
  console.log(`Business Continuity Guaranteed: ${r4.output.summary.length > 0 ? "YES" : "NO"}`);
  console.log("================================================================================");
}

runLiveCheck().catch((err) => {
  console.error("Live check execution error:", err);
  process.exit(1);
});

