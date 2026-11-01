import { Injectable, Logger } from "@nestjs/common";
import { AiProvider } from "./ai-provider.interface";
import type {
  AiGenerationResult,
  AiPromptPayload,
  StructuredAiOutputEnvelope,
} from "./contracts";

export interface ExternalLlmConfig {
  readonly providerName: string;
  readonly modelName: string;
  readonly apiKey?: string;
  readonly endpointUrl?: string;
  readonly timeoutMs?: number;
}

/**
 * Generic External LLM Provider adapter for I DO GROW.
 *
 * Implements provider-neutral REST interaction with external LLM services:
 * - Compatible with OpenAI / Anthropic / Gemini / Ollama proxy endpoints.
 * - Enforces bounded execution with strict AbortSignal timeouts.
 * - Protects system prompt instructions from untrusted business context.
 * - Gracefully falls back to the deterministic foundation provider on network error,
 *   timeout, or schema violation.
 */
@Injectable()
export class ExternalLlmAiProvider extends AiProvider {
  private readonly logger = new Logger(ExternalLlmAiProvider.name);
  readonly providerName: string;
  readonly modelName: string;

  constructor(
    private readonly config: ExternalLlmConfig,
    private readonly fallbackProvider: AiProvider,
  ) {
    super();
    this.providerName = config.providerName || "external-llm";
    this.modelName = config.modelName || "llm-generic-v1";
  }

  async generateStructured<T>(
    payload: AiPromptPayload,
    schemaValidator: (output: unknown) => { valid: boolean; data?: T; errors?: string[] },
  ): Promise<AiGenerationResult<T>> {
    // If endpoint is not configured, immediately use fallback provider
    if (!this.config.endpointUrl) {
      this.logger.warn(
        "No AI_API_ENDPOINT configured for ExternalLlmAiProvider. Falling back to deterministic foundation provider.",
      );
      return this.fallbackProvider.generateStructured(payload, schemaValidator);
    }

    const timeoutMs = this.config.timeoutMs || 10000;

    // Proof log for operational observability (without exposing secrets)
    this.logger.log(`[AI] provider=${this.providerName} model=${this.modelName}`);

    try {
      const response = await fetch(this.config.endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: "system",
              content: payload.systemPrompt,
            },
            {
              role: "user",
              content: JSON.stringify({
                context: payload.untrustedBusinessContext,
                query: payload.query || "Generate structured operational analysis.",
              }),
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`External LLM service returned HTTP ${response.status}: ${response.statusText}`);
      }

      const responseBody = (await response.json()) as any;
      let rawContent = responseBody?.choices?.[0]?.message?.content ?? responseBody?.output ?? responseBody;

      if (typeof rawContent === "string") {
        try {
          rawContent = JSON.parse(rawContent);
        } catch {
          throw new Error("External LLM response content could not be parsed as JSON.");
        }
      }

      const validation = schemaValidator(rawContent);
      if (!validation.valid) {
        throw new Error(
          `External LLM output validation failed: ${validation.errors?.join("; ") || "Schema mismatch"}`,
        );
      }

      return {
        provider: this.providerName,
        model: this.modelName,
        output: (validation.data ?? rawContent) as T,
        rawResponse: JSON.stringify(rawContent),
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `[AI Fallback] provider=${this.providerName} model=${this.modelName} execution failed (${errorMsg}). Gracefully failing over to deterministic provider.`,
      );
      // Fallback guarantees business continuity without disrupting Trader workflows
      return this.fallbackProvider.generateStructured(payload, schemaValidator);
    }
  }
}

