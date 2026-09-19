import { Module } from "@nestjs/common";

import { AuthenticationModule } from "./authentication";
import { BuyOrdersModule } from "./buy-orders";
import { ListingsModule } from "./listings";
import { MarketplaceModule } from "./marketplace";
import { MatchingModule } from "./matching/matching.module";
import { QuotesModule } from "./quotes/quotes.module";
import { TradesModule } from "./trades";
import { OrganisationsModule } from "./organisations";

@Module({
  imports: [
    AuthenticationModule,
    OrganisationsModule,
    ListingsModule,
    MarketplaceModule,
    BuyOrdersModule,
    MatchingModule,
    QuotesModule,
    TradesModule,
  ],
})
export class AppModule {}
