import { Module } from "@nestjs/common";
import { AuditModule } from "../audit";
import { AuthenticationModule } from "../authentication/authentication.module";
import { DatabaseModule } from "../database";
import { OrganisationsModule } from "../organisations/organisations.module";
import { StorageModule } from "../storage/storage.module";
import { ContractsController } from "./contracts.controller";
import { ContractsRepository } from "./contracts.repository";
import { ContractsService } from "./contracts.service";
import { PrismaContractsRepository } from "./prisma-contracts.repository";

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    OrganisationsModule,
    AuditModule,
    StorageModule,
  ],
  controllers: [ContractsController],
  providers: [
    ContractsService,
    {
      provide: ContractsRepository,
      useClass: PrismaContractsRepository,
    },
  ],
  exports: [ContractsService, ContractsRepository],
})
export class ContractsModule {}
