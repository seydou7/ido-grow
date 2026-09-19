import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";
import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import type {
  CreateQuoteInput,
  QuoteDetail,
  ReviseCounterQuoteInput,
  UpdateQuoteInput,
} from "./contracts";
import { QuotesService } from "./quotes.service";

@Controller("quotes")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class QuotesController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly quotesService: QuotesService,
  ) {}

  @Post()
  async createQuote(
    @Headers("cookie") cookieHeader: string | undefined,
    @Body() input: CreateQuoteInput,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.createQuote(identity.userId, input);
  }

  @Get(":id")
  async getQuoteById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.getQuoteById(identity.userId, id);
  }

  @Get("by-match/:matchId")
  async getQuoteByMatchId(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("matchId") matchId: string,
  ): Promise<QuoteDetail | null> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.getQuoteByMatchId(identity.userId, matchId);
  }

  @Put(":id")
  async updateQuote(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() input: UpdateQuoteInput,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.updateQuote(identity.userId, id, input);
  }

  @Post(":id/submit-review")
  async submitForInternalReview(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.submitForInternalReview(identity.userId, id);
  }

  @Post(":id/return-to-draft")
  async returnToDraft(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.returnToDraft(identity.userId, id);
  }

  @Post(":id/send")
  async sendQuote(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.sendQuote(identity.userId, id);
  }

  @Post(":id/revise-counter")
  async reviseCounter(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() input: ReviseCounterQuoteInput,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.reviseCounter(identity.userId, id, input);
  }

}
