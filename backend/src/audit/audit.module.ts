import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database";
import { AuditEventWriter } from "./audit-event.writer";
import { PrismaAuditEventWriter } from "./prisma-audit-event.writer";

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: AuditEventWriter,
      useClass: PrismaAuditEventWriter,
    },
  ],
  exports: [AuditEventWriter],
})
export class AuditModule {}
