import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  InspectionTemplateSummary,
  InspectionDetail,
  InspectionSummary,
  AssignableInspectorSummary,
  CreateInspectionInput,
  AssignInspectorInput,
  SaveMeasurementsInput,
  UploadEvidenceInput,
  InspectionEvidenceSummary,
  RecordAssessmentInput,
  CreateNonConformityInput,
  ResolveNonConformityInput,
  NonConformitySummary,
  RequestPhysicalInspectionInput,
  QualityResultSummary,
  InspectionCertificateSummary,
  RecordQualityDecisionInput,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class QualityRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "QualityRequestError";
  }
}

function endpoint(path: string): string {
  return `${getLocalApiBaseUrl(API_BASE_URL)}${path}`;
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(endpoint(path), {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new QualityRequestError("The quality inspection service is unavailable.");
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let errorMessage = "Unable to process quality inspection request.";
  try {
    const errorBody = (await response.json()) as { detail?: string; message?: string };
    errorMessage = errorBody.detail || errorBody.message || errorMessage;
  } catch {
    // Fall back to default
  }

  throw new QualityRequestError(errorMessage, response.status);
}

export async function getInspectionTemplates(): Promise<{ items: InspectionTemplateSummary[] }> {
  const response = await send("/api/v1/quality/inspection-templates", {
    method: "GET",
  });
  return parseResponse<{ items: InspectionTemplateSummary[] }>(response);
}

export async function getInspectionTemplateById(id: string): Promise<InspectionTemplateSummary> {
  const response = await send(`/api/v1/quality/inspection-templates/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  return parseResponse<InspectionTemplateSummary>(response);
}

export async function getAssignableInspectors(): Promise<{ items: AssignableInspectorSummary[] }> {
  const response = await send("/api/v1/quality/inspectors", {
    method: "GET",
  });
  return parseResponse<{ items: AssignableInspectorSummary[] }>(response);
}

export async function createInspection(
  input: CreateInspectionInput,
): Promise<InspectionDetail> {
  const response = await send("/api/v1/quality/inspections", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseResponse<InspectionDetail>(response);
}

export async function assignInspector(
  id: string,
  input: AssignInspectorInput,
): Promise<InspectionDetail> {
  const response = await send(`/api/v1/quality/inspections/${encodeURIComponent(id)}/assign`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseResponse<InspectionDetail>(response);
}

export async function getMyInspections(): Promise<{ items: InspectionSummary[] }> {
  const response = await send("/api/v1/quality/my-inspections", {
    method: "GET",
  });
  return parseResponse<{ items: InspectionSummary[] }>(response);
}

export async function getAllInspections(): Promise<{ items: InspectionSummary[] }> {
  const response = await send("/api/v1/quality/inspections", {
    method: "GET",
  });
  return parseResponse<{ items: InspectionSummary[] }>(response);
}

export async function getInspectionById(id: string): Promise<InspectionDetail> {
  const response = await send(`/api/v1/quality/inspections/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  return parseResponse<InspectionDetail>(response);
}

export async function startInspection(id: string): Promise<InspectionDetail> {
  const response = await send(`/api/v1/quality/inspections/${encodeURIComponent(id)}/start`, {
    method: "POST",
  });
  return parseResponse<InspectionDetail>(response);
}

export async function saveMeasurements(
  id: string,
  input: SaveMeasurementsInput,
): Promise<InspectionDetail> {
  const response = await send(`/api/v1/quality/inspections/${encodeURIComponent(id)}/measurements`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return parseResponse<InspectionDetail>(response);
}

export async function completeInspectionData(id: string): Promise<InspectionDetail> {
  const response = await send(`/api/v1/quality/inspections/${encodeURIComponent(id)}/complete`, {
    method: "POST",
  });
  return parseResponse<InspectionDetail>(response);
}

export async function uploadEvidence(
  id: string,
  file: File,
  input: UploadEvidenceInput,
): Promise<InspectionEvidenceSummary> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("evidenceType", input.evidenceType);
  if (input.caption) formData.append("caption", input.caption);
  if (input.capturedAt) formData.append("capturedAt", input.capturedAt);

  try {
    const response = await fetch(endpoint(`/api/v1/quality/inspections/${encodeURIComponent(id)}/evidence`), {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    return parseResponse<InspectionEvidenceSummary>(response);
  } catch (err) {
    if (err instanceof QualityRequestError) throw err;
    throw new QualityRequestError("Failed to upload evidence file.");
  }
}

export function getEvidenceFileUrl(inspectionId: string, evidenceId: string): string {
  return endpoint(
    `/api/v1/quality/inspections/${encodeURIComponent(inspectionId)}/evidence/${encodeURIComponent(evidenceId)}/file`,
  );
}

export async function recordAssessment(
  id: string,
  input: RecordAssessmentInput,
): Promise<InspectionDetail> {
  const response = await send(`/api/v1/quality/inspections/${encodeURIComponent(id)}/assessment`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseResponse<InspectionDetail>(response);
}

export async function createNonConformity(
  id: string,
  input: CreateNonConformityInput,
): Promise<NonConformitySummary> {
  const response = await send(`/api/v1/quality/inspections/${encodeURIComponent(id)}/non-conformities`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseResponse<NonConformitySummary>(response);
}

export async function resolveNonConformity(
  id: string,
  nonConformityId: string,
  input: ResolveNonConformityInput,
): Promise<NonConformitySummary> {
  const response = await send(
    `/api/v1/quality/inspections/${encodeURIComponent(id)}/non-conformities/${encodeURIComponent(nonConformityId)}/resolve`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<NonConformitySummary>(response);
}

export async function requestPhysicalInspection(
  id: string,
  input: RequestPhysicalInspectionInput,
): Promise<InspectionDetail> {
  const response = await send(`/api/v1/quality/inspections/${encodeURIComponent(id)}/physical-inspection`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseResponse<InspectionDetail>(response);
}

export async function recordQualityDecision(
  inspectionId: string,
  input: RecordQualityDecisionInput,
): Promise<QualityResultSummary> {
  const response = await send(`/api/v1/quality/inspections/${encodeURIComponent(inspectionId)}/decision`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseResponse<QualityResultSummary>(response);
}

export async function getCertificateMetadata(
  inspectionId: string,
): Promise<InspectionCertificateSummary> {
  const response = await send(`/api/v1/quality/inspections/${encodeURIComponent(inspectionId)}/certificate`, {
    method: "GET",
  });
  return parseResponse<InspectionCertificateSummary>(response);
}

export function getCertificateFileUrl(inspectionId: string): string {
  return endpoint(`/api/v1/quality/inspections/${encodeURIComponent(inspectionId)}/certificate/file`);
}
