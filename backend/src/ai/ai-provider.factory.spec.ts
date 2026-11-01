import { createAiProvider } from "./ai-provider.factory";
import { DeterministicFakeAiProvider } from "./deterministic-fake-ai.provider";
import { ExternalLlmAiProvider } from "./external-llm-ai.provider";
import { COPILOT_PROMPTS, getPromptTemplate } from "./copilot-prompts";
import type { AiPromptPayload } from "./contracts";

describe("AiProviderFactory, DeepSeek / Qwen Providers & Prompt Catalog (TRADER-AI-04)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("defaults to DeterministicFakeAiProvider when AI_PROVIDER is unset", () => {
    delete process.env.AI_PROVIDER;
    const provider = createAiProvider();
    expect(provider).toBeInstanceOf(DeterministicFakeAiProvider);
    expect(provider.providerName).toBe("deterministic-fake");
  });

  it("defaults to DeterministicFakeAiProvider when AI_PROVIDER='deterministic'", () => {
    process.env.AI_PROVIDER = "deterministic";
    const provider = createAiProvider();
    expect(provider).toBeInstanceOf(DeterministicFakeAiProvider);
  });

  it("instantiates DeepSeek ExternalLlmAiProvider with deepseek-flash default when AI_PROVIDER='deepseek'", () => {
    process.env.AI_PROVIDER = "deepseek";
    delete process.env.AI_MODEL_NAME;
    delete process.env.AI_API_ENDPOINT;
    process.env.AI_API_KEY = "test-deepseek-key";

    const provider = createAiProvider();
    expect(provider).toBeInstanceOf(ExternalLlmAiProvider);
    expect(provider.providerName).toBe("deepseek");
    expect(provider.modelName).toBe("deepseek-flash");
  });

  it("allows custom DeepSeek model override via AI_MODEL_NAME (e.g. deepseek-v4-pro)", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.AI_MODEL_NAME = "deepseek-v4-pro";
    process.env.AI_API_KEY = "test-deepseek-key";

    const provider = createAiProvider();
    expect(provider).toBeInstanceOf(ExternalLlmAiProvider);
    expect(provider.providerName).toBe("deepseek");
    expect(provider.modelName).toBe("deepseek-v4-pro");
  });

  it("falls back to DeterministicFakeAiProvider when AI_PROVIDER='qwen' but endpoint is missing", () => {
    process.env.AI_PROVIDER = "qwen";
    delete process.env.AI_API_ENDPOINT;
    const provider = createAiProvider();
    expect(provider).toBeInstanceOf(DeterministicFakeAiProvider);
  });

  it("instantiates Qwen ExternalLlmAiProvider with qwen3.8-27b default when AI_PROVIDER='qwen'", () => {
    process.env.AI_PROVIDER = "qwen";
    process.env.AI_API_ENDPOINT = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
    process.env.AI_API_KEY = "test-qwen-key";
    delete process.env.AI_MODEL_NAME; // should default to qwen3.8-27b

    const provider = createAiProvider();
    expect(provider).toBeInstanceOf(ExternalLlmAiProvider);
    expect(provider.providerName).toBe("qwen");
    expect(provider.modelName).toBe("qwen3.8-27b");
  });

  it("allows custom Qwen model override via AI_MODEL_NAME", () => {
    process.env.AI_PROVIDER = "qwen";
    process.env.AI_API_ENDPOINT = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
    process.env.AI_MODEL_NAME = "qwen2.5-72b-instruct";

    const provider = createAiProvider();
    expect(provider).toBeInstanceOf(ExternalLlmAiProvider);
    expect(provider.modelName).toBe("qwen2.5-72b-instruct");
  });

  it("instantiates ExternalLlmAiProvider when AI_PROVIDER='external-llm' with endpoint", () => {
    process.env.AI_PROVIDER = "external-llm";
    process.env.AI_API_ENDPOINT = "https://api.custom-llm.com/v1/chat/completions";
    process.env.AI_MODEL_NAME = "custom-model";

    const provider = createAiProvider();
    expect(provider).toBeInstanceOf(ExternalLlmAiProvider);
    expect(provider.providerName).toBe("external-llm");
    expect(provider.modelName).toBe("custom-model");
  });

  it("ExternalLlmAiProvider gracefully falls back to deterministic provider on network failure or timeout", async () => {
    const fallback = new DeterministicFakeAiProvider();
    const provider = new ExternalLlmAiProvider(
      {
        providerName: "qwen",
        modelName: "qwen3.8-27b",
        endpointUrl: "http://127.0.0.1:59999/unreachable-endpoint",
        timeoutMs: 300,
      },
      fallback,
    );

    const payload: AiPromptPayload = {
      systemPrompt: "System instruction in French",
      untrustedBusinessContext: {
        trade: {
          id: "trade-fallback-qwen",
          tradeNumber: "TR-QWEN-01",
          materialType: "HEMP",
          quantity: 120,
          quantityUnit: "TONNES",
        },
      },
    };

    const result = await provider.generateStructured(payload, (raw: any) => ({
      valid: typeof raw?.summary === "string",
      data: raw,
    }));

    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect(typeof (result.output as any).summary).toBe("string");
    expect((result.output as any).summary).toContain("TR-QWEN-01");
  });

  it("COPILOT_PROMPTS catalog defines distinct specialized prompts for all 8 Copilot capabilities", () => {
    const expectedKeys = [
      "TRADER_DASHBOARD_BRIEFING",
      "TRADER_LOT_EXPLANATION",
      "TRADER_COMPARISON_SYNTHESIS",
      "TRADER_QUOTE_MARGIN",
      "TRADER_CONTEXT_ASSISTANT",
      "TRADER_QUALITY_INSPECTION",
      "TRADER_LOGISTICS_DIAGNOSTIC",
      "TRADER_DOCUMENTS_AUDIT",
    ];

    expect(Object.keys(COPILOT_PROMPTS).length).toBe(8);

    for (const key of expectedKeys) {
      const template = getPromptTemplate(key);
      expect(template).toBeDefined();
      expect(template.agentKey).toBe(key);
      expect(template.role).toContain("I DO GROW");
      expect(template.task.length).toBeGreaterThan(20);
      expect(template.constraints.length).toBeGreaterThan(3);

      const prompt = template.buildSystemPrompt();
      expect(prompt).toContain("RÉPONSE EN FRANÇAIS");
      expect(prompt).toContain("HUMAN-IN-THE-LOOP");
      expect(prompt).toContain("FORMAT DE SORTIE JSON STRICT");
    }
  });
});
