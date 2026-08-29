import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";

import { AuditEventWriter } from "../audit";
import type {
  CreateOrganisationInput,
  CreateSiteInput,
  OrganisationProfile,
  SelfMembership,
  SelfMembershipCollection,
  SiteCollection,
  SiteSummary,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "./contracts";
import {
  type MembershipRecord,
  type OrganisationRecord,
  type SiteRecord,
  OrganisationsRepository,
} from "./organisations.repository";

@Injectable()
export class OrganisationsService {
  constructor(
    private readonly repository: OrganisationsRepository,
    private readonly auditWriter: AuditEventWriter,
  ) {}

  async findSelfMemberships(userId: string): Promise<SelfMembershipCollection> {
    const memberships = await this.repository.findMembershipsForUser(userId);

    return {
      items: memberships.map(toSelfMembership),
      page: { nextCursor: null, hasMore: false },
    };
  }

  async getOrganisationProfile(
    userId: string,
    organisationId: string,
  ): Promise<OrganisationProfile> {
    const membership = await this.repository.findMembership(userId, organisationId);
    if (!membership) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/organisations/membership-required",
        title: "Membership Required",
        status: 403,
        detail: "User is not a member of the requested organisation.",
      });
    }

    return toOrganisationProfile(membership.organisation);
  }

  async createOrganisation(
    userId: string,
    input: CreateOrganisationInput,
  ): Promise<OrganisationProfile> {
    if (!input.name || input.name.trim().length === 0) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/organisations/invalid-input",
        title: "Invalid Organisation Name",
        status: 400,
        detail: "Organisation name cannot be blank.",
      });
    }

    const org = await this.repository.createOrganisation(userId, input);

    await this.auditWriter.append({
      eventType: "organisation.profile.updated",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "organisation", id: org.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: { action: "created" },
    });

    return toOrganisationProfile(org);
  }

  async updateOrganisationProfile(
    userId: string,
    organisationId: string,
    input: UpdateOrganisationProfileInput,
  ): Promise<OrganisationProfile> {
    const membership = await this.repository.findMembership(userId, organisationId);
    if (!membership) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/organisations/membership-required",
        title: "Membership Required",
        status: 403,
        detail: "User is not a member of the requested organisation.",
      });
    }

    const updated = await this.repository.updateOrganisationProfile(
      organisationId,
      input,
    );

    await this.auditWriter.append({
      eventType: "organisation.profile.updated",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "organisation", id: organisationId },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: { action: "updated" },
    });

    return toOrganisationProfile(updated);
  }

  async listSites(
    userId: string,
    organisationId: string,
  ): Promise<SiteCollection> {
    const membership = await this.repository.findMembership(userId, organisationId);
    if (!membership) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/organisations/membership-required",
        title: "Membership Required",
        status: 403,
        detail: "User is not a member of the requested organisation.",
      });
    }

    const sites = await this.repository.findSitesByOrganisationId(organisationId);

    return {
      items: sites.map(toSiteSummary),
    };
  }

  async getSite(
    userId: string,
    organisationId: string,
    siteId: string,
  ): Promise<SiteSummary> {
    const membership = await this.repository.findMembership(userId, organisationId);
    if (!membership) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/organisations/membership-required",
        title: "Membership Required",
        status: 403,
        detail: "User is not a member of the requested organisation.",
      });
    }

    const site = await this.repository.findSiteById(organisationId, siteId);
    if (!site) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/organisations/site-not-found",
        title: "Site Not Found",
        status: 404,
        detail: "The requested site was not found in this organisation.",
      });
    }

    return toSiteSummary(site);
  }

  async createSite(
    userId: string,
    organisationId: string,
    input: CreateSiteInput,
  ): Promise<SiteSummary> {
    const membership = await this.repository.findMembership(userId, organisationId);
    if (!membership) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/organisations/membership-required",
        title: "Membership Required",
        status: 403,
        detail: "User is not a member of the requested organisation.",
      });
    }

    if (!input.name || input.name.trim().length === 0) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/organisations/invalid-input",
        title: "Invalid Site Name",
        status: 400,
        detail: "Site name cannot be blank.",
      });
    }

    const site = await this.repository.createSite(organisationId, input);

    await this.auditWriter.append({
      eventType: "organisation.site.created",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "site", id: site.id },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: { organisationId },
    });

    return toSiteSummary(site);
  }

  async updateSite(
    userId: string,
    organisationId: string,
    siteId: string,
    input: UpdateSiteInput,
  ): Promise<SiteSummary> {
    const membership = await this.repository.findMembership(userId, organisationId);
    if (!membership) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/organisations/membership-required",
        title: "Membership Required",
        status: 403,
        detail: "User is not a member of the requested organisation.",
      });
    }

    const existing = await this.repository.findSiteById(organisationId, siteId);
    if (!existing) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/organisations/site-not-found",
        title: "Site Not Found",
        status: 404,
        detail: "The requested site was not found in this organisation.",
      });
    }

    const updated = await this.repository.updateSite(
      organisationId,
      siteId,
      input,
    );

    await this.auditWriter.append({
      eventType: "organisation.site.updated",
      outcome: "succeeded",
      actor: { type: "user", userId },
      target: { type: "site", id: siteId },
      correlationId: randomUUID(),
      occurredAt: new Date(),
      metadata: { organisationId },
    });

    return toSiteSummary(updated);
  }
}

