import { Module } from "@nestjs/common";

import { AuditModule } from "../audit";
import { AuthenticationModule } from "../authentication";
import { DatabaseModule } from "../database";
import { OrganisationsController } from "./organisations.controller";
import { OrganisationsRepository } from "./organisations.repository";
import { OrganisationsService } from "./organisations.service";
import { PrismaOrganisationsRepository } from "./prisma-organisations.repository";

@Module({
  imports: [AuthenticationModule, DatabaseModule, AuditModule],
  controllers: [OrganisationsController],
  providers: [
    OrganisationsService,
    {
      provide: OrganisationsRepository,
      useClass: PrismaOrganisationsRepository,
    },
  ],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
