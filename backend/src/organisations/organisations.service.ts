import { Injectable } from "@nestjs/common";

import type {
  SelfMembership,
  SelfMembershipCollection,
} from "./contracts";
import {
  type MembershipRecord,
  OrganisationsRepository,
} from "./organisations.repository";

@Injectable()
export class OrganisationsService {
  constructor(private readonly repository: OrganisationsRepository) {}

  async findSelfMemberships(userId: string): Promise<SelfMembershipCollection> {
    const memberships = await this.repository.findMembershipsForUser(userId);

    return {
      items: memberships.map(toSelfMembership),
      page: { nextCursor: null, hasMore: false },
    };
  }
}

function toSelfMembership(record: MembershipRecord): SelfMembership {
  return {
    id: record.id,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    organisation: {
      id: record.organisation.id,
      name: record.organisation.name,
      createdAt: record.organisation.createdAt.toISOString(),
      updatedAt: record.organisation.updatedAt.toISOString(),
      sites: record.organisation.sites.map((site) => ({
        id: site.id,
        name: site.name,
        createdAt: site.createdAt.toISOString(),
        updatedAt: site.updatedAt.toISOString(),
      })),
    },
  };
}
