import {
  Controller,
  Get,
  Param,
  Query,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";

import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import type {
  PublicMarketplaceListingCollection,
  PublicMarketplaceListingDetail,
  PublicMarketplaceQuery,
} from "./public-marketplace.contracts";
import { PublicMarketplaceService } from "./public-marketplace.service";

@Controller("public/marketplace")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class PublicMarketplaceController {
  constructor(private readonly marketplace: PublicMarketplaceService) {}

  @Get()
  async listPublicListings(
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
    @Query("hasCertifications") hasCertifications?: string,
    @Query("hasQualityApproved") hasQualityApproved?: string,
    @Query("hasDpp") hasDpp?: string,
    @Query("sort") sort?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ): Promise<PublicMarketplaceListingCollection> {
    const query: PublicMarketplaceQuery = {
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
      hasCertifications: hasCertifications === "true" ? true : undefined,
      hasQualityApproved: hasQualityApproved === "true" ? true : undefined,
      hasDpp: hasDpp === "true" ? true : undefined,
      sort: sort || undefined,
      page: page ? Number.parseInt(page, 10) : undefined,
      pageSize: pageSize ? Number.parseInt(pageSize, 10) : undefined,
    };

    return this.marketplace.listPublicListings(query);
  }

  @Get(":listingId")
  async getPublicListing(
    @Param("listingId") listingId: string,
  ): Promise<PublicMarketplaceListingDetail> {
    return this.marketplace.getPublicListing(listingId);
  }
}
