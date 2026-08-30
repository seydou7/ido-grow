import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";

import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import type {
  BuyOrderCollection,
  BuyOrderDetail,
  BuyOrderQuery,
  BuyOrderStatus,
  CreateBuyOrderInput,
  TraderDemandCollection,
  UpdateBuyOrderInput,
} from "./contracts";
import { BuyOrdersService } from "./buy-orders.service";

@Controller()
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class BuyOrdersController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly buyOrders: BuyOrdersService,
  ) {}

  @Get("buy-orders/trader/demand")
  async listTraderDemand(
    @Headers("cookie") cookieHeader: string | undefined,
    @Query("materialType") materialType?: string,
    @Query("deliveryCountry") deliveryCountry?: string,
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
  ): Promise<TraderDemandCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const query: BuyOrderQuery = {
      materialType,
      deliveryCountry,
      limit: limitStr ? parseInt(limitStr, 10) : undefined,
      offset: offsetStr ? parseInt(offsetStr, 10) : undefined,
    };

    return this.buyOrders.listTraderDemand(identity.userId, query);
  }

  @Get("buy-orders/trader/buyers")
  async listBuyerOrganisationsForTrader(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<{
    items: Array<{
      id: string;
      name: string;
      country: string | null;
      verificationStatus: string;
    }>;
  }> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.buyOrders.listBuyerOrganisationsForTrader(identity.userId);
  }

  @Get("buy-orders/trader/drafts")
  async listTraderDrafts(
    @Headers("cookie") cookieHeader: string | undefined,
    @Query("materialType") materialType?: string,
    @Query("deliveryCountry") deliveryCountry?: string,
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
  ): Promise<TraderDemandCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const query: BuyOrderQuery = {
      materialType,
      deliveryCountry,
      limit: limitStr ? parseInt(limitStr, 10) : undefined,
      offset: offsetStr ? parseInt(offsetStr, 10) : undefined,
    };

    return this.buyOrders.listTraderDrafts(identity.userId, query);
  }

  @Get("buy-orders")
  async listBuyOrders(
    @Headers("cookie") cookieHeader: string | undefined,
    @Query("buyerOrganisationId") buyerOrganisationId?: string,
    @Query("status") status?: string,
    @Query("materialType") materialType?: string,
    @Query("deliveryCountry") deliveryCountry?: string,
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
  ): Promise<BuyOrderCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const query: BuyOrderQuery = {
      status: status as BuyOrderStatus | undefined,
      materialType,
      deliveryCountry,
      limit: limitStr ? parseInt(limitStr, 10) : undefined,
      offset: offsetStr ? parseInt(offsetStr, 10) : undefined,
    };

    return this.buyOrders.listBuyOrders(
      identity.userId,
      buyerOrganisationId || "",
      query,
    );
  }

  @Get("organisations/:id/buy-orders")
  async listOrganisationBuyOrders(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Query("status") status?: string,
    @Query("materialType") materialType?: string,
  ): Promise<BuyOrderCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const query: BuyOrderQuery = {
      status: status as BuyOrderStatus | undefined,
      materialType,
    };

    return this.buyOrders.listBuyOrders(
      identity.userId,
      organisationId,
      query,
    );
  }

  @Post("buy-orders")
  @HttpCode(HttpStatus.CREATED)
  async createBuyOrder(
    @Headers("cookie") cookieHeader: string | undefined,
    @Query("buyerOrganisationId") queryOrgId: string | undefined,
    @Body() body: CreateBuyOrderInput & { buyerOrganisationId?: string },
  ): Promise<BuyOrderDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const buyerOrganisationId = body.buyerOrganisationId || queryOrgId || "";

    return this.buyOrders.createBuyOrder(
      identity.userId,
      buyerOrganisationId,
      body,
    );
  }

  @Post("organisations/:id/buy-orders")
  @HttpCode(HttpStatus.CREATED)
  async createOrganisationBuyOrder(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Body() body: CreateBuyOrderInput,
  ): Promise<BuyOrderDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.buyOrders.createBuyOrder(
      identity.userId,
      organisationId,
      body,
    );
  }

  @Get("buy-orders/:buyOrderId")
  async getBuyOrder(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("buyOrderId") buyOrderId: string,
  ): Promise<BuyOrderDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.buyOrders.getBuyOrder(identity.userId, buyOrderId);
  }

  @Patch("buy-orders/:buyOrderId")
  async updateBuyOrder(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("buyOrderId") buyOrderId: string,
    @Body() body: UpdateBuyOrderInput,
  ): Promise<BuyOrderDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.buyOrders.updateBuyOrder(
      identity.userId,
      buyOrderId,
      body,
    );
  }

  @Post("buy-orders/:buyOrderId/submit")
  @HttpCode(HttpStatus.OK)
  async submitBuyOrder(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("buyOrderId") buyOrderId: string,
  ): Promise<BuyOrderDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.buyOrders.submitBuyOrder(identity.userId, buyOrderId);
  }

  @Post("buy-orders/:buyOrderId/cancel")
  @HttpCode(HttpStatus.OK)
  async cancelBuyOrder(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("buyOrderId") buyOrderId: string,
  ): Promise<BuyOrderDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.buyOrders.cancelBuyOrder(identity.userId, buyOrderId);
  }

  @Delete("buy-orders/:buyOrderId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBuyOrder(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("buyOrderId") buyOrderId: string,
  ): Promise<void> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    await this.buyOrders.deleteBuyOrder(identity.userId, buyOrderId);
  }
}
