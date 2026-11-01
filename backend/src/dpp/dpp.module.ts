import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { DatabaseModule } from "../database/database.module";
import { DppController } from "./dpp.controller";
import { DppService } from "./dpp.service";

@Module({
  imports: [DatabaseModule, AuditModule, AuthenticationModule],
  controllers: [DppController],
  providers: [DppService],
  exports: [DppService],
})
export class DppModule {}
