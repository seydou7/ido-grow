import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";

import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import type {
  CreateListingInput,
  ListingCollection,
  ListingSummary,
  UpdateListingInput,
} from "./contracts";
import { ListingsService } from "./listings.service";

@Controller()
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class ListingsController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly listings: ListingsService,
  ) {}

  @Get("organisations/:id/listings")
  async listListings(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
  ): Promise<ListingCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.listings.listListings(identity.userId, organisationId);
  }

  @Get("organisations/:id/listings/:listingId")
  async getListing(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Param("listingId") listingId: string,
  ): Promise<ListingSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.listings.getListing(identity.userId, organisationId, listingId);
  }

  @Post("organisations/:id/listings")
  @HttpCode(HttpStatus.CREATED)
  async createListing(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Body() body: CreateListingInput,
  ): Promise<ListingSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.listings.createListing(identity.userId, organisationId, body);
  }

  @Patch("organisations/:id/listings/:listingId")
  async updateListing(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Param("listingId") listingId: string,
    @Body() body: UpdateListingInput,
  ): Promise<ListingSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.listings.updateListing(
      identity.userId,
      organisationId,
      listingId,
      body,
    );
  }
}
