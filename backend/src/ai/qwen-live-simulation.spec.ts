import { createServer, type Server } from "node:http";
import { ExternalLlmAiProvider } from "./external-llm-ai.provider";
import { DeterministicFakeAiProvider } from "./deterministic-fake-ai.provider";
import type { AiPromptPayload, StructuredAiOutputEnvelope } from "./contracts";

describe("Qwen Live HTTP Simulation & Response Parsing (TRADER-AI-03 Proof)", () => {
  let mockServer: Server;
  let mockPort: number;
  let serverMode: "SUCCESS_QWEN" | "INVALID_JSON" | "HTTP_500" | "SLOW_TIMEOUT";

  beforeAll((done) => {
    mockServer = createServer((req, res) => {
      if (serverMode === "SLOW_TIMEOUT") {
        // Do not respond, let timeout fire
        return;
      }

      if (serverMode === "HTTP_500") {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Internal Qwen engine failure" } }));
        return;
      }

      if (serverMode === "INVALID_JSON") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          choices: [
            {
              message: {
                content: "Not a JSON structure, just free prose text explaining why this lot is good.",
              },
            },
          ],
        }));
        return;
      }

      // SUCCESS_QWEN: Realistic qwen3.8-27b structured completion in French
      res.writeHead(200, { "Content-Type": "application/json" });
      const qwenOutput: StructuredAiOutputEnvelope = {
        summary:
          "Analyse qwen3.8-27b : Le lot de Chanvre Premium Normandie présente une excellente adéquation technique et tarifaire (-6% sous l'objectif acheteur). Fournisseur coopératif audité et validé.",
        confidence: 0.94,
        evidence: [
          {
            sourceType: "listing",
            sourceId: "lot-normandie-01",
            fieldPath: "listing.priceAmount",
            safeValue: "1410 EUR/T",
          },
        ],
        missingInformation: [],
        proposedActions: [
          {
            toolKey: "matching.prepare_quote",
            proposalType: "PREPARE_QUOTE_PROPOSAL",
            payload: { recommendedMarginPct: 11.5 },
            riskLevel: "REQUIRES_APPROVAL",
            rationale: "Optimisation de marge brute Trader sous le plafond d'achat.",
          },
        ],
      };

      res.end(
        JSON.stringify({
          id: "chatcmpl-qwen-sim-001",
          object: "chat.completion",
          created: 1730330000,
          model: "qwen3.8-27b",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: JSON.stringify(qwenOutput),
              },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 412,
            completion_tokens: 185,
            total_tokens: 597,
          },
        }),
      );
    });

    mockServer.listen(0, "127.0.0.1", () => {
      const address = mockServer.address() as any;
      mockPort = address.port;
      done();
    });
  });

  afterAll((done) => {
    mockServer.close(done);
  });

  it("successfully parses and validates genuine structured JSON from Qwen endpoint", async () => {
    serverMode = "SUCCESS_QWEN";
    const fallback = new DeterministicFakeAiProvider();
    const provider = new ExternalLlmAiProvider(
      {
        providerName: "qwen",
        modelName: "qwen3.8-27b",
        endpointUrl: `http://127.0.0.1:${mockPort}/v1/chat/completions`,
        apiKey: "sk-mock-qwen-key",
        timeoutMs: 5000,
      },
      fallback,
    );

    const payload: AiPromptPayload = {
      systemPrompt: "System instruction in French",
      untrustedBusinessContext: {
        demand: { materialType: "HEMP", quantity: 100 },
        candidate: { id: "lot-normandie-01", priceAmount: 1410 },
      },
      query: "Pourquoi ce lot ?",
    };

    const result = await provider.generateStructured<StructuredAiOutputEnvelope>(payload, (raw: any) => ({
      valid: typeof raw?.summary === "string" && Array.isArray(raw?.proposedActions),
      data: raw,
    }));

    expect(result.provider).toBe("qwen");
    expect(result.model).toBe("qwen3.8-27b");
    expect(result.output.summary).toContain("Analyse qwen3.8-27b");
    expect(result.output.summary).toContain("Chanvre Premium Normandie");
    expect(result.output.confidence).toBe(0.94);
    expect(result.output.proposedActions[0].riskLevel).toBe("REQUIRES_APPROVAL");
  });

  it("fails over to deterministic fallback when Qwen returns unparseable non-JSON text", async () => {
    serverMode = "INVALID_JSON";
    const fallback = new DeterministicFakeAiProvider();
    const provider = new ExternalLlmAiProvider(
      {
        providerName: "qwen",
        modelName: "qwen3.8-27b",
        endpointUrl: `http://127.0.0.1:${mockPort}/v1/chat/completions`,
        apiKey: "sk-mock-qwen-key",
        timeoutMs: 5000,
      },
      fallback,
    );

    const payload: AiPromptPayload = {
      systemPrompt: "System instruction",
      untrustedBusinessContext: {
        trade: { id: "trade-01", tradeNumber: "TR-01", materialType: "HEMP", quantity: 50 },
      },
    };

    const result = await provider.generateStructured<StructuredAiOutputEnvelope>(payload, (raw: any) => ({
      valid: typeof raw?.summary === "string" && typeof raw?.confidence === "number",
      data: raw,
    }));

    // Must gracefully fall back to deterministic provider without crashing
    expect(result.output).toBeDefined();
    expect(typeof result.output.summary).toBe("string");
    expect(result.output.summary).toContain("TR-01");
  });

  it("fails over to deterministic fallback when Qwen endpoint returns HTTP 500 error", async () => {
    serverMode = "HTTP_500";
    const fallback = new DeterministicFakeAiProvider();
    const provider = new ExternalLlmAiProvider(
      {
        providerName: "qwen",
        modelName: "qwen3.8-27b",
        endpointUrl: `http://127.0.0.1:${mockPort}/v1/chat/completions`,
        apiKey: "sk-mock-qwen-key",
        timeoutMs: 5000,
      },
      fallback,
    );

    const payload: AiPromptPayload = {
      systemPrompt: "System instruction",
      untrustedBusinessContext: {
        trade: { id: "trade-500", tradeNumber: "TR-500", materialType: "HEMP", quantity: 80 },
      },
    };

    const result = await provider.generateStructured<StructuredAiOutputEnvelope>(payload, (raw: any) => ({
      valid: typeof raw?.summary === "string",
      data: raw,
    }));

    expect(result.output).toBeDefined();
    expect(result.output.summary).toContain("TR-500");
  });

  it("fails over to deterministic fallback on timeout (> 200ms)", async () => {
    serverMode = "SLOW_TIMEOUT";
    const fallback = new DeterministicFakeAiProvider();
    const provider = new ExternalLlmAiProvider(
      {
        providerName: "qwen",
        modelName: "qwen3.8-27b",
        endpointUrl: `http://127.0.0.1:${mockPort}/v1/chat/completions`,
        apiKey: "sk-mock-qwen-key",
        timeoutMs: 200, // Very short timeout
      },
      fallback,
    );

    const payload: AiPromptPayload = {
      systemPrompt: "System instruction",
      untrustedBusinessContext: {
        trade: { id: "trade-timeout", tradeNumber: "TR-TIMEOUT", materialType: "HEMP", quantity: 100 },
      },
    };

    const result = await provider.generateStructured<StructuredAiOutputEnvelope>(payload, (raw: any) => ({
      valid: typeof raw?.summary === "string",
      data: raw,
    }));

    expect(result.output).toBeDefined();
    expect(result.output.summary).toContain("TR-TIMEOUT");
  });
});

