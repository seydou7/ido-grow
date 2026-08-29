import type {
  CreateOrganisationInput,
  CreateSiteInput,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "./contracts";

export type SiteRecord = Readonly<{
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
  createdAt: Date;
  updatedAt: Date;
}>;

export type OrganisationRecord = Readonly<{
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
  createdAt: Date;
  updatedAt: Date;
  sites: readonly SiteRecord[];
}>;

export type MembershipRecord = Readonly<{
  id: string;
  userId: string;
  organisationId: string;
  createdAt: Date;
  updatedAt: Date;
  organisation: OrganisationRecord;
}>;

export abstract class OrganisationsRepository {
  abstract findMembershipsForUser(userId: string): Promise<MembershipRecord[]>;
  abstract findMembership(userId: string, organisationId: string): Promise<MembershipRecord | null>;
  abstract findOrganisationById(id: string): Promise<OrganisationRecord | null>;
  abstract createOrganisation(userId: string, input: CreateOrganisationInput): Promise<OrganisationRecord>;
  abstract updateOrganisationProfile(id: string, input: UpdateOrganisationProfileInput): Promise<OrganisationRecord>;
  abstract findSitesByOrganisationId(organisationId: string): Promise<SiteRecord[]>;
  abstract findSiteById(organisationId: string, siteId: string): Promise<SiteRecord | null>;
  abstract createSite(organisationId: string, input: CreateSiteInput): Promise<SiteRecord>;
  abstract updateSite(organisationId: string, siteId: string, input: UpdateSiteInput): Promise<SiteRecord>;
}
