"use client";

import { useEffect, useState } from "react";
import { BREAKDOWN_FIELD_LABELS, type CommercialBreakdown } from "../quotes/contracts";
import { getTraderTradeById, getTraderTrades, TradesRequestError } from "./api";
import type { TradeDetail, TradeSummary } from "./contracts";
import { CreateInspectionModal, AssignInspectorModal } from "../quality";
import { TradeContractSection } from "../contracts/trade-contract-section";

export interface TraderTradesViewProps {
  onOpenMatchingWorkspace?: (buyOrderId: string) => void;
  onNavigateSection?: (section: string) => void;
  onOpenInspection?: (inspectionId: string) => void;
  onSelectTrade?: (tradeId: string) => void;
}

export function TraderTradesView({
  onOpenMatchingWorkspace,
  onNavigateSection,
  onOpenInspection,
  onSelectTrade,
}: TraderTradesViewProps) {
  const [trades, setTrades] = useState<TradeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [selectedTradeDetail, setSelectedTradeDetail] = useState<TradeDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isCreateInspectionOpen, setIsCreateInspectionOpen] = useState(false);
  const [isAssignInspectionOpen, setIsAssignInspectionOpen] = useState(false);
  const [activeInspectionIdToAssign, setActiveInspectionIdToAssign] = useState<string | null>(null);
  const [activeInspectionRefToAssign, setActiveInspectionRefToAssign] = useState<string | null>(null);

  const loadTrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTraderTrades();
      setTrades(data.items);
    } catch (err) {
      if (err instanceof TradesRequestError && err.status === 403) {
        setError("Access restricted. Trade records are accessible to authenticated Trader organisations.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load trade records.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTrades();
  }, []);

  const handleOpenDetail = async (id: string) => {
    if (onSelectTrade) {
      onSelectTrade(id);
      return;
    }
    setSelectedTradeId(id);
    setSelectedTradeDetail(null);
    setLoadingDetail(true);
    setDetailError(null);
    try {
      const detail = await getTraderTradeById(id);
      setSelectedTradeDetail(detail);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Failed to load trade detail.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedTradeId(null);
    setSelectedTradeDetail(null);
    setDetailError(null);
  };

  // KPI Calculations
  const totalTradesCount = trades.length;
  const totalVolume = trades.reduce((acc, t) => acc + t.quantity, 0);
  const uniqueBuyers = new Set(trades.map((t) => t.buyerOrganisationId)).size;
  const uniqueSuppliers = new Set(trades.map((t) => t.supplierOrganisationId)).size;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2dccd] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
              Sprint 06 · Commercial Baseline
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#173f35]">
            Commercial Transactions &amp; Trade Records
          </h1>
          <p className="mt-0.5 text-xs text-[#52635c]">
            Authoritative transaction records established upon buyer quotation acceptance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateSection && (
            <button
              type="button"
              onClick={() => onNavigateSection("trader-cockpit")}
              className="rounded-xl border border-[#e2dccd] bg-white px-3.5 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
            >
              ← Back to Cockpit
            </button>
          )}
          <button
            type="button"
            onClick={() => void loadTrades()}
            disabled={loading}
            className="rounded-xl border border-[#e2dccd] bg-white px-3.5 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh Trades"}
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-[#6e7d77] uppercase tracking-wider">
            Executed Trades
          </p>
          <p className="mt-1 text-2xl font-bold text-[#173f35]">{totalTradesCount}</p>
          <p className="mt-1 text-[11px] text-[#52635c]">Accepted commercial baselines</p>
        </div>

        <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-[#6e7d77] uppercase tracking-wider">
            Total Traded Volume
          </p>
          <p className="mt-1 text-2xl font-bold text-[#173f35]">
            {totalVolume.toLocaleString()} <span className="text-xs font-normal">tonnes</span>
          </p>
          <p className="mt-1 text-[11px] text-[#52635c]">Aggregated commodity volume</p>
        </div>

        <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-[#6e7d77] uppercase tracking-wider">
            Active Buyers
          </p>
          <p className="mt-1 text-2xl font-bold text-[#173f35]">{uniqueBuyers}</p>
          <p className="mt-1 text-[11px] text-[#52635c]">Unique procurement partners</p>
        </div>

        <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-[#6e7d77] uppercase tracking-wider">
            Active Suppliers
          </p>
          <p className="mt-1 text-2xl font-bold text-[#173f35]">{uniqueSuppliers}</p>
          <p className="mt-1 text-[11px] text-[#52635c]">Verified sourcing partners</p>
        </div>
      </div>

      {/* TRADES LIST TABLE */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-[#e2dccd] bg-[#fbf9f4] p-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#173f35]">Transaction Ledger</h2>
            <p className="mt-0.5 text-xs text-[#52635c]">
              Real transaction records produced from accepted commercial proposals
            </p>
          </div>
          <span className="rounded-full bg-[#faf8f1] px-3 py-1 text-xs font-bold text-[#173f35] border border-[#e2dccd]">
            {trades.length} Record{trades.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-[#6e7d77]">
            Loading transaction ledger...
          </div>
        ) : trades.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-[#173f35]">No trade records recorded yet</p>
            <p className="mt-1 text-xs text-[#52635c]">
              Trade records are created automatically when a Buyer organisation accepts a dispatched quotation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[11px] font-bold uppercase tracking-wider text-[#6e7d77]">
                  <th className="py-3 px-4">Trade Reference</th>
                  <th className="py-3 px-4">Buyer Organisation</th>
                  <th className="py-3 px-4">Supplier Organisation</th>
                  <th className="py-3 px-4">Material &amp; Form</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Accepted Quote</th>
                  <th className="py-3 px-4">Commercial Total</th>
                  <th className="py-3 px-4">Accepted Date</th>
                  <th className="py-3 px-4 text-right">Ledger Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece1]">
                {trades.map((trade) => {
                  const acceptedDate = new Date(trade.acceptedAt).toLocaleDateString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr key={trade.id} className="hover:bg-[#fcfaf5] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#173f35]">
                        <span className="font-mono text-xs">{trade.tradeNumber}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#173f35] max-w-[160px] truncate">
                        {trade.buyerOrganisationName}
                      </td>
                      <td className="py-3.5 px-4 text-[#52635c] max-w-[160px] truncate">
                        {trade.supplierOrganisationName}
                      </td>
                      <td className="py-3.5 px-4 text-[#173f35]">
                        <span>{trade.materialType}</span>
                        {trade.productForm && (
                          <span className="ml-1 text-[10px] text-[#6e7d77]">({trade.productForm})</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#173f35]">
                        {trade.quantity} {trade.quantityUnit}
                      </td>
                      <td className="py-3.5 px-4 text-[#52635c]">
                        <span className="font-medium text-[#173f35]">{trade.quoteNumber}</span>
                        <span className="ml-1 text-[10px] text-[#6e7d77]">(v{trade.acceptedQuoteVersionNumber})</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#173f35]">
                        {trade.acceptedTotalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[10px] font-semibold text-[#6e7d77]">{trade.currency}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6e7d77] text-[11px]">
                        {acceptedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => void handleOpenDetail(trade.id)}
                          className="inline-flex items-center rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all"
                        >
                          View Record →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedTradeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-[#e2dccd] bg-white shadow-2xl overflow-hidden">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#e2dccd] bg-[#fbf9f4] px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                    Commercial Baseline Established
                  </span>
                  <span className="text-xs font-mono text-[#6e7d77]">
                    {selectedTradeDetail?.tradeNumber || selectedTradeId}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-bold text-[#173f35]">
                  Trade Record &amp; Transaction Baseline
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-xl border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-bold text-[#173f35] hover:bg-[#faf8f1] transition-all"
              >
                ✕ Close
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="overflow-y-auto p-6 space-y-6">
              {loadingDetail ? (
                <div className="py-12 text-center text-xs text-[#6e7d77]">
                  Loading trade baseline details...
                </div>
              ) : detailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                  {detailError}
                </div>
              ) : selectedTradeDetail ? (
                <>
                  {/* READ-ONLY BASELINE BANNER */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900">
                    <p className="font-semibold">
                      Immutable Commercial Baseline (Sprint 06 Scope)
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-800/90 leading-relaxed">
                      This transaction record preserves the exact commercial proposal accepted by {selectedTradeDetail.buyerOrganisationName}. Contract generation, digital signatures, quality inspection, logistics, and settlement belong to future roadmap sprints.
                    </p>
                  </div>

                  {/* COUNTERPARTIES & REFERENCE SUMMARY */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#e2dccd] bg-[#fcfaf5] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6e7d77]">
                        Buyer Organisation
                      </p>
                      <h4 className="mt-1 font-bold text-sm text-[#173f35]">
                        {selectedTradeDetail.buyerOrganisationName}
                      </h4>
                      {selectedTradeDetail.buyerCountry && (
                        <p className="mt-0.5 text-xs text-[#52635c]">
                          {[selectedTradeDetail.buyerCity, selectedTradeDetail.buyerCountry].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-[#e2dccd] bg-[#fcfaf5] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6e7d77]">
                        Supplier Organisation
                      </p>
                      <h4 className="mt-1 font-bold text-sm text-[#173f35]">
                        {selectedTradeDetail.supplierOrganisationName}
                      </h4>
                      {selectedTradeDetail.supplierCountry && (
                        <p className="mt-0.5 text-xs text-[#52635c]">
                          {[selectedTradeDetail.supplierCity, selectedTradeDetail.supplierCountry].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* COMMODITY & SOURCING SNAPSHOT */}
                  <div className="rounded-xl border border-[#e2dccd] bg-white p-4 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#173f35]">
                      Commodity &amp; Sourcing Baseline
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[#6e7d77] block text-[10px]">Material</span>
                        <span className="font-semibold text-[#173f35]">{selectedTradeDetail.materialType}</span>
                      </div>
                      <div>
                        <span className="text-[#6e7d77] block text-[10px]">Product Form</span>
                        <span className="font-semibold text-[#173f35]">{selectedTradeDetail.productForm || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[#6e7d77] block text-[10px]">Quantity</span>
                        <span className="font-semibold text-[#173f35]">
                          {selectedTradeDetail.quantity} {selectedTradeDetail.quantityUnit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6e7d77] block text-[10px]">Accepted Date</span>
                        <span className="font-semibold text-[#173f35]">
                          {new Date(selectedTradeDetail.acceptedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>


                  {/* PRODUCT QUALITY INSPECTION (SPRINT 07) */}
                  <div className="rounded-xl border border-[#e2dccd] bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#173f35]">
                        Product Quality Inspection
                      </h4>
                      {selectedTradeDetail.latestInspection ? (
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                            selectedTradeDetail.latestInspection.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : selectedTradeDetail.latestInspection.status === "IN_PROGRESS"
                              ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                              : selectedTradeDetail.latestInspection.status === "ASSIGNED"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {selectedTradeDetail.latestInspection.status === "COMPLETED"
                            ? "Inspection Data Complete"
                            : selectedTradeDetail.latestInspection.status === "IN_PROGRESS"
                            ? "Inspection In Progress"
                            : selectedTradeDetail.latestInspection.status === "ASSIGNED"
                            ? "Inspection Assigned"
                            : "Inspection Unassigned"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md border border-[#e2dccd] bg-[#fbf9f4] px-2 py-0.5 text-[11px] font-semibold text-[#6e7d77]">
                          No Inspection
                        </span>
                      )}
                    </div>

                    {selectedTradeDetail.latestInspection ? (
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#fcfaf5] p-3 rounded-lg border border-[#f0ece1]">
                          <div>
                            <span className="text-[#6e7d77] block text-[10px]">Reference</span>
                            <span className="font-mono font-bold text-[#173f35]">
                              {selectedTradeDetail.latestInspection.inspectionReference}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#6e7d77] block text-[10px]">Method</span>
                            <span className="font-semibold text-[#173f35]">
                              {selectedTradeDetail.latestInspection.inspectionMethod}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#6e7d77] block text-[10px]">Inspector</span>
                            <span className="font-medium text-[#173f35]">
                              {selectedTradeDetail.latestInspection.assignedInspectorEmail || "Unassigned"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#6e7d77] block text-[10px]">Status Meaning</span>
                            <span className="font-medium text-[#52635c]">
                              {selectedTradeDetail.latestInspection.status === "COMPLETED"
                                ? "Measurements recorded (Grade pending)"
                                : "Field verification ongoing"}
                            </span>
                          </div>
                        </div>

                        {/* BLOCK 02 EVIDENCE & ASSESSMENT SUMMARY */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#faf8f1] p-2.5 rounded-lg border border-[#e2dccd] text-xs">
                          <div>
                            <span className="text-[#6e7d77] block text-[10px]">Evidence</span>
                            <span className="font-semibold text-[#173f35]">
                              {selectedTradeDetail.latestInspection.evidenceCount ?? 0} files
                            </span>
                          </div>
                          <div>
                            <span className="text-[#6e7d77] block text-[10px]">Preliminary Assessment</span>
                            <span className="font-semibold text-[#173f35]">
                              {selectedTradeDetail.latestInspection.assessmentStatus === "ASSESSMENT_RECORDED"
                                ? "Recorded"
                                : "Not Assessed"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#6e7d77] block text-[10px]">Non-Conformities</span>
                            <span className={`font-semibold ${(selectedTradeDetail.latestInspection.openNonConformitiesCount ?? 0) > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                              {(selectedTradeDetail.latestInspection.openNonConformitiesCount ?? 0) > 0
                                ? `${selectedTradeDetail.latestInspection.openNonConformitiesCount} Open`
                                : "None Open"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#6e7d77] block text-[10px]">Physical Inspection</span>
                            <span className={`font-semibold ${selectedTradeDetail.latestInspection.physicalInspectionRequired ? "text-rose-700 font-bold" : "text-[#52635c]"}`}>
                              {selectedTradeDetail.latestInspection.physicalInspectionRequired ? "REQUIRED" : "Standard"}
                            </span>
                          </div>
                        </div>

                        {/* BLOCK 03 FINAL QUALITY DECISION & CERTIFICATE */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#faf8f1] p-3 rounded-lg border border-[#e2dccd] text-xs">
                          <div>
                            <span className="text-[#6e7d77] block text-[10px]">Final Quality Decision</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${
                                  selectedTradeDetail.latestInspection.qualityDecision === "APPROVED"
                                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                    : selectedTradeDetail.latestInspection.qualityDecision === "REJECTED"
                                    ? "bg-rose-100 text-rose-900 border-rose-300"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                              >
                                {selectedTradeDetail.latestInspection.qualityDecision || "Decision Pending"}
                              </span>
                              {selectedTradeDetail.latestInspection.classificationLabel && (
                                <span className="font-semibold text-[#173f35]">
                                  ({selectedTradeDetail.latestInspection.classificationLabel})
                                </span>
                              )}
                            </div>
                          </div>

                          {selectedTradeDetail.latestInspection.certificateNumber && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#173f35]">
                                Cert: {selectedTradeDetail.latestInspection.certificateNumber}
                              </span>
                              {onOpenInspection && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenInspection(selectedTradeDetail.latestInspection!.id);
                                    handleCloseDetail();
                                  }}
                                  className="rounded-lg bg-[#173f35] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#123129] transition-all"
                                >
                                  View Certificate →
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          {selectedTradeDetail.latestInspection.status === "DRAFT" && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveInspectionIdToAssign(selectedTradeDetail.latestInspection!.id);
                                setActiveInspectionRefToAssign(selectedTradeDetail.latestInspection!.inspectionReference);
                                setIsAssignInspectionOpen(true);
                              }}
                              className="rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#123129] transition-all"
                            >
                              Assign Inspector
                            </button>
                          )}
                          {onOpenInspection && (
                            <button
                              type="button"
                              onClick={() => {
                                onOpenInspection(selectedTradeDetail.latestInspection!.id);
                                handleCloseDetail();
                              }}
                              className="rounded-lg border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
                            >
                              View Inspection →
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#fcfaf5] p-3 rounded-lg border border-[#f0ece1] text-xs">
                        <p className="text-[#52635c]">
                          No quality inspection task has been initiated for this trade.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsCreateInspectionOpen(true)}
                          className="self-start sm:self-auto shrink-0 rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#123129] shadow-sm transition-all"
                        >
                          Request Inspection
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SOURCE TRACEABILITY LINKS */}
                  <div className="rounded-xl border border-[#e2dccd] bg-[#fbf9f4] p-4 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#173f35]">
                      Platform Traceability &amp; Linkage
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center justify-between border-b border-[#e2dccd]/60 pb-1.5">
                        <span className="text-[#6e7d77]">Accepted Quotation</span>
                        <span className="font-mono font-bold text-[#173f35]">
                          {selectedTradeDetail.quoteNumber} (v{selectedTradeDetail.acceptedQuoteVersionNumber})
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-[#e2dccd]/60 pb-1.5">
                        <span className="text-[#6e7d77]">Commercial Matching Pair</span>
                        <span className="font-mono text-[#52635c] truncate max-w-[160px]">
                          {selectedTradeDetail.matchId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-[#e2dccd]/60 pb-1.5">
                        <span className="text-[#6e7d77]">Buyer Order (Demand)</span>
                        <span className="font-mono text-[#52635c] truncate max-w-[160px]">
                          {selectedTradeDetail.buyOrderId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-[#e2dccd]/60 pb-1.5">
                        <span className="text-[#6e7d77]">Supplier Listing</span>
                        <span className="font-mono text-[#52635c] truncate max-w-[160px]">
                          {selectedTradeDetail.listingId}
                        </span>
                      </div>
                    </div>

                    {onOpenMatchingWorkspace && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenMatchingWorkspace(selectedTradeDetail.buyOrderId);
                            handleCloseDetail();
                          }}
                          className="text-xs font-bold text-[#173f35] hover:underline"
                        >
                          → Open Sourcing Workspace for Demand
                        </button>
                      </div>
                    )}
                  </div>

                  {/* COMMERCIAL TERMS & 11-LINE BREAKDOWN */}
                  <div className="rounded-xl border border-[#e2dccd] bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#173f35]">
                        Accepted Commercial Breakdown
                      </h4>
                      <span className="text-xs font-mono font-bold text-[#173f35]">
                        Currency: {selectedTradeDetail.currency}
                      </span>
                    </div>

                    {selectedTradeDetail.acceptedBreakdown ? (
                      <div className="space-y-1.5 border-t border-[#e2dccd] pt-3 text-xs">
                        {(
                          Object.keys(
                            selectedTradeDetail.acceptedBreakdown,
                          ) as Array<keyof CommercialBreakdown>
                        ).map((fieldKey) => {
                          const amount = selectedTradeDetail.acceptedBreakdown[fieldKey] || 0;
                          const label = BREAKDOWN_FIELD_LABELS[fieldKey] || fieldKey;
                          return (
                            <div
                              key={fieldKey}
                              className="flex items-center justify-between py-1 border-b border-[#f0ece1]"
                            >
                              <span className="text-[#52635c]">{label}</span>
                              <span className="font-medium text-[#173f35]">
                                {amount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          );
                        })}

                        <div className="flex items-center justify-between pt-2 text-sm font-bold text-[#173f35]">
                          <span>Accepted Commercial Total</span>
                          <span className="font-mono text-base">
                            {selectedTradeDetail.acceptedTotalAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            {selectedTradeDetail.currency}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 text-sm font-bold text-[#173f35] flex justify-between">
                        <span>Total Commercial Value</span>
                        <span>
                          {selectedTradeDetail.acceptedTotalAmount.toLocaleString()}{" "}
                          {selectedTradeDetail.currency}
                        </span>
                      </div>
                    )}

                    {/* COMMERCIAL TERMS (INCOTERM & PAYMENT TERMS) */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e2dccd] text-xs">
                      <div>
                        <span className="text-[#6e7d77] block text-[10px]">Incoterm</span>
                        <span className="font-bold text-[#173f35]">
                          {selectedTradeDetail.incoterm || "Standard Commercial Terms"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6e7d77] block text-[10px]">Payment Terms</span>
                        <span className="font-bold text-[#173f35]">
                          {selectedTradeDetail.paymentTerms || "Per Bilateral Agreement"}
                        </span>
                      </div>
                    </div>

                    {selectedTradeDetail.commercialNotes && (
                      <div className="pt-2 text-xs text-[#52635c]">
                        <span className="text-[10px] text-[#6e7d77] block">Commercial Notes:</span>
                        <p className="mt-0.5 rounded-lg bg-[#faf8f1] p-2 border border-[#e2dccd]">
                          {selectedTradeDetail.commercialNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* STRUCTURED CONTRACT (SPRINT 08 BLOCK 01) */}
                  <TradeContractSection
                    trade={selectedTradeDetail}
                    onContractUpdated={(updatedContract) => {
                      setSelectedTradeDetail((prev) =>
                        prev ? { ...prev, contract: updatedContract } : null,
                      );
                    }}
                  />
                </>
              ) : null}
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-[#e2dccd] bg-[#fbf9f4] px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-[#6e7d77]">
                Transaction Record · Read-Only Commercial Baseline
              </span>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-xl border border-[#e2dccd] bg-white px-4 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUALITY MODALS */}
      {selectedTradeDetail && (
        <>
          <CreateInspectionModal
            isOpen={isCreateInspectionOpen}
            onClose={() => setIsCreateInspectionOpen(false)}
            tradeId={selectedTradeDetail.id}
            tradeNumber={selectedTradeDetail.tradeNumber}
            materialType={selectedTradeDetail.materialType}
            quantity={selectedTradeDetail.quantity}
            quantityUnit={selectedTradeDetail.quantityUnit}
            supplierName={selectedTradeDetail.supplierOrganisationName}
            onCreated={(newIns) => {
              setSelectedTradeDetail((prev) =>
                prev
                  ? {
                      ...prev,
                      latestInspection: {
                        id: newIns.id,
                        inspectionReference: newIns.inspectionReference,
                        status: newIns.status,
                        inspectionMethod: newIns.inspectionMethod,
                        assignedInspectorEmail: newIns.assignedInspector?.email ?? null,
                        completedAt: null,
                      },
                    }
                  : null
              );
            }}
          />

          {activeInspectionIdToAssign && activeInspectionRefToAssign && (
            <AssignInspectorModal
              isOpen={isAssignInspectionOpen}
              onClose={() => setIsAssignInspectionOpen(false)}
              inspectionId={activeInspectionIdToAssign}
              inspectionReference={activeInspectionRefToAssign}
              onAssigned={(updatedIns) => {
                setSelectedTradeDetail((prev) =>
                  prev && prev.latestInspection
                    ? {
                        ...prev,
                        latestInspection: {
                          ...prev.latestInspection,
                          status: updatedIns.status,
                          assignedInspectorEmail: updatedIns.assignedInspector?.email ?? null,
                        },
                      }
                    : null
                );
              }}
            />
          )}
        </>
      )}

    </div>
  );
}
