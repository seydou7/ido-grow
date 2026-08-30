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
  MarketplaceListingCollection,
  MarketplaceListingDetail,
  MarketplaceQuery,
} from "./contracts";
import { MarketplaceService } from "./marketplace.service";

@Controller("marketplace")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class MarketplaceController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly marketplace: MarketplaceService,
  ) {}

  @Get("listings")
  async listListings(
    @Headers("cookie") cookieHeader: string | undefined,
    @Query("search") search?: string,
    @Query("materialType") materialType?: string,
    @Query("productForm") productForm?: string,
    @Query("originCountry") originCountry?: string,
    @Query("harvestYear") harvestYear?: string,
    @Query("minQuantity") minQuantity?: string,
    @Query("maxQuantity") maxQuantity?: string,
    @Query("quantityUnit") quantityUnit?: string,
    @Query("hasPrice") hasPrice?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("priceUnit") priceUnit?: string,
  ): Promise<MarketplaceListingCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const query: MarketplaceQuery = {
      search: search || undefined,
      materialType: materialType || undefined,
      productForm: productForm || undefined,
      originCountry: originCountry || undefined,
      harvestYear: harvestYear ? Number.parseInt(harvestYear, 10) : undefined,
      minQuantity: minQuantity ? Number.parseFloat(minQuantity) : undefined,
      maxQuantity: maxQuantity ? Number.parseFloat(maxQuantity) : undefined,
      quantityUnit: quantityUnit || undefined,
      hasPrice: hasPrice === "true" ? true : undefined,
      minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
      priceUnit: priceUnit || undefined,
    };

    return this.marketplace.listListings(identity.userId, query);
  }

  @Get("listings/:listingId")
  async getListing(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("listingId") listingId: string,
  ): Promise<MarketplaceListingDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.marketplace.getListing(identity.userId, listingId);
  }
}
