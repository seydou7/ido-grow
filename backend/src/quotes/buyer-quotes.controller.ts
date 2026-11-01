import {
  Body,
  Controller,
  Get,
  Headers,
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
  QuoteCounterOfferInput,
  QuoteDetail,
  QuoteSummary,
  RejectQuoteInput,
} from "./contracts";
import { QuotesService } from "./quotes.service";

@Controller("buyer/quotes")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class BuyerQuotesController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly quotesService: QuotesService,
  ) {}

  @Get()
  async getBuyerQuotes(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<QuoteSummary[]> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.getBuyerQuotes(identity.userId);
  }

  @Get(":id")
  async getBuyerQuoteById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.getBuyerQuoteById(identity.userId, id);
  }

  @Post(":id/accept")
  async acceptQuote(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.acceptQuoteByBuyer(identity.userId, id);
  }

  @Post(":id/reject")
  async rejectQuote(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() input: RejectQuoteInput,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.rejectQuoteByBuyer(identity.userId, id, input);
  }

  @Post(":id/counter")
  async counterQuote(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() input: QuoteCounterOfferInput,
  ): Promise<QuoteDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.quotesService.counterQuoteByBuyer(identity.userId, id, input);
  }
}
