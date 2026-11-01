import { Injectable } from "@nestjs/common";

import { PrismaService } from "../database";
import type {
  CreateOrganisationInput,
  CreateSiteInput,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "./contracts";
import {
  type ComplianceDocumentRecord,
  type MembershipRecord,
  type OrganisationMemberRecord,
  type OrganisationRecord,
  type SiteRecord,
  OrganisationsRepository,
} from "./organisations.repository";

@Injectable()
export class PrismaOrganisationsRepository extends OrganisationsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMembershipsForUser(userId: string): Promise<MembershipRecord[]> {
    const records = await this.prisma.membership.findMany({
      where: { userId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: {
        organisation: {
          include: {
            sites: {
              orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            },
            complianceDocuments: {
              orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            },
          },
        },
      },
    });

    return records.map(toMembershipRecord);
  }

  async findMembership(
    userId: string,
    organisationId: string,
  ): Promise<MembershipRecord | null> {
    const record = await this.prisma.membership.findUnique({
      where: {
        userId_organisationId: {
          userId,
          organisationId,
        },
      },
      include: {
        organisation: {
          include: {
            sites: {
              orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            },
            complianceDocuments: {
              orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            },
          },
        },
      },
    });

    return record ? toMembershipRecord(record) : null;
  }

  async findOrganisationById(id: string): Promise<OrganisationRecord | null> {
    const record = await this.prisma.organisation.findUnique({
      where: { id },
      include: {
        sites: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
        complianceDocuments: {
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        },
      },
    });

    return record ? toOrganisationRecord(record) : null;
  }

  async createOrganisation(
    userId: string,
    input: CreateOrganisationInput,
  ): Promise<OrganisationRecord> {
    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organisation.create({
        data: {
          name: input.name,
          legalName: input.legalName ?? null,
          organisationType: "SUPPLIER",
          businessType: input.businessType ?? null,
          registrationNumber: input.registrationNumber ?? null,
          vatNumber: input.vatNumber ?? null,
          address: input.address ?? null,
          city: input.city ?? null,
          postalCode: input.postalCode ?? null,
          country: input.country ?? null,
          contactName: input.contactName ?? null,
          contactEmail: input.contactEmail ?? null,
          contactPhone: input.contactPhone ?? null,
          verificationStatus: "PENDING",
        },
      });

      await tx.membership.create({
        data: {
          userId,
          organisationId: org.id,
        },
      });

      return {
        ...org,
        sites: [],
        complianceDocuments: [],
      };
    });
  }

  async updateOrganisationProfile(
    id: string,
    input: UpdateOrganisationProfileInput,
  ): Promise<OrganisationRecord> {
    const updated = await this.prisma.organisation.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.legalName !== undefined && { legalName: input.legalName }),
        ...(input.businessType !== undefined && { businessType: input.businessType }),
        ...(input.registrationNumber !== undefined && { registrationNumber: input.registrationNumber }),
        ...(input.vatNumber !== undefined && { vatNumber: input.vatNumber }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
        ...(input.country !== undefined && { country: input.country }),
        ...(input.contactName !== undefined && { contactName: input.contactName }),
        ...(input.contactEmail !== undefined && { contactEmail: input.contactEmail }),
        ...(input.contactPhone !== undefined && { contactPhone: input.contactPhone }),
      },
      include: {
        sites: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
        complianceDocuments: {
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        },
      },
    });

    return toOrganisationRecord(updated);
  }

  async findSitesByOrganisationId(organisationId: string): Promise<SiteRecord[]> {
    const records = await this.prisma.site.findMany({
      where: { organisationId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return records.map(toSiteRecord);
  }

  async findSiteById(
    organisationId: string,
    siteId: string,
  ): Promise<SiteRecord | null> {
    const record = await this.prisma.site.findFirst({
      where: {
        id: siteId,
        organisationId,
      },
    });

    return record ? toSiteRecord(record) : null;
  }

  async createSite(
    organisationId: string,
    input: CreateSiteInput,
  ): Promise<SiteRecord> {
    const record = await this.prisma.site.create({
      data: {
        organisationId,
        name: input.name,
        facilityType: input.facilityType ?? null,
        address: input.address ?? null,
        city: input.city ?? null,
        postalCode: input.postalCode ?? null,
        country: input.country ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        landAreaHectares: input.landAreaHectares ?? null,
      },
    });

    return toSiteRecord(record);
  }

  async updateSite(
    organisationId: string,
    siteId: string,
    input: UpdateSiteInput,
  ): Promise<SiteRecord> {
    const record = await this.prisma.site.update({
      where: {
        id: siteId,
        organisationId,
      },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.facilityType !== undefined && { facilityType: input.facilityType }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
        ...(input.country !== undefined && { country: input.country }),
        ...(input.latitude !== undefined && { latitude: input.latitude }),
        ...(input.longitude !== undefined && { longitude: input.longitude }),
        ...(input.landAreaHectares !== undefined && { landAreaHectares: input.landAreaHectares }),
      },
    });

    return toSiteRecord(record);
  }

  async findComplianceDocumentsByOrganisationId(organisationId: string): Promise<ComplianceDocumentRecord[]> {
    const records = await this.prisma.complianceDocument.findMany({
      where: { organisationId },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    });

    return records.map(toComplianceDocumentRecord);
  }

  async findComplianceDocumentById(
    organisationId: string,
    documentId: string,
  ): Promise<ComplianceDocumentRecord | null> {
    const record = await this.prisma.complianceDocument.findFirst({
      where: {
        id: documentId,
        organisationId,
      },
    });

    return record ? toComplianceDocumentRecord(record) : null;
  }

  async createComplianceDocument(
    organisationId: string,
    input: {
      documentType: string;
      originalFilename: string;
      storageKey: string;
      mimeType: string;
      fileSize: number;
    },
  ): Promise<ComplianceDocumentRecord> {
    const record = await this.prisma.complianceDocument.create({
      data: {
        organisationId,
        documentType: input.documentType,
        originalFilename: input.originalFilename,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        status: "PENDING_REVIEW",
      },
    });

    return toComplianceDocumentRecord(record);
  }

  async findMembersByOrganisationId(organisationId: string): Promise<OrganisationMemberRecord[]> {
    const records = await this.prisma.membership.findMany({
      where: { organisationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return records.map((r) => ({
      id: r.id,
      userId: r.userId,
      organisationId: r.organisationId,
      userEmail: r.user.email,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async findOrganisationsByType(
    organisationType: string,
  ): Promise<OrganisationRecord[]> {
    const records = await this.prisma.organisation.findMany({
      where: { organisationType },
      include: {
        sites: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
        complianceDocuments: {
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        },
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    return records.map(toOrganisationRecord);
  }
}

function toSiteRecord(record: {
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
}): SiteRecord {
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
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toComplianceDocumentRecord(record: {
  id: string;
  organisationId: string;
  documentType: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): ComplianceDocumentRecord {
  return {
    id: record.id,
    organisationId: record.organisationId,
    documentType: record.documentType,
    originalFilename: record.originalFilename,
    storageKey: record.storageKey,
    mimeType: record.mimeType,
    fileSize: record.fileSize,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toOrganisationRecord(record: {
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
  sites: {
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
  }[];
  complianceDocuments: {
    id: string;
    organisationId: string;
    documentType: string;
    originalFilename: string;
    storageKey: string;
    mimeType: string;
    fileSize: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}): OrganisationRecord {
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
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    sites: record.sites.map(toSiteRecord),
    complianceDocuments: record.complianceDocuments.map(toComplianceDocumentRecord),
  };
}

function toMembershipRecord(record: {
  id: string;
  userId: string;
  organisationId: string;
  createdAt: Date;
  updatedAt: Date;
  organisation: Parameters<typeof toOrganisationRecord>[0];
}): MembershipRecord {
  return {
    id: record.id,
    userId: record.userId,
    organisationId: record.organisationId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    organisation: toOrganisationRecord(record.organisation),
  };
}
