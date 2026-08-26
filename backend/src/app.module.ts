import { Module } from "@nestjs/common";

import { AuthenticationModule } from "./authentication";

@Module({ imports: [AuthenticationModule] })
export class AppModule {}
