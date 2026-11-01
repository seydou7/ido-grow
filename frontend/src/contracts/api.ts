import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  ContractCollection,
  ContractDetail,
  UpdateContractDraftInput,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ContractsRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ContractsRequestError";
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
    throw new ContractsRequestError("The contracts service is unavailable.");
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let errorMessage = "Unable to process contract request.";
  try {
    const errorBody = (await response.json()) as { detail?: string; message?: string };
    errorMessage = errorBody.detail || errorBody.message || errorMessage;
  } catch {
    // Fall back to default message
  }

  throw new ContractsRequestError(errorMessage, response.status);
}

export async function createContractForTrade(tradeId: string): Promise<ContractDetail> {
  const response = await send(`/api/v1/trades/${encodeURIComponent(tradeId)}/contract`, {
    method: "POST",
  });
  return parseResponse<ContractDetail>(response);
}

export async function getContracts(): Promise<ContractCollection> {
  const response = await send("/api/v1/contracts", {
    method: "GET",
  });
  return parseResponse<ContractCollection>(response);
}

export async function getContractById(id: string): Promise<ContractDetail> {
  const response = await send(`/api/v1/contracts/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  return parseResponse<ContractDetail>(response);
}

export async function getContractByTradeId(tradeId: string): Promise<ContractDetail | null> {
  const response = await send(`/api/v1/contracts/by-trade/${encodeURIComponent(tradeId)}`, {
    method: "GET",
  });
  if (response.status === 404) {
    return null;
  }
  return parseResponse<ContractDetail>(response);
}

export async function updateContractDraft(
  id: string,
  input: UpdateContractDraftInput,
): Promise<ContractDetail> {
  const response = await send(`/api/v1/contracts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return parseResponse<ContractDetail>(response);
}

export async function confirmContract(id: string): Promise<ContractDetail> {
  const response = await send(`/api/v1/contracts/${encodeURIComponent(id)}/confirm`, {
    method: "POST",
  });
  return parseResponse<ContractDetail>(response);
}

export async function downloadContractDocument(
  contractId: string,
): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(
    endpoint(`/api/v1/contracts/${encodeURIComponent(contractId)}/document`),
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    let errorMsg = "Unable to download contract document.";
    try {
      const err = (await response.json()) as { detail?: string; message?: string };
      errorMsg = err.detail || err.message || errorMsg;
    } catch {
      // fallback
    }
    throw new ContractsRequestError(errorMsg, response.status);
  }

  const contentDisposition = response.headers.get("content-disposition");
  let filename = `contract-${contractId}.pdf`;
  if (contentDisposition) {
    const match = /filename=["']?([^"';]+)["']?/.exec(contentDisposition);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  const blob = await response.blob();
  return { blob, filename };
}
