import { Module } from "@nestjs/common";

import { AuditModule } from "../audit";
import { DatabaseModule } from "../database";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationNoStoreInterceptor } from "./authentication-no-store.interceptor";
import { AuthenticationRepository } from "./authentication.repository";
import { AuthenticationService } from "./authentication.service";
import { Clock } from "./clock";
import { PasswordHasher } from "./password-hasher";
import { PrismaAuthenticationRepository } from "./prisma-authentication.repository";
import { SessionTokenService } from "./session-token";

@Module({
  imports: [AuditModule, DatabaseModule],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    AuthenticationNoStoreInterceptor,
    PasswordHasher,
    SessionTokenService,
    Clock,
    {
      provide: AuthenticationRepository,
      useClass: PrismaAuthenticationRepository,
    },
  ],
  exports: [AuthenticationService, AuthenticationNoStoreInterceptor],
})
export class AuthenticationModule {}
