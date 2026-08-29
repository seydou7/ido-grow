import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  CreateOrganisationInput,
  CreateSiteInput,
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
