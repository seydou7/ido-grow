import { getLocalApiBaseUrl } from "@/auth/config";
import type {
  CloseShipmentInput,
  ConfirmDeliveryInput,
  CreateFreightRequestInput,
  CreateSettlementClaimInput,
  CreateSettlementInput,
  CreateShipmentInput,
  CustomsStatusInput,
  FreightQuotationSummary,
  LogisticsPartnerRequestSummary,
  LogisticsRequestSummary,
  MarkDisputedInput,
  MarkInTransitInput,
  MarkPickedUpInput,
  ReconcileCostsInput,
  RecordDiscrepancyInput,
  ReportDelayInput,
  ResolveDisputeInput,
  ResolveSettlementClaimInput,
  SchedulePickupInput,
  SettlementClaimSummary,
  SettlementDetail,
  SettlementDocumentSummary,
  SettlementDocumentType,
  ShipmentCollection,
  ShipmentCostReconciliationSummary,
  ShipmentDetail,
  ShipmentDiscrepancySummary,
  ShipmentDocumentSummary,
  ShipmentSummary,
  ShipmentTrackingEventSummary,
  SubmitFreightQuotationInput,
  UpdateSettlementInput,
  UpdateShipmentRequirementsInput,
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class LogisticsRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "LogisticsRequestError";
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
        ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new LogisticsRequestError("The logistics service is unavailable.");
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let errorMessage = "Unable to process logistics request.";
  try {
    const errorBody = (await response.json()) as { detail?: string; message?: string; title?: string };
    errorMessage = errorBody.detail || errorBody.message || errorBody.title || errorMessage;
  } catch {
    // Fall back to default message
  }

  throw new LogisticsRequestError(errorMessage, response.status);
}

// ── Shipment API ─────────────────────────────────────────────

export async function createShipmentForContract(
  contractId: string,
  input: CreateShipmentInput,
): Promise<ShipmentDetail> {
  const response = await send(`/api/v1/contracts/${encodeURIComponent(contractId)}/shipments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseResponse<ShipmentDetail>(response);
}

export async function fetchShipments(): Promise<ShipmentCollection> {
  const response = await send("/api/v1/shipments", { method: "GET" });
  return parseResponse<ShipmentCollection>(response);
}

export async function fetchShipmentById(shipmentId: string): Promise<ShipmentDetail> {
  const response = await send(`/api/v1/shipments/${encodeURIComponent(shipmentId)}`, {
    method: "GET",
  });
  return parseResponse<ShipmentDetail>(response);
}

export async function updateShipmentRequirements(
  shipmentId: string,
  input: UpdateShipmentRequirementsInput,
): Promise<ShipmentDetail> {
  const response = await send(`/api/v1/shipments/${encodeURIComponent(shipmentId)}/requirements`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return parseResponse<ShipmentDetail>(response);
}

// ── Freight Request API ──────────────────────────────────────

export async function createFreightRequests(
  shipmentId: string,
  input: CreateFreightRequestInput,
): Promise<LogisticsRequestSummary[]> {
  const response = await send(`/api/v1/shipments/${encodeURIComponent(shipmentId)}/freight-requests`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseResponse<LogisticsRequestSummary[]>(response);
}

export async function fetchFreightRequests(
  shipmentId: string,
): Promise<LogisticsRequestSummary[]> {
  const response = await send(`/api/v1/shipments/${encodeURIComponent(shipmentId)}/freight-requests`, {
    method: "GET",
  });
  return parseResponse<LogisticsRequestSummary[]>(response);
}

// ── Freight Quotation API ────────────────────────────────────

export async function fetchFreightQuotations(
  shipmentId: string,
): Promise<FreightQuotationSummary[]> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/freight-quotations`,
    { method: "GET" },
  );
  return parseResponse<FreightQuotationSummary[]>(response);
}

