export type AgentRunStatus =
  | "QUEUED"
  | "RUNNING"
  | "AWAITING_APPROVAL"
  | "COMPLETED"
  | "FAILED";

export type ProposalStatus =
  | "PROPOSED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTED"
  | "EXECUTION_FAILED";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ToolExecutionStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";

export interface AiEvidenceItem {
  sourceType: string;
  sourceId: string;
  fieldOrPath: string;
  safeValueSummary: string;
  verified?: boolean;
}

export interface AiMissingInformationItem {
  fieldOrConcept: string;
  impactOnConfidence: "LOW" | "MEDIUM" | "HIGH";
  rationale: string;
}

export interface ProposedActionItem {
  proposalType: string;
  toolKey: string;
  payload: Record<string, unknown>;
  confidence: number;
  riskLevel: "READ_ONLY" | "REQUIRES_APPROVAL" | "FORBIDDEN_FOR_AI";
  rationale?: string;
}

export interface StructuredAiOutputEnvelope {
  summary: string;
  confidence: number;
  evidence: AiEvidenceItem[];
  missingInformation: AiMissingInformationItem[];
  proposedActions: ProposedActionItem[];
}

export interface AgentRunListItem {
  id: string;
  agentKey: string;
  promptVersion: string;
  initiatedByUserId: string;
  initiatedByRole: string;
  organisationContextId?: string | null;
  provider: string;
  model: string;
  status: AgentRunStatus;
  targetResourceType?: string | null;
  targetResourceId?: string | null;
  summary?: string | null;
  confidence?: number | null;
  failureCategory?: string | null;
  startedAt: string;
  completedAt?: string | null;
  _count?: {
    proposals: number;
    approvals: number;
    toolExecutions: number;
  };
}

export interface AgentProposalItem {
  id: string;
  runId: string;
  proposalType: string;
  toolKey: string;
  structuredPayload: Record<string, unknown>;
  confidence: number;
  status: ProposalStatus;
  createdAt: string;
  executedAt?: string | null;
  approval?: {
    id: string;
    status: ApprovalStatus;
    requiredRole: string;
    decidedByUserId?: string | null;
    decidedAt?: string | null;
    decisionNote?: string | null;
  } | null;
}

export interface AgentRunDetail extends AgentRunListItem {
  failureReason?: string | null;
  structuredOutput?: StructuredAiOutputEnvelope | null;
  proposals: AgentProposalItem[];
  approvals: ApprovalRequestItem[];
  toolExecutions: ToolExecutionLogItem[];
}

export interface ApprovalRequestItem {
  id: string;
  proposalId: string;
  runId: string;
  requiredRole: string;
  status: ApprovalStatus;
  requestedAt: string;
  decidedByUserId?: string | null;
  decidedAt?: string | null;
  decisionNote?: string | null;
  proposal: {
    id: string;
    proposalType: string;
    toolKey: string;
    structuredPayload: Record<string, unknown>;
    confidence: number;
    status: ProposalStatus;
    run?: {
      id: string;
      agentKey: string;
      promptVersion: string;
      targetResourceType?: string | null;
      targetResourceId?: string | null;
      summary?: string | null;
      confidence?: number | null;
      startedAt: string;
    };
  };
}

export interface ToolExecutionLogItem {
  id: string;
  runId: string;
  proposalId?: string | null;
  approvalId?: string | null;
  toolKey: string;
  riskClassification: string;
  status: ToolExecutionStatus;
  executedByUserId?: string | null;
  executedByRole?: string | null;
  safeInputSummary: Record<string, unknown>;
  safeResultReference?: Record<string, unknown> | null;
  failureCategory?: string | null;
  failureReason?: string | null;
  startedAt: string;
  completedAt?: string | null;
}

export interface EvaluationScenarioResult {
  scenarioName: string;
  category: string;
  passed: boolean;
  detail: string;
}

export interface EvaluationSummary {
  totalScenarios: number;
  passedCount: number;
  failedCount: number;
  status: "ALL_PASSED" | "HAS_FAILURES";
  results: EvaluationScenarioResult[];
  executedAt: string;
}

export interface CreateAgentRunInput {
  agentKey: string;
  targetResourceType: string;
  targetResourceId: string;
  organisationContextId?: string;
  customInstructions?: string;
}
