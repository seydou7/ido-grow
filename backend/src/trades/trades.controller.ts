import {
  Controller,
  Get,
  Headers,
  Param,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";
import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import type {
  TradeCollection,
  TradeDetail,
} from "./trades.contracts";
import { TradesService } from "./trades.service";

@Controller("trader/trades")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class TraderTradesController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly tradesService: TradesService,
  ) {}

  @Get()
  async getTraderTrades(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<TradeCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.tradesService.getTradesForTrader(identity.userId);
  }

  @Get(":id")
  async getTraderTradeById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<TradeDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.tradesService.getTradeDetailForTrader(identity.userId, id);
  }
}

@Controller("buyer/trades")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class BuyerTradesController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly tradesService: TradesService,
  ) {}

  @Get()
  async getBuyerTrades(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<TradeCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.tradesService.getTradesForBuyer(identity.userId);
  }

  @Get(":id")
  async getBuyerTradeById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<TradeDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.tradesService.getTradeDetailForBuyer(identity.userId, id);
  }
}
