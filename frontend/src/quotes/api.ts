import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  CreateQuoteInput,
  QuoteCounterOfferInput,
  QuoteDetail,
  QuoteSummary,
  RejectQuoteInput,
  ReviseCounterQuoteInput,
  UpdateQuoteInput,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class QuotesRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "QuotesRequestError";
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
    throw new QuotesRequestError("The quotation service is unavailable.");
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return null as unknown as T;
  }
  if (!res.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const body = (await res.json()) as { detail?: string; message?: string; title?: string };
      errorDetail = body.detail || body.message || body.title || errorDetail;
    } catch {
      // Ignored
    }
    throw new QuotesRequestError(errorDetail, res.status);
  }
  const text = await res.text();
  if (!text || text.trim() === "" || text === "null") {
    return null as unknown as T;
  }
  return JSON.parse(text) as T;
}

export async function fetchQuoteById(id: string): Promise<QuoteDetail> {
  const res = await send(`/api/v1/quotes/${id}`);
  return handleResponse<QuoteDetail>(res);
}

export async function fetchQuoteByMatchId(matchId: string): Promise<QuoteDetail | null> {
  const res = await send(`/api/v1/quotes/by-match/${matchId}`);
  if (res.status === 404 || res.status === 204) {
    return null;
  }
  return handleResponse<QuoteDetail | null>(res);
}

export async function createQuote(input: CreateQuoteInput): Promise<QuoteDetail> {
  const res = await send("/api/v1/quotes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return handleResponse<QuoteDetail>(res);
}

export async function updateQuote(
  id: string,
  input: UpdateQuoteInput,
): Promise<QuoteDetail> {
  const res = await send(`/api/v1/quotes/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return handleResponse<QuoteDetail>(res);
}

export async function submitQuoteForInternalReview(id: string): Promise<QuoteDetail> {
  const res = await send(`/api/v1/quotes/${id}/submit-review`, {
    method: "POST",
  });
  return handleResponse<QuoteDetail>(res);
}

export async function returnQuoteToDraft(id: string): Promise<QuoteDetail> {
  const res = await send(`/api/v1/quotes/${id}/return-to-draft`, {
    method: "POST",
  });
  return handleResponse<QuoteDetail>(res);
}

export async function sendQuote(id: string): Promise<QuoteDetail> {
  const res = await send(`/api/v1/quotes/${id}/send`, {
    method: "POST",
  });
  return handleResponse<QuoteDetail>(res);
}

export async function reviseCounterQuote(
  id: string,
  input: ReviseCounterQuoteInput,
): Promise<QuoteDetail> {
  const res = await send(`/api/v1/quotes/${id}/revise-counter`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return handleResponse<QuoteDetail>(res);
}

export async function fetchBuyerQuotes(): Promise<QuoteSummary[]> {
  const res = await send("/api/v1/buyer/quotes");
  return handleResponse<QuoteSummary[]>(res);
}

export async function fetchBuyerQuoteById(id: string): Promise<QuoteDetail> {
  const res = await send(`/api/v1/buyer/quotes/${id}`);
  return handleResponse<QuoteDetail>(res);
}

export async function acceptBuyerQuote(id: string): Promise<QuoteDetail> {
  const res = await send(`/api/v1/buyer/quotes/${id}/accept`, {
    method: "POST",
  });
  return handleResponse<QuoteDetail>(res);
}

export async function rejectBuyerQuote(
  id: string,
  input?: RejectQuoteInput,
): Promise<QuoteDetail> {
  const res = await send(`/api/v1/buyer/quotes/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(input || {}),
  });
  return handleResponse<QuoteDetail>(res);
}

export async function counterBuyerQuote(
  id: string,
  input: QuoteCounterOfferInput,
): Promise<QuoteDetail> {
  const res = await send(`/api/v1/buyer/quotes/${id}/counter`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return handleResponse<QuoteDetail>(res);
}
