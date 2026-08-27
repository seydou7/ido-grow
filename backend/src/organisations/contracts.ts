export type SiteSummary = Readonly<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}>;

export type OrganisationSummary = Readonly<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sites: readonly SiteSummary[];
}>;

export type SelfMembership = Readonly<{
  id: string;
  createdAt: string;
  updatedAt: string;
  organisation: OrganisationSummary;
}>;

export type SelfMembershipCollection = Readonly<{
  items: readonly SelfMembership[];
  page: Readonly<{
    nextCursor: null;
    hasMore: false;
  }>;
}>;
