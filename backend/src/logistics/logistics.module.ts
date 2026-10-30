import { Module } from "@nestjs/common";
import { AuditModule } from "../audit";
import { AuthenticationModule } from "../authentication";
import { DatabaseModule } from "../database";
import { OrganisationsModule } from "../organisations";
import { StorageModule } from "../storage";
import { LogisticsController } from "./logistics.controller";
import { LogisticsService } from "./logistics.service";

@Module({
  imports: [DatabaseModule, AuditModule, AuthenticationModule, OrganisationsModule, StorageModule],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
