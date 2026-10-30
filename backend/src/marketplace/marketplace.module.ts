import { Module } from "@nestjs/common";

import { AuthenticationModule } from "../authentication/authentication.module";
import { DatabaseModule } from "../database/database.module";
import { OrganisationsModule } from "../organisations/organisations.module";
import { MarketplaceController } from "./marketplace.controller";
import { MarketplaceRepository } from "./marketplace.repository";
import { MarketplaceService } from "./marketplace.service";
import { PrismaMarketplaceRepository } from "./prisma-marketplace.repository";

import { PublicMarketplaceController } from "./public-marketplace.controller";
import { PublicMarketplaceService } from "./public-marketplace.service";

@Module({
  imports: [AuthenticationModule, DatabaseModule, OrganisationsModule],
  controllers: [MarketplaceController, PublicMarketplaceController],
  providers: [
    MarketplaceService,
    PublicMarketplaceService,
    {
      provide: MarketplaceRepository,
      useClass: PrismaMarketplaceRepository,
    },
  ],
  exports: [MarketplaceService, PublicMarketplaceService, MarketplaceRepository],
})
export class MarketplaceModule {}
