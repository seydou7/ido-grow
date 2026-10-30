import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AuditEventWriter } from "../audit/audit-event.writer";
import { PrismaService } from "../database";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import { AgentRegistryService } from "./agent-registry.service";
import { AiContextRetrieverService } from "./ai-context-retriever.service";
import { AiProvider } from "./ai-provider.interface";
import type {
  CreateAgentRunInput,
  StructuredAiOutputEnvelope,
} from "./contracts";
import { ToolRegistryService } from "./tool-registry.service";

@Injectable()
export class AiOrchestratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organisationsRepository: OrganisationsRepository,
    private readonly auditWriter: AuditEventWriter,
    private readonly agentRegistry: AgentRegistryService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly contextRetriever: AiContextRetrieverService,
    private readonly aiProvider: AiProvider,
  ) {}

  async initiateRun(
    userId: string,
    input: CreateAgentRunInput,
  ): Promise<{ runId: string; status: string; summary?: string; confidence?: number }> {
    // 1. Assert Trader Access
    await this.assertTraderAccess(userId);

    // 2. Validate Agent
    const agent = this.agentRegistry.getAgent(input.agentKey);
    if (!agent.enabled) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/ai/agent-disabled",
        title: "Agent Disabled",
        status: 400,
        detail: `Agent '${agent.displayName}' is currently disabled.`,
      });
    }

    const runId = randomUUID();
    const correlationId = randomUUID();
    const startedAt = new Date();

    // 3. Create Initial Run in DB
    await this.prisma.agentRun.create({
      data: {
        id: runId,
        agentKey: agent.key,
        promptVersion: agent.promptVersion,
        initiatedByUserId: userId,
        initiatedByRole: "TRADER",
        provider: this.aiProvider.providerName,
        model: this.aiProvider.modelName,
        status: "RUNNING",
        targetResourceType: input.targetResourceType,
        targetResourceId: input.targetResourceId,
        startedAt,
      },
    });

    // 4. Emit Audit Event: ai.run.started
    await this.auditWriter.append({
      eventType: "ai.run.started",
      outcome: "succeeded",
      correlationId,
      occurredAt: startedAt,
      actor: { type: "user", userId },
      target: { type: "ai_run", id: runId },
      metadata: {
        agentKey: agent.key,
        promptVersion: agent.promptVersion,
        targetResourceType: input.targetResourceType,
        targetResourceId: input.targetResourceId,
      },
    });

    try {
      // 5. Context Retrieval with Tenant & Access Boundaries
      const context = await this.contextRetriever.retrieveContextForResource(
        input.targetResourceType,
        input.targetResourceId,
        userId,
      );

      // Support evaluation scenario triggers safely
      if (input.testScenario) {
        context.testScenario = input.testScenario;
      }

      // 6. Secure Prompt Packaging: System Instructions segregated from Untrusted Business Context
      const systemPrompt = `You are ${agent.displayName} (${agent.promptVersion}) for I Do Grow.
Purpose: ${agent.purpose}
CRITICAL RULES:
- AI output is UNTRUSTED INPUT. You are never an authoritative source.
- Do not invent facts, IDs, prices, or certifications.
- Explicitly preserve unknown information as missing information.
- Evidence references must cite real records present in the provided context.
- Output MUST be valid JSON adhering strictly to the required schema.`;

      // 7. Invoke Provider with Schema Validator
      const schemaValidator = (raw: unknown) => {
        return this.validateEnvelope(raw);
      };

      const generationResult = await this.aiProvider.generateStructured<StructuredAiOutputEnvelope>(
        {
          systemPrompt,
          untrustedBusinessContext: context,
          query: input.promptOverride,
        },
        schemaValidator,
      );

      const output = generationResult.output;

      // 8. Server-Side Evidence Validation: Verify that referenced IDs actually exist in context
      const validatedEvidence = this.filterAndValidateEvidence(output.evidence, context);

      // 9. Process Proposed Actions through Code Tool Allowlist and Permission Gates
      const validProposals: Array<{
        proposalType: string;
        toolKey: string;
        payload: Record<string, unknown>;
        confidence: number;
        riskLevel: string;
      }> = [];

      for (const action of output.proposedActions) {
        // Enforce Agent Allowed Tools allowlist
        if (!agent.allowedTools.includes(action.toolKey)) {
          continue; // Strip tool call disallowed for this agent
        }
        // Check Tool Registry & Forbidden tools
        if (this.toolRegistry.isForbidden(action.toolKey)) {
          continue; // Strip forbidden tool call
        }
        try {
          const tool = this.toolRegistry.getTool(action.toolKey);
          validProposals.push({
            proposalType: action.proposalType,
            toolKey: action.toolKey,
            payload: action.payload,
            confidence: output.confidence,
            riskLevel: tool.riskClassification,
          });
        } catch {
          // Unregistered tool ignored
        }
      }

      // 10. Persist Proposals and Approval Requests
      let runStatus: "COMPLETED" | "AWAITING_APPROVAL" = "COMPLETED";

      if (validProposals.length > 0) {
        for (const prop of validProposals) {
          const proposalId = randomUUID();
          await this.prisma.agentProposal.create({
            data: {
              id: proposalId,
              runId,
              proposalType: prop.proposalType,
              toolKey: prop.toolKey,
              structuredPayload: prop.payload as any,
              confidence: prop.confidence,
              status: prop.riskLevel === "REQUIRES_APPROVAL" ? "PENDING_APPROVAL" : "PROPOSED",
            },
          });

          await this.auditWriter.append({
            eventType: "ai.proposal.created",
            outcome: "succeeded",
            correlationId,
            occurredAt: new Date(),
            actor: { type: "user", userId },
            target: { type: "ai_proposal", id: proposalId },
            metadata: {
              runId,
              toolKey: prop.toolKey,
              proposalType: prop.proposalType,
              riskLevel: prop.riskLevel,
            },
          });

          if (prop.riskLevel === "REQUIRES_APPROVAL") {
            runStatus = "AWAITING_APPROVAL";
            const approvalId = randomUUID();
            await this.prisma.approvalRequest.create({
              data: {
                id: approvalId,
                proposalId,
                runId,
                requiredRole: "TRADER",
                status: "PENDING",
              },
            });

            await this.auditWriter.append({
              eventType: "ai.approval.requested",
              outcome: "succeeded",
              correlationId,
              occurredAt: new Date(),
              actor: { type: "user", userId },
              target: { type: "ai_approval", id: approvalId },
              metadata: {
                runId,
                proposalId,
                requiredRole: "TRADER",
              },
            });
          }
        }
      }

      // 11. Complete Agent Run Record
      const completedAt = new Date();
      await this.prisma.agentRun.update({
        where: { id: runId },
        data: {
          status: runStatus,
          summary: output.summary,
          confidence: output.confidence,
          structuredOutput: {
            summary: output.summary,
            confidence: output.confidence,
            evidence: validatedEvidence,
            missingInformation: output.missingInformation,
            proposedActions: validProposals,
          } as any,
          completedAt,
        },
      });

      // 12. Emit Audit Event: ai.run.completed
      await this.auditWriter.append({
        eventType: "ai.run.completed",
        outcome: "succeeded",
        correlationId,
        occurredAt: completedAt,
        actor: { type: "user", userId },
        target: { type: "ai_run", id: runId },
        metadata: {
          status: runStatus,
          confidence: String(output.confidence),
          proposalsCount: String(validProposals.length),
        },
      });

      return {
        runId,
        status: runStatus,
        summary: output.summary,
        confidence: output.confidence,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown failure";
      const failureAt = new Date();

      await this.prisma.agentRun.update({
        where: { id: runId },
        data: {
          status: "FAILED",
          failureCategory: "EXECUTION_ERROR",
          failureReason: errorMessage,
          completedAt: failureAt,
        },
      });

      await this.auditWriter.append({
        eventType: "ai.run.failed",
        outcome: "failed",
        correlationId,
        occurredAt: failureAt,
        actor: { type: "user", userId },
        target: { type: "ai_run", id: runId },
        metadata: {
          failureCategory: "EXECUTION_ERROR",
          failureReason: errorMessage,
        },
      });

      throw err;
    }
  }

  async listRuns(
    userId: string,
    filters?: { status?: string; agentKey?: string; limit?: number; offset?: number },
  ) {
    await this.assertTraderAccess(userId);

    const where: Record<string, any> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.agentKey) where.agentKey = filters.agentKey;

    const [total, items] = await Promise.all([
      this.prisma.agentRun.count({ where }),
      this.prisma.agentRun.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 20,
        skip: filters?.offset ?? 0,
        include: {
          proposals: {
            include: { approvalRequests: true },
          },
          initiatedByUser: { select: { email: true, role: true } },
        },
      }),
    ]);

    return { total, items };
  }

  async getRunById(userId: string, runId: string) {
    await this.assertTraderAccess(userId);

    const run = await this.prisma.agentRun.findUnique({
      where: { id: runId },
      include: {
        proposals: {
          include: { approvalRequests: true, toolExecutions: true },
        },
        toolExecutions: true,
        initiatedByUser: { select: { id: true, email: true, role: true } },
      },
    });

    if (!run) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/ai/run-not-found",
        title: "Agent Run Not Found",
        status: 404,
        detail: `Agent Run '${runId}' not found.`,
      });
    }

    return run;
  }

  private validateEnvelope(raw: unknown): {
    valid: boolean;
    data?: StructuredAiOutputEnvelope;
    errors?: string[];
  } {
    const errors: string[] = [];
    if (!raw || typeof raw !== "object") {
      return { valid: false, errors: ["Output must be an object."] };
    }

    const obj = raw as Record<string, any>;
    if (typeof obj.summary !== "string" || obj.summary.trim().length === 0) {
      errors.push("Missing required string field 'summary'.");
    }
    if (typeof obj.confidence !== "number" || obj.confidence < 0 || obj.confidence > 1) {
      errors.push("Field 'confidence' must be a number between 0.0 and 1.0.");
    }
    if (!Array.isArray(obj.evidence)) {
      errors.push("Field 'evidence' must be an array.");
    }
    if (!Array.isArray(obj.missingInformation)) {
      errors.push("Field 'missingInformation' must be an array.");
    }
    if (!Array.isArray(obj.proposedActions)) {
      errors.push("Field 'proposedActions' must be an array.");
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return {
      valid: true,
      data: {
        summary: obj.summary.trim(),
        confidence: obj.confidence,
        evidence: obj.evidence,
        missingInformation: obj.missingInformation,
        proposedActions: obj.proposedActions,
      },
    };
  }

  private filterAndValidateEvidence(
    evidenceList: readonly any[],
    context: Record<string, unknown>,
  ): any[] {
    const validEvidence: any[] = [];
    for (const item of evidenceList) {
      if (!item || typeof item !== "object") continue;
      const sType = String(item.sourceType || "").toLowerCase();
      const sId = String(item.sourceId || "");

      // Check if sourceId exists in context
      let idFound = false;
      if (sType === "trade" && (context.trade as any)?.id === sId) idFound = true;
      if (sType === "contract" && (context.contract as any)?.id === sId) idFound = true;
      if (sType === "inspection" && (context.inspection as any)?.id === sId) idFound = true;
      if (sType === "quality_result" && (context.inspection as any)?.qualityResult?.id === sId) idFound = true;
      if (sType === "shipment" && (context.shipment as any)?.id === sId) idFound = true;
      if (sType === "settlement" && (context.settlement as any)?.id === sId) idFound = true;
      if (sType === "dpp" && (context.dpp as any)?.id === sId) idFound = true;

      if (idFound) {
        validEvidence.push(item);
      }
    }
    return validEvidence;
  }

  private async assertTraderAccess(userId: string): Promise<void> {
    const memberships = await this.organisationsRepository.findMembershipsForUser(userId);
    const isTrader = memberships?.some(
      (m) => m.organisation.organisationType.toUpperCase() === "TRADER",
    );
    if (!isTrader) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/ai/trader-access-required",
        title: "Trader Access Required",
        status: 403,
        detail: "Only authenticated Trader organisations can access AI Platform Foundation.",
      });
    }
  }
}
