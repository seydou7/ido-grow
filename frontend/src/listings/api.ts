import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  CreateListingInput,
  ListingCollection,
  ListingSummary,
  UpdateListingInput,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ListingRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ListingRequestError";
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
    throw new ListingRequestError("The listings service is unavailable.");
  }
}

export async function listListings(
  organisationId: string,
): Promise<ListingCollection> {
  const response = await send(
    `/api/v1/organisations/${encodeURIComponent(organisationId)}/listings`,
    { method: "GET" },
  );

  if (!response.ok) {
    throw new ListingRequestError("Unable to retrieve organisation listings.");
  }

  return response.json();
}

export async function getListing(
  organisationId: string,
  listingId: string,
): Promise<ListingSummary> {
  const response = await send(
    `/api/v1/organisations/${encodeURIComponent(organisationId)}/listings/${encodeURIComponent(listingId)}`,
    { method: "GET" },
  );

  if (!response.ok) {
    throw new ListingRequestError("Unable to retrieve listing details.");
  }

  return response.json();
}

export async function createListing(
  organisationId: string,
  input: CreateListingInput,
): Promise<ListingSummary> {
  const response = await send(
    `/api/v1/organisations/${encodeURIComponent(organisationId)}/listings`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ListingRequestError(
      errorBody?.detail || "Unable to create listing.",
    );
  }

  return response.json();
}

export async function updateListing(
  organisationId: string,
  listingId: string,
  input: UpdateListingInput,
): Promise<ListingSummary> {
  const response = await send(
    `/api/v1/organisations/${encodeURIComponent(organisationId)}/listings/${encodeURIComponent(listingId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ListingRequestError(
      errorBody?.detail || "Unable to update listing.",
    );
  }

  return response.json();
}
