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
import { ToolRegistryService } from "./tool-registry.service";

@Injectable()
export class AiApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organisationsRepository: OrganisationsRepository,
    private readonly auditWriter: AuditEventWriter,
    private readonly toolRegistry: ToolRegistryService,
  ) {}

  async listApprovals(userId: string, statusFilter?: string) {
    await this.assertTraderAccess(userId);

    const where: Record<string, any> = {};
    if (statusFilter) {
      where.status = statusFilter;
    }

    const approvals = await this.prisma.approvalRequest.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      include: {
        proposal: {
          include: {
            run: {
              select: {
                id: true,
                agentKey: true,
                promptVersion: true,
                targetResourceType: true,
                targetResourceId: true,
                summary: true,
                confidence: true,
                startedAt: true,
              },
            },
          },
        },
        decidedByUser: {
          select: { id: true, email: true },
        },
      },
    });

    return approvals;
  }

  async getApprovalById(userId: string, approvalId: string) {
    await this.assertTraderAccess(userId);

    const approval = await this.prisma.approvalRequest.findUnique({
      where: { id: approvalId },
      include: {
        proposal: {
          include: {
            run: true,
            toolExecutions: true,
          },
        },
        decidedByUser: {
          select: { id: true, email: true },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/ai/approval-not-found",
        title: "Approval Not Found",
        status: 404,
        detail: `Approval request '${approvalId}' does not exist.`,
      });
    }

    return approval;
  }

  async approve(
    userId: string,
    approvalId: string,
    decisionNote?: string,
  ): Promise<{ status: "APPROVED"; executed: boolean; toolResult?: any }> {
    await this.assertTraderAccess(userId);

    const approval = await this.prisma.approvalRequest.findUnique({
      where: { id: approvalId },
      include: { proposal: { include: { run: true } } },
    });

    if (!approval) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/ai/approval-not-found",
        title: "Approval Not Found",
        status: 404,
        detail: `Approval request '${approvalId}' does not exist.`,
      });
    }

    if (approval.status !== "PENDING") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/ai/approval-already-decided",
        title: "Approval Already Decided",
        status: 400,
        detail: `This request has already been decided with status '${approval.status}'.`,
      });
    }

    const decidedAt = new Date();
    const correlationId = randomUUID();

    // 1. Mark Approval as APPROVED in DB
    await this.prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: "APPROVED",
        decidedByUserId: userId,
        decidedAt,
        decisionNote: decisionNote ?? null,
      },
    });

    await this.prisma.agentProposal.update({
      where: { id: approval.proposalId },
      data: {
        status: "APPROVED",
      },
    });

    // 2. Emit ai.approval.approved
    await this.auditWriter.append({
      eventType: "ai.approval.approved",
      outcome: "succeeded",
      correlationId,
      occurredAt: decidedAt,
      actor: { type: "user", userId },
      target: { type: "ai_approval", id: approvalId },
      metadata: {
        proposalId: approval.proposalId,
        toolKey: approval.proposal.toolKey,
        decisionNote: decisionNote ?? "",
      },
    });

    // 3. Execution Gate: Execute Tool via ToolRegistry
    const executionId = randomUUID();
    const startedAt = new Date();
    let toolResult: any = null;
    let executionSuccess = false;
    let failureCategory: string | undefined;
    let failureReason: string | undefined;

    try {
      const execOutcome = await this.toolRegistry.executeTool(
        approval.proposal.toolKey,
        approval.proposal.structuredPayload,
        {
          runId: approval.runId,
          proposalId: approval.proposalId,
          approvalId,
          actorUserId: userId,
          actorRole: "TRADER",
        },
      );

      executionSuccess = execOutcome.success;
      toolResult = execOutcome.result;
      if (!executionSuccess) {
        failureCategory = execOutcome.failureCategory ?? "EXECUTION_ERROR";
        failureReason = execOutcome.failureReason ?? "Tool execution failed";
      }
    } catch (err: unknown) {
      executionSuccess = false;
      failureCategory = "EXECUTION_EXCEPTION";
      failureReason = err instanceof Error ? err.message : "Tool threw unhandled error";
    }

    const completedAt = new Date();

    // 4. Record ToolExecutionLog
    await this.prisma.toolExecutionLog.create({
      data: {
        id: executionId,
        runId: approval.runId,
        proposalId: approval.proposalId,
        approvalId,
        toolKey: approval.proposal.toolKey,
        actorRole: "TRADER",
        actorUserId: userId,
        safeInputSummary: approval.proposal.structuredPayload as any,
        status: executionSuccess ? "SUCCESS" : "FAILED",
        startedAt,
        completedAt,
        safeResultReference: toolResult ? (toolResult as any) : null,
        failureCategory: failureCategory ?? null,
        failureReason: failureReason ?? null,
      },
    });

    // Update Proposal Status
    await this.prisma.agentProposal.update({
      where: { id: approval.proposalId },
      data: {
        status: executionSuccess ? "EXECUTED" : "EXECUTION_FAILED",
      },
    });

    // 5. Emit Audit Event for Execution
    if (executionSuccess) {
      await this.auditWriter.append({
        eventType: "ai.tool.executed",
        outcome: "succeeded",
        correlationId,
        occurredAt: completedAt,
        actor: { type: "user", userId },
        target: { type: "ai_tool_execution", id: executionId },
        metadata: {
          runId: approval.runId,
          toolKey: approval.proposal.toolKey,
          approvalId,
        },
      });
    } else {
      await this.auditWriter.append({
        eventType: "ai.tool.failed",
        outcome: "failed",
        correlationId,
        occurredAt: completedAt,
        actor: { type: "user", userId },
        target: { type: "ai_tool_execution", id: executionId },
        metadata: {
          runId: approval.runId,
          toolKey: approval.proposal.toolKey,
          failureCategory: failureCategory ?? "UNKNOWN",
          failureReason: failureReason ?? "Execution failed",
        },
      });
    }

    // 6. Check if all proposals for parent run are resolved
    await this.resolveParentRunStatusIfDone(approval.runId);

    return {
      status: "APPROVED",
      executed: executionSuccess,
      toolResult,
    };
  }

  async reject(
    userId: string,
    approvalId: string,
    decisionNote?: string,
  ): Promise<{ status: "REJECTED" }> {
    await this.assertTraderAccess(userId);

    const approval = await this.prisma.approvalRequest.findUnique({
      where: { id: approvalId },
    });

    if (!approval) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/ai/approval-not-found",
        title: "Approval Not Found",
        status: 404,
        detail: `Approval request '${approvalId}' does not exist.`,
      });
    }

    if (approval.status !== "PENDING") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/ai/approval-already-decided",
        title: "Approval Already Decided",
        status: 400,
        detail: `This request has already been decided with status '${approval.status}'.`,
      });
    }

    const decidedAt = new Date();
    const correlationId = randomUUID();

    // 1. Mark Approval as REJECTED in DB
    await this.prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: "REJECTED",
        decidedByUserId: userId,
        decidedAt,
        decisionNote: decisionNote ?? null,
      },
    });

    await this.prisma.agentProposal.update({
      where: { id: approval.proposalId },
      data: {
        status: "REJECTED",
      },
    });

    // 2. Emit ai.approval.rejected
    await this.auditWriter.append({
      eventType: "ai.approval.rejected",
      outcome: "succeeded",
      correlationId,
      occurredAt: decidedAt,
      actor: { type: "user", userId },
      target: { type: "ai_approval", id: approvalId },
      metadata: {
        proposalId: approval.proposalId,
        decisionNote: decisionNote ?? "",
      },
    });

    // 3. Check if all proposals for parent run are resolved
    await this.resolveParentRunStatusIfDone(approval.runId);

    return { status: "REJECTED" };
  }

  private async resolveParentRunStatusIfDone(runId: string): Promise<void> {
    const pendingApprovalsCount = await this.prisma.approvalRequest.count({
      where: {
        runId,
        status: "PENDING",
      },
    });

    if (pendingApprovalsCount === 0) {
      await this.prisma.agentRun.update({
        where: { id: runId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    }
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
        detail: "Only authenticated Trader organisations can view or decide AI approvals.",
      });
    }
  }
}
