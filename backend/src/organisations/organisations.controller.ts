import {
  Body,
  Controller,
  Get,
  Headers,
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
  CreateOrganisationInput,
  CreateSiteInput,
  OrganisationProfile,
  SelfMembershipCollection,
  SiteCollection,
  SiteSummary,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "./contracts";
import { OrganisationsService } from "./organisations.service";

@Controller()
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class OrganisationsController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly organisations: OrganisationsService,
  ) {}

  @Get("memberships")
  async findSelfMemberships(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<SelfMembershipCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.findSelfMemberships(identity.userId);
  }

  @Get("organisations/:id")
  async getOrganisationProfile(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
  ): Promise<OrganisationProfile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.getOrganisationProfile(identity.userId, organisationId);
  }

  @Post("organisations")
  async createOrganisation(
    @Headers("cookie") cookieHeader: string | undefined,
    @Body() input: CreateOrganisationInput,
  ): Promise<OrganisationProfile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.createOrganisation(identity.userId, input);
  }

  @Patch("organisations/:id")
  async updateOrganisationProfile(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Body() input: UpdateOrganisationProfileInput,
  ): Promise<OrganisationProfile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.updateOrganisationProfile(
      identity.userId,
      organisationId,
      input,
    );
  }

  @Get("organisations/:id/sites")
  async listSites(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
  ): Promise<SiteCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.listSites(identity.userId, organisationId);
  }

  @Get("organisations/:id/sites/:siteId")
  async getSite(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Param("siteId") siteId: string,
  ): Promise<SiteSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.getSite(identity.userId, organisationId, siteId);
  }

  @Post("organisations/:id/sites")
  async createSite(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Body() input: CreateSiteInput,
  ): Promise<SiteSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.createSite(identity.userId, organisationId, input);
  }

  @Patch("organisations/:id/sites/:siteId")
  async updateSite(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Param("siteId") siteId: string,
    @Body() input: UpdateSiteInput,
  ): Promise<SiteSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.updateSite(
      identity.userId,
      organisationId,
      siteId,
      input,
    );
  }
}
