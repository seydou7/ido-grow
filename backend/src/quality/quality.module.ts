import { Module } from "@nestjs/common";
import { AuditModule } from "../audit";
import { AuthenticationModule } from "../authentication";
import { DatabaseModule } from "../database";
import { OrganisationsModule } from "../organisations";
import { StorageModule } from "../storage";
import { PrismaQualityRepository } from "./prisma-quality.repository";
import { QualityController } from "./quality.controller";
import { QualityRepository } from "./quality.repository";
import { QualityService } from "./quality.service";

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    OrganisationsModule,
    AuditModule,
    StorageModule,
  ],
  controllers: [QualityController],
  providers: [
    QualityService,
    {
      provide: QualityRepository,
      useClass: PrismaQualityRepository,
    },
  ],
  exports: [QualityService, QualityRepository],
})
export class QualityModule {}
