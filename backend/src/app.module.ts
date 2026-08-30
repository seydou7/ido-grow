import { Module } from "@nestjs/common";

import { AuthenticationModule } from "./authentication";
import { ListingsModule } from "./listings";
import { MarketplaceModule } from "./marketplace";
import { OrganisationsModule } from "./organisations";

@Module({
  imports: [
    AuthenticationModule,
    OrganisationsModule,
    ListingsModule,
    MarketplaceModule,
  ],
})
export class AppModule {}
