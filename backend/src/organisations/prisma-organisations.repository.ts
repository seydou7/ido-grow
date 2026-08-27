import { Injectable } from "@nestjs/common";

import { PrismaService } from "../database";
import {
  type MembershipRecord,
  OrganisationsRepository,
} from "./organisations.repository";

@Injectable()
export class PrismaOrganisationsRepository extends OrganisationsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findMembershipsForUser(userId: string): Promise<MembershipRecord[]> {
    return this.prisma.membership.findMany({
      where: { userId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        organisation: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            sites: {
              orderBy: [{ createdAt: "asc" }, { id: "asc" }],
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });
  }
}
