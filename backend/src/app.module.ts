import { Module } from "@nestjs/common";

import { AuthenticationModule } from "./authentication";
import { BuyOrdersModule } from "./buy-orders";
import { ListingsModule } from "./listings";
import { MarketplaceModule } from "./marketplace";
import { OrganisationsModule } from "./organisations";

@Module({
  imports: [
    AuthenticationModule,
    OrganisationsModule,
    ListingsModule,
    MarketplaceModule,
    BuyOrdersModule,
  ],
})
export class AppModule {}
