import { Module } from "@nestjs/common";

import { AuthenticationModule } from "../authentication/authentication.module";
import { DatabaseModule } from "../database/database.module";
import { OrganisationsModule } from "../organisations/organisations.module";
import { MarketplaceController } from "./marketplace.controller";
import { MarketplaceRepository } from "./marketplace.repository";
import { MarketplaceService } from "./marketplace.service";
import { PrismaMarketplaceRepository } from "./prisma-marketplace.repository";

@Module({
  imports: [AuthenticationModule, DatabaseModule, OrganisationsModule],
  controllers: [MarketplaceController],
  providers: [
    MarketplaceService,
    {
      provide: MarketplaceRepository,
      useClass: PrismaMarketplaceRepository,
    },
  ],
  exports: [MarketplaceService, MarketplaceRepository],
})
export class MarketplaceModule {}
