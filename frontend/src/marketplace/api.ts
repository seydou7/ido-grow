import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  MarketplaceListingCollection,
  MarketplaceListingDetail,
  MarketplaceQuery,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class MarketplaceRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "MarketplaceRequestError";
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
    throw new MarketplaceRequestError("The marketplace service is unavailable.");
  }
}

export async function listMarketplaceListings(
  query?: MarketplaceQuery,
): Promise<MarketplaceListingCollection> {
  const params = new URLSearchParams();

  if (query?.search) params.set("search", query.search);
  if (query?.materialType && query.materialType !== "ALL") {
    params.set("materialType", query.materialType);
  }
  if (query?.productForm && query.productForm !== "ALL") {
    params.set("productForm", query.productForm);
  }
  if (query?.originCountry) params.set("originCountry", query.originCountry);
  if (query?.harvestYear) params.set("harvestYear", String(query.harvestYear));
  if (query?.quantityUnit && query.quantityUnit !== "ALL") {
    params.set("quantityUnit", query.quantityUnit);
  }
  if (query?.minQuantity !== undefined) {
    params.set("minQuantity", String(query.minQuantity));
  }
  if (query?.maxQuantity !== undefined) {
    params.set("maxQuantity", String(query.maxQuantity));
  }
  if (query?.hasPrice) params.set("hasPrice", "true");
  if (query?.minPrice !== undefined) {
    params.set("minPrice", String(query.minPrice));
  }
  if (query?.maxPrice !== undefined) {
    params.set("maxPrice", String(query.maxPrice));
  }
  if (query?.priceUnit && query.priceUnit !== "ALL") {
    params.set("priceUnit", query.priceUnit);
  }

  const queryString = params.toString();
  const path = `/api/v1/marketplace/listings${queryString ? `?${queryString}` : ""}`;

  const response = await send(path, { method: "GET" });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new MarketplaceRequestError(
      errorBody?.detail || "Unable to retrieve marketplace listings.",
      response.status,
    );
  }

  return response.json();
}

export async function getMarketplaceListing(
  listingId: string,
): Promise<MarketplaceListingDetail> {
  const response = await send(
    `/api/v1/marketplace/listings/${encodeURIComponent(listingId)}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new MarketplaceRequestError(
      errorBody?.detail || "Unable to retrieve marketplace listing details.",
      response.status,
    );
  }

  return response.json();
}
