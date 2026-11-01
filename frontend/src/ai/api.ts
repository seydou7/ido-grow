import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  AgentRunDetail,
  AgentRunListItem,
  ApprovalRequestItem,
  CreateAgentRunInput,
  EvaluationSummary,
  ToolExecutionLogItem,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class AiRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "AiRequestError";
  }
}

function endpoint(path: string): string {
  return `${getLocalApiBaseUrl(API_BASE_URL)}${path}`;
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(endpoint(path), {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new AiRequestError("The AI platform foundation service is unavailable.");
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let errorMessage = "Unable to process AI platform request.";
  try {
    const errorBody = (await response.json()) as { detail?: string; message?: string };
    errorMessage = errorBody.detail || errorBody.message || errorMessage;
  } catch {
    // Fall back to default message
  }

  throw new AiRequestError(errorMessage, response.status);
}

export async function initiateAgentRun(
  input: CreateAgentRunInput,
): Promise<{ runId: string; status: string; summary?: string; confidence?: number }> {
  const response = await send("/api/v1/ai/runs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseResponse<{ runId: string; status: string; summary?: string; confidence?: number }>(
    response,
  );
}

export async function listAgentRuns(options?: {
  status?: string;
  agentKey?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: AgentRunListItem[]; total: number }> {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.agentKey) params.set("agentKey", options.agentKey);
  if (options?.limit) params.set("limit", options.limit.toString());
  if (options?.offset) params.set("offset", options.offset.toString());

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await send(`/api/v1/ai/runs${query}`, {
    method: "GET",
  });
  return parseResponse<{ items: AgentRunListItem[]; total: number }>(response);
}

export async function getAgentRunById(runId: string): Promise<AgentRunDetail> {
  const response = await send(`/api/v1/ai/runs/${encodeURIComponent(runId)}`, {
    method: "GET",
  });
  return parseResponse<AgentRunDetail>(response);
}

export async function listPendingApprovals(
  statusFilter?: string,
): Promise<ApprovalRequestItem[]> {
  const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
  const response = await send(`/api/v1/ai/approvals${query}`, {
    method: "GET",
  });
  return parseResponse<ApprovalRequestItem[]>(response);
}

export async function getApprovalById(approvalId: string): Promise<ApprovalRequestItem> {
  const response = await send(`/api/v1/ai/approvals/${encodeURIComponent(approvalId)}`, {
    method: "GET",
  });
  return parseResponse<ApprovalRequestItem>(response);
}

export async function approveProposal(
  approvalId: string,
  decisionNote?: string,
): Promise<{
  success: boolean;
  approvalStatus: string;
  proposalStatus: string;
  execution?: ToolExecutionLogItem;
}> {
  const response = await send(`/api/v1/ai/approvals/${encodeURIComponent(approvalId)}/approve`, {
    method: "POST",
    body: JSON.stringify({ decisionNote }),
  });
  return parseResponse<{
    success: boolean;
    approvalStatus: string;
    proposalStatus: string;
    execution?: ToolExecutionLogItem;
  }>(response);
}

export async function rejectProposal(
  approvalId: string,
  decisionNote?: string,
): Promise<{ success: boolean; approvalStatus: string; proposalStatus: string }> {
  const response = await send(`/api/v1/ai/approvals/${encodeURIComponent(approvalId)}/reject`, {
    method: "POST",
    body: JSON.stringify({ decisionNote }),
  });
  return parseResponse<{ success: boolean; approvalStatus: string; proposalStatus: string }>(
    response,
  );
}

export async function getRunExecutions(runId: string): Promise<ToolExecutionLogItem[]> {
  const response = await send(`/api/v1/ai/runs/${encodeURIComponent(runId)}/executions`, {
    method: "GET",
  });
  return parseResponse<ToolExecutionLogItem[]>(response);
}

export async function getEvaluationSummary(): Promise<EvaluationSummary> {
  const response = await send("/api/v1/ai/evaluation/summary", {
    method: "GET",
  });
  return parseResponse<EvaluationSummary>(response);
}
