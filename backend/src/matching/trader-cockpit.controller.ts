import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";

import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import type {
  TraderBuyerCollection,
  TraderBuyerDetail,
  TraderCockpitResponse,
  TraderSupplierCollection,
  TraderSupplierDetail,
} from "./contracts";
import { MatchingService } from "./matching.service";

@Controller("trader")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class TraderCockpitController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly matchingService: MatchingService,
  ) {}

  @Get("cockpit")
  async getTraderCockpit(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<TraderCockpitResponse> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.matchingService.getTraderCockpit(identity.userId);
  }

  @Get("suppliers")
  async listSuppliers(
    @Headers("cookie") cookieHeader: string | undefined,
    @Query("search") search?: string,
    @Query("country") country?: string,
    @Query("verificationStatus") verificationStatus?: string,
  ): Promise<TraderSupplierCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.matchingService.listSuppliersForTrader(identity.userId, {
      search,
      country,
      verificationStatus,
    });
  }

  @Get("suppliers/:organisationId")
  async getSupplierDetail(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("organisationId") organisationId: string,
  ): Promise<TraderSupplierDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.matchingService.getSupplierDetailForTrader(
      identity.userId,
      organisationId,
    );
  }

  @Get("buyers")
  async listBuyers(
    @Headers("cookie") cookieHeader: string | undefined,
    @Query("search") search?: string,
    @Query("country") country?: string,
    @Query("verificationStatus") verificationStatus?: string,
  ): Promise<TraderBuyerCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.matchingService.listBuyersForTrader(identity.userId, {
      search,
      country,
      verificationStatus,
    });
  }

  @Get("buyers/:organisationId")
  async getBuyerDetail(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("organisationId") organisationId: string,
  ): Promise<TraderBuyerDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.matchingService.getBuyerDetailForTrader(
      identity.userId,
      organisationId,
    );
  }
}
