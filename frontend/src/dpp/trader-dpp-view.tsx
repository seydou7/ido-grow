"use client";

import React, { useEffect, useState } from "react";
import type {
  DigitalProductPassportResponse,
  DPPCustodyRecordResponse,
  DPPEventResponse,
  DPPVersionResponse,
  DppQrResult,
  PassportViewResponse,
  TraceableLotResponse,
} from "./contracts";
import {
  createPassportForLot,
  downloadPassportPdf,
  fetchLots,
  fetchPassportById,
  fetchPassportCustody,
  fetchPassportEvents,
  fetchPassportQr,
  fetchPassports,
  fetchPassportVersions,
  fetchPassportView,
  syncPassport,
} from "./api";
import { CreateLotModal } from "./create-lot-modal";
import { PassportView } from "./passport-view";
import { DppQrModal } from "./dpp-qr-modal";

type DppTab =
  | "identity"
  | "origin"
  | "quality"
  | "transaction"
  | "logistics"
  | "timeline"
  | "custody"
  | "versions";

export function TraderDppView(): React.JSX.Element {
  const [passports, setPassports] = useState<DigitalProductPassportResponse[]>([]);
  const [lots, setLots] = useState<TraceableLotResponse[]>([]);
  const [selectedDppId, setSelectedDppId] = useState<string | null>(null);
  const [activeDpp, setActiveDpp] = useState<DigitalProductPassportResponse | null>(null);
  const [events, setEvents] = useState<DPPEventResponse[]>([]);
  const [custodyRecords, setCustodyRecords] = useState<DPPCustodyRecordResponse[]>([]);
  const [versions, setVersions] = useState<DPPVersionResponse[]>([]);
  const [activeTab, setActiveTab] = useState<DppTab>("timeline");

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [creatingDppLotId, setCreatingDppLotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);
  const [inspectSnapshot, setInspectSnapshot] = useState<object | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [viewMode, setViewMode] = useState<"detail" | "passport">("detail");
  const [passportViewData, setPassportViewData] = useState<PassportViewResponse | null>(null);
  const [activeQr, setActiveQr] = useState<DppQrResult | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dppsData, lotsData] = await Promise.all([
        fetchPassports(),
        fetchLots(),
      ]);
      setPassports(dppsData);
      setLots(lotsData);
    } catch {
      setNotification({ message: "Failed to load Digital Product Passports.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function selectPassport(dppId: string) {
    setSelectedDppId(dppId);
    setDetailLoading(true);
    try {
      const [dppData, eventsData, custodyData, versionsData] = await Promise.all([
        fetchPassportById(dppId),
        fetchPassportEvents(dppId),
        fetchPassportCustody(dppId),
        fetchPassportVersions(dppId),
      ]);
      setActiveDpp(dppData);
      setEvents(eventsData);
      setCustodyRecords(custodyData);
      setVersions(versionsData);
    } catch {
      setNotification({ message: "Failed to load passport details.", type: "error" });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSync() {
    if (!activeDpp) return;
    setSyncing(true);
    try {
      const updated = await syncPassport(activeDpp.id);
      setActiveDpp(updated);
      const [eventsData, custodyData, versionsData] = await Promise.all([
        fetchPassportEvents(activeDpp.id),
        fetchPassportCustody(activeDpp.id),
        fetchPassportVersions(activeDpp.id),
      ]);
      setEvents(eventsData);
      setCustodyRecords(custodyData);
      setVersions(versionsData);
      setNotification({ message: "Passport synchronized successfully with authoritative events.", type: "success" });
    } catch {
      setNotification({ message: "Failed to synchronize passport.", type: "error" });
    } finally {
      setSyncing(false);
    }
  }

  async function handleCreateDpp(lotId: string) {
    setCreatingDppLotId(lotId);
    try {
      const newDpp = await createPassportForLot(lotId);
      setNotification({ message: `Digital Product Passport ${newDpp.passportNumber} created!`, type: "success" });
      await loadData();
      selectPassport(newDpp.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create passport.";
      setNotification({ message: msg, type: "error" });
    } finally {
      setCreatingDppLotId(null);
    }
  }

  async function handleOpenPassport(dppId: string, versionNumber?: number) {
    setDetailLoading(true);
    try {
      const data = await fetchPassportView(dppId, versionNumber);
      setPassportViewData(data);
      setViewMode("passport");
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to load passport view.",
        type: "error",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDownloadPdf(dppId: string, versionNumber?: number) {
    setDownloadingPdf(true);
    try {
      await downloadPassportPdf(dppId, versionNumber);
      setNotification({ message: "Passport PDF downloaded successfully.", type: "success" });
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to download passport PDF.",
        type: "error",
      });
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleShowQr(dppId: string) {
    try {
      const qr = await fetchPassportQr(dppId);
      setActiveQr(qr);
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to load QR code.",
        type: "error",
      });
    }
  }

  const lotsWithoutDpp = lots.filter((l) => !l.hasDpp);

  const filteredPassports = passports.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.passportNumber.toLowerCase().includes(q) ||
      p.lot.lotNumber.toLowerCase().includes(q) ||
      p.lot.materialType.toLowerCase().includes(q) ||
      (p.lot.supplierName?.toLowerCase().includes(q) ?? false) ||
      (p.lot.countryOfOrigin?.toLowerCase().includes(q) ?? false)
    );
  });

  if (viewMode === "passport" && passportViewData) {
    return (
      <PassportView
        initialData={passportViewData}
        userRole="TRADER"
        onBack={() => setViewMode("detail")}
      />
    );
  }

  return (
    <div className="space-y-6 text-[#f3f4f6]">
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs border ${
            notification.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/40 border-red-500/40 text-red-200"
          }`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs opacity-75 hover:opacity-100 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {selectedDppId && activeDpp ? (
        // ── DETAIL VIEW ──────────────────────────────────────────
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#234d40] pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedDppId(null);
                  setActiveDpp(null);
                  loadData();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#234d40] bg-[#142922] px-3 py-1.5 text-xs font-medium text-[#d1d5db] hover:text-white hover:bg-[#1a382f] transition-colors"
              >
                ← All Passports
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">{activeDpp.passportNumber}</h1>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    v{activeDpp.currentVersionNumber}
                  </span>
                  <span className="rounded-full bg-[#1b3e34] px-2 py-0.5 text-[11px] font-medium text-[#9ca3af]">
                    {activeDpp.status}
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  Linked Lot: <span className="font-mono text-emerald-300">{activeDpp.lot.lotNumber}</span>
                  {activeDpp.lot.supplierName ? ` • Producer: ${activeDpp.lot.supplierName}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleShowQr(activeDpp.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#234d40] bg-[#142922] px-3 py-2 text-xs font-semibold text-[#d1d5db] hover:text-white hover:bg-[#1a382f] shadow-sm transition"
              >
                <span>📱 QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPdf(activeDpp.id, activeDpp.currentVersionNumber)}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#234d40] bg-[#142922] px-3 py-2 text-xs font-semibold text-[#d1d5db] hover:text-white hover:bg-[#1a382f] shadow-sm transition disabled:opacity-50"
              >
                <span>{downloadingPdf ? "Generating..." : "📥 Download PDF"}</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenPassport(activeDpp.id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition"
              >
                <span>📄 View Passport Page</span>
              </button>
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/40 bg-emerald-950/40 hover:bg-emerald-900/60 px-3 py-2 text-xs font-semibold text-emerald-300 shadow-sm transition disabled:opacity-50"
              >
                <svg
                  className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {syncing ? "Syncing..." : "Sync"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-200">
            <span className="font-semibold">Block 02 Active:</span> Human-readable passport, downloadable PDF passport, QR entry point, and authorised counterparty access are active.
          </div>

          {detailLoading ? (
            <div className="py-12 text-center text-xs text-[#9ca3af]">Loading passport data...</div>
          ) : (
            <>
              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-1 border-b border-[#234d40] pb-2">
                {(
                  [
                    { id: "timeline", label: `Timeline (${events.length})` },
                    { id: "custody", label: `Custody (${custodyRecords.length})` },
                    { id: "identity", label: "Identity & Lot" },
                    { id: "origin", label: "Origin & Site" },
                    { id: "quality", label: "Quality & Certs" },
                    { id: "transaction", label: "Transaction" },
                    { id: "logistics", label: "Logistics" },
                    { id: "versions", label: `Versions (${versions.length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-emerald-600 text-white"
                        : "text-[#9ca3af] hover:text-white hover:bg-[#142922]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="mt-4">
                {activeTab === "timeline" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white">Authoritative Event History</h3>
                    {events.length === 0 ? (
                      <p className="text-xs text-[#9ca3af]">No events projected yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {events.map((ev) => (
                          <div
                            key={ev.id}
                            className="rounded-xl border border-[#234d40] bg-[#142922] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-white">{ev.eventType}</span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    ev.verificationStatus === "VERIFIED"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                      : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                                  }`}
                                >
                                  {ev.verificationStatus}
                                </span>
                              </div>
                              <p className="text-xs text-[#9ca3af]">
                                Source: <span className="font-mono text-emerald-300">{ev.sourceType}:{ev.sourceId}</span>
                                {ev.location ? ` • Location: ${ev.location}` : ""}
                              </p>
                              {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                                <p className="text-[11px] text-[#9ca3af] font-mono">
                                  {JSON.stringify(ev.metadata)}
                                </p>
                              )}
                            </div>
                            <div className="text-right sm:shrink-0 text-xs text-[#9ca3af]">
                              <div>Occurred: {new Date(ev.occurredAt).toLocaleString()}</div>
                              <div className="text-[10px] text-zinc-500">Recorded: {new Date(ev.recordedAt).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "custody" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white">Chain of Custody Milestones</h3>
                    {custodyRecords.length === 0 ? (
                      <p className="text-xs text-[#9ca3af]">No custody milestones recorded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {custodyRecords.map((cr) => (
                          <div
                            key={cr.id}
                            className="rounded-xl border border-[#234d40] bg-[#142922] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <span className="font-mono text-xs font-semibold text-white">{cr.milestone}</span>
                              <p className="text-xs text-[#d1d5db]">
                                {cr.notes || "Custody milestone recorded in trade lifecycle"}
                              </p>
                              <p className="text-xs text-[#9ca3af]">
                                Source: <span className="font-mono text-emerald-300">{cr.sourceType}:{cr.sourceId}</span>
                                {cr.location ? ` • Location: ${cr.location}` : ""}
                              </p>
                            </div>
                            <div className="text-right sm:shrink-0 text-xs text-[#9ca3af]">
                              <div>{new Date(cr.occurredAt).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "identity" && (
                  <div className="rounded-xl border border-[#234d40] bg-[#142922] p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-white">Physical Lot Identity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[#9ca3af] block">Passport Number</span>
                        <span className="font-mono font-semibold text-white">{activeDpp.passportNumber}</span>
                      </div>
                      <div>
                        <span className="text-[#9ca3af] block">Lot Reference</span>
                        <span className="font-mono font-semibold text-emerald-300">{activeDpp.lot.lotNumber}</span>
                      </div>
                      <div>
                        <span className="text-[#9ca3af] block">Material Type</span>
                        <span className="font-semibold text-white">{activeDpp.lot.materialType}</span>
                      </div>
                      <div>
                        <span className="text-[#9ca3af] block">Product Form</span>
                        <span className="text-white">{activeDpp.lot.productForm || "Not recorded"}</span>
                      </div>
                      <div>
                        <span className="text-[#9ca3af] block">Quantity</span>
                        <span className="font-semibold text-white">{activeDpp.lot.quantity} {activeDpp.lot.quantityUnit}</span>
                      </div>
                      <div>
                        <span className="text-[#9ca3af] block">Batch Reference</span>
                        <span className="font-mono text-white">{activeDpp.lot.batchReference || "Not recorded"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "origin" && (
                  <div className="rounded-xl border border-[#234d40] bg-[#142922] p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-white">Origin & Production Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#9ca3af] block">Producer / Supplier</span>
                        <span className="font-semibold text-white">{activeDpp.lot.supplierName || "Not recorded"}</span>
                      </div>
                      <div>
                        <span className="text-[#9ca3af] block">Production Site</span>
                        <span className="text-white">{activeDpp.lot.productionSiteName || "Not recorded"}</span>
                      </div>
                      <div>
                        <span className="text-[#9ca3af] block">Country of Origin</span>
                        <span className="text-white">{activeDpp.lot.countryOfOrigin || "Not recorded"}</span>
                      </div>
                      <div>
                        <span className="text-[#9ca3af] block">Region / Farm Parcel</span>
                        <span className="text-white">{activeDpp.lot.regionOfOrigin || "Not recorded"}</span>
                      </div>
                      <div>
                        <span className="text-[#9ca3af] block">Harvest / Production Date</span>
                        <span className="text-white">
                          {activeDpp.lot.productionDate ? new Date(activeDpp.lot.productionDate).toLocaleDateString() : "Not recorded"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "quality" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#234d40] bg-[#142922] p-5 space-y-3">
                      <h3 className="text-sm font-semibold text-white">Quality Verification</h3>
                      {activeDpp.currentSnapshot?.quality.inspections.length ? (
                        <div className="space-y-2">
                          {activeDpp.currentSnapshot.quality.inspections.map((insp) => (
                            <div key={insp.inspectionReference} className="border border-[#234d40] rounded-lg p-3 text-xs flex justify-between items-center">
                              <div>
                                <span className="font-mono font-semibold text-white">{insp.inspectionReference}</span>
                                <span className="text-[#9ca3af] ml-2">Status: {insp.status}</span>
                                {insp.humanClassificationLabel && (
                                  <p className="text-emerald-300 font-medium mt-1">Classification: {insp.humanClassificationLabel}</p>
                                )}
                              </div>
                              <div className="text-right">
                                {insp.decision && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${insp.decision === "APPROVED" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                                    {insp.decision}
                                  </span>
                                )}
                                {insp.certificateReference && (
                                  <p className="font-mono text-[11px] text-[#9ca3af] mt-1">{insp.certificateReference}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#9ca3af]">No inspection records attached.</p>
                      )}
                    </div>

                    <div className="rounded-xl border border-[#234d40] bg-[#142922] p-5 space-y-3">
                      <h3 className="text-sm font-semibold text-white">Certifications & Compliance</h3>
                      {activeDpp.currentSnapshot?.certifications.length ? (
                        <div className="space-y-2">
                          {activeDpp.currentSnapshot.certifications.map((doc) => (
                            <div key={doc.originalFilename} className="border border-[#234d40] rounded-lg p-3 text-xs flex justify-between items-center">
                              <div>
                                <span className="font-semibold text-white">{doc.documentType}</span>
                                <p className="text-[#9ca3af]">{doc.originalFilename}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300">
                                {doc.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#9ca3af]">No compliance certificates recorded.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "transaction" && (
                  <div className="rounded-xl border border-[#234d40] bg-[#142922] p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-white">Commercial Transaction</h3>
                    {activeDpp.currentSnapshot?.transaction.length ? (
                      <div className="space-y-3">
                        {activeDpp.currentSnapshot.transaction.map((tx) => (
                          <div key={tx.tradeNumber} className="border border-[#234d40] rounded-lg p-3 text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="font-mono font-semibold text-white">{tx.tradeNumber}</span>
                              <span className="text-[#9ca3af]">{new Date(tx.acceptedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[#d1d5db]">Buyer: <span className="font-medium text-white">{tx.buyerOrganisationName}</span></p>
                            <p className="text-[#9ca3af]">Agreed Quantity: {tx.quantity} {tx.quantityUnit}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#9ca3af]">No commercial trade attached to this lot yet.</p>
                    )}
                    <p className="text-[11px] text-[#9ca3af] italic">
                      Notice: Internal trader margins, commercial pricing, and bank instructions are omitted from the DPP for counterparty privacy.
                    </p>
                  </div>
                )}

                {activeTab === "logistics" && (
                  <div className="rounded-xl border border-[#234d40] bg-[#142922] p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-white">Logistics & Shipments</h3>
                    {activeDpp.currentSnapshot?.logistics.length ? (
                      <div className="space-y-3">
                        {activeDpp.currentSnapshot.logistics.map((sh) => (
                          <div key={sh.shipmentNumber} className="border border-[#234d40] rounded-lg p-3 text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-semibold text-white">{sh.shipmentNumber}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                {sh.status}
                              </span>
                            </div>
                            <p className="text-[#d1d5db]">Route: {sh.origin || "Origin"} → {sh.destination || "Destination"}</p>
                            {sh.carrierName && <p className="text-[#9ca3af]">Carrier: {sh.carrierName}</p>}
                            {sh.deliveredAt && (
                              <p className="text-emerald-400">Delivered: {new Date(sh.deliveredAt).toLocaleString()}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#9ca3af]">No shipments recorded for this lot yet.</p>
                    )}
                  </div>
                )}

                {activeTab === "versions" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white">Immutable Version History</h3>
                    <div className="space-y-3">
                      {versions.map((v) => (
                        <div
                          key={v.id}
                          className="rounded-xl border border-[#234d40] bg-[#142922] p-4 flex justify-between items-center text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">Version {v.versionNumber}</span>
                              {v.versionNumber === activeDpp.currentVersionNumber && (
                                <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-[#9ca3af] mt-1">{v.changeReason || "Authoritative milestone recorded"}</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">Created: {new Date(v.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenPassport(activeDpp.id, v.versionNumber)}
                              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                            >
                              View Passport (v{v.versionNumber})
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(activeDpp.id, v.versionNumber)}
                              className="rounded-lg border border-[#234d40] px-2.5 py-1.5 text-xs text-[#d1d5db] hover:text-white hover:bg-[#1a382f] transition-colors"
                            >
                              📥 PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => setInspectSnapshot(v.snapshot)}
                              className="rounded-lg border border-[#234d40] px-2.5 py-1.5 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1a382f] transition-colors"
                            >
                              Inspect Snapshot
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Inspect Snapshot Modal */}
          {inspectSnapshot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-2xl rounded-2xl bg-[#0f1f1a] border border-[#234d40] p-6 shadow-2xl text-[#f3f4f6]">
                <div className="flex items-center justify-between pb-3 border-b border-[#234d40] mb-4">
                  <h3 className="text-sm font-semibold text-white">Immutable Passport Snapshot</h3>
                  <button
                    type="button"
                    onClick={() => setInspectSnapshot(null)}
                    className="text-xs text-[#9ca3af] hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <pre className="max-h-96 overflow-auto rounded-xl bg-[#0b1613] p-4 text-[11px] font-mono text-emerald-300">
                  {JSON.stringify(inspectSnapshot, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ) : (
        // ── LIST VIEW ────────────────────────────────────────────
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#234d40] pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Digital Product Passports</h1>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                Traceable natural-fibre lots, immutable provenance events & versioned digital product passports.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLotModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-colors"
            >
              + Create Traceable Lot
            </button>
          </div>

          {/* Lots Pending DPP Action */}
          {lotsWithoutDpp.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/30 bg-[#122b23] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Lots Ready for DPP Generation</h2>
                  <p className="text-xs text-emerald-200/80">
                    Traceable lots established without an active digital product passport.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                  {lotsWithoutDpp.length} pending
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {lotsWithoutDpp.map((lot) => (
                  <div
                    key={lot.id}
                    className="rounded-xl border border-[#234d40] bg-[#0f1f1a] p-3.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-semibold text-emerald-300">{lot.lotNumber}</span>
                      <p className="text-white font-medium mt-0.5">{lot.materialType} • {lot.quantity} {lot.quantityUnit}</p>
                      <p className="text-[11px] text-[#9ca3af]">{lot.supplierName || "Producer"} • {lot.countryOfOrigin || "Origin not set"}</p>
                    </div>
                    <button
                      type="button"
                      disabled={creatingDppLotId === lot.id}
                      onClick={() => handleCreateDpp(lot.id)}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                    >
                      {creatingDppLotId === lot.id ? "Creating..." : "Create DPP"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by passport #, lot #, material, supplier, or origin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Passports List */}
          {loading ? (
            <div className="py-12 text-center text-xs text-[#9ca3af]">Loading passports...</div>
          ) : filteredPassports.length === 0 ? (
            <div className="rounded-2xl border border-[#234d40] bg-[#142922] p-12 text-center text-xs text-[#9ca3af]">
              No Digital Product Passports match your query. Create a traceable lot to begin.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#234d40] bg-[#142922]">
              <table className="w-full text-left text-xs text-[#d1d5db]">
                <thead className="border-b border-[#234d40] bg-[#0f1f1a] text-[11px] uppercase text-[#9ca3af]">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">DPP Reference</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Lot Number</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Producer / Supplier</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Material</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Origin</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Version</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Events</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#234d40]">
                  {filteredPassports.map((p) => (
                    <tr key={p.id} className="hover:bg-[#1a382f]/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-semibold text-white">{p.passportNumber}</td>
                      <td className="px-4 py-3.5 font-mono text-emerald-300">{p.lot.lotNumber}</td>
                      <td className="px-4 py-3.5 font-medium text-white">{p.lot.supplierName || "—"}</td>
                      <td className="px-4 py-3.5">{p.lot.materialType} {p.lot.productForm ? `(${p.lot.productForm})` : ""}</td>
                      <td className="px-4 py-3.5">{p.lot.countryOfOrigin || "Not recorded"}</td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold">
                          v{p.currentVersionNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{p.eventsCount}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPassport(p.id)}
                            className="rounded-lg bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 px-2.5 py-1 text-xs font-medium text-emerald-300 transition-colors"
                            title="View Human-Readable Passport"
                          >
                            Passport
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(p.id)}
                            className="rounded-lg border border-[#234d40] hover:bg-[#1a382f] px-2 py-1 text-xs text-[#d1d5db] transition-colors"
                            title="Download Passport PDF"
                          >
                            📥
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShowQr(p.id)}
                            className="rounded-lg border border-[#234d40] hover:bg-[#1a382f] px-2 py-1 text-xs text-[#d1d5db] transition-colors"
                            title="View Passport QR Code"
                          >
                            📱
                          </button>
                          <button
                            type="button"
                            onClick={() => selectPassport(p.id)}
                            className="rounded-lg bg-[#234d40] hover:bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition-colors"
                            title="Manage DPP Details & Custody"
                          >
                            Manage →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <CreateLotModal
            isOpen={isLotModalOpen}
            onClose={() => setIsLotModalOpen(false)}
            onLotCreated={(lot) => {
              setNotification({ message: `Lot ${lot.lotNumber} created successfully!`, type: "success" });
              loadData();
            }}
          />
        </div>
      )}
    </div>
  );
}
