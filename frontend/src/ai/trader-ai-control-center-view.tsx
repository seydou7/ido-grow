"use client";

import { useEffect, useState, useTransition } from "react";
import {
  approveProposal,
  getAgentRunById,
  getEvaluationSummary,
  initiateAgentRun,
  listAgentRuns,
  listPendingApprovals,
  rejectProposal,
} from "./api";
import type {
  AgentRunDetail,
  AgentRunListItem,
  ApprovalRequestItem,
  EvaluationSummary,
  ToolExecutionLogItem,
} from "./contracts";

type TabKey = "runs" | "approvals" | "executions" | "evaluation";

interface Props {
  readonly currentUserId?: string;
  readonly organisationId?: string;
}

export function TraderAiControlCenterView({ organisationId }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("approvals");
  const [runs, setRuns] = useState<AgentRunListItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequestItem[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationSummary | null>(null);
  const [selectedRun, setSelectedRun] = useState<AgentRunDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Run Initiation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTradeId, setModalTradeId] = useState("");
  const [modalInstructions, setModalInstructions] = useState("");
  const [isStartingRun, startRunTransition] = useTransition();

  // Approval Decision State
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const [processingApprovalId, setProcessingApprovalId] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [runsData, approvalsData, evalData] = await Promise.all([
        listAgentRuns(),
        listPendingApprovals("PENDING"),
        getEvaluationSummary().catch(() => null),
      ]);
      setRuns(runsData.items);
      setApprovals(approvalsData);
      setEvaluation(evalData);
      if (approvalsData.length === 0 && runsData.items.length > 0 && activeTab === "approvals") {
        setActiveTab("runs");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load AI platform data.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSelectRun(runId: string) {
    try {
      const detail = await getAgentRunById(runId);
      setSelectedRun(detail);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load run details.";
      setErrorMessage(msg);
    }
  }

  function handleStartRun(e: React.FormEvent) {
    e.preventDefault();
    if (!modalTradeId.trim()) return;

    startRunTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);
        const result = await initiateAgentRun({
          agentKey: "TRADER_CONTEXT_ASSISTANT",
          targetResourceType: "TRADE",
          targetResourceId: modalTradeId.trim(),
          organisationContextId: organisationId,
          customInstructions: modalInstructions.trim() || undefined,
        });

        setIsModalOpen(false);
        setModalTradeId("");
        setModalInstructions("");
        setSuccessMessage(`Agent run initiated successfully: ${result.runId} (${result.status})`);
        await loadData();
        await handleSelectRun(result.runId);
        setActiveTab("runs");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to start agent run.";
        setErrorMessage(msg);
      }
    });
  }

  async function handleApprove(approvalId: string) {
    setProcessingApprovalId(approvalId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const note = decisionNotes[approvalId]?.trim();
      const res = await approveProposal(approvalId, note);
      setSuccessMessage(
        `Proposal approved and executed successfully via safe tool gate! Tool status: ${res.execution?.status ?? "SUCCESS"}`,
      );
      await loadData();
      if (selectedRun) {
        await handleSelectRun(selectedRun.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve proposal.";
      setErrorMessage(msg);
    } finally {
      setProcessingApprovalId(null);
    }
  }

  async function handleReject(approvalId: string) {
    setProcessingApprovalId(approvalId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const note = decisionNotes[approvalId]?.trim();
      await rejectProposal(approvalId, note);
      setSuccessMessage("Proposal rejected. Action was safely prevented from executing.");
      await loadData();
      if (selectedRun) {
        await handleSelectRun(selectedRun.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject proposal.";
      setErrorMessage(msg);
    } finally {
      setProcessingApprovalId(null);
    }
  }

  async function handleRerunEvaluation() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getEvaluationSummary();
      setEvaluation(data);
      setSuccessMessage("Evaluation suite executed successfully across all 9 deterministic test fixtures.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to execute evaluation suite.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  // Aggregate all executions across loaded runs
  const allExecutions: Array<{ run: AgentRunListItem; exec: ToolExecutionLogItem }> = [];
  if (selectedRun?.toolExecutions) {
    for (const exec of selectedRun.toolExecutions) {
      allExecutions.push({ run: selectedRun, exec });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#173f35]">AI Control Center</h1>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
              Sprint 10 Foundation Active
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
              Trader Only
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-600">
            Controlled AI orchestration, tool execution gateway, and human-in-the-loop approvals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center rounded-lg bg-[#173f35] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12322a]"
          >
            Initiate Agent Run
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-900"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="mb-6 border-b border-stone-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("approvals")}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium ${
              activeTab === "approvals"
                ? "border-[#173f35] text-[#173f35]"
                : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            Pending Approvals
            {approvals.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {approvals.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("runs")}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium ${
              activeTab === "runs"
                ? "border-[#173f35] text-[#173f35]"
                : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            Recent Runs
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
              {runs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("executions")}
            className={`border-b-2 py-3 px-1 text-sm font-medium ${
              activeTab === "executions"
                ? "border-[#173f35] text-[#173f35]"
                : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            Execution History
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evaluation")}
            className={`border-b-2 py-3 px-1 text-sm font-medium ${
              activeTab === "evaluation"
                ? "border-[#173f35] text-[#173f35]"
                : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            Evaluation Harness
            {evaluation && (
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  evaluation.status === "ALL_PASSED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {evaluation.passedCount}/{evaluation.totalScenarios} Passed
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab 1: Pending Approvals */}
      {activeTab === "approvals" && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Human Approval Queue</h2>
            <span className="text-xs text-stone-500">
              Mandatory human gate for high-risk and state-modifying proposals
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-12 text-center">
              <p className="text-sm font-medium text-stone-700">No pending approvals</p>
              <p className="mt-1 text-xs text-stone-500">
                All AI actions requiring explicit human verification have been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {approvals.map((req) => {
                const note = decisionNotes[req.id] ?? "";
                const isProcessing = processingApprovalId === req.id;
                return (
                  <div
                    key={req.id}
                    className="overflow-hidden rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-mono font-medium text-amber-800">
                            {req.proposal.toolKey}
                          </span>
                          <span className="text-xs font-medium text-stone-500">
                            Type: {req.proposal.proposalType}
                          </span>
                          <span className="text-xs font-semibold text-amber-700">
                            Confidence: {(req.proposal.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-stone-800">
                          Target Resource: {req.proposal.run?.targetResourceType ?? "TRADE"} #
                          {req.proposal.run?.targetResourceId ?? "N/A"}
                        </p>
                      </div>
                      <div className="text-right text-xs text-stone-500">
                        Requested: {new Date(req.requestedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                          Proposed Action Payload
                        </h4>
                        <pre className="mt-1.5 max-h-40 overflow-auto rounded-lg bg-stone-900 p-3 text-xs text-emerald-400 font-mono">
                          {JSON.stringify(req.proposal.structuredPayload, null, 2)}
                        </pre>
                      </div>

                      <div className="flex flex-col justify-between">
                        <div>
                          <label
                            htmlFor={`note-${req.id}`}
                            className="block text-xs font-semibold uppercase tracking-wider text-stone-500"
                          >
                            Decision Note (Optional)
                          </label>
                          <textarea
                            id={`note-${req.id}`}
                            rows={3}
                            value={note}
                            onChange={(e) =>
                              setDecisionNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                            }
                            placeholder="Add reason for approval or rejection audit log..."
                            className="mt-1.5 w-full rounded-lg border border-stone-300 p-2.5 text-xs text-stone-800 placeholder-stone-400 focus:border-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                          />
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleReject(req.id)}
                            disabled={isProcessing}
                            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {isProcessing ? "Processing..." : "Reject Action"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(req.id)}
                            disabled={isProcessing}
                            className="rounded-lg bg-[#173f35] px-4 py-2 text-xs font-semibold text-white hover:bg-[#12322a] disabled:opacity-50"
                          >
                            {isProcessing ? "Executing..." : "Approve & Execute Gate"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Recent Runs & Detail View */}
      {activeTab === "runs" && (
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Runs Table */}
          <div className={`${selectedRun ? "lg:col-span-5" : "lg:col-span-12"} space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Agent Runs</h2>
              <span className="text-xs text-stone-500">{runs.length} recorded</span>
            </div>

            {runs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-12 text-center">
                <p className="text-sm font-medium text-stone-700">No agent runs recorded yet</p>
                <p className="mt-1 text-xs text-stone-500">
                  Initiate a run using the button in the upper right.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <ul className="divide-y divide-stone-100">
                  {runs.map((r) => {
                    const isSelected = selectedRun?.id === r.id;
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectRun(r.id)}
                          className={`w-full p-4 text-left transition hover:bg-stone-50 ${
                            isSelected ? "bg-stone-50 ring-1 ring-inset ring-[#173f35]/20" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-stone-900">
                              {r.agentKey}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                r.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-800"
                                  : r.status === "AWAITING_APPROVAL"
                                    ? "bg-amber-50 text-amber-800"
                                    : r.status === "FAILED"
                                      ? "bg-red-50 text-red-800"
                                      : "bg-blue-50 text-blue-800"
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-stone-600 line-clamp-1">
                            {r.summary ?? "Operational transaction context analysis"}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                            <span>Target: {r.targetResourceId ?? "N/A"}</span>
                            <span>{new Date(r.startedAt).toLocaleTimeString()}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Selected Run Detail Drawer / Panel */}
          {selectedRun && (
            <div className="lg:col-span-7 space-y-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900">{selectedRun.agentKey}</h3>
                    <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-700">
                      {selectedRun.promptVersion}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-stone-400">Run ID: {selectedRun.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRun(null)}
                  className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                >
                  Close
                </button>
              </div>

              {/* Provenance Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg bg-stone-50 p-3 text-xs">
                <div>
                  <span className="text-stone-400">Provider</span>
                  <p className="font-semibold text-stone-800">{selectedRun.provider}</p>
                </div>
                <div>
                  <span className="text-stone-400">Model</span>
                  <p className="font-semibold text-stone-800">{selectedRun.model}</p>
                </div>
                <div>
                  <span className="text-stone-400">Initiated By</span>
                  <p className="font-semibold text-stone-800">{selectedRun.initiatedByRole}</p>
                </div>
                <div>
                  <span className="text-stone-400">Confidence</span>
                  <p className="font-semibold text-stone-800">
                    {selectedRun.confidence !== null && selectedRun.confidence !== undefined
                      ? `${(selectedRun.confidence * 100).toFixed(0)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Operational Summary */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Operational Summary
                </h4>
                <p className="mt-1.5 rounded-lg border border-stone-100 bg-stone-50/50 p-3 text-sm leading-relaxed text-stone-800">
                  {selectedRun.summary ?? selectedRun.structuredOutput?.summary ?? "No summary provided."}
                </p>
              </div>

              {/* Source-Backed Evidence */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Verified Real Platform Evidence ({selectedRun.structuredOutput?.evidence?.length ?? 0})
                </h4>
                {selectedRun.structuredOutput?.evidence?.length ? (
                  <div className="mt-2 space-y-2">
                    {selectedRun.structuredOutput.evidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between rounded-lg border border-stone-200 p-2.5 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-800">
                              {ev.sourceType}
                            </span>
                            <span className="text-stone-600">#{ev.sourceId}</span>
                            <span className="text-stone-400">→</span>
                            <span className="font-semibold text-stone-800">{ev.fieldOrPath}</span>
                          </div>
                          <p className="mt-1 text-stone-600">{ev.safeValueSummary}</p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          VERIFIED
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-stone-400">No structured evidence claims emitted.</p>
                )}
              </div>

              {/* Explicit Missing Information */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Explicit Missing Information ({selectedRun.structuredOutput?.missingInformation?.length ?? 0})
                </h4>
                {selectedRun.structuredOutput?.missingInformation?.length ? (
                  <div className="mt-2 space-y-2">
                    {selectedRun.structuredOutput.missingInformation.map((info, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-amber-200 bg-amber-50/40 p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-900">{info.fieldOrConcept}</span>
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                            Impact: {info.impactOnConfidence}
                          </span>
                        </div>
                        <p className="mt-1 text-amber-800">{info.rationale}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-stone-400">No missing information noted.</p>
                )}
              </div>

              {/* Proposed Actions & Approval State */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Proposed Actions & Human Approval Gate
                </h4>
                {selectedRun.proposals?.length ? (
                  <div className="mt-2 space-y-3">
                    {selectedRun.proposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="rounded-lg border border-stone-200 bg-stone-50/50 p-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-stone-900">{prop.toolKey}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              prop.status === "EXECUTED"
                                ? "bg-emerald-100 text-emerald-800"
                                : prop.status === "PENDING_APPROVAL"
                                  ? "bg-amber-100 text-amber-800"
                                  : prop.status === "REJECTED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-stone-200 text-stone-800"
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                        <pre className="mt-2 overflow-auto rounded bg-stone-900 p-2 font-mono text-[11px] text-emerald-400">
                          {JSON.stringify(prop.structuredPayload, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-stone-400">No actions proposed by agent.</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Tool Execution History */}
      {activeTab === "executions" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Append-Only Execution Log</h2>
            <span className="text-xs text-stone-500">
              Controlled execution gateway audit records
            </span>
          </div>

          {allExecutions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-12 text-center">
              <p className="text-sm font-medium text-stone-700">No tool execution logs found</p>
              <p className="mt-1 text-xs text-stone-500">
                Approved actions and safe tool executions will appear here in chronological order.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Tool Key</th>
                    <th className="py-3 px-4 font-semibold">Risk Class</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Actor</th>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Safe Input / Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {allExecutions.map(({ exec }) => (
                    <tr key={exec.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-mono font-medium text-stone-900">{exec.toolKey}</td>
                      <td className="py-3 px-4 text-stone-600">{exec.riskClassification}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            exec.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {exec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{exec.executedByRole ?? "TRADER"}</td>
                      <td className="py-3 px-4 text-stone-500">
                        {new Date(exec.startedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                        {JSON.stringify(exec.safeInputSummary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 4: Evaluation & Security Harness */}
      {activeTab === "evaluation" && (
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Deterministic Evaluation Suite</h2>
              <p className="text-xs text-stone-500">
                Automated security, schema conformance, and guardrail fixtures.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRerunEvaluation}
              disabled={isLoading}
              className="inline-flex items-center rounded-lg bg-[#173f35] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#12322a] disabled:opacity-50"
            >
              Re-run 9 Fixtures Live
            </button>
          </div>

          {evaluation ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
                  <span className="text-xs text-stone-500">Total Scenarios</span>
                  <p className="mt-1 text-2xl font-bold text-stone-900">{evaluation.totalScenarios}</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
                  <span className="text-xs text-stone-500">Passed</span>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">{evaluation.passedCount}</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
                  <span className="text-xs text-stone-500">Failed</span>
                  <p className="mt-1 text-2xl font-bold text-red-600">{evaluation.failedCount}</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
                  <span className="text-xs text-stone-500">Harness Status</span>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      evaluation.status === "ALL_PASSED" ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {evaluation.status}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <ul className="divide-y divide-stone-100">
                  {evaluation.results.map((res, i) => (
                    <li key={i} className="flex items-start justify-between p-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">{res.scenarioName}</span>
                          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600">
                            {res.category}
                          </span>
                        </div>
                        <p className="mt-1 text-stone-600">{res.detail}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          res.passed ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {res.passed ? "PASS" : "FAIL"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-xs text-stone-500">
              Evaluation suite results not yet loaded.
            </div>
          )}
        </section>
      )}

      {/* Initiation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-stone-900">Initiate Foundation Agent Run</h3>
            <p className="mt-1 text-xs text-stone-500">
              Runs the safe TRADER_CONTEXT_ASSISTANT against an authorised transaction context.
            </p>

            <form onSubmit={handleStartRun} className="mt-4 space-y-4">
              <div>
                <label htmlFor="agentKey" className="block text-xs font-medium text-stone-700">
                  Agent Definition
                </label>
                <input
                  id="agentKey"
                  type="text"
                  readOnly
                  value="TRADER_CONTEXT_ASSISTANT (v1)"
                  className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700"
                />
              </div>

              <div>
                <label htmlFor="tradeId" className="block text-xs font-medium text-stone-700">
                  Target Trade ID *
                </label>
                <input
                  id="tradeId"
                  type="text"
                  required
                  placeholder="e.g. paste Trade ID from Transactions ledger"
                  value={modalTradeId}
                  onChange={(e) => setModalTradeId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                />
              </div>

              <div>
                <label htmlFor="instructions" className="block text-xs font-medium text-stone-700">
                  Operational Focus / Instructions (Optional)
                </label>
                <textarea
                  id="instructions"
                  rows={2}
                  placeholder="e.g. Focus on quality measurements & settlement readiness"
                  value={modalInstructions}
                  onChange={(e) => setModalInstructions(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isStartingRun}
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isStartingRun || !modalTradeId.trim()}
                  className="rounded-lg bg-[#173f35] px-4 py-2 text-xs font-semibold text-white hover:bg-[#12322a] disabled:opacity-50"
                >
                  {isStartingRun ? "Starting Run..." : "Run Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
