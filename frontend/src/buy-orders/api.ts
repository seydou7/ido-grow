import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  BuyOrderCollection,
  BuyOrderDetail,
  BuyOrderQuery,
  CreateBuyOrderInput,
  TraderDemandCollection,
  UpdateBuyOrderInput,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class BuyOrdersRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "BuyOrdersRequestError";
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
    throw new BuyOrdersRequestError("The buy orders service is unavailable.");
  }
}

export async function listBuyOrders(
  buyerOrganisationId?: string,
  query?: BuyOrderQuery,
): Promise<BuyOrderCollection> {
  const params = new URLSearchParams();
  if (buyerOrganisationId) params.set("buyerOrganisationId", buyerOrganisationId);
  if (query?.status) params.set("status", query.status);
  if (query?.materialType && query.materialType !== "ALL") {
    params.set("materialType", query.materialType);
  }
  if (query?.deliveryCountry) params.set("deliveryCountry", query.deliveryCountry);

  const queryString = params.toString();
  const path = `/api/v1/buy-orders${queryString ? `?${queryString}` : ""}`;

  const response = await send(path, { method: "GET" });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BuyOrdersRequestError(
      errorBody?.detail || "Unable to retrieve buy orders.",
      response.status,
    );
  }

  return response.json();
}

export async function getBuyOrder(buyOrderId: string): Promise<BuyOrderDetail> {
  const response = await send(
    `/api/v1/buy-orders/${encodeURIComponent(buyOrderId)}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BuyOrdersRequestError(
      errorBody?.detail || "Unable to retrieve buy order details.",
      response.status,
    );
  }

  return response.json();
}

export async function createBuyOrder(
  input: CreateBuyOrderInput,
  buyerOrganisationId?: string,
): Promise<BuyOrderDetail> {
  const params = new URLSearchParams();
  if (buyerOrganisationId) params.set("buyerOrganisationId", buyerOrganisationId);

  const queryString = params.toString();
  const path = `/api/v1/buy-orders${queryString ? `?${queryString}` : ""}`;

  const response = await send(path, {
    method: "POST",
    body: JSON.stringify({ ...input, buyerOrganisationId }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BuyOrdersRequestError(
      errorBody?.detail || "Unable to create buy order.",
      response.status,
    );
  }

  return response.json();
}

export async function updateBuyOrder(
  buyOrderId: string,
  input: UpdateBuyOrderInput,
): Promise<BuyOrderDetail> {
  const response = await send(
    `/api/v1/buy-orders/${encodeURIComponent(buyOrderId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BuyOrdersRequestError(
      errorBody?.detail || "Unable to update buy order.",
      response.status,
    );
  }

  return response.json();
}

export async function submitBuyOrder(
  buyOrderId: string,
): Promise<BuyOrderDetail> {
  const response = await send(
    `/api/v1/buy-orders/${encodeURIComponent(buyOrderId)}/submit`,
    { method: "POST" },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BuyOrdersRequestError(
      errorBody?.detail || "Unable to submit buy order.",
      response.status,
    );
  }

  return response.json();
}

export async function cancelBuyOrder(
  buyOrderId: string,
): Promise<BuyOrderDetail> {
  const response = await send(
    `/api/v1/buy-orders/${encodeURIComponent(buyOrderId)}/cancel`,
    { method: "POST" },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BuyOrdersRequestError(
      errorBody?.detail || "Unable to cancel buy order.",
      response.status,
    );
  }

  return response.json();
}

export async function listTraderDemand(
  query?: BuyOrderQuery,
): Promise<TraderDemandCollection> {
  const params = new URLSearchParams();
  if (query?.materialType && query.materialType !== "ALL") {
    params.set("materialType", query.materialType);
  }
  if (query?.deliveryCountry) params.set("deliveryCountry", query.deliveryCountry);

  const queryString = params.toString();
  const path = `/api/v1/buy-orders/trader/demand${queryString ? `?${queryString}` : ""}`;

  const response = await send(path, { method: "GET" });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BuyOrdersRequestError(
      errorBody?.detail || "Unable to retrieve trader demand overview.",
      response.status,
    );
  }

  return response.json();
}

export async function listBuyerOrganisationsForTrader(): Promise<{
  items: Array<{
    id: string;
    name: string;
    country: string | null;
    verificationStatus: string;
  }>;
}> {
  const response = await send("/api/v1/buy-orders/trader/buyers", {
    method: "GET",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BuyOrdersRequestError(
      errorBody?.detail || "Unable to retrieve buyer organisations.",
      response.status,
    );
  }

  return response.json();
}

export async function listTraderDrafts(
  query?: BuyOrderQuery,
): Promise<TraderDemandCollection> {
  const params = new URLSearchParams();
  if (query?.materialType && query.materialType !== "ALL") {
    params.set("materialType", query.materialType);
  }
  if (query?.deliveryCountry) params.set("deliveryCountry", query.deliveryCountry);

  const queryString = params.toString();
  const path = `/api/v1/buy-orders/trader/drafts${queryString ? `?${queryString}` : ""}`;

  const response = await send(path, { method: "GET" });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BuyOrdersRequestError(
      errorBody?.detail || "Unable to retrieve trader drafts.",
      response.status,
    );
  }

  return response.json();
}

export async function deleteBuyOrder(buyOrderId: string): Promise<void> {
  const response = await send(`/api/v1/buy-orders/${buyOrderId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BuyOrdersRequestError(
      errorBody?.detail || "Unable to delete buy order draft.",
      response.status,
    );
  }
}
