import { getLocalApiBaseUrl } from "@/auth/config";
import type { TradeCollection, TradeDetail } from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class TradesRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "TradesRequestError";
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
    throw new TradesRequestError("The trade records service is unavailable.");
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let errorMessage = "Unable to process trade request.";
  try {
    const errorBody = (await response.json()) as { detail?: string; message?: string };
    errorMessage = errorBody.detail || errorBody.message || errorMessage;
  } catch {
    // Fall back to default message
  }

  throw new TradesRequestError(errorMessage, response.status);
}

export async function getTraderTrades(): Promise<TradeCollection> {
  const response = await send("/api/v1/trader/trades", {
    method: "GET",
  });
  return parseResponse<TradeCollection>(response);
}

export async function getTraderTradeById(id: string): Promise<TradeDetail> {
  const response = await send(`/api/v1/trader/trades/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  return parseResponse<TradeDetail>(response);
}

export async function getBuyerTrades(): Promise<TradeCollection> {
  const response = await send("/api/v1/buyer/trades", {
    method: "GET",
  });
  return parseResponse<TradeCollection>(response);
}

export async function getBuyerTradeById(id: string): Promise<TradeDetail> {
  const response = await send(`/api/v1/buyer/trades/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  return parseResponse<TradeDetail>(response);
}
