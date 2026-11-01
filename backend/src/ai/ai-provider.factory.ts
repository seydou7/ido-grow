import * as fs from "node:fs";
import * as path from "node:path";
import { Logger } from "@nestjs/common";
import { AiProvider } from "./ai-provider.interface";
import { DeterministicFakeAiProvider } from "./deterministic-fake-ai.provider";
import { ExternalLlmAiProvider, type ExternalLlmConfig } from "./external-llm-ai.provider";

function tryLoadLocalEnv(): void {
  if (typeof (process as any).loadEnvFile === "function") {
    const candidates = [
      path.resolve(process.cwd(), ".env"),
      path.resolve(process.cwd(), "backend/.env"),
      path.resolve(__dirname, "../../.env"),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        try {
          (process as any).loadEnvFile(candidate);
          break;
        } catch {
          // ignore parsing error
        }
      }
    }
  }
}

/**
 * Resolves the active AI provider based on application runtime configuration.
 *
 * Current defaults:
 * - Development: DeterministicFakeAiProvider (offline, deterministic, zero cost)
 * - Testing: DeterministicFakeAiProvider (fast, repeatable, zero external calls)
 * - Production: DeterministicFakeAiProvider (until an official LLM provider decision is approved)
 *
 * Pluggable via environment variables:
 * - AI_PROVIDER: "deterministic" (default) | "deepseek" | "qwen" | "external-llm"
 * - AI_API_ENDPOINT: Target LLM completion API endpoint URL (default for deepseek: "https://api.deepseek.com/chat/completions")
 * - AI_API_KEY: Authentication token for the LLM service
 * - AI_MODEL_NAME: Identifier of the target model (default: "deepseek-flash" for deepseek, "qwen3.8-27b" for qwen)
 * - AI_TIMEOUT_MS: Execution timeout in milliseconds (default: 10000)
 */
export function createAiProvider(): AiProvider {
  tryLoadLocalEnv();
  const providerType = (process.env.AI_PROVIDER || "deterministic").trim().toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  const timeoutMs = process.env.AI_TIMEOUT_MS ? Number.parseInt(process.env.AI_TIMEOUT_MS, 10) : 10000;
  const fallback = new DeterministicFakeAiProvider();

  if (providerType === "deepseek") {
    const endpointUrl = process.env.AI_API_ENDPOINT || "https://api.deepseek.com/chat/completions";
    const modelName = process.env.AI_MODEL_NAME || "deepseek-flash";

    const config: ExternalLlmConfig = {
      providerName: "deepseek",
      modelName,
      apiKey,
      endpointUrl,
      timeoutMs,
    };

    Logger.log(
      `AI Provider configured: DeepSeek (${modelName} at ${new URL(endpointUrl).host}) with deterministic fallback.`,
      "AiProviderFactory",
    );
    return new ExternalLlmAiProvider(config, fallback);
  }

  if (providerType === "qwen") {
    const endpointUrl = process.env.AI_API_ENDPOINT;
    const modelName = process.env.AI_MODEL_NAME || "qwen3.8-27b";

    if (!endpointUrl) {
      Logger.warn(
        `AI_PROVIDER is set to 'qwen' but AI_API_ENDPOINT is missing. Using DeterministicFakeAiProvider fallback.`,
        "AiProviderFactory",
      );
      return fallback;
    }

    const config: ExternalLlmConfig = {
      providerName: "qwen",
      modelName,
      apiKey,
      endpointUrl,
      timeoutMs,
    };

    Logger.log(
      `AI Provider configured: Qwen LLM (${modelName} at ${new URL(endpointUrl).host}) with deterministic fallback.`,
      "AiProviderFactory",
    );
    return new ExternalLlmAiProvider(config, fallback);
  }

  if (providerType === "external-llm") {
    const endpointUrl = process.env.AI_API_ENDPOINT;
    const modelName = process.env.AI_MODEL_NAME || "llm-generic-v1";

    if (!endpointUrl) {
      Logger.warn(
        `AI_PROVIDER is set to 'external-llm' but AI_API_ENDPOINT is missing. Using DeterministicFakeAiProvider fallback.`,
        "AiProviderFactory",
      );
      return fallback;
    }

    const config: ExternalLlmConfig = {
      providerName: "external-llm",
      modelName,
      apiKey,
      endpointUrl,
      timeoutMs,
    };

    Logger.log(
      `AI Provider configured: External LLM (${modelName} at ${new URL(endpointUrl).host}) with deterministic fallback.`,
      "AiProviderFactory",
    );
    return new ExternalLlmAiProvider(config, fallback);
  }

  // Default: DeterministicFakeAiProvider
  return fallback;
}

