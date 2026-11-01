import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  CreateLotDto,
  DigitalProductPassportResponse,
  DPPCustodyRecordResponse,
  DPPEventResponse,
  DPPVersionResponse,
  TraceableLotResponse,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class DppRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "DppRequestError";
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
    throw new DppRequestError("The DPP service is unavailable.");
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let errorMessage = "Unable to process Digital Product Passport request.";
  try {
    const errorBody = (await response.json()) as { detail?: string; message?: string };
    errorMessage = errorBody.detail || errorBody.message || errorMessage;
  } catch {
    // Fall back to default message
  }

  throw new DppRequestError(errorMessage, response.status);
}

// ── LOTS ────────────────────────────────────────────────────────

export async function fetchLots(): Promise<TraceableLotResponse[]> {
  const response = await send("/api/v1/lots");
  return parseResponse<TraceableLotResponse[]>(response);
}

export async function fetchLotById(lotId: string): Promise<TraceableLotResponse> {
  const response = await send(`/api/v1/lots/${encodeURIComponent(lotId)}`);
  return parseResponse<TraceableLotResponse>(response);
}

export async function createLot(data: CreateLotDto): Promise<TraceableLotResponse> {
  const response = await send("/api/v1/lots", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return parseResponse<TraceableLotResponse>(response);
}

// ── PASSPORTS ───────────────────────────────────────────────────

export async function fetchPassports(): Promise<DigitalProductPassportResponse[]> {
  const response = await send("/api/v1/dpp");
  return parseResponse<DigitalProductPassportResponse[]>(response);
}

export async function fetchPassportById(dppId: string): Promise<DigitalProductPassportResponse> {
  const response = await send(`/api/v1/dpp/${encodeURIComponent(dppId)}`);
  return parseResponse<DigitalProductPassportResponse>(response);
}

export async function createPassportForLot(lotId: string): Promise<DigitalProductPassportResponse> {
  const response = await send(`/api/v1/lots/${encodeURIComponent(lotId)}/dpp`, {
    method: "POST",
  });
  return parseResponse<DigitalProductPassportResponse>(response);
}

export async function fetchPassportEvents(dppId: string): Promise<DPPEventResponse[]> {
  const response = await send(`/api/v1/dpp/${encodeURIComponent(dppId)}/events`);
  return parseResponse<DPPEventResponse[]>(response);
}

export async function fetchPassportVersions(dppId: string): Promise<DPPVersionResponse[]> {
  const response = await send(`/api/v1/dpp/${encodeURIComponent(dppId)}/versions`);
  return parseResponse<DPPVersionResponse[]>(response);
}

export async function fetchPassportVersionByNumber(
  dppId: string,
  versionNumber: number,
): Promise<DPPVersionResponse> {
  const response = await send(
    `/api/v1/dpp/${encodeURIComponent(dppId)}/versions/${encodeURIComponent(versionNumber)}`,
  );
  return parseResponse<DPPVersionResponse>(response);
}

export async function fetchPassportCustody(dppId: string): Promise<DPPCustodyRecordResponse[]> {
  const response = await send(`/api/v1/dpp/${encodeURIComponent(dppId)}/custody`);
  return parseResponse<DPPCustodyRecordResponse[]>(response);
}

export async function syncPassport(dppId: string): Promise<DigitalProductPassportResponse> {
  const response = await send(`/api/v1/dpp/${encodeURIComponent(dppId)}/sync`, {
    method: "POST",
  });
  return parseResponse<DigitalProductPassportResponse>(response);
}

// ── BLOCK 02: PASSPORT VIEW, DOWNLOADABLE PDF & QR ─────────────

export async function fetchPassportView(
  dppId: string,
  versionNumber?: number,
): Promise<import("./contracts").PassportViewResponse> {
  const query = versionNumber ? `?version=${encodeURIComponent(versionNumber)}` : "";
  const response = await send(`/api/v1/dpp/${encodeURIComponent(dppId)}/passport${query}`);
  return parseResponse<import("./contracts").PassportViewResponse>(response);
}

export function getPassportPdfUrl(dppId: string, versionNumber?: number): string {
  const query = versionNumber ? `?version=${encodeURIComponent(versionNumber)}` : "";
  return endpoint(`/api/v1/dpp/${encodeURIComponent(dppId)}/passport.pdf${query}`);
}

export async function downloadPassportPdf(
  dppId: string,
  versionNumber?: number,
): Promise<void> {
  const url = getPassportPdfUrl(dppId, versionNumber);
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    let errorMessage = "Unable to download passport PDF.";
    try {
      const err = await response.json();
      errorMessage = err.detail || err.message || errorMessage;
    } catch {
      // default
    }
    throw new DppRequestError(errorMessage, response.status);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;

  const contentDisposition = response.headers.get("content-disposition");
  let filename = `passport-${dppId}.pdf`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export async function fetchPassportQr(
  dppId: string,
): Promise<import("./contracts").DppQrResult> {
  const response = await send(`/api/v1/dpp/${encodeURIComponent(dppId)}/qr`);
  return parseResponse<import("./contracts").DppQrResult>(response);
}

