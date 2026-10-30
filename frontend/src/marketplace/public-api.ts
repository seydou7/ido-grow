import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  PublicMarketplaceListingCollection,
  PublicMarketplaceListingDetail,
  PublicMarketplaceQuery,
  RegisterBuyerDto,
  RegisterBuyerResult,
  SessionStatus,
} from "./public-contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class PublicMarketplaceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "PublicMarketplaceError";
  }
}

function endpoint(path: string): string {
  try {
    const base = getLocalApiBaseUrl(API_BASE_URL);
    return `${base}${path}`;
  } catch {
    return path;
  }
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint(path), {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new PublicMarketplaceError("Marketplace network service is unavailable.");
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const detail =
      errorBody?.detail ||
      errorBody?.message ||
      `Request failed with status ${response.status}`;
    throw new PublicMarketplaceError(detail, response.status, errorBody?.code);
  }

  return response.json() as Promise<T>;
}

export async function fetchPublicListings(
  query: PublicMarketplaceQuery = {},
): Promise<PublicMarketplaceListingCollection> {
  const params = new URLSearchParams();

  if (query.search && query.search.trim()) params.set("search", query.search.trim());
  if (query.materialType && query.materialType !== "ALL") {
    params.set("materialType", query.materialType);
  }
  if (query.productForm && query.productForm !== "ALL") {
    params.set("productForm", query.productForm);
  }
  if (query.originCountry && query.originCountry !== "ALL") {
    params.set("originCountry", query.originCountry);
  }
  if (query.harvestYear !== undefined && !Number.isNaN(query.harvestYear)) {
    params.set("harvestYear", String(query.harvestYear));
  }
  if (query.minQuantity !== undefined && !Number.isNaN(query.minQuantity)) {
    params.set("minQuantity", String(query.minQuantity));
  }
  if (query.maxQuantity !== undefined && !Number.isNaN(query.maxQuantity)) {
    params.set("maxQuantity", String(query.maxQuantity));
  }
  if (query.quantityUnit && query.quantityUnit !== "ALL") {
    params.set("quantityUnit", query.quantityUnit);
  }
  if (query.hasPrice === true) {
    params.set("hasPrice", "true");
  }
  if (query.minPrice !== undefined && !Number.isNaN(query.minPrice)) {
    params.set("minPrice", String(query.minPrice));
  }
  if (query.maxPrice !== undefined && !Number.isNaN(query.maxPrice)) {
    params.set("maxPrice", String(query.maxPrice));
  }
  if (query.priceUnit && query.priceUnit !== "ALL") {
    params.set("priceUnit", query.priceUnit);
  }
  if (query.hasCertifications === true) {
    params.set("hasCertifications", "true");
  }
  if (query.hasQualityApproved === true) {
    params.set("hasQualityApproved", "true");
  }
  if (query.hasDpp === true) {
    params.set("hasDpp", "true");
  }
  if (query.sort) {
    params.set("sort", query.sort);
  }
  if (query.page !== undefined && query.page > 0) {
    params.set("page", String(query.page));
  }
  if (query.pageSize !== undefined && query.pageSize > 0) {
    params.set("pageSize", String(query.pageSize));
  }

  const queryStr = params.toString();
  const path = `/api/v1/public/marketplace${queryStr ? `?${queryStr}` : ""}`;
  return requestJson<PublicMarketplaceListingCollection>(path, { method: "GET" });
}

export async function fetchPublicListing(
  listingId: string,
): Promise<PublicMarketplaceListingDetail> {
  const path = `/api/v1/public/marketplace/${encodeURIComponent(listingId)}`;
  return requestJson<PublicMarketplaceListingDetail>(path, { method: "GET" });
}

export async function registerBuyer(
  dto: RegisterBuyerDto,
): Promise<RegisterBuyerResult> {
  return requestJson<RegisterBuyerResult>("/api/v1/auth/register-buyer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ status: "authenticated"; user: { id: string; email: string } }> {
  return requestJson<{ status: "authenticated"; user: { id: string; email: string } }>(
    "/api/v1/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );
}

export async function fetchAuthSession(): Promise<SessionStatus> {
  return requestJson<SessionStatus>("/api/v1/auth/session", { method: "GET" });
}

export async function logoutUser(): Promise<void> {
  await fetch(endpoint("/api/v1/auth/logout"), {
    method: "POST",
    credentials: "include",
  }).catch(() => {
    // Ignore logout failure
  });
}
