import { Module } from "@nestjs/common";

import { AuthenticationModule } from "./authentication";
import { ListingsModule } from "./listings";
import { OrganisationsModule } from "./organisations";

@Module({ imports: [AuthenticationModule, OrganisationsModule, ListingsModule] })
export class AppModule {}
