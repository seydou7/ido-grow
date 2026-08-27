import type { MembershipRecord } from "./organisations.repository";
import { OrganisationsRepository } from "./organisations.repository";
import { OrganisationsService } from "./organisations.service";

class InMemoryOrganisationsRepository extends OrganisationsRepository {
  readonly membershipsByUser = new Map<string, MembershipRecord[]>();
  requestedUserIds: string[] = [];

  async findMembershipsForUser(userId: string): Promise<MembershipRecord[]> {
    this.requestedUserIds.push(userId);
    return this.membershipsByUser.get(userId) ?? [];
  }
}

describe("OrganisationsService", () => {
  const timestamp = new Date("2026-08-26T12:00:00.000Z");
  let repository: InMemoryOrganisationsRepository;
  let service: OrganisationsService;

  beforeEach(() => {
    repository = new InMemoryOrganisationsRepository();
    service = new OrganisationsService(repository);
  });

  it("returns a valid empty collection for an authenticated user with no memberships", async () => {
    await expect(service.findSelfMemberships("user-with-none")).resolves.toEqual({
      items: [],
      page: { nextCursor: null, hasMore: false },
    });
    expect(repository.requestedUserIds).toEqual(["user-with-none"]);
  });

  it("projects only safe structural membership, organisation, and site fields", async () => {
    repository.membershipsByUser.set("user-a", [
      {
        id: "membership-a",
        createdAt: timestamp,
        updatedAt: timestamp,
        organisation: {
          id: "organisation-a",
          name: "Synthetic Test Organisation",
          createdAt: timestamp,
          updatedAt: timestamp,
          sites: [
            {
              id: "site-a",
              name: "Synthetic Test Site",
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ],
        },
      },
    ]);

    const response = await service.findSelfMemberships("user-a");

    expect(response).toEqual({
      items: [
        {
          id: "membership-a",
          createdAt: timestamp.toISOString(),
          updatedAt: timestamp.toISOString(),
          organisation: {
            id: "organisation-a",
            name: "Synthetic Test Organisation",
            createdAt: timestamp.toISOString(),
            updatedAt: timestamp.toISOString(),
            sites: [
              {
                id: "site-a",
                name: "Synthetic Test Site",
                createdAt: timestamp.toISOString(),
                updatedAt: timestamp.toISOString(),
              },
            ],
          },
        },
      ],
      page: { nextCursor: null, hasMore: false },
    });
    expect(JSON.stringify(response)).not.toMatch(
      /password|session|token|hash|role|permission|authority|activeOrganisation/i,
    );
  });
});
