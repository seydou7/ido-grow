import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Res,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";

import { AuthenticationNoStoreInterceptor } from "./authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "./authentication-problem";
import { AuthenticationService } from "./authentication.service";
import { readSessionToken } from "./cookie";
import { parseLoginCredentials } from "./credentials";
import { assertAllowedStateChangingOrigin } from "./request-origin";
import {
  clearSessionCookieOptions,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "./runtime-config";

type CookieResponse = {
  cookie(
    name: string,
    value: string,
    options: ReturnType<typeof sessionCookieOptions>,
  ): void;
  clearCookie(
    name: string,
    options: ReturnType<typeof clearSessionCookieOptions>,
  ): void;
};

@Controller("auth")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class AuthenticationController {
  constructor(private readonly authentication: AuthenticationService) {}

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() body: unknown,
    @Headers("origin") origin: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    assertAllowedStateChangingOrigin(origin);
    const credentials = parseLoginCredentials(body);
    const result = await this.authentication.login(
      credentials.email,
      credentials.password,
    );

    response.cookie(SESSION_COOKIE_NAME, result.rawToken, sessionCookieOptions());
    return result.response;
  }

  @Get("session")
  session(@Headers("cookie") cookieHeader: string | undefined) {
    return this.authentication.session(readSessionToken(cookieHeader));
  }

  @Post("logout")
  @HttpCode(204)
  async logout(
    @Headers("cookie") cookieHeader: string | undefined,
    @Headers("origin") origin: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<void> {
    assertAllowedStateChangingOrigin(origin);
    await this.authentication.logout(readSessionToken(cookieHeader));

    response.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions());
  }
}
