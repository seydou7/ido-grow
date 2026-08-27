import {
  Controller,
  Get,
  Headers,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";

import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import type { SelfMembershipCollection } from "./contracts";
import { OrganisationsService } from "./organisations.service";

@Controller("memberships")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class OrganisationsController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly organisations: OrganisationsService,
  ) {}

  @Get()
  async findSelfMemberships(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<SelfMembershipCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.findSelfMemberships(identity.userId);
  }
}
