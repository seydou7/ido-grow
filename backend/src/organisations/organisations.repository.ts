export type MembershipRecord = Readonly<{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  organisation: Readonly<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    sites: readonly Readonly<{
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    }>[];
  }>;
}>;

export abstract class OrganisationsRepository {
  abstract findMembershipsForUser(userId: string): Promise<MembershipRecord[]>;
}
