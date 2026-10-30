import type { AiGenerationResult, AiPromptPayload } from "./contracts";

export abstract class AiProvider {
  abstract readonly providerName: string;
  abstract readonly modelName: string;

  abstract generateStructured<T>(
    payload: AiPromptPayload,
    schemaValidator: (output: unknown) => { valid: boolean; data?: T; errors?: string[] },
  ): Promise<AiGenerationResult<T>>;
}