function calculateCompleteness(org: OrganisationRecord): {
  completenessPercent: number;
  missingFields: string[];
} {
  const missing: string[] = [];

  if (!org.name || org.name.trim().length === 0) missing.push("name");
  if (!org.legalName || org.legalName.trim().length === 0) missing.push("legalName");
  if (!org.businessType || org.businessType.trim().length === 0) missing.push("businessType");
  if (!org.registrationNumber || org.registrationNumber.trim().length === 0) missing.push("registrationNumber");
  if (!org.vatNumber || org.vatNumber.trim().length === 0) missing.push("vatNumber");
  if (!org.address || org.address.trim().length === 0) missing.push("address");
  if (!org.country || org.country.trim().length === 0) missing.push("country");
  if (!org.contactName || org.contactName.trim().length === 0) missing.push("contactName");
  if (!org.contactEmail || org.contactEmail.trim().length === 0) missing.push("contactEmail");
  if (!org.contactPhone || org.contactPhone.trim().length === 0) missing.push("contactPhone");
  if (org.sites.length === 0) missing.push("productionSites");

  const totalChecks = 11;
  const completedChecks = totalChecks - missing.length;
  const completenessPercent = Math.round((completedChecks / totalChecks) * 100);

  return {
    completenessPercent,
    missingFields: missing,
  };
}

function toSiteSummary(record: SiteRecord): SiteSummary {
  return {
    id: record.id,
    organisationId: record.organisationId,
    name: record.name,
    facilityType: record.facilityType,
    address: record.address,
    city: record.city,
    postalCode: record.postalCode,
    country: record.country,
    latitude: record.latitude,
    longitude: record.longitude,
    landAreaHectares: record.landAreaHectares,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function toOrganisationProfile(record: OrganisationRecord): OrganisationProfile {
  const { completenessPercent, missingFields } = calculateCompleteness(record);

  return {
    id: record.id,
    name: record.name,
    legalName: record.legalName,
    organisationType: record.organisationType,
    businessType: record.businessType,
    registrationNumber: record.registrationNumber,
    vatNumber: record.vatNumber,
    address: record.address,
    city: record.city,
    postalCode: record.postalCode,
    country: record.country,
    contactName: record.contactName,
    contactEmail: record.contactEmail,
    contactPhone: record.contactPhone,
    verificationStatus: record.verificationStatus,
    completenessPercent,
    missingFields,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    sites: record.sites.map(toSiteSummary),
  };
}

function toSelfMembership(record: MembershipRecord): SelfMembership {
  return {
    id: record.id,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    organisation: toOrganisationProfile(record.organisation),
  };
}
