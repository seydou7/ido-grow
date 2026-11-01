type EvidencePrismaInput = {
  id: string;
  inspectionId: string;
  evidenceType: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  caption?: string | null;
  capturedAt?: Date | null;
  uploadedByUserId: string;
  createdAt: Date;
};

type NonConformityPrismaInput = {
  id: string;
  inspectionId: string;
  reportedByUserId: string;
  category: string;
  description: string;
  status: string;
  resolutionNotes?: string | null;
  resolvedAt?: Date | null;
  resolvedByUserId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

import { Injectable, BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../database";
import { AuditEventDatabaseClient } from "../audit";
import {
  InspectionTemplateSummary,
  InspectionDetail,
  InspectionSummary,
  AssignableInspectorSummary,
  InspectionStatus,
  EvidenceType,
  AssessmentStatus,
  NonConformityStatus,
  InspectionEvidenceSummary,
  NonConformitySummary,
  QualityResultSummary,
  InspectionCertificateSummary,
  QualityDecision,
  InspectionTemplateField,
  HEMP_STRAW_STANDARD_FIELDS,
} from "./contracts";
import { QualityRepository } from "./quality.repository";

@Injectable()
export class PrismaQualityRepository extends QualityRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async ensureDefaultTemplate(): Promise<void> {
    const existing = await this.prisma.inspectionTemplate.findUnique({
      where: {
        templateKey_version: {
          templateKey: "HEMP_STRAW_STANDARD",
          version: 1,
        },
      },
    });

    if (!existing) {
      await this.prisma.inspectionTemplate.create({
        data: {
          templateKey: "HEMP_STRAW_STANDARD",
          name: "European Hemp Straw Quality Inspection Template",
          materialType: "HEMP",
          productForm: "STRAW_RETTED",
          supportedMethods:
            "REMOTE,AI_ASSISTED,SUPPLIER_SELF_REPORTED,LOCAL_AGENT_VERIFIED,INDEPENDENT_PHYSICAL_INSPECTION,LABORATORY_TESTED",
          version: 1,
          status: "ACTIVE",
          fields: HEMP_STRAW_STANDARD_FIELDS as unknown as object,
          photoInstructions: null,
        },
      });
    }
  }

  async findActiveTemplates(): Promise<InspectionTemplateSummary[]> {
    const records = await this.prisma.inspectionTemplate.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    });
    return records.map((r) => this.mapTemplate(r));
  }

  async findTemplateById(id: string): Promise<InspectionTemplateSummary | null> {
    const record = await this.prisma.inspectionTemplate.findUnique({
      where: { id },
    });
    return record ? this.mapTemplate(record) : null;
  }

  async findTemplateByKeyAndVersion(
    templateKey: string,
    version: number,
  ): Promise<InspectionTemplateSummary | null> {
    const record = await this.prisma.inspectionTemplate.findUnique({
      where: {
        templateKey_version: {
          templateKey,
          version,
        },
      },
    });
    return record ? this.mapTemplate(record) : null;
  }

  async createInspection(data: {
    inspectionReference: string;
    templateId: string;
    templateVersion: number;
    tradeId: string;
    listingId?: string | null;
    externalLotReference?: string | null;
    buyerOrganisationId?: string | null;
    supplierOrganisationId: string;
    assignedInspectorUserId?: string | null;
    inspectionMethod: string;
    status: InspectionStatus;
    scheduledAt?: Date | null;
    createdByUserId: string;
  }): Promise<InspectionDetail> {
    const created = await this.prisma.inspection.create({
      data: {
        inspectionReference: data.inspectionReference,
        templateId: data.templateId,
        templateVersion: data.templateVersion,
        tradeId: data.tradeId,
        listingId: data.listingId,
        externalLotReference: data.externalLotReference,
        buyerOrganisationId: data.buyerOrganisationId,
        supplierOrganisationId: data.supplierOrganisationId,
        assignedInspectorUserId: data.assignedInspectorUserId,
        inspectionMethod: data.inspectionMethod,
        status: data.status,
        scheduledAt: data.scheduledAt,
        createdByUserId: data.createdByUserId,
      },
    });

    const full = await this.findInspectionById(created.id);
    if (!full) {
      throw new Error("Failed to retrieve created inspection task.");
    }
    return full;
  }

  async updateInspection(
    id: string,
    data: {
      status?: InspectionStatus;
      assignedInspectorUserId?: string | null;
      scheduledAt?: Date | null;
      startedAt?: Date | null;
      completedAt?: Date | null;
      latitude?: number | null;
      longitude?: number | null;
      measurementMethod?: string | null;
      equipmentUsed?: string | null;
      inspectorNotes?: string | null;
      measurements?: Record<string, unknown>;
    },
  ): Promise<InspectionDetail> {
    await this.prisma.inspection.update({
      where: { id },
      data: {
        status: data.status,
        assignedInspectorUserId: data.assignedInspectorUserId,
        scheduledAt: data.scheduledAt,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        latitude: data.latitude,
        longitude: data.longitude,
        measurementMethod: data.measurementMethod,
        equipmentUsed: data.equipmentUsed,
        inspectorNotes: data.inspectorNotes,
        measurements: data.measurements as unknown as object,
      },
    });

    const full = await this.findInspectionById(id);
    if (!full) {
      throw new Error("Failed to retrieve updated inspection task.");
    }
    return full;
  }

  async findInspectionById(id: string): Promise<InspectionDetail | null> {
    const record = await this.prisma.inspection.findUnique({
      where: { id },
      include: {
        template: true,
        trade: true,
        buyerOrganisation: { select: { id: true, name: true } },
        supplierOrganisation: { select: { id: true, name: true } },
        assignedInspectorUser: { select: { id: true, email: true, role: true } },
        evidence: { orderBy: { createdAt: "desc" } },
        nonConformities: { orderBy: { createdAt: "desc" } },
        qualityResult: {
          include: {
            certificate: {
              select: { id: true, certificateNumber: true },
            },
          },
        },
        certificate: true,
      },
    });

    if (!record) return null;
    return this.mapInspectionDetail(record);
  }

  async findInspectionsForInspector(
    inspectorUserId: string,
  ): Promise<InspectionSummary[]> {
    const records = await this.prisma.inspection.findMany({
      where: { assignedInspectorUserId: inspectorUserId },
      include: {
        trade: true,
        supplierOrganisation: { select: { name: true } },
        buyerOrganisation: { select: { name: true } },
        assignedInspectorUser: { select: { email: true } },
        evidence: { select: { id: true } },
        nonConformities: { select: { id: true, status: true } },
        qualityResult: { select: { decision: true } },
        certificate: { select: { certificateNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((r) => this.mapInspectionSummary(r));
  }

  async findAllInspections(): Promise<InspectionSummary[]> {
    const records = await this.prisma.inspection.findMany({
      include: {
        trade: true,
        supplierOrganisation: { select: { name: true } },
        buyerOrganisation: { select: { name: true } },
        assignedInspectorUser: { select: { email: true } },
        evidence: { select: { id: true } },
        nonConformities: { select: { id: true, status: true } },
        qualityResult: { select: { decision: true } },
        certificate: { select: { certificateNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((r) => this.mapInspectionSummary(r));
  }

  async findInspectionsByTradeId(tradeId: string): Promise<InspectionSummary[]> {
    const records = await this.prisma.inspection.findMany({
      where: { tradeId },
      include: {
        trade: true,
        supplierOrganisation: { select: { name: true } },
        buyerOrganisation: { select: { name: true } },
        assignedInspectorUser: { select: { email: true } },
        evidence: { select: { id: true } },
        nonConformities: { select: { id: true, status: true } },
        qualityResult: { select: { decision: true } },
        certificate: { select: { certificateNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((r) => this.mapInspectionSummary(r));
  }

  async createEvidence(
    data: {
      inspectionId: string;
      evidenceType: EvidenceType;
      originalFilename: string;
      storageKey: string;
      mimeType: string;
      fileSize: number;
      caption?: string | null;
      capturedAt?: Date | null;
      uploadedByUserId: string;
    },
    onAtomicActions?: (
      database: AuditEventDatabaseClient,
      evidence: InspectionEvidenceSummary,
    ) => Promise<void>,
  ): Promise<InspectionEvidenceSummary> {
    return await this.prisma.$transaction(async (tx) => {
      const record = await tx.inspectionEvidence.create({
        data: {
          inspectionId: data.inspectionId,
          evidenceType: data.evidenceType,
          originalFilename: data.originalFilename,
          storageKey: data.storageKey,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
          caption: data.caption || null,
          capturedAt: data.capturedAt || null,
          uploadedByUserId: data.uploadedByUserId,
        },
      });

      const summary = this.mapEvidence(record);

      if (onAtomicActions) {
        await onAtomicActions(tx as unknown as AuditEventDatabaseClient, summary);
      }

      return summary;
    });
  }

  async findEvidenceById(id: string): Promise<InspectionEvidenceSummary | null> {
    const record = await this.prisma.inspectionEvidence.findUnique({
      where: { id },
    });
    return record ? this.mapEvidence(record) : null;
  }

  async findEvidenceByInspectionId(
    inspectionId: string,
  ): Promise<InspectionEvidenceSummary[]> {
    const records = await this.prisma.inspectionEvidence.findMany({
      where: { inspectionId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r) => this.mapEvidence(r));
  }

  async updateAssessment(
    id: string,
    data: {
      assessmentStatus: AssessmentStatus;
      assessmentSummary: string;
      observedIssues?: string | null;
      recommendedFollowUp?: string | null;
      assessedAt: Date;
      assessedByUserId: string;
    },
  ): Promise<InspectionDetail> {
    await this.prisma.inspection.update({
      where: { id },
      data: {
        assessmentStatus: data.assessmentStatus,
        assessmentSummary: data.assessmentSummary,
        observedIssues: data.observedIssues || null,
        recommendedFollowUp: data.recommendedFollowUp || null,
        assessedAt: data.assessedAt,
        assessedByUserId: data.assessedByUserId,
      },
    });

    const updated = await this.findInspectionById(id);
    if (!updated) {
      throw new Error("Failed to reload inspection after assessment update.");
    }
    return updated;
  }

  async updatePhysicalInspection(
    id: string,
    data: {
      physicalInspectionRequired: boolean;
      physicalInspectionReason: string | null;
    },
  ): Promise<InspectionDetail> {
    await this.prisma.inspection.update({
      where: { id },
      data: {
        physicalInspectionRequired: data.physicalInspectionRequired,
        physicalInspectionReason: data.physicalInspectionReason,
      },
    });

    const updated = await this.findInspectionById(id);
    if (!updated) {
      throw new Error("Failed to reload inspection after physical inspection update.");
    }
    return updated;
  }

  async createNonConformity(data: {
    inspectionId: string;
    reportedByUserId: string;
    category: string;
    description: string;
    status: NonConformityStatus;
  }): Promise<NonConformitySummary> {
    const record = await this.prisma.nonConformity.create({
      data: {
        inspectionId: data.inspectionId,
        reportedByUserId: data.reportedByUserId,
        category: data.category,
        description: data.description,
        status: data.status,
      },
    });

    return this.mapNonConformity(record);
  }

  async findNonConformityById(id: string): Promise<NonConformitySummary | null> {
    const record = await this.prisma.nonConformity.findUnique({
      where: { id },
    });
    return record ? this.mapNonConformity(record) : null;
  }

  async updateNonConformity(
    id: string,
    data: {
      status: NonConformityStatus;
      resolutionNotes: string;
      resolvedAt: Date;
      resolvedByUserId: string;
    },
  ): Promise<NonConformitySummary> {
    const record = await this.prisma.nonConformity.update({
      where: { id },
      data: {
        status: data.status,
        resolutionNotes: data.resolutionNotes,
        resolvedAt: data.resolvedAt,
        resolvedByUserId: data.resolvedByUserId,
      },
    });

    return this.mapNonConformity(record);
  }

  async findNonConformitiesByInspectionId(
    inspectionId: string,
  ): Promise<NonConformitySummary[]> {
    const records = await this.prisma.nonConformity.findMany({
      where: { inspectionId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r) => this.mapNonConformity(r));
  }

  async findAssignableInspectors(): Promise<AssignableInspectorSummary[]> {
    const users = await this.prisma.user.findMany({
      where: {
        role: "QUALITY_INSPECTOR",
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { email: "asc" },
    });

    return users.map((u) => ({
      userId: u.id,
      email: u.email,
      role: u.role || "QUALITY_INSPECTOR",
      isActive: u.isActive,
    }));
  }

  async findUserById(
    userId: string,
  ): Promise<{ id: string; email: string; role: string | null; isActive: boolean } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  async findTradeById(tradeId: string): Promise<{
    id: string;
    tradeNumber: string;
    listingId: string;
    buyerOrganisationId: string;
    supplierOrganisationId: string;
    materialType: string;
    productForm: string | null;
    quantity: number;
    quantityUnit: string;
    buyerOrganisation: { id: string; name: string };
    supplierOrganisation: { id: string; name: string };
  } | null> {
    const trade = await this.prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        buyerOrganisation: { select: { id: true, name: true } },
        supplierOrganisation: { select: { id: true, name: true } },
      },
    });

    if (!trade) return null;

    return {
      id: trade.id,
      tradeNumber: trade.tradeNumber,
      listingId: trade.listingId,
      buyerOrganisationId: trade.buyerOrganisationId,
      supplierOrganisationId: trade.supplierOrganisationId,
      materialType: trade.materialType,
      productForm: trade.productForm,
      quantity: trade.quantity,
      quantityUnit: trade.quantityUnit,
      buyerOrganisation: trade.buyerOrganisation,
      supplierOrganisation: trade.supplierOrganisation,
    };
  }

  private mapTemplate(record: {
    id: string;
    templateKey: string;
    name: string;
    materialType: string;
    productForm: string | null;
    supportedMethods: string;
    version: number;
    status: string;
    fields: unknown;
    photoInstructions?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): InspectionTemplateSummary {
    return {
      id: record.id,
      templateKey: record.templateKey,
      name: record.name,
      materialType: record.materialType,
      productForm: record.productForm,
      supportedMethods: record.supportedMethods.split(",").map((m: string) => m.trim()),
      version: record.version,
      status: record.status,
      fields: (record.fields as unknown as InspectionTemplateField[]) || [],
      photoInstructions: record.photoInstructions || null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private mapEvidence(record: EvidencePrismaInput): InspectionEvidenceSummary {
    return {
      id: record.id,
      inspectionId: record.inspectionId,
      evidenceType: record.evidenceType as EvidenceType,
      originalFilename: record.originalFilename,
      storageKey: record.storageKey,
      mimeType: record.mimeType,
      fileSize: record.fileSize,
      caption: record.caption || null,
      capturedAt: record.capturedAt ? record.capturedAt.toISOString() : null,
      uploadedByUserId: record.uploadedByUserId,
      createdAt: record.createdAt.toISOString(),
    };
  }

  private mapNonConformity(record: NonConformityPrismaInput): NonConformitySummary {
    return {
      id: record.id,
      inspectionId: record.inspectionId,
      reportedByUserId: record.reportedByUserId,
      category: record.category,
      description: record.description,
      status: record.status as NonConformityStatus,
      resolutionNotes: record.resolutionNotes || null,
      resolvedAt: record.resolvedAt ? record.resolvedAt.toISOString() : null,
      resolvedByUserId: record.resolvedByUserId || null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private mapInspectionDetail(record: {
    id: string;
    inspectionReference: string;
    templateId: string;
    template?: {
      templateKey: string;
      name: string;
      materialType: string;
      productForm: string | null;
      fields: unknown;
    } | null;
    templateVersion: number;
    tradeId: string | null;
    trade?: {
      tradeNumber: string;
      materialType: string;
      productForm: string | null;
      quantity: number;
      quantityUnit: string;
    } | null;
    listingId: string | null;
    externalLotReference: string | null;
    buyerOrganisation?: { id: string; name: string } | null;
    supplierOrganisation: { id: string; name: string };
    assignedInspectorUser?: { id: string; email: string; role: string | null } | null;
    inspectionMethod: string;
    status: string;
    scheduledAt: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    latitude: number | null;
    longitude: number | null;
    measurementMethod: string | null;
    equipmentUsed: string | null;
    inspectorNotes: string | null;
    measurements: unknown;
    assessmentStatus?: string | null;
    assessmentSummary?: string | null;
    observedIssues?: string | null;
    recommendedFollowUp?: string | null;
    assessedAt?: Date | null;
    assessedByUserId?: string | null;
    physicalInspectionRequired?: boolean | null;
    physicalInspectionReason?: string | null;
    evidence?: EvidencePrismaInput[];
    nonConformities?: NonConformityPrismaInput[];
    qualityResult?: {
      id: string;
      inspectionId: string;
      tradeId: string | null;
      decision: string;
      classificationLabel: string;
      decisionNotes: string | null;
      decidedByUserId: string;
      decidedAt: Date;
      createdAt: Date;
      certificate?: { id: string; certificateNumber: string } | null;
    } | null;
    certificate?: {
      id: string;
      certificateNumber: string;
      inspectionId: string;
      qualityResultId: string;
      tradeId: string | null;
      storageKey: string | null;
      snapshotData: unknown;
      issuedByUserId: string;
      issuedAt: Date;
      createdAt: Date;
    } | null;
    createdAt: Date;
    updatedAt: Date;
  }): InspectionDetail {
    return {
      id: record.id,
      inspectionReference: record.inspectionReference,
      templateId: record.templateId,
      templateKey: record.template?.templateKey || "UNKNOWN",
      templateName: record.template?.name || "Standard Inspection",
      templateVersion: record.templateVersion,
      templateFields:
        (record.template?.fields as unknown as InspectionTemplateField[]) || [],
      tradeId: record.tradeId,
      tradeNumber: record.trade?.tradeNumber || null,
      listingId: record.listingId,
      externalLotReference: record.externalLotReference,
      materialType: record.trade?.materialType || record.template?.materialType || "HEMP",
      productForm: record.trade?.productForm || record.template?.productForm || null,
      quantity: record.trade?.quantity || 0,
      quantityUnit: record.trade?.quantityUnit || "TONNES",
      buyerOrganisation: record.buyerOrganisation
        ? { id: record.buyerOrganisation.id, name: record.buyerOrganisation.name }
        : null,
      supplierOrganisation: {
        id: record.supplierOrganisation.id,
        name: record.supplierOrganisation.name,
      },
      assignedInspector: record.assignedInspectorUser
        ? {
            id: record.assignedInspectorUser.id,
            email: record.assignedInspectorUser.email,
            role: record.assignedInspectorUser.role || "QUALITY_INSPECTOR",
          }
        : null,
      inspectionMethod: record.inspectionMethod,
      status: record.status as InspectionStatus,
      scheduledAt: record.scheduledAt ? record.scheduledAt.toISOString() : null,
      startedAt: record.startedAt ? record.startedAt.toISOString() : null,
      completedAt: record.completedAt ? record.completedAt.toISOString() : null,
      latitude: record.latitude,
      longitude: record.longitude,
      measurementMethod: record.measurementMethod,
      equipmentUsed: record.equipmentUsed,
      inspectorNotes: record.inspectorNotes,
      measurements: (record.measurements as Record<string, unknown>) || {},
      assessmentStatus: (record.assessmentStatus as AssessmentStatus) || "NOT_ASSESSED",
      assessmentSummary: record.assessmentSummary || null,
      observedIssues: record.observedIssues || null,
      recommendedFollowUp: record.recommendedFollowUp || null,
      assessedAt: record.assessedAt ? record.assessedAt.toISOString() : null,
      assessedByUserId: record.assessedByUserId || null,
      physicalInspectionRequired: Boolean(record.physicalInspectionRequired),
      physicalInspectionReason: record.physicalInspectionReason || null,
      evidence: record.evidence ? record.evidence.map((e) => this.mapEvidence(e)) : [],
      nonConformities: record.nonConformities
        ? record.nonConformities.map((nc) => this.mapNonConformity(nc))
        : [],
      qualityResult: record.qualityResult
        ? {
            id: record.qualityResult.id,
            inspectionId: record.qualityResult.inspectionId,
            tradeId: record.qualityResult.tradeId,
            decision: record.qualityResult.decision as QualityDecision,
            classificationLabel: record.qualityResult.classificationLabel,
            decisionNotes: record.qualityResult.decisionNotes,
            decidedByUserId: record.qualityResult.decidedByUserId,
            decidedAt: record.qualityResult.decidedAt.toISOString(),
            createdAt: record.qualityResult.createdAt.toISOString(),
            certificateId:
              record.qualityResult.certificate?.id || record.certificate?.id || null,
            certificateNumber:
              record.qualityResult.certificate?.certificateNumber ||
              record.certificate?.certificateNumber ||
              null,
          }
        : null,
      certificate: record.certificate
        ? {
            id: record.certificate.id,
            certificateNumber: record.certificate.certificateNumber,
            inspectionId: record.certificate.inspectionId,
            qualityResultId: record.certificate.qualityResultId,
            tradeId: record.certificate.tradeId,
            storageKey: record.certificate.storageKey,
            snapshotData: record.certificate.snapshotData as Record<string, unknown>,
            issuedByUserId: record.certificate.issuedByUserId,
            issuedAt: record.certificate.issuedAt.toISOString(),
            createdAt: record.certificate.createdAt.toISOString(),
          }
        : null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private mapInspectionSummary(record: {
    id: string;
    inspectionReference: string;
    tradeId: string | null;
    trade?: {
      tradeNumber: string;
      materialType: string;
      productForm: string | null;
      quantity: number;
      quantityUnit: string;
    } | null;
    supplierOrganisation?: { name: string } | null;
    buyerOrganisation?: { name: string } | null;
    assignedInspectorUser?: { email: string } | null;
    inspectionMethod: string;
    status: string;
    assessmentStatus?: string | null;
    physicalInspectionRequired?: boolean | null;
    evidence?: Array<{ id: string }>;
    nonConformities?: Array<{ id: string; status: string }>;
    qualityResult?: { decision: string } | null;
    certificate?: { certificateNumber: string } | null;
    scheduledAt: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
  }): InspectionSummary {
    const openNonConformities = record.nonConformities
      ? record.nonConformities.filter((nc) => nc.status === "OPEN").length
      : 0;

    return {
      id: record.id,
      inspectionReference: record.inspectionReference,
      tradeId: record.tradeId,
      tradeNumber: record.trade?.tradeNumber || null,
      supplierOrganisationName: record.supplierOrganisation?.name || "Unknown Supplier",
      buyerOrganisationName: record.buyerOrganisation?.name || null,
      materialType: record.trade?.materialType || "HEMP",
      productForm: record.trade?.productForm || null,
      quantity: record.trade?.quantity || 0,
      quantityUnit: record.trade?.quantityUnit || "TONNES",
      assignedInspectorEmail: record.assignedInspectorUser?.email || null,
      inspectionMethod: record.inspectionMethod,
      status: record.status as InspectionStatus,
      assessmentStatus: (record.assessmentStatus as AssessmentStatus) || "NOT_ASSESSED",
      evidenceCount: record.evidence?.length ?? 0,
      openNonConformitiesCount: openNonConformities,
      physicalInspectionRequired: Boolean(record.physicalInspectionRequired),
      qualityDecision: (record.qualityResult?.decision as QualityDecision) || null,
      certificateNumber: record.certificate?.certificateNumber || null,
      scheduledAt: record.scheduledAt ? record.scheduledAt.toISOString() : null,
      startedAt: record.startedAt ? record.startedAt.toISOString() : null,
      completedAt: record.completedAt ? record.completedAt.toISOString() : null,
      createdAt: record.createdAt.toISOString(),
    };
  }

  async createQualityResult(
    data: {
      inspectionId: string;
      tradeId?: string | null;
      decision: QualityDecision;
      classificationLabel: string;
      decisionNotes?: string | null;
      decidedByUserId: string;
      decidedAt: Date;
    },
    certificateData?: {
      certificateNumber: string;
      storageKey: string | null;
      snapshotData: Record<string, unknown>;
      issuedByUserId: string;
      issuedAt: Date;
    },
    onAtomicActions?: (
      database: AuditEventDatabaseClient,
      context: {
        qualityResult: QualityResultSummary;
        certificate?: InspectionCertificateSummary;
      },
    ) => Promise<void>,
  ): Promise<{
    qualityResult: QualityResultSummary;
    certificate?: InspectionCertificateSummary;
  }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
      // Concurrency protection: check if already decided inside transaction
      const existing = await tx.qualityResult.findUnique({
        where: { inspectionId: data.inspectionId },
        include: { certificate: true },
      });

      if (existing) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/quality/result-already-exists",
          title: "Quality Decision Immutable",
          status: 400,
          detail: "A final quality decision has already been recorded for this inspection and is immutable.",
        });
      }

      const qrRecord = await tx.qualityResult.create({
        data: {
          inspectionId: data.inspectionId,
          tradeId: data.tradeId || null,
          decision: data.decision,
          classificationLabel: data.classificationLabel,
          decisionNotes: data.decisionNotes || null,
          decidedByUserId: data.decidedByUserId,
          decidedAt: data.decidedAt,
        },
      });

      let certSummary: InspectionCertificateSummary | undefined;

      if (certificateData) {
        const certRecord = await tx.inspectionCertificate.create({
          data: {
            certificateNumber: certificateData.certificateNumber,
            inspectionId: data.inspectionId,
            qualityResultId: qrRecord.id,
            tradeId: data.tradeId || null,
            storageKey: certificateData.storageKey,
            snapshotData: certificateData.snapshotData as object,
            issuedByUserId: certificateData.issuedByUserId,
            issuedAt: certificateData.issuedAt,
          },
        });

        certSummary = {
          id: certRecord.id,
          certificateNumber: certRecord.certificateNumber,
          inspectionId: certRecord.inspectionId,
          qualityResultId: certRecord.qualityResultId,
          tradeId: certRecord.tradeId,
          storageKey: certRecord.storageKey,
          snapshotData: certRecord.snapshotData as Record<string, unknown>,
          issuedByUserId: certRecord.issuedByUserId,
          issuedAt: certRecord.issuedAt.toISOString(),
          createdAt: certRecord.createdAt.toISOString(),
        };
      }

      const qrSummary: QualityResultSummary = {
        id: qrRecord.id,
        inspectionId: qrRecord.inspectionId,
        tradeId: qrRecord.tradeId,
        decision: qrRecord.decision as QualityDecision,
        classificationLabel: qrRecord.classificationLabel,
        decisionNotes: qrRecord.decisionNotes,
        decidedByUserId: qrRecord.decidedByUserId,
        decidedAt: qrRecord.decidedAt.toISOString(),
        createdAt: qrRecord.createdAt.toISOString(),
        certificateId: certSummary?.id || null,
        certificateNumber: certSummary?.certificateNumber || null,
      };

      if (onAtomicActions) {
        await onAtomicActions(tx as unknown as AuditEventDatabaseClient, {
          qualityResult: qrSummary,
          certificate: certSummary,
        });
      }

      return {
        qualityResult: qrSummary,
        certificate: certSummary,
      };
    });
    } catch (error: unknown) {
      const err = error as { code?: string; meta?: { target?: unknown }; message?: string };
      if (
        err?.code === "P2002" ||
        (err?.message && err.message.includes("Unique constraint failed"))
      ) {
        const metaTarget = err.meta?.target;
        const targetStr = Array.isArray(metaTarget)
          ? metaTarget.join(",")
          : typeof metaTarget === "string"
            ? metaTarget
            : "";
        const combined = `${targetStr} ${err.message || ""}`;

        if (
          combined.includes("certificateNumber") ||
          combined.includes("InspectionCertificate_certificateNumber_key")
        ) {
          throw new ConflictException({
            type: "https://errors.idogrow.com/quality/certificate-reference-collision",
            title: "Certificate Reference Collision",
            status: 409,
            detail: "A certificate with this reference number already exists. Collision detected.",
          });
        }

        throw new BadRequestException({
          type: "https://errors.idogrow.com/quality/result-already-exists",
          title: "Quality Decision Immutable",
          status: 400,
          detail: "A final quality decision has already been recorded for this inspection and is immutable.",
        });
      }
      throw error;
    }
  }

  async findQualityResultByInspectionId(inspectionId: string): Promise<QualityResultSummary | null> {
    const record = await this.prisma.qualityResult.findUnique({
      where: { inspectionId },
      include: { certificate: true },
    });
    if (!record) return null;

    return {
      id: record.id,
      inspectionId: record.inspectionId,
      tradeId: record.tradeId,
      decision: record.decision as QualityDecision,
      classificationLabel: record.classificationLabel,
      decisionNotes: record.decisionNotes,
      decidedByUserId: record.decidedByUserId,
      decidedAt: record.decidedAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
      certificateId: record.certificate?.id || null,
      certificateNumber: record.certificate?.certificateNumber || null,
    };
  }

  async createCertificate(data: {
    certificateNumber: string;
    inspectionId: string;
    qualityResultId: string;
    tradeId?: string | null;
    storageKey?: string | null;
    snapshotData: Record<string, unknown>;
    issuedByUserId: string;
    issuedAt: Date;
  }): Promise<InspectionCertificateSummary> {
    const record = await this.prisma.inspectionCertificate.create({
      data: {
        certificateNumber: data.certificateNumber,
        inspectionId: data.inspectionId,
        qualityResultId: data.qualityResultId,
        tradeId: data.tradeId || null,
        storageKey: data.storageKey || null,
        snapshotData: data.snapshotData as object,
        issuedByUserId: data.issuedByUserId,
        issuedAt: data.issuedAt,
      },
    });

    return {
      id: record.id,
      certificateNumber: record.certificateNumber,
      inspectionId: record.inspectionId,
      qualityResultId: record.qualityResultId,
      tradeId: record.tradeId,
      storageKey: record.storageKey,
      snapshotData: record.snapshotData as Record<string, unknown>,
      issuedByUserId: record.issuedByUserId,
      issuedAt: record.issuedAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async findCertificateByInspectionId(inspectionId: string): Promise<InspectionCertificateSummary | null> {
    const record = await this.prisma.inspectionCertificate.findUnique({
      where: { inspectionId },
    });
    if (!record) return null;

    return {
      id: record.id,
      certificateNumber: record.certificateNumber,
      inspectionId: record.inspectionId,
      qualityResultId: record.qualityResultId,
      tradeId: record.tradeId,
      storageKey: record.storageKey,
      snapshotData: record.snapshotData as Record<string, unknown>,
      issuedByUserId: record.issuedByUserId,
      issuedAt: record.issuedAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async findCertificateById(id: string): Promise<InspectionCertificateSummary | null> {
    const record = await this.prisma.inspectionCertificate.findUnique({
      where: { id },
    });
    if (!record) return null;

    return {
      id: record.id,
      certificateNumber: record.certificateNumber,
      inspectionId: record.inspectionId,
      qualityResultId: record.qualityResultId,
      tradeId: record.tradeId,
      storageKey: record.storageKey,
      snapshotData: record.snapshotData as Record<string, unknown>,
      issuedByUserId: record.issuedByUserId,
      issuedAt: record.issuedAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }
}
