import { Module } from "@nestjs/common";

import { AuditModule } from "../audit";
import { AuthenticationModule } from "../authentication";
import { DatabaseModule } from "../database";
import { OrganisationsModule } from "../organisations";
import { ListingsController } from "./listings.controller";
import { ListingsRepository } from "./listings.repository";
import { ListingsService } from "./listings.service";
import { PrismaListingsRepository } from "./prisma-listings.repository";

@Module({
  imports: [
    AuthenticationModule,
    DatabaseModule,
    AuditModule,
    OrganisationsModule,
  ],
  controllers: [ListingsController],
  providers: [
    ListingsService,
    {
      provide: ListingsRepository,
      useClass: PrismaListingsRepository,
    },
  ],
  exports: [ListingsService],
})
export class ListingsModule {}