export async function submitTraderManualQuotation(
  shipmentId: string,
  logisticsRequestId: string,
  input: SubmitFreightQuotationInput,
): Promise<FreightQuotationSummary> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/freight-quotations`,
    {
      method: "POST",
      body: JSON.stringify({ ...input, logisticsRequestId }),
    },
  );
  return parseResponse<FreightQuotationSummary>(response);
}

// ── Carrier Selection API ────────────────────────────────────

export async function selectCarrier(
  shipmentId: string,
  freightQuotationId: string,
): Promise<ShipmentDetail> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/select-carrier`,
    {
      method: "POST",
      body: JSON.stringify({ freightQuotationId }),
    },
  );
  return parseResponse<ShipmentDetail>(response);
}

// ── Block 03 Execution & Tracking API ────────────────────────

export async function schedulePickup(
  shipmentId: string,
  input: SchedulePickupInput,
): Promise<ShipmentDetail> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/schedule-pickup`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentDetail>(response);
}

export async function markPickedUp(
  shipmentId: string,
  input: MarkPickedUpInput,
): Promise<ShipmentDetail> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/mark-picked-up`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentDetail>(response);
}

export async function markInTransit(
  shipmentId: string,
  input: MarkInTransitInput,
): Promise<ShipmentDetail> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/mark-in-transit`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentDetail>(response);
}

export async function setCustomsStatus(
  shipmentId: string,
  input: CustomsStatusInput,
): Promise<ShipmentDetail> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/customs`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentDetail>(response);
}

export async function reportDelay(
  shipmentId: string,
  input: ReportDelayInput,
): Promise<ShipmentDetail> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/report-delay`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentDetail>(response);
}

export async function confirmDelivery(
  shipmentId: string,
  input: ConfirmDeliveryInput,
): Promise<ShipmentDetail> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/confirm-delivery`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentDetail>(response);
}

export async function recordDiscrepancy(
  shipmentId: string,
  input: RecordDiscrepancyInput,
): Promise<ShipmentDiscrepancySummary> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/discrepancies`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentDiscrepancySummary>(response);
}

export async function markDisputed(
  shipmentId: string,
  input: MarkDisputedInput,
): Promise<ShipmentDetail> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/mark-disputed`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentDetail>(response);
}

export async function resolveDispute(
  shipmentId: string,
  input: ResolveDisputeInput,
): Promise<ShipmentDetail> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/resolve-dispute`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentDetail>(response);
}

export async function reconcileCosts(
  shipmentId: string,
  input: ReconcileCostsInput,
): Promise<ShipmentCostReconciliationSummary> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/reconcile-costs`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentCostReconciliationSummary>(response);
}

export async function closeShipment(
  shipmentId: string,
  input: CloseShipmentInput,
): Promise<ShipmentDetail> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/close`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<ShipmentDetail>(response);
}

export async function fetchTrackingEvents(
  shipmentId: string,
): Promise<ShipmentTrackingEventSummary[]> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/tracking-events`,
    { method: "GET" },
  );
  return parseResponse<ShipmentTrackingEventSummary[]>(response);
}

// ── Shipping Documents API ───────────────────────────────────

export async function uploadShippingDocument(
  shipmentId: string,
  file: File,
  label: string,
  documentReference?: string,
): Promise<ShipmentDocumentSummary> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label);
  if (documentReference) {
    formData.append("documentReference", documentReference);
  }

  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/documents`,
    {
      method: "POST",
      body: formData,
    },
  );
  return parseResponse<ShipmentDocumentSummary>(response);
}

export async function fetchShippingDocuments(
  shipmentId: string,
): Promise<ShipmentDocumentSummary[]> {
  const response = await send(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/documents`,
    { method: "GET" },
  );
  return parseResponse<ShipmentDocumentSummary[]>(response);
}

export function getShippingDocumentDownloadUrl(shipmentId: string, documentId: string): string {
  return endpoint(`/api/v1/shipments/${encodeURIComponent(shipmentId)}/documents/${encodeURIComponent(documentId)}/download`);
}

