
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

export type InspectionEvidenceSummary = Readonly<{
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
}>;

export type NonConformitySummary = Readonly<{
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
}>;

export type InspectionTemplateField = Readonly<{
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
}>;

export type InspectionTemplateSummary = Readonly<{
  id: string;
  templateKey: string;
  name: string;
  materialType: string;
  productForm: string | null;
  supportedMethods: readonly string[];
  version: number;
  status: string;
  fields: readonly InspectionTemplateField[];
  photoInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type InspectionTemplateCollection = Readonly<{
  items: readonly InspectionTemplateSummary[];
}>;

export type InspectionDetail = Readonly<{
  id: string;
  inspectionReference: string;
  templateId: string;
  templateKey: string;
  templateName: string;
  templateVersion: number;
  templateFields: readonly InspectionTemplateField[];
  tradeId: string | null;
  tradeNumber: string | null;
  listingId: string | null;
  externalLotReference: string | null;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  buyerOrganisation: Readonly<{ id: string; name: string }> | null;
  supplierOrganisation: Readonly<{ id: string; name: string }>;
  assignedInspector: Readonly<{ id: string; email: string; role: string }> | null;
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
  evidence: readonly InspectionEvidenceSummary[];
  nonConformities: readonly NonConformitySummary[];
  qualityResult: QualityResultSummary | null;
  certificate: InspectionCertificateSummary | null;
  createdAt: string;
  updatedAt: string;
}>;

export type InspectionSummary = Readonly<{
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
  assessmentStatus: AssessmentStatus;
  evidenceCount: number;
  openNonConformitiesCount: number;
  physicalInspectionRequired: boolean;
  qualityDecision: QualityDecision | null;
  certificateNumber: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}>;

export type InspectionCollection = Readonly<{
  items: readonly InspectionSummary[];
}>;

export type AssignableInspectorSummary = Readonly<{
  userId: string;
  email: string;
  role: string;
  isActive: boolean;
}>;

export type AssignableInspectorCollection = Readonly<{
  items: readonly AssignableInspectorSummary[];
}>;

export type CreateInspectionInput = Readonly<{
  tradeId: string;
  templateId?: string;
  inspectionMethod: InspectionMethod;
  externalLotReference?: string;
  scheduledAt?: string;
}>;

export type AssignInspectorInput = Readonly<{
  inspectorUserId: string;
  scheduledAt?: string;
}>;

export type SaveMeasurementsInput = Readonly<{
  measurements: Record<string, unknown>;
  latitude?: number;
  longitude?: number;
  measurementMethod?: string;
  equipmentUsed?: string;
  inspectorNotes?: string;
}>;

export type UploadEvidenceInput = Readonly<{
  evidenceType: EvidenceType;
  caption?: string;
  capturedAt?: string;
}>;

export type RecordAssessmentInput = Readonly<{
  assessmentSummary: string;
  observedIssues?: string;
  recommendedFollowUp?: string;
}>;

export type CreateNonConformityInput = Readonly<{
  category: string;
  description: string;
}>;

export type ResolveNonConformityInput = Readonly<{
  resolutionNotes: string;
}>;

export type RequestPhysicalInspectionInput = Readonly<{
  reason: string;
}>;

export const HEMP_STRAW_STANDARD_FIELDS: readonly InspectionTemplateField[] = [
  {
    id: "moisturePercentage",
    name: "moisturePercentage",
    label: "Moisture Percentage",
    category: "PHYSICAL_PROPERTIES",
    type: "NUMERIC",
    unit: "%",
    min: 0,
    max: 100,
    required: true,
    description: "Core moisture measurement percentage (technical range 0-100%).",
    placeholder: "e.g. 14.5",
  },
  {
    id: "baleDimensions",
    name: "baleDimensions",
    label: "Bale Dimensions",
    category: "PHYSICAL_PROPERTIES",
    type: "TEXT",
    unit: "cm",
    required: true,
    description: "Measured bale dimensions (Length x Width x Height in cm).",
    placeholder: "e.g. 120 x 120 x 240 cm",
  },
  {
    id: "estimatedBaleWeight",
    name: "estimatedBaleWeight",
    label: "Estimated Bale Weight",
    category: "PHYSICAL_PROPERTIES",
    type: "NUMERIC",
    unit: "kg",
    min: 0,
    required: true,
    description: "Sampled or calculated average bale weight in kilograms.",
    placeholder: "e.g. 380",
  },
  {
    id: "rettingQuality",
    name: "rettingQuality",
    label: "Retting Quality Assessment",
    category: "FIBRE_QUALITY",
    type: "TEXT",
    required: true,
    description: "Qualitative evaluation of retting progress, fibre separation, and stem condition.",
    placeholder: "e.g. Uniform retting, easy peel from hurd core",
  },
  {
    id: "colour",
    name: "colour",
    label: "Colour Observation",
    category: "FIBRE_QUALITY",
    type: "TEXT",
    required: true,
    description: "Visual straw and fibre coloration description.",
    placeholder: "e.g. Light blonde to pale brown",
  },
  {
    id: "consistency",
    name: "consistency",
    label: "Batch Consistency",
    category: "FIBRE_QUALITY",
    type: "TEXT",
    required: true,
    description: "Observed uniformity across sampled bales in the lot.",
    placeholder: "e.g. Highly consistent throughout batch",
  },
  {
    id: "contamination",
    name: "contamination",
    label: "Contamination Notes",
    category: "CONTAMINATION_STORAGE",
    type: "TEXT",
    required: true,
    description: "Observation of foreign weeds, plastics, or non-hemp materials.",
    placeholder: "e.g. Clean, trace weed stems only",
  },
  {
    id: "mouldIndicators",
    name: "mouldIndicators",
    label: "Mould Indicators Present",
    category: "CONTAMINATION_STORAGE",
    type: "BOOLEAN",
    required: true,
    description: "Indication whether visual mould, spores, or musty odour are present.",
  },
  {
    id: "soilOrStoneContamination",
    name: "soilOrStoneContamination",
    label: "Soil or Stone Contamination Present",
    category: "CONTAMINATION_STORAGE",
    type: "BOOLEAN",
    required: true,
    description: "Indication whether soil clumps or field stones are embedded in bales.",
  },
  {
    id: "storageConditions",
    name: "storageConditions",
    label: "Storage Conditions",
    category: "CONTAMINATION_STORAGE",
    type: "TEXT",
    required: true,
    description: "Description of on-site storage environment.",
    placeholder: "e.g. Dry enclosed barn, concrete floor, tarp covered",
  },
  {
    id: "harvestDate",
    name: "harvestDate",
    label: "Harvest Date",
    category: "PHYSICAL_PROPERTIES",
    type: "DATE",
    required: true,
    description: "Reported or verified harvest date (YYYY-MM-DD).",
    placeholder: "YYYY-MM-DD",
  },
  {
    id: "baleIntegrity",
    name: "baleIntegrity",
    label: "Bale Integrity Assessment",
    category: "PHYSICAL_PROPERTIES",
    type: "TEXT",
    required: true,
    description: "Physical structural integrity of bales, compaction, and string condition.",
    placeholder: "e.g. Firm rectangular compaction, intact sisal twine",
  },
  {
    id: "fibreToHurdIndication",
    name: "fibreToHurdIndication",
    label: "Fibre-to-Hurd Indication",
    category: "FIBRE_QUALITY",
    type: "TEXT",
    required: true,
    description: "Measurable or visual indication of fibre versus core hurd proportion.",
    placeholder: "e.g. Approx. 30-35% long technical fibre yield",
  },
  {
    id: "visualHomogeneity",
    name: "visualHomogeneity",
    label: "Visual Homogeneity",
    category: "FIBRE_QUALITY",
    type: "TEXT",
    required: true,
    description: "Visual assessment of overall texture and appearance uniformity.",
    placeholder: "e.g. Homogeneous straw thickness, no wet pockets",
  },
];

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
