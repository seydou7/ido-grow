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
} from "./contracts";

export abstract class QualityRepository {
  abstract ensureDefaultTemplate(): Promise<void>;
  abstract findActiveTemplates(): Promise<InspectionTemplateSummary[]>;
  abstract findTemplateById(id: string): Promise<InspectionTemplateSummary | null>;
  abstract findTemplateByKeyAndVersion(templateKey: string, version: number): Promise<InspectionTemplateSummary | null>;

  abstract createInspection(data: {
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
  }): Promise<InspectionDetail>;

  abstract updateInspection(id: string, data: {
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
  }): Promise<InspectionDetail>;

  abstract findInspectionById(id: string): Promise<InspectionDetail | null>;
  abstract findInspectionsForInspector(inspectorUserId: string): Promise<InspectionSummary[]>;
  abstract findAllInspections(): Promise<InspectionSummary[]>;
  abstract findInspectionsByTradeId(tradeId: string): Promise<InspectionSummary[]>;

  abstract findAssignableInspectors(): Promise<AssignableInspectorSummary[]>;
  abstract findUserById(userId: string): Promise<{ id: string; email: string; role: string | null; isActive: boolean } | null>;
  abstract findTradeById(tradeId: string): Promise<{
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
  } | null>;

  abstract createEvidence(
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
  ): Promise<InspectionEvidenceSummary>;

  abstract findEvidenceById(id: string): Promise<InspectionEvidenceSummary | null>;
  abstract findEvidenceByInspectionId(inspectionId: string): Promise<InspectionEvidenceSummary[]>;

  abstract updateAssessment(id: string, data: {
    assessmentStatus: AssessmentStatus;
    assessmentSummary: string;
    observedIssues?: string | null;
    recommendedFollowUp?: string | null;
    assessedAt: Date;
    assessedByUserId: string;
  }): Promise<InspectionDetail>;

  abstract updatePhysicalInspection(id: string, data: {
    physicalInspectionRequired: boolean;
    physicalInspectionReason: string | null;
  }): Promise<InspectionDetail>;

  abstract createNonConformity(data: {
    inspectionId: string;
    reportedByUserId: string;
    category: string;
    description: string;
    status: NonConformityStatus;
  }): Promise<NonConformitySummary>;

  abstract findNonConformityById(id: string): Promise<NonConformitySummary | null>;
  abstract updateNonConformity(id: string, data: {
    status: NonConformityStatus;
    resolutionNotes: string;
    resolvedAt: Date;
    resolvedByUserId: string;
  }): Promise<NonConformitySummary>;

  abstract findNonConformitiesByInspectionId(inspectionId: string): Promise<NonConformitySummary[]>;

  abstract createQualityResult(
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
  }>;

  abstract findQualityResultByInspectionId(inspectionId: string): Promise<QualityResultSummary | null>;

  abstract createCertificate(data: {
    certificateNumber: string;
    inspectionId: string;
    qualityResultId: string;
    tradeId?: string | null;
    storageKey?: string | null;
    snapshotData: Record<string, unknown>;
    issuedByUserId: string;
    issuedAt: Date;
  }): Promise<InspectionCertificateSummary>;

  abstract findCertificateByInspectionId(inspectionId: string): Promise<InspectionCertificateSummary | null>;
  abstract findCertificateById(id: string): Promise<InspectionCertificateSummary | null>;
}
