import { Module } from "@nestjs/common";

import { AuditModule } from "../audit";
import { AuthenticationModule } from "../authentication/authentication.module";
import { BuyOrdersModule } from "../buy-orders/buy-orders.module";
import { DatabaseModule } from "../database";
import { OrganisationsModule } from "../organisations/organisations.module";
import { MatchingController } from "./matching.controller";
import { TraderCockpitController } from "./trader-cockpit.controller";
import { MatchingRepository } from "./matching.repository";
import { MatchingService } from "./matching.service";
import { PrismaMatchingRepository } from "./prisma-matching.repository";

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    AuthenticationModule,
    OrganisationsModule,
    BuyOrdersModule,
  ],
  controllers: [MatchingController, TraderCockpitController],
  providers: [
    MatchingService,
    {
      provide: MatchingRepository,
      useClass: PrismaMatchingRepository,
    },
  ],
  exports: [MatchingService, MatchingRepository],
})
export class MatchingModule {}
