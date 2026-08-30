import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { DatabaseModule } from "../database";
import { OrganisationsModule } from "../organisations/organisations.module";
import { BuyOrdersController } from "./buy-orders.controller";
import { BuyOrdersRepository } from "./buy-orders.repository";
import { BuyOrdersService } from "./buy-orders.service";
import { PrismaBuyOrdersRepository } from "./prisma-buy-orders.repository";

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    OrganisationsModule,
    AuditModule,
  ],
  controllers: [BuyOrdersController],
  providers: [
    BuyOrdersService,
    {
      provide: BuyOrdersRepository,
      useClass: PrismaBuyOrdersRepository,
    },
  ],
  exports: [BuyOrdersService, BuyOrdersRepository],
})
export class BuyOrdersModule {}