// ── Logistics Partner Portal API ─────────────────────────────

export async function fetchPartnerRequests(): Promise<LogisticsPartnerRequestSummary[]> {
  const response = await send("/api/v1/logistics/my-requests", { method: "GET" });
  return parseResponse<LogisticsPartnerRequestSummary[]>(response);
}

export async function fetchPartnerRequestById(
  requestId: string,
): Promise<LogisticsPartnerRequestSummary> {
  const response = await send(`/api/v1/logistics/my-requests/${encodeURIComponent(requestId)}`, {
    method: "GET",
  });
  return parseResponse<LogisticsPartnerRequestSummary>(response);
}

export async function submitPartnerQuotation(
  requestId: string,
  input: SubmitFreightQuotationInput,
): Promise<FreightQuotationSummary> {
  const response = await send(
    `/api/v1/logistics/my-requests/${encodeURIComponent(requestId)}/quotation`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<FreightQuotationSummary>(response);
}

export async function fetchPartnerActiveShipments(): Promise<ShipmentSummary[]> {
  const response = await send("/api/v1/logistics/my-active-shipments", { method: "GET" });
  return parseResponse<ShipmentSummary[]>(response);
}

// ── Administrative Settlement API ────────────────────────────

export async function createSettlement(
  tradeId: string,
  input: CreateSettlementInput,
): Promise<SettlementDetail> {
  const response = await send(`/api/v1/trades/${encodeURIComponent(tradeId)}/settlement`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseResponse<SettlementDetail>(response);
}

export async function fetchSettlementByTradeId(
  tradeId: string,
): Promise<SettlementDetail | null> {
  const response = await send(`/api/v1/trades/${encodeURIComponent(tradeId)}/settlement`, {
    method: "GET",
  });
  if (response.status === 404) {
    return null;
  }
  return parseResponse<SettlementDetail>(response);
}

export async function fetchSettlementById(
  settlementId: string,
): Promise<SettlementDetail> {
  const response = await send(`/api/v1/settlements/${encodeURIComponent(settlementId)}`, {
    method: "GET",
  });
  return parseResponse<SettlementDetail>(response);
}

export async function updateSettlement(
  settlementId: string,
  input: UpdateSettlementInput,
): Promise<SettlementDetail> {
  const response = await send(`/api/v1/settlements/${encodeURIComponent(settlementId)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return parseResponse<SettlementDetail>(response);
}

export async function uploadSettlementDocument(
  settlementId: string,
  file: File,
  documentType: SettlementDocumentType,
  documentReference?: string,
): Promise<SettlementDocumentSummary> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);
  formData.append("label", documentType);
  if (documentReference) {
    formData.append("documentReference", documentReference);
  }

  const response = await send(
    `/api/v1/settlements/${encodeURIComponent(settlementId)}/documents`,
    {
      method: "POST",
      body: formData,
    },
  );
  return parseResponse<SettlementDocumentSummary>(response);
}

export function getSettlementDocumentDownloadUrl(settlementId: string, documentId: string): string {
  return endpoint(`/api/v1/settlements/${encodeURIComponent(settlementId)}/documents/${encodeURIComponent(documentId)}/download`);
}

export async function createSettlementClaim(
  settlementId: string,
  input: CreateSettlementClaimInput,
): Promise<SettlementClaimSummary> {
  const response = await send(
    `/api/v1/settlements/${encodeURIComponent(settlementId)}/claims`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<SettlementClaimSummary>(response);
}

export async function resolveSettlementClaim(
  settlementId: string,
  claimId: string,
  input: ResolveSettlementClaimInput,
): Promise<SettlementClaimSummary> {
  const response = await send(
    `/api/v1/settlements/${encodeURIComponent(settlementId)}/claims/${encodeURIComponent(claimId)}/resolve`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return parseResponse<SettlementClaimSummary>(response);
}
