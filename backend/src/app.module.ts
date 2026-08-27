import { Module } from "@nestjs/common";

import { AuthenticationModule } from "./authentication";
import { OrganisationsModule } from "./organisations";

@Module({ imports: [AuthenticationModule, OrganisationsModule] })
export class AppModule {}
