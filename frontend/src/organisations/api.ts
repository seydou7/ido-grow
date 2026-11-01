import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  ComplianceDocumentCollection,
  ComplianceDocumentSummary,
  CreateOrganisationInput,
  CreateSiteInput,
  OrganisationMemberCollection,
  OrganisationProfile,
  SelfMembershipCollection,
  SiteCollection,
  SiteSummary,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class OrganisationRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganisationRequestError";
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
        ...init?.headers,
      },
    });
  } catch {
    throw new OrganisationRequestError("The organisation service is unavailable.");
  }
}

export async function getSelfMemberships(): Promise<SelfMembershipCollection> {
  const response = await send("/api/v1/memberships", { method: "GET" });
  if (!response.ok) {
    throw new OrganisationRequestError("Unable to retrieve organisations.");
  }
  return response.json();
}

export async function getOrganisationProfile(
  id: string,
): Promise<OrganisationProfile> {
  const response = await send(`/api/v1/organisations/${id}`, { method: "GET" });
  if (!response.ok) {
    throw new OrganisationRequestError("Unable to retrieve organisation profile.");
  }
  return response.json();
}

export async function createOrganisation(
  input: CreateOrganisationInput,
): Promise<OrganisationProfile> {
  const response = await send("/api/v1/organisations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new OrganisationRequestError("Unable to create organisation.");
  }
  return response.json();
}

export async function updateOrganisationProfile(
  id: string,
  input: UpdateOrganisationProfileInput,
): Promise<OrganisationProfile> {
  const response = await send(`/api/v1/organisations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new OrganisationRequestError("Unable to update organisation profile.");
  }
  return response.json();
}

export async function listSites(
  organisationId: string,
): Promise<SiteCollection> {
  const response = await send(`/api/v1/organisations/${organisationId}/sites`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new OrganisationRequestError("Unable to list production sites.");
  }
  return response.json();
}

export async function createSite(
  organisationId: string,
  input: CreateSiteInput,
): Promise<SiteSummary> {
  const response = await send(`/api/v1/organisations/${organisationId}/sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new OrganisationRequestError("Unable to create production site.");
  }
  return response.json();
}

export async function updateSite(
  organisationId: string,
  siteId: string,
  input: UpdateSiteInput,
): Promise<SiteSummary> {
  const response = await send(
    `/api/v1/organisations/${organisationId}/sites/${siteId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) {
    throw new OrganisationRequestError("Unable to update production site.");
  }
  return response.json();
}

export async function listComplianceDocuments(
  organisationId: string,
): Promise<ComplianceDocumentCollection> {
  const response = await send(`/api/v1/organisations/${organisationId}/documents`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new OrganisationRequestError("Unable to list compliance documents.");
  }
  return response.json();
}

export async function uploadComplianceDocument(
  organisationId: string,
  documentType: string,
  file: File,
): Promise<ComplianceDocumentSummary> {
  const formData = new FormData();
  formData.append("documentType", documentType);
  formData.append("file", file);

  try {
    const response = await fetch(endpoint(`/api/v1/organisations/${organisationId}/documents`), {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      let detail = "Unable to upload compliance document.";
      try {
        const errorJson = await response.json();
        if (errorJson.detail) detail = errorJson.detail;
      } catch {
        // Fallback to default message
      }
      throw new OrganisationRequestError(detail);
    }
    return response.json();
  } catch (err: unknown) {
    if (err instanceof OrganisationRequestError) throw err;
    throw new OrganisationRequestError("Network error during file upload.");
  }
}

export function getComplianceDocumentDownloadUrl(
  organisationId: string,
  documentId: string,
): string {
  return endpoint(`/api/v1/organisations/${organisationId}/documents/${documentId}/download`);
}

export async function listOrganisationMembers(
  organisationId: string,
): Promise<OrganisationMemberCollection> {
  const response = await send(`/api/v1/organisations/${organisationId}/members`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new OrganisationRequestError("Unable to list organisation members.");
  }
  return response.json();
}
