import { Module } from "@nestjs/common";
import { AuditModule } from "../audit";
import { AuthenticationModule } from "../authentication/authentication.module";
import { DatabaseModule } from "../database";
import { OrganisationsModule } from "../organisations/organisations.module";
import { PrismaQuotesRepository } from "./prisma-quotes.repository";
import { QuotesController } from "./quotes.controller";
import { BuyerQuotesController } from "./buyer-quotes.controller";
import { QuotesRepository } from "./quotes.repository";
import { QuotesService } from "./quotes.service";

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    OrganisationsModule,
    AuditModule,
  ],
  controllers: [QuotesController, BuyerQuotesController],
  providers: [
    QuotesService,
    {
      provide: QuotesRepository,
      useClass: PrismaQuotesRepository,
    },
  ],
  exports: [QuotesService, QuotesRepository],
})
export class QuotesModule {}
