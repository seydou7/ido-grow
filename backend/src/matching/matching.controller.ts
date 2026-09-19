import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";

import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import type {
  ApproveMatchInput,
  CancelMatchInput,
  MatchingWorkspace,
  MatchSummary,
  SelectMatchInput,
} from "./contracts";
import { MatchingService } from "./matching.service";

@Controller("matching")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class MatchingController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly matchingService: MatchingService,
  ) {}

  @Get("buy-orders/:buyOrderId/workspace")
  async getMatchingWorkspace(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("buyOrderId") buyOrderId: string,
  ): Promise<MatchingWorkspace> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.matchingService.getMatchingWorkspace(
      identity.userId,
      buyOrderId,
    );
  }

  @Post("buy-orders/:buyOrderId/matches")
  @HttpCode(HttpStatus.OK)
  async selectCandidateAsMatch(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("buyOrderId") buyOrderId: string,
    @Body() body: SelectMatchInput,
  ): Promise<MatchSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.matchingService.selectCandidateAsMatch(
      identity.userId,
      buyOrderId,
      body,
    );
  }

  @Post("matches/:matchId/approve")
  @HttpCode(HttpStatus.OK)
  async approveMatch(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("matchId") matchId: string,
    @Body() body: ApproveMatchInput,
  ): Promise<MatchSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.matchingService.approveMatch(identity.userId, matchId, body);
  }

  @Post("matches/:matchId/cancel")
  @HttpCode(HttpStatus.OK)
  async cancelMatch(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("matchId") matchId: string,
    @Body() body: CancelMatchInput,
  ): Promise<MatchSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.matchingService.cancelMatch(identity.userId, matchId, body);
  }
}
