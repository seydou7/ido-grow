import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";
import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import { PrismaService } from "../database";
import { AiApprovalService } from "./ai-approval.service";
import { AiEvaluationService } from "./ai-evaluation.service";
import { AiOrchestratorService } from "./ai-orchestrator.service";
import type { CreateAgentRunInput, DecideApprovalInput } from "./contracts";

@Controller("ai")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class AiController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly orchestrator: AiOrchestratorService,
    private readonly approvalService: AiApprovalService,
    private readonly evaluationService: AiEvaluationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post("runs")
  async initiateRun(
    @Headers("cookie") cookieHeader: string | undefined,
    @Body() body: CreateAgentRunInput,
  ) {
    const identity = await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.orchestrator.initiateRun(identity.userId, body);
  }

  @Get("runs")
  async listRuns(
    @Headers("cookie") cookieHeader: string | undefined,
    @Query("status") status?: string,
    @Query("agentKey") agentKey?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const identity = await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.orchestrator.listRuns(identity.userId, {
      status,
      agentKey,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
      offset: offset ? Number.parseInt(offset, 10) : undefined,
    });
  }

  @Get("runs/:runId")
  async getRunById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("runId") runId: string,
  ) {
    const identity = await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.orchestrator.getRunById(identity.userId, runId);
  }

  @Get("approvals")
  async listApprovals(
    @Headers("cookie") cookieHeader: string | undefined,
    @Query("status") status?: string,
  ) {
    const identity = await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.approvalService.listApprovals(identity.userId, status);
  }

  @Get("approvals/:approvalId")
  async getApprovalById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("approvalId") approvalId: string,
  ) {
    const identity = await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.approvalService.getApprovalById(identity.userId, approvalId);
  }

  @Post("approvals/:approvalId/approve")
  async approveProposal(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("approvalId") approvalId: string,
    @Body() body: DecideApprovalInput,
  ) {
    const identity = await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.approvalService.approve(identity.userId, approvalId, body?.decisionNote);
  }

  @Post("approvals/:approvalId/reject")
  async rejectProposal(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("approvalId") approvalId: string,
    @Body() body: DecideApprovalInput,
  ) {
    const identity = await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.approvalService.reject(identity.userId, approvalId, body?.decisionNote);
  }

  @Get("runs/:runId/executions")
  async getRunExecutions(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("runId") runId: string,
  ) {
    await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.prisma.toolExecutionLog.findMany({
      where: { runId },
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("evaluation/summary")
  async getEvaluationSummary(@Headers("cookie") cookieHeader: string | undefined) {
    await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.evaluationService.runEvaluationSuite();
  }
}
