export type SiteSummary = Readonly<{
  id: string;
  organisationId: string;
  name: string;
  facilityType: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  landAreaHectares: number | null;
  createdAt: string;
  updatedAt: string;
}>;

export type OrganisationProfile = Readonly<{
  id: string;
  name: string;
  legalName: string | null;
  organisationType: string;
  businessType: string | null;
  registrationNumber: string | null;
  vatNumber: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  verificationStatus: string;
  completenessPercent: number;
  missingFields: readonly string[];
  createdAt: string;
  updatedAt: string;
  sites: readonly SiteSummary[];
}>;

export type SelfMembership = Readonly<{
  id: string;
  createdAt: string;
  updatedAt: string;
  organisation: OrganisationProfile;
}>;

export type SelfMembershipCollection = Readonly<{
  items: readonly SelfMembership[];
  page: Readonly<{
    nextCursor: null;
    hasMore: false;
  }>;
}>;

export type CreateOrganisationInput = Readonly<{
  name: string;
  legalName?: string | null;
  businessType?: string | null;
  registrationNumber?: string | null;
  vatNumber?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}>;

export type UpdateOrganisationProfileInput = Readonly<{
  name?: string;
  legalName?: string | null;
  businessType?: string | null;
  registrationNumber?: string | null;
  vatNumber?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}>;

export type CreateSiteInput = Readonly<{
  name: string;
  facilityType?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  landAreaHectares?: number | null;
}>;

export type UpdateSiteInput = Readonly<{
  name?: string;
  facilityType?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  landAreaHectares?: number | null;
}>;

export type SiteCollection = Readonly<{
  items: readonly SiteSummary[];
}>;
