import * as http from "node:http";
import { ExternalLlmAiProvider } from "./external-llm-ai.provider";
import { DeterministicFakeAiProvider } from "./deterministic-fake-ai.provider";
import type { AiPromptPayload, StructuredAiOutputEnvelope } from "./contracts";

describe("DeepSeek Live Simulation & Fallback Resilience (TRADER-AI-04)", () => {
  let mockServer: http.Server;
  let mockPort: number;
  let serverMode: "SUCCESS" | "INVALID_JSON" | "HTTP_401" | "HTTP_500" | "TIMEOUT" = "SUCCESS";

  beforeAll((done) => {
    mockServer = http.createServer((req, res) => {
      if (req.method !== "POST") {
        res.writeHead(405);
        res.end();
        return;
      }

      if (serverMode === "HTTP_401") {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Authentication failed. Invalid DeepSeek API Key.", type: "authentication_error" } }));
        return;
      }

      if (serverMode === "HTTP_500") {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "DeepSeek internal engine overloaded.", type: "server_error" } }));
        return;
      }

      if (serverMode === "TIMEOUT") {
        // Intentionally delay past timeout with unref'd timer
        const timer = setTimeout(() => {
          if (!res.writableEnded) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ choices: [] }));
          }
        }, 1000);
        timer.unref();
        return;
      }

      if (serverMode === "INVALID_JSON") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            id: "chatcmpl-deepseek-invalid",
            choices: [
              {
                message: {
                  role: "assistant",
                  content: "Ceci est une explication en texte brut non formatée en JSON valide.",
                },
              },
            ],
          }),
        );
        return;
      }

      // SUCCESS: Valid DeepSeek completion
      const envelope: StructuredAiOutputEnvelope = {
        summary:
          "Analyse DeepSeek-Flash : Le lot de Chanvre Industriel Normandie présente une excellente conformité technique avec 9.8% d'humidité. Tarif compétitif recommandé.",
        confidence: 0.95,
        evidence: [
          {
            sourceType: "listing",
            sourceId: "LOT-20261030-HEMP-001",
            fieldPath: "listing.priceAmount",
            safeValue: "1410 EUR/T",
          },
        ],
        missingInformation: [],
        proposedActions: [
          {
            toolKey: "matching.prepare_quote",
            proposalType: "PREPARE_QUOTE_PROPOSAL",
            payload: { recommendedMarginPct: 11.2 },
            riskLevel: "REQUIRES_APPROVAL",
            rationale: "Marge optimale 11.2% conforme au plafond acheteur.",
          },
        ],
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          id: "chatcmpl-deepseek-flash-001",
          object: "chat.completion",
          created: 1730400000,
          model: "deepseek-flash",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: JSON.stringify(envelope),
              },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 350,
            completion_tokens: 140,
            total_tokens: 490,
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

  it("1. Sélection Provider & Réponse JSON Valide : DeepSeek-Flash", async () => {
    serverMode = "SUCCESS";
    const fallback = new DeterministicFakeAiProvider();
    const provider = new ExternalLlmAiProvider(
      {
        providerName: "deepseek",
        modelName: "deepseek-flash",
        endpointUrl: `http://127.0.0.1:${mockPort}/chat/completions`,
        apiKey: "sk-deepseek-test-key",
        timeoutMs: 5000,
      },
      fallback,
    );

    const payload: AiPromptPayload = {
      systemPrompt: "System instruction in French",
      untrustedBusinessContext: {
        demand: { materialType: "HEMP", quantity: 100 },
        candidate: { id: "LOT-20261030-HEMP-001", priceAmount: 1410 },
      },
      query: "Pourquoi ce lot ?",
    };

    const result = await provider.generateStructured<StructuredAiOutputEnvelope>(payload, (raw: any) => ({
      valid: typeof raw?.summary === "string" && typeof raw?.confidence === "number",
      data: raw,
    }));

    expect(result.provider).toBe("deepseek");
    expect(result.model).toBe("deepseek-flash");
    expect(result.output.summary).toContain("Analyse DeepSeek-Flash");
    expect(result.output.confidence).toBe(0.95);
    expect(result.output.proposedActions[0].riskLevel).toBe("REQUIRES_APPROVAL");
  });

  it("2. JSON Invalide : bascule automatique vers fallback déterministe", async () => {
    serverMode = "INVALID_JSON";
    const fallback = new DeterministicFakeAiProvider();
    const provider = new ExternalLlmAiProvider(
      {
        providerName: "deepseek",
        modelName: "deepseek-flash",
        endpointUrl: `http://127.0.0.1:${mockPort}/chat/completions`,
        apiKey: "sk-deepseek-test-key",
        timeoutMs: 5000,
      },
      fallback,
    );

    const payload: AiPromptPayload = {
      systemPrompt: "System instruction in French",
      untrustedBusinessContext: {
        trade: { id: "trade-invalid-json", tradeNumber: "TR-DEEPSEEK-01", materialType: "HEMP", quantity: 60 },
      },
    };

    const result = await provider.generateStructured<StructuredAiOutputEnvelope>(payload, (raw: any) => ({
      valid: typeof raw?.summary === "string" && typeof raw?.confidence === "number",
      data: raw,
    }));

    // Must gracefully fall back to deterministic provider
    expect(result.output).toBeDefined();
    expect(result.output.summary).toContain("TR-DEEPSEEK-01");
  });

  it("3. HTTP 401 Unauthorized : bascule automatique vers fallback déterministe", async () => {
    serverMode = "HTTP_401";
    const fallback = new DeterministicFakeAiProvider();
    const provider = new ExternalLlmAiProvider(
      {
        providerName: "deepseek",
        modelName: "deepseek-flash",
        endpointUrl: `http://127.0.0.1:${mockPort}/chat/completions`,
        apiKey: "sk-invalid-deepseek-key",
        timeoutMs: 5000,
      },
      fallback,
    );

    const payload: AiPromptPayload = {
      systemPrompt: "System instruction in French",
      untrustedBusinessContext: {
        trade: { id: "trade-401", tradeNumber: "TR-401", materialType: "HEMP", quantity: 50 },
      },
    };

    const result = await provider.generateStructured<StructuredAiOutputEnvelope>(payload, (raw: any) => ({
      valid: typeof raw?.summary === "string",
      data: raw,
    }));

    expect(result.output).toBeDefined();
    expect(result.output.summary).toContain("TR-401");
  });

  it("4. HTTP 500 Server Error : bascule automatique vers fallback déterministe", async () => {
    serverMode = "HTTP_500";
    const fallback = new DeterministicFakeAiProvider();
    const provider = new ExternalLlmAiProvider(
      {
        providerName: "deepseek",
        modelName: "deepseek-flash",
        endpointUrl: `http://127.0.0.1:${mockPort}/chat/completions`,
        apiKey: "sk-deepseek-test-key",
        timeoutMs: 5000,
      },
      fallback,
    );

    const payload: AiPromptPayload = {
      systemPrompt: "System instruction in French",
      untrustedBusinessContext: {
        trade: { id: "trade-500", tradeNumber: "TR-500", materialType: "FLAX", quantity: 80 },
      },
    };

    const result = await provider.generateStructured<StructuredAiOutputEnvelope>(payload, (raw: any) => ({
      valid: typeof raw?.summary === "string",
      data: raw,
    }));

    expect(result.output).toBeDefined();
    expect(result.output.summary).toContain("TR-500");
  });

  it("5. Timeout (> 200ms) : annulation propre et fallback déterministe", async () => {
    serverMode = "TIMEOUT";
    const fallback = new DeterministicFakeAiProvider();
    const provider = new ExternalLlmAiProvider(
      {
        providerName: "deepseek",
        modelName: "deepseek-flash",
        endpointUrl: `http://127.0.0.1:${mockPort}/chat/completions`,
        apiKey: "sk-deepseek-test-key",
        timeoutMs: 200, // Short timeout
      },
      fallback,
    );

    const payload: AiPromptPayload = {
      systemPrompt: "System instruction in French",
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
