import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  ApproveMatchInput,
  CancelMatchInput,
  MatchingWorkspace,
  MatchSummary,
  SelectMatchInput,
  TraderCockpitResponse,
  TraderSupplierCollection,
  TraderSupplierDetail,
  TraderBuyerCollection,
  TraderBuyerDetail,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class MatchingRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "MatchingRequestError";
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
    throw new MatchingRequestError("The matching service is unavailable.");
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const body = (await res.json()) as { detail?: string; message?: string };
      errorDetail = body.detail || body.message || errorDetail;
    } catch {
      // Ignored
    }
    throw new MatchingRequestError(errorDetail, res.status);
  }
  return res.json() as Promise<T>;
}

export async function getMatchingWorkspace(
  buyOrderId: string,
): Promise<MatchingWorkspace> {
  const res = await send(`/api/v1/matching/buy-orders/${buyOrderId}/workspace`);
  return handleResponse<MatchingWorkspace>(res);
}

export async function selectCandidateAsMatch(
  buyOrderId: string,
  input: SelectMatchInput,
): Promise<MatchSummary> {
  const res = await send(
    `/api/v1/matching/buy-orders/${buyOrderId}/matches`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return handleResponse<MatchSummary>(res);
}

export async function approveMatch(
  matchId: string,
  input: ApproveMatchInput = {},
): Promise<MatchSummary> {
  const res = await send(`/api/v1/matching/matches/${matchId}/approve`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return handleResponse<MatchSummary>(res);
}

export async function cancelMatch(
  matchId: string,
  input: CancelMatchInput = {},
): Promise<MatchSummary> {
  const res = await send(`/api/v1/matching/matches/${matchId}/cancel`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return handleResponse<MatchSummary>(res);
}

export async function getTraderCockpit(): Promise<TraderCockpitResponse> {
  const res = await send("/api/v1/trader/cockpit");
  return handleResponse<TraderCockpitResponse>(res);
}

export async function listSuppliersForTrader(query?: {
  search?: string;
  country?: string;
  verificationStatus?: string;
}): Promise<TraderSupplierCollection> {
  const params = new URLSearchParams();
  if (query?.search) params.append("search", query.search);
  if (query?.country) params.append("country", query.country);
  if (query?.verificationStatus) params.append("verificationStatus", query.verificationStatus);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await send(`/api/v1/trader/suppliers${qs}`);
  return handleResponse<TraderSupplierCollection>(res);
}

export async function getSupplierDetailForTrader(
  organisationId: string,
): Promise<TraderSupplierDetail> {
  const res = await send(`/api/v1/trader/suppliers/${organisationId}`);
  return handleResponse<TraderSupplierDetail>(res);
}

export async function listBuyersForTrader(query?: {
  search?: string;
  country?: string;
  verificationStatus?: string;
}): Promise<TraderBuyerCollection> {
  const params = new URLSearchParams();
  if (query?.search) params.append("search", query.search);
  if (query?.country) params.append("country", query.country);
  if (query?.verificationStatus) params.append("verificationStatus", query.verificationStatus);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await send(`/api/v1/trader/buyers${qs}`);
  return handleResponse<TraderBuyerCollection>(res);
}

export async function getBuyerDetailForTrader(
  organisationId: string,
): Promise<TraderBuyerDetail> {
  const res = await send(`/api/v1/trader/buyers/${organisationId}`);
  return handleResponse<TraderBuyerDetail>(res);
}
