import { Module } from "@nestjs/common";

import { AuthenticationModule } from "./authentication";
import { BuyOrdersModule } from "./buy-orders";
import { ListingsModule } from "./listings";
import { MarketplaceModule } from "./marketplace";
import { MatchingModule } from "./matching/matching.module";
import { QuotesModule } from "./quotes/quotes.module";
import { TradesModule } from "./trades";
import { QualityModule } from "./quality";
import { ContractsModule } from "./contracts";
import { LogisticsModule } from "./logistics";
import { OrganisationsModule } from "./organisations";
import { DppModule } from "./dpp/dpp.module";
import { AiModule } from "./ai";

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
    QualityModule,
    ContractsModule,
    LogisticsModule,
    DppModule,
    AiModule,
  ],
})
export class AppModule {}
