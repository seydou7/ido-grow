import { Module } from "@nestjs/common";
import { AuthenticationModule } from "../authentication";
import { DatabaseModule } from "../database";
import { OrganisationsModule } from "../organisations";
import { BuyerTradesController, TraderTradesController } from "./trades.controller";
import { TradesService } from "./trades.service";

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    OrganisationsModule,
  ],
  controllers: [TraderTradesController, BuyerTradesController],
  providers: [TradesService],
  exports: [TradesService],
})
export class TradesModule {}
