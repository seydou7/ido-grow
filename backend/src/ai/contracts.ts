export type RiskClassification =
  | "READ_ONLY"
  | "REQUIRES_APPROVAL"
  | "FORBIDDEN_FOR_AI";

export type AgentRunStatus =
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "AWAITING_APPROVAL"
  | "FAILED";

export type AgentProposalStatus =
  | "PROPOSED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTED"
  | "EXECUTION_FAILED";

export type ApprovalRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type ToolExecutionStatus =
  | "SUCCESS"
  | "FAILED";

export type InformationStatus =
  | "SOURCE_BACKED"
  | "INFERRED"
  | "MISSING";

export interface AiEvidenceItem {
  readonly sourceType: string;
  readonly sourceId: string;
  readonly fieldPath: string;
  readonly safeValue: string;
}

export interface AiMissingInformationItem {
  readonly field: string;
  readonly reason: string;
  readonly status: InformationStatus;
}

export interface AiProposedAction {
  readonly toolKey: string;
  readonly proposalType: string;
  readonly payload: Record<string, unknown>;
  readonly riskLevel: RiskClassification;
  readonly rationale: string;
}

export interface StructuredAiOutputEnvelope {
  readonly summary: string;
  readonly confidence: number;
  readonly evidence: readonly AiEvidenceItem[];
  readonly missingInformation: readonly AiMissingInformationItem[];
  readonly proposedActions: readonly AiProposedAction[];
}

export interface AgentDefinition {
  readonly key: string;
  readonly displayName: string;
  readonly purpose: string;
  readonly promptVersion: string;
  readonly enabled: boolean;
  readonly allowedTools: readonly string[];
  readonly restrictedActions: readonly string[];
  readonly requiredContext: readonly string[];
  readonly confidencePolicy: {
    readonly minConfidenceForProposal: number;
  };
  readonly escalationPolicy: {
    readonly requireHumanApproval: boolean;
  };
}

export interface ToolExecutionContext {
  readonly runId: string;
  readonly proposalId?: string;
  readonly approvalId?: string;
  readonly actorUserId: string;
  readonly actorRole: string;
}

export interface ToolExecutionResult {
  readonly success: boolean;
  readonly result?: Record<string, unknown>;
  readonly failureCategory?: string;
  readonly failureReason?: string;
}

export interface ToolDefinition {
  readonly key: string;
  readonly purpose: string;
  readonly allowedRoles: readonly string[];
  readonly riskClassification: RiskClassification;
  readonly requiresApproval: boolean;
  readonly validateInput: (params: unknown) => { valid: boolean; error?: string };
  readonly execute: (
    params: any,
    context: ToolExecutionContext,
  ) => Promise<ToolExecutionResult>;
}

export interface AiPromptPayload {
  readonly systemPrompt: string;
  readonly developerInstructions?: string;
  readonly untrustedBusinessContext: Record<string, unknown>;
  readonly query?: string;
}

export interface AiGenerationResult<T> {
  readonly provider: string;
  readonly model: string;
  readonly output: T;
  readonly rawResponse?: string;
}

export interface CreateAgentRunInput {
  readonly agentKey: string;
  readonly targetResourceType: string;
  readonly targetResourceId: string;
  readonly promptOverride?: string;
  readonly testScenario?: string;
}

export interface DecideApprovalInput {
  readonly decisionNote?: string;
}

export interface EvaluationScenarioResult {
  readonly scenarioName: string;
  readonly category: string;
  readonly passed: boolean;
  readonly detail: string;
}

export interface EvaluationSummary {
  readonly providerName: string;
  readonly modelName: string;
  readonly totalScenarios: number;
  readonly passedScenarios: number;
  readonly failedScenarios: number;
  readonly timestamp: string;
  readonly results: readonly EvaluationScenarioResult[];
}
