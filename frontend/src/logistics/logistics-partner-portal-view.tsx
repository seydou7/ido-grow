"use client";

import { useEffect, useState } from "react";
import type {
  ConfirmDeliveryInput,
  CustomsStatusInput,
  LogisticsPartnerRequestSummary,
  MarkInTransitInput,
  MarkPickedUpInput,
  RecordDiscrepancyInput,
  ReportDelayInput,
  SchedulePickupInput,
  ShipmentDetail,
  ShipmentSummary,
} from "./contracts";
import {
  confirmDelivery,
  fetchPartnerActiveShipments,
  fetchPartnerRequests,
  fetchShipmentById,
  getShippingDocumentDownloadUrl,
  markInTransit,
  markPickedUp,
  recordDiscrepancy,
  reportDelay,
  schedulePickup,
  setCustomsStatus,
  submitPartnerQuotation,
  uploadShippingDocument,
} from "./api";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}

export function LogisticsPartnerPortalView() {
  const [activeTab, setActiveTab] = useState<"invitations" | "active_shipments">("invitations");

  // Requests state
  const [requests, setRequests] = useState<LogisticsPartnerRequestSummary[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LogisticsPartnerRequestSummary | null>(null);

  // Active Shipments state
  const [activeShipments, setActiveShipments] = useState<ShipmentSummary[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    freightAmount: 0,
    currency: "EUR",
    validUntil: "",
    proposedPickupDate: "",
    estimatedDeliveryDate: "",
    notes: "",
  });

  // Action forms state
  const [pickupForm, setPickupForm] = useState<SchedulePickupInput>({ scheduledPickupAt: "", notes: "" });
  const [pickedUpForm, setPickedUpForm] = useState<MarkPickedUpInput>({ actualPickupAt: "", location: "", notes: "" });
  const [inTransitForm, setInTransitForm] = useState<MarkInTransitInput>({ location: "", notes: "" });
  const [customsForm, setCustomsForm] = useState<CustomsStatusInput>({ location: "", notes: "" });
  const [delayForm, setDelayForm] = useState<ReportDelayInput>({ delayReason: "", revisedExpectedDeliveryDate: "", notes: "" });
  const [deliveryForm, setDeliveryForm] = useState<ConfirmDeliveryInput>({ deliveredAt: "", deliveredLocation: "", deliveryNotes: "" });
  const [discrepancyForm, setDiscrepancyForm] = useState<RecordDiscrepancyInput>({
    type: "DAMAGE",
    description: "",
    expectedQuantity: 0,
    deliveredQuantity: 0,
    quantityUnit: "KG",
  });

  const [docFile, setDocFile] = useState<File | null>(null);
  const [docLabel, setDocLabel] = useState("");
  const [docRef, setDocRef] = useState("");

  // Modal visibility
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showPickedUpModal, setShowPickedUpModal] = useState(false);
  const [showInTransitModal, setShowInTransitModal] = useState(false);
  const [showCustomsModal, setShowCustomsModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqData, shipmentsData] = await Promise.all([
        fetchPartnerRequests(),
        fetchPartnerActiveShipments().catch(() => []),
      ]);
      setRequests(reqData);
      setActiveShipments(shipmentsData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load logistics partner data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRequest = (req: LogisticsPartnerRequestSummary) => {
    setSelectedRequest(req);
    setError(null);
    setSuccess(null);
    setQuoteForm({
      freightAmount: req.ownQuotation?.freightAmount ?? 0,
      currency: req.ownQuotation?.currency ?? "EUR",
      validUntil: req.ownQuotation?.validUntil ? req.ownQuotation.validUntil.substring(0, 10) : "",
      proposedPickupDate: req.ownQuotation?.proposedPickupDate ? req.ownQuotation.proposedPickupDate.substring(0, 10) : "",
      estimatedDeliveryDate: req.ownQuotation?.estimatedDeliveryDate ? req.ownQuotation.estimatedDeliveryDate.substring(0, 10) : "",
      notes: req.ownQuotation?.notes ?? "",
    });
  };

  const handleOpenShipment = async (shipmentSummary: ShipmentSummary) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const detail = await fetchShipmentById(shipmentSummary.id);
      setSelectedShipment(detail);
      setDiscrepancyForm((prev) => ({ ...prev, quantityUnit: detail.quantityUnit }));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load shipment details"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await submitPartnerQuotation(selectedRequest.id, {
        freightAmount: Number(quoteForm.freightAmount),
        currency: quoteForm.currency,
        validUntil: quoteForm.validUntil ? new Date(quoteForm.validUntil).toISOString() : null,
        proposedPickupDate: quoteForm.proposedPickupDate ? new Date(quoteForm.proposedPickupDate).toISOString() : null,
        estimatedDeliveryDate: quoteForm.estimatedDeliveryDate ? new Date(quoteForm.estimatedDeliveryDate).toISOString() : null,
        notes: quoteForm.notes?.trim() || null,
      });
      setSuccess("Freight quotation submitted successfully!");
      await loadData();
      setSelectedRequest(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to submit quotation"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const reloadSelectedShipment = async () => {
    if (!selectedShipment) return;
    const detail = await fetchShipmentById(selectedShipment.id);
    setSelectedShipment(detail);
    await loadData();
  };

  // Execution actions
  const handleSchedulePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !pickupForm.scheduledPickupAt) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await schedulePickup(selectedShipment.id, {
        scheduledPickupAt: new Date(pickupForm.scheduledPickupAt).toISOString(),
        notes: pickupForm.notes?.trim() || null,
      });
      setShowPickupModal(false);
      setSuccess("Pickup scheduled successfully.");
      await reloadSelectedShipment();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to schedule pickup"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkPickedUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await markPickedUp(selectedShipment.id, {
        actualPickupAt: pickedUpForm.actualPickupAt ? new Date(pickedUpForm.actualPickupAt).toISOString() : new Date().toISOString(),
        location: pickedUpForm.location?.trim() || null,
        notes: pickedUpForm.notes?.trim() || null,
      });
      setShowPickedUpModal(false);
      setSuccess("Marked picked up successfully.");
      await reloadSelectedShipment();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to mark picked up"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkInTransit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await markInTransit(selectedShipment.id, {
        location: inTransitForm.location?.trim() || null,
        notes: inTransitForm.notes?.trim() || null,
      });
      setShowInTransitModal(false);
      setSuccess("Shipment marked in transit.");
      await reloadSelectedShipment();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to mark in transit"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomsStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await setCustomsStatus(selectedShipment.id, {
        location: customsForm.location?.trim() || null,
        notes: customsForm.notes?.trim() || null,
      });
      setShowCustomsModal(false);
      setSuccess("Customs status updated.");
      await reloadSelectedShipment();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update customs status"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !delayForm.delayReason.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await reportDelay(selectedShipment.id, {
        delayReason: delayForm.delayReason.trim(),
        revisedExpectedDeliveryDate: delayForm.revisedExpectedDeliveryDate ? new Date(delayForm.revisedExpectedDeliveryDate).toISOString() : null,
        notes: delayForm.notes?.trim() || null,
      });
      setShowDelayModal(false);
      setSuccess("Delay recorded.");
      await reloadSelectedShipment();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to report delay"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await confirmDelivery(selectedShipment.id, {
        deliveredAt: deliveryForm.deliveredAt ? new Date(deliveryForm.deliveredAt).toISOString() : new Date().toISOString(),
        deliveredLocation: deliveryForm.deliveredLocation?.trim() || null,
        deliveryNotes: deliveryForm.deliveryNotes?.trim() || null,
      });
      setShowDeliveryModal(false);
      setSuccess("Delivery confirmed successfully.");
      await reloadSelectedShipment();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to confirm delivery"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordDiscrepancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !discrepancyForm.description.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await recordDiscrepancy(selectedShipment.id, {
        type: discrepancyForm.type,
        description: discrepancyForm.description.trim(),
        expectedQuantity: discrepancyForm.type === "QUANTITY_DIFFERENCE" ? Number(discrepancyForm.expectedQuantity) : null,
        deliveredQuantity: discrepancyForm.type === "QUANTITY_DIFFERENCE" ? Number(discrepancyForm.deliveredQuantity) : null,
        quantityUnit: discrepancyForm.type === "QUANTITY_DIFFERENCE" ? selectedShipment.quantityUnit : null,
      });
      setShowDiscrepancyModal(false);
      setSuccess("Discrepancy recorded.");
      await reloadSelectedShipment();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to record discrepancy"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadShippingDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !docFile || !docLabel.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await uploadShippingDocument(selectedShipment.id, docFile, docLabel.trim(), docRef.trim() || undefined);
      setShowDocUploadModal(false);
      setDocFile(null);
      setDocLabel("");
      setDocRef("");
      setSuccess("Document uploaded successfully.");
      await reloadSelectedShipment();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to upload document"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="logistics-partner-portal-view">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece7dc] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#173f35]">Logistics Partner Portal</h2>
          <p className="text-xs text-[#6e7d77]">
            Transport quote invitations and operational execution of your assigned shipments.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="rounded-lg border border-[#dcd7cb] bg-white px-3 py-1.5 text-xs font-semibold text-[#52635c] hover:bg-[#faf8f1] disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* FEEDBACK BANNERS */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800" role="status">
          {success}
        </div>
      )}

      {/* PORTAL TABS */}
      <div className="flex gap-2 border-b border-[#ece7dc] pb-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setActiveTab("invitations");
            setSelectedShipment(null);
          }}
          className={`rounded-lg px-3 py-1.5 transition-colors ${
            activeTab === "invitations" ? "bg-[#173f35] text-white" : "text-[#52635c] hover:bg-[#ece7dc]"
          }`}
        >
          Quote Invitations ({requests.length})
        </button>
        <button
          type="button"
          data-testid="tab-active-shipments"
          onClick={() => {
            setActiveTab("active_shipments");
            setSelectedRequest(null);
          }}
          className={`rounded-lg px-3 py-1.5 transition-colors ${
            activeTab === "active_shipments" ? "bg-[#173f35] text-white" : "text-[#52635c] hover:bg-[#ece7dc]"
          }`}
        >
          My Active Shipments ({activeShipments.length})
        </button>
      </div>

      {/* TAB 1: QUOTE INVITATIONS */}
      {activeTab === "invitations" && (
        <>
          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#dcd7cb] bg-[#faf8f4] p-8 text-center">
              <p className="text-sm font-semibold text-[#173f35]">No transport invitations at this time</p>
              <p className="mt-1 text-xs text-[#8a9992]">
                When an I Do Grow Trader creates a freight request for your organisation, it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-[#ece7dc] bg-white p-4 shadow-xs hover:border-[#173f35] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#173f35]">Shipment #{req.shipmentNumber}</span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      {req.hasQuotation ? "QUOTED" : "REQUESTED"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-[#52635c] space-y-1">
                    <div>Origin: {req.origin || "Not specified"} → Destination: {req.destination || "Not specified"}</div>
                    <div>Quantity: {req.shipmentQuantity} {req.quantityUnit}</div>
                    {req.ownQuotation && (
                      <div className="font-bold text-[#173f35]">
                        Your Quote: {req.ownQuotation.freightAmount} {req.ownQuotation.currency}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenRequest(req)}
                    className="mt-3 w-full rounded-lg bg-[#173f35] py-1.5 text-xs font-bold text-white hover:bg-[#123129]"
                  >
                    {req.hasQuotation ? "Edit Quotation" : "Submit Quotation"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY ACTIVE SHIPMENTS */}
      {activeTab === "active_shipments" && (
        <>
          {!selectedShipment ? (
            activeShipments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dcd7cb] bg-[#faf8f4] p-8 text-center">
                <p className="text-sm font-semibold text-[#173f35]">No active assigned shipments</p>
                <p className="mt-1 text-xs text-[#8a9992]">
                  Shipments where your organisation was selected as carrier will appear here for operational execution.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeShipments.map((shp) => (
                  <div
                    key={shp.id}
                    className="rounded-xl border border-[#ece7dc] bg-white p-4 shadow-xs hover:border-[#173f35] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#173f35]">Shipment #{shp.shipmentNumber}</span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                        {shp.status}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[#52635c] space-y-1">
                      <div>Route: {shp.origin || "N/A"} → {shp.destination || "N/A"}</div>
                      <div>Quantity: {shp.shipmentQuantity} {shp.quantityUnit}</div>
                    </div>
                    <button
                      type="button"
                      data-testid={`open-shipment-${shp.id}`}
                      onClick={() => handleOpenShipment(shp)}
                      className="mt-3 w-full rounded-lg bg-[#173f35] py-1.5 text-xs font-bold text-white hover:bg-[#123129]"
                    >
                      Open Operational Execution
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Selected Shipment Detail View */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#ece7dc] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#173f35]">Shipment #{selectedShipment.shipmentNumber}</h3>
                  <p className="text-xs text-[#6e7d77]">Status: {selectedShipment.status}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedShipment(null)}
                  className="rounded-lg border border-[#dcd7cb] bg-white px-2.5 py-1 text-xs text-[#52635c] hover:bg-[#faf8f4]"
                >
                  ← Back to List
                </button>
              </div>

              {/* ACTION BAR FOR LOGISTICS PARTNER */}
              {selectedShipment.status !== "CLOSED" && (
                <div className="rounded-xl border border-[#dcd7cb] bg-[#faf8f4] p-3">
                  <div className="text-xs font-bold text-[#173f35] mb-2">Carrier Operational Controls</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedShipment.status === "CARRIER_SELECTED" && (
                      <button
                        type="button"
                        onClick={() => setShowPickupModal(true)}
                        className="rounded-lg bg-[#0369a1] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Schedule Pickup
                      </button>
                    )}
                    {selectedShipment.status === "PICKUP_SCHEDULED" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowPickedUpModal(true)}
                          className="rounded-lg bg-[#5b21b6] px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Mark Picked Up
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDelayModal(true)}
                          className="rounded-lg border border-[#ea580c] bg-white px-3 py-1.5 text-xs font-bold text-[#ea580c]"
                        >
                          Report Delay
                        </button>
                      </>
                    )}
                    {selectedShipment.status === "PICKED_UP" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowInTransitModal(true)}
                          className="rounded-lg bg-[#115e59] px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Mark In Transit
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDelayModal(true)}
                          className="rounded-lg border border-[#ea580c] bg-white px-3 py-1.5 text-xs font-bold text-[#ea580c]"
                        >
                          Report Delay
                        </button>
                      </>
                    )}
                    {(selectedShipment.status === "IN_TRANSIT" || selectedShipment.status === "CUSTOMS") && (
                      <>
                        {selectedShipment.status === "IN_TRANSIT" && (
                          <button
                            type="button"
                            onClick={() => setShowCustomsModal(true)}
                            className="rounded-lg bg-[#86198f] px-3 py-1.5 text-xs font-bold text-white"
                          >
                            Customs Status
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowDeliveryModal(true)}
                          className="rounded-lg bg-[#166534] px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Confirm Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDelayModal(true)}
                          className="rounded-lg border border-[#ea580c] bg-white px-3 py-1.5 text-xs font-bold text-[#ea580c]"
                        >
                          Report Delay
                        </button>
                      </>
                    )}
                    {selectedShipment.status === "DELIVERED" && (
                      <button
                        type="button"
                        onClick={() => setShowDiscrepancyModal(true)}
                        className="rounded-lg border border-[#b91c1c] bg-white px-3 py-1.5 text-xs font-bold text-[#b91c1c]"
                      >
                        Record Discrepancy
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TIMELINE & DOCUMENTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Timeline */}
                <div className="rounded-xl border border-[#ece7dc] bg-white p-3">
                  <h4 className="text-xs font-bold text-[#173f35] uppercase tracking-wider mb-2">Tracking History</h4>
                  {(!selectedShipment.trackingEvents || selectedShipment.trackingEvents.length === 0) ? (
                    <p className="text-xs text-[#8a9992]">No events recorded.</p>
                  ) : (
                    <div className="space-y-1.5 border-l-2 border-[#173f35] pl-3 text-xs">
                      {selectedShipment.trackingEvents.map((te) => (
                        <div key={te.id} className="text-[#2c3e38]">
                          <span className="font-bold">{te.resultingStatus}</span> • {new Date(te.occurredAt).toLocaleString()}
                          {te.notes && <div className="text-[11px] text-[#6e7d77]">{te.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="rounded-xl border border-[#ece7dc] bg-white p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#173f35] uppercase tracking-wider">Shipping Documents</h4>
                    {selectedShipment.status !== "CLOSED" && (
                      <button
                        type="button"
                        onClick={() => setShowDocUploadModal(true)}
                        className="rounded bg-[#173f35] px-2 py-0.5 text-[11px] font-bold text-white"
                      >
                        + Upload
                      </button>
                    )}
                  </div>
                  {(!selectedShipment.documents || selectedShipment.documents.length === 0) ? (
                    <p className="text-xs text-[#8a9992]">No documents uploaded.</p>
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      {selectedShipment.documents.map((d) => (
                        <div key={d.id} className="flex items-center justify-between border-b border-[#ece7dc] pb-1">
                          <span>{d.label} ({d.originalFilename})</span>
                          <a
                            href={getShippingDocumentDownloadUrl(selectedShipment.id, d.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#173f35] underline"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MODALS FOR PARTNER ── */}

      {/* QUOTE MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Submit Quotation for Shipment #{selectedRequest.shipmentNumber}</h3>
            <form onSubmit={handleSubmitQuote} className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Freight Amount</label>
                  <input
                    type="number"
                    required
                    value={quoteForm.freightAmount || ""}
                    onChange={(e) => setQuoteForm({ ...quoteForm, freightAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Currency</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.currency}
                    onChange={(e) => setQuoteForm({ ...quoteForm, currency: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setSelectedRequest(null)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                >
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PICKUP MODAL */}
      {showPickupModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Schedule Pickup</h3>
            <form onSubmit={handleSchedulePickup} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Scheduled Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={pickupForm.scheduledPickupAt}
                  onChange={(e) => setPickupForm({ ...pickupForm, scheduledPickupAt: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowPickupModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#0369a1] px-3 py-1 text-xs font-bold text-white">
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK PICKED UP MODAL */}
      {showPickedUpModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Mark Goods Picked Up</h3>
            <form onSubmit={handleMarkPickedUp} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={pickedUpForm.location || ""}
                  onChange={(e) => setPickedUpForm({ ...pickedUpForm, location: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowPickedUpModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#5b21b6] px-3 py-1 text-xs font-bold text-white">
                  Confirm Picked Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK IN TRANSIT MODAL */}
      {showInTransitModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Mark In Transit</h3>
            <form onSubmit={handleMarkInTransit} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Transit Corridor</label>
                <input
                  type="text"
                  value={inTransitForm.location || ""}
                  onChange={(e) => setInTransitForm({ ...inTransitForm, location: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowInTransitModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#115e59] px-3 py-1 text-xs font-bold text-white">
                  Set In Transit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMS MODAL */}
      {showCustomsModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Customs Status</h3>
            <form onSubmit={handleCustomsStatus} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Customs Office</label>
                <input
                  type="text"
                  value={customsForm.location || ""}
                  onChange={(e) => setCustomsForm({ ...customsForm, location: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowCustomsModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#86198f] px-3 py-1 text-xs font-bold text-white">
                  Set Customs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELAY MODAL */}
      {showDelayModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#ea580c]">Report Delay</h3>
            <form onSubmit={handleReportDelay} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Reason for Delay</label>
                <input
                  type="text"
                  required
                  value={delayForm.delayReason}
                  onChange={(e) => setDelayForm({ ...delayForm, delayReason: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowDelayModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#ea580c] px-3 py-1 text-xs font-bold text-white">
                  Report Delay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELIVERY MODAL */}
      {showDeliveryModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#166534]">Confirm Delivery</h3>
            <form onSubmit={handleConfirmDelivery} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Delivery Location</label>
                <input
                  type="text"
                  value={deliveryForm.deliveredLocation || ""}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveredLocation: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowDeliveryModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#166534] px-3 py-1 text-xs font-bold text-white">
                  Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISCREPANCY MODAL */}
      {showDiscrepancyModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#b91c1c]">Record Discrepancy</h3>
            <form onSubmit={handleRecordDiscrepancy} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Type</label>
                <select
                  value={discrepancyForm.type}
                  onChange={(e) => setDiscrepancyForm({ ...discrepancyForm, type: e.target.value as "DAMAGE" | "QUANTITY_DIFFERENCE" })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                >
                  <option value="DAMAGE">DAMAGE</option>
                  <option value="QUANTITY_DIFFERENCE">QUANTITY_DIFFERENCE</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={discrepancyForm.description}
                  onChange={(e) => setDiscrepancyForm({ ...discrepancyForm, description: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowDiscrepancyModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#b91c1c] px-3 py-1 text-xs font-bold text-white">
                  Submit Discrepancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD SHIPPING DOC MODAL */}
      {showDocUploadModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Upload Shipping Document</h3>
            <form onSubmit={handleUploadShippingDoc} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Label</label>
                <input
                  type="text"
                  required
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                  placeholder="e.g. Proof of Delivery (POD)"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#52635c]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowDocUploadModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || !docFile} className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
