
export const MAX_INSPECTION_EVIDENCE_BYTES = 10 * 1024 * 1024; // 10 MB
export type InspectionStatus =
  | "DRAFT"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED";

export type InspectionMethod =
  | "REMOTE"
  | "AI_ASSISTED"
  | "SUPPLIER_SELF_REPORTED"
  | "LOCAL_AGENT_VERIFIED"
  | "INDEPENDENT_PHYSICAL_INSPECTION"
  | "LABORATORY_TESTED";

export type InspectionFieldType =
  | "NUMERIC"
  | "TEXT"
  | "BOOLEAN"
  | "DATE";

export type EvidenceType = "PHOTO" | "DOCUMENT" | "LAB_REPORT";

export type AssessmentStatus = "NOT_ASSESSED" | "ASSESSMENT_RECORDED";

export type NonConformityStatus = "OPEN" | "RESOLVED";

export interface InspectionEvidenceSummary {
  id: string;
  inspectionId: string;
  evidenceType: EvidenceType;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  caption: string | null;
  capturedAt: string | null;
  uploadedByUserId: string;
  createdAt: string;
}

export interface NonConformitySummary {
  id: string;
  inspectionId: string;
  reportedByUserId: string;
  category: string;
  description: string;
  status: NonConformityStatus;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionTemplateField {
  id: string;
  name: string;
  label: string;
  category: "PHYSICAL_PROPERTIES" | "FIBRE_QUALITY" | "CONTAMINATION_STORAGE";
  type: InspectionFieldType;
  unit?: string;
  required: boolean;
  min?: number;
  max?: number;
  description?: string;
  placeholder?: string;
}

export interface InspectionTemplateSummary {
  id: string;
  templateKey: string;
  name: string;
  materialType: string;
  productForm: string | null;
  supportedMethods: string[];
  version: number;
  status: string;
  fields: InspectionTemplateField[];
  photoInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionDetail {
  id: string;
  inspectionReference: string;
  templateId: string;
  templateKey: string;
  templateName: string;
  templateVersion: number;
  templateFields: InspectionTemplateField[];
  tradeId: string | null;
  tradeNumber: string | null;
  listingId: string | null;
  externalLotReference: string | null;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  buyerOrganisation: { id: string; name: string } | null;
  supplierOrganisation: { id: string; name: string };
  assignedInspector: { id: string; email: string; role: string } | null;
  inspectionMethod: string;
  status: InspectionStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  latitude: number | null;
  longitude: number | null;
  measurementMethod: string | null;
  equipmentUsed: string | null;
  inspectorNotes: string | null;
  measurements: Record<string, unknown>;
  assessmentStatus: AssessmentStatus;
  assessmentSummary: string | null;
  observedIssues: string | null;
  recommendedFollowUp: string | null;
  assessedAt: string | null;
  assessedByUserId: string | null;
  physicalInspectionRequired: boolean;
  physicalInspectionReason: string | null;
  evidence: InspectionEvidenceSummary[];
  nonConformities: NonConformitySummary[];
  qualityResult?: QualityResultSummary | null;
  certificate?: InspectionCertificateSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionSummary {
  id: string;
  inspectionReference: string;
  tradeId: string | null;
  tradeNumber: string | null;
  supplierOrganisationName: string;
  buyerOrganisationName: string | null;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  assignedInspectorEmail: string | null;
  inspectionMethod: string;
  status: InspectionStatus;
  assessmentStatus?: AssessmentStatus;
  evidenceCount?: number;
  openNonConformitiesCount?: number;
  physicalInspectionRequired?: boolean;
  qualityDecision?: QualityDecision | null;
  certificateNumber?: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface AssignableInspectorSummary {
  userId: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface CreateInspectionInput {
  tradeId: string;
  templateId?: string;
  inspectionMethod: InspectionMethod;
  externalLotReference?: string;
  scheduledAt?: string;
}

export interface AssignInspectorInput {
  inspectorUserId: string;
  scheduledAt?: string;
}

export interface SaveMeasurementsInput {
  measurements: Record<string, unknown>;
  latitude?: number;
  longitude?: number;
  measurementMethod?: string;
  equipmentUsed?: string;
  inspectorNotes?: string;
}

export interface UploadEvidenceInput {
  evidenceType: EvidenceType;
  caption?: string;
  capturedAt?: string;
}

export interface RecordAssessmentInput {
  assessmentSummary: string;
  observedIssues?: string;
  recommendedFollowUp?: string;
}

export interface CreateNonConformityInput {
  category: string;
  description: string;
}

export interface ResolveNonConformityInput {
  resolutionNotes: string;
}

export interface RequestPhysicalInspectionInput {
  reason: string;
}

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  PHOTO: "Photo Evidence",
  DOCUMENT: "Supporting Document",
  LAB_REPORT: "Laboratory Report",
};

export const ASSESSMENT_STATUS_CONFIG: Record<
  AssessmentStatus,
  { label: string; badgeClass: string }
> = {
  NOT_ASSESSED: {
    label: "Not Assessed",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  ASSESSMENT_RECORDED: {
    label: "Assessment Recorded",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
  },
};

export const NON_CONFORMITY_STATUS_CONFIG: Record<
  NonConformityStatus,
  { label: string; badgeClass: string }
> = {
  OPEN: {
    label: "Non-Conformity Open",
    badgeClass: "bg-red-50 text-red-800 border-red-200",
  },
  RESOLVED: {
    label: "Non-Conformity Resolved",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
};

export const INSPECTION_METHOD_LABELS: Record<InspectionMethod, string> = {
  INDEPENDENT_PHYSICAL_INSPECTION: "Independent Physical Inspection",
  LOCAL_AGENT_VERIFIED: "Local-Agent Verified",
  SUPPLIER_SELF_REPORTED: "Supplier Self-Reported",
  REMOTE: "Remote Assessment",
  LABORATORY_TESTED: "Laboratory Tested",
  AI_ASSISTED: "AI-Assisted Assessment",
};

export const INSPECTION_STATUS_CONFIG: Record<
  InspectionStatus,
  { label: string; badgeClass: string; description: string }
> = {
  DRAFT: {
    label: "Inspection Unassigned",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Inspection created — awaiting inspector assignment",
  },
  ASSIGNED: {
    label: "Inspection Assigned",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    description: "Assigned to inspector — scheduled or ready to start",
  },
  IN_PROGRESS: {
    label: "Inspection In Progress",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
    description: "Inspection started — measurement entry in progress",
  },
  COMPLETED: {
    label: "Inspection Data Complete",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "All required structured measurement data recorded",
  },
};

export type QualityDecision = "APPROVED" | "REJECTED";

export type QualityResultSummary = Readonly<{
  id: string;
  inspectionId: string;
  tradeId: string | null;
  decision: QualityDecision;
  classificationLabel: string;
  decisionNotes: string | null;
  decidedByUserId: string;
  decidedAt: string;
  createdAt: string;
  certificateId?: string | null;
  certificateNumber?: string | null;
}>;

export type InspectionCertificateSummary = Readonly<{
  id: string;
  certificateNumber: string;
  inspectionId: string;
  qualityResultId: string;
  tradeId: string | null;
  storageKey: string | null;
  snapshotData: Record<string, unknown>;
  issuedByUserId: string;
  issuedAt: string;
  createdAt: string;
}>;

export type RecordQualityDecisionInput = Readonly<{
  decision: QualityDecision;
  classificationLabel: string;
  decisionNotes?: string;
}>;
