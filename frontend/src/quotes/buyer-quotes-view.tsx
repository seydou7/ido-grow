"use client";

import { useEffect, useState } from "react";
import {
  acceptBuyerQuote,
  counterBuyerQuote,
  fetchBuyerQuoteById,
  fetchBuyerQuotes,
  QuotesRequestError,
  rejectBuyerQuote,
} from "./api";
import {
  formatCurrencySymbol,
  formatMonetaryDisplay,
} from "./quote-builder-modal";
import {
  BREAKDOWN_FIELD_LABELS,
} from "./contracts";
import type {
  CommercialBreakdown,
  QuoteCounterOfferInput,
  QuoteDetail,
  QuoteSummary,
} from "./contracts";

export function BuyerQuotesView() {
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [detailQuote, setDetailQuote] = useState<QuoteDetail | null>(null);

  // Active modal action
  const [actionModal, setActionModal] = useState<"accept" | "reject" | "counter" | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Reject input
  const [rejectionReason, setRejectionReason] = useState("");

  // Counter inputs
  const [proposedProductValue, setProposedProductValue] = useState<string>("");
  const [proposedIncoterm, setProposedIncoterm] = useState<string>("");
  const [proposedPaymentTerms, setProposedPaymentTerms] = useState<string>("");
  const [counterNote, setCounterNote] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"proposal" | "timeline">("proposal");

  const loadQuotes = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchBuyerQuotes();
      setQuotes(data);
    } catch (err) {
      setErrorMessage(
        err instanceof QuotesRequestError ? err.message : "Failed to load quotations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQuotes();
  }, []);

  const handleOpenDetail = async (id: string) => {
    setSelectedQuoteId(id);
    setActionError(null);
    setActionSuccess(null);
    setActiveTab("proposal");
    try {
      const detail = await fetchBuyerQuoteById(id);
      setDetailQuote(detail);
      // Pre-fill counter defaults
      setProposedProductValue(String(detail.currentVersion.productValue));
      setProposedIncoterm(detail.currentVersion.incoterm || "");
      setProposedPaymentTerms(detail.currentVersion.paymentTerms || "");
      setCounterNote("");
    } catch (err) {
      setActionError(
        err instanceof QuotesRequestError ? err.message : "Failed to load proposal details.",
      );
    } finally {
    }
  };

  const handleCloseDetail = () => {
    setSelectedQuoteId(null);
    setDetailQuote(null);
    setActionModal(null);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleAccept = async () => {
    if (!detailQuote || actionSubmitting) return;
    setActionSubmitting(true);
    setActionError(null);
    try {
      const updated = await acceptBuyerQuote(detailQuote.id);
      setDetailQuote(updated);
      setActionModal(null);
      setActionSuccess("Quotation accepted successfully. Proposal is now marked as ACCEPTED.");
      await loadQuotes();
    } catch (err) {
      setActionError(
        err instanceof QuotesRequestError ? err.message : "Failed to accept quotation.",
      );
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!detailQuote || actionSubmitting) return;
    setActionSubmitting(true);
    setActionError(null);
    try {
      const updated = await rejectBuyerQuote(detailQuote.id, {
        rejectionReason: rejectionReason.trim() || null,
      });
      setDetailQuote(updated);
      setActionModal(null);
      setActionSuccess("Quotation declined. Proposal is now marked as REJECTED.");
      await loadQuotes();
    } catch (err) {
      setActionError(
        err instanceof QuotesRequestError ? err.message : "Failed to decline quotation.",
      );
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleCounter = async () => {
    if (!detailQuote || actionSubmitting) return;
    if (!counterNote.trim()) {
      setActionError("A commercial note / rationale is required for the counter-offer.");
      return;
    }

    setActionSubmitting(true);
    setActionError(null);
    try {
      const numProdVal = proposedProductValue ? parseFloat(proposedProductValue) : undefined;
      const input: QuoteCounterOfferInput = {
        proposedProductValue: isNaN(numProdVal as number) ? undefined : numProdVal,
        proposedIncoterm: proposedIncoterm.trim() || null,
        proposedPaymentTerms: proposedPaymentTerms.trim() || null,
        buyerNote: counterNote.trim(),
      };

      const updated = await counterBuyerQuote(detailQuote.id, input);
      setDetailQuote(updated);
      setActionModal(null);
      setActionSuccess("Counter-offer submitted to Trader team. Proposal is now marked as COUNTERED.");
      await loadQuotes();
    } catch (err) {
      setActionError(
        err instanceof QuotesRequestError ? err.message : "Failed to submit counter-offer.",
      );
    } finally {
      setActionSubmitting(false);
    }
  };

  const [currentTime, setCurrentTime] = useState<number>(0);
  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  const isExpired = (validUntil: string | null) => {
    if (!validUntil || !currentTime) return false;
    return new Date(validUntil).getTime() < currentTime;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-3xl border border-[#e2dccd] bg-[#fbf9f4] p-6 sm:p-8 shadow-2xs">
        <div className="max-w-3xl">
          <span className="rounded-md bg-[#173f35] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#fffaf0]">
            Commercial Proposals
          </span>
          <h1 className="mt-3 text-2xl font-black text-[#173f35] sm:text-3xl">
            Received Quotations
          </h1>
          <p className="mt-2 text-sm text-[#52635c] leading-relaxed">
            Review transparent commercial cost breakdowns submitted by I Do Grow Traders. Accept proposals, propose structured counter-offers, or decline terms.
          </p>
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="font-bold text-red-600 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      {/* QUOTES LIST */}
      {loading ? (
        <div className="rounded-3xl border border-[#e2dccd] bg-white p-12 text-center text-sm font-semibold text-[#6e7d77]">
          Loading quotations...
        </div>
      ) : quotes.length === 0 ? (
        <div className="rounded-3xl border border-[#e2dccd] bg-white p-12 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#faf8f1] text-[#173f35]">
            📄
          </div>
          <h3 className="text-base font-bold text-[#173f35]">No Quotations Received</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#6e7d77]">
            When an I Do Grow Trader prepares and dispatches a quotation for one of your approved matches, it will appear here for your review.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#e2dccd] bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[11px] font-bold text-[#6e7d77] uppercase tracking-wider">
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Material / Product</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Volume</th>
                  <th className="px-6 py-4">Total Quote</th>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2dccd]/50">
                {quotes.map((q) => {
                  const expired = isExpired(q.currentVersion.validUntil);
                  return (
                    <tr key={q.id} className="hover:bg-[#faf8f1]/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#173f35]">
                        {q.quoteNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#173f35]">{q.materialType}</div>
                        {q.productForm && (
                          <div className="text-[10px] text-[#6e7d77]">{q.productForm}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#52635c] font-medium">
                        {q.supplierOrganisationName}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#173f35]">
                        {q.quantity} {q.quantityUnit}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-sm text-[#173f35]">
                          {formatMonetaryDisplay(q.currentVersion.totalAmount, q.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 font-mono font-bold text-[#173f35]">
                          v{q.currentVersionNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            q.status === "SENT"
                              ? expired
                                ? "bg-gray-100 text-gray-700 border-gray-300"
                                : "bg-blue-100 text-blue-900 border-blue-300"
                              : q.status === "COUNTERED"
                              ? "bg-purple-100 text-purple-900 border-purple-300"
                              : q.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : "bg-red-100 text-red-900 border-red-300"
                          }`}
                        >
                          {q.status === "SENT"
                            ? expired
                              ? "Expired"
                              : "Awaiting Your Decision"
                            : q.status === "COUNTERED"
                            ? "Counter-Offer Submitted"
                            : q.status === "ACCEPTED"
                            ? "Proposal Accepted"
                            : "Declined"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(q.id)}
                          className="rounded-xl bg-[#173f35] px-3.5 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all"
                        >
                          View Proposal →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedQuoteId && detailQuote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d221c]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl rounded-3xl border border-[#e2dccd] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* MODAL HEADER */}
            <div className="border-b border-[#e2dccd] bg-[#fbf9f4] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#173f35] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#fffaf0]">
                      Commercial Proposal
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                        detailQuote.status === "SENT"
                          ? isExpired(detailQuote.currentVersion.validUntil)
                            ? "bg-gray-100 text-gray-700 border-gray-300"
                            : "bg-blue-100 text-blue-900 border-blue-300"
                          : detailQuote.status === "COUNTERED"
                          ? "bg-purple-100 text-purple-900 border-purple-300"
                          : detailQuote.status === "ACCEPTED"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : "bg-red-100 text-red-900 border-red-300"
                      }`}
                    >
                      {detailQuote.status === "SENT"
                        ? isExpired(detailQuote.currentVersion.validUntil)
                          ? "Expired"
                          : "Awaiting Your Decision"
                        : detailQuote.status === "COUNTERED"
                        ? "Counter-Offer Submitted"
                        : detailQuote.status === "ACCEPTED"
                        ? "Proposal Accepted"
                        : "Declined"}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#6e7d77]">
                      {detailQuote.quoteNumber} (v{detailQuote.currentVersionNumber})
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-black text-[#173f35]">
                    {detailQuote.materialType} {detailQuote.productForm ? `(${detailQuote.productForm})` : ""}
                  </h2>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#52635c]">
                    <span>
                      <strong className="text-[#173f35]">Volume:</strong> {detailQuote.quantity} {detailQuote.quantityUnit}
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-[#173f35]">Supplier:</strong> {detailQuote.supplierOrganisationName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Total Card */}
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 px-4 py-2.5 text-right shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Total Proposal ({detailQuote.currency})
                    </span>
                    <p className="text-xl font-black text-emerald-950">
                      {formatMonetaryDisplay(detailQuote.currentVersion.totalAmount, detailQuote.currency)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    className="rounded-full p-2 text-[#6e7d77] hover:bg-[#e2dccd]/50 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* TABS */}
              <div className="mt-6 flex gap-2 border-b border-[#e2dccd]/60 -mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("proposal")}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === "proposal"
                      ? "border-[#173f35] text-[#173f35]"
                      : "border-transparent text-[#6e7d77] hover:text-[#173f35]"
                  }`}
                >
                  Commercial Breakdown & Terms
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("timeline")}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "timeline"
                      ? "border-[#173f35] text-[#173f35]"
                      : "border-transparent text-[#6e7d77] hover:text-[#173f35]"
                  }`}
                >
                  <span>Negotiation Timeline</span>
                  <span className="rounded-full bg-[#173f35]/10 px-1.5 py-0.2 text-[10px] font-extrabold text-[#173f35]">
                    {detailQuote.timeline?.length || 0}
                  </span>
                </button>
              </div>
            </div>

            {/* ALERTS */}
            {actionError && (
              <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-xs font-semibold text-red-800 flex items-center justify-between">
                <span>{actionError}</span>
                <button type="button" onClick={() => setActionError(null)} className="text-red-600 font-bold">
                  ✕
                </button>
              </div>
            )}
            {actionSuccess && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 text-xs font-semibold text-emerald-900 flex items-center justify-between">
                <span>{actionSuccess}</span>
                <button type="button" onClick={() => setActionSuccess(null)} className="text-emerald-700 font-bold">
                  ✕
                </button>
              </div>
            )}

            {/* BODY */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {activeTab === "proposal" ? (
                <>
                  {/* Status Banner */}
                  {detailQuote.status === "SENT" && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-950 flex items-center justify-between">
                      <div>
                        <strong>Action Required:</strong> Please review this commercial proposal. You can accept the terms, submit a counter-offer, or decline.
                      </div>
                      {isExpired(detailQuote.currentVersion.validUntil) && (
                        <span className="rounded-md bg-red-100 text-red-800 border border-red-200 px-2 py-1 font-bold text-[11px]">
                          Validity Expired
                        </span>
                      )}
                    </div>
                  )}

                  {detailQuote.status === "COUNTERED" && (
                    <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 text-xs text-purple-950 space-y-2">
                      <div className="font-bold flex items-center gap-2">
                        <span>⏳</span> Counter-Offer Submitted — Awaiting Trader Review
                      </div>
                      {detailQuote.counterOffers && detailQuote.counterOffers.length > 0 && (
                        <div className="bg-white/80 p-3 rounded-xl border border-purple-200 text-[11px] space-y-1">
                          <p><strong>Note:</strong> &ldquo;{detailQuote.counterOffers[0].buyerNote}&rdquo;</p>
                          {detailQuote.counterOffers[0].proposedProductValue && (
                            <p><strong>Proposed Product Value:</strong> {formatMonetaryDisplay(detailQuote.counterOffers[0].proposedProductValue, detailQuote.currency)}</p>
                          )}
                          {detailQuote.counterOffers[0].proposedIncoterm && (
                            <p><strong>Proposed Incoterm:</strong> {detailQuote.counterOffers[0].proposedIncoterm}</p>
                          )}
                          {detailQuote.counterOffers[0].proposedPaymentTerms && (
                            <p><strong>Proposed Payment Terms:</strong> {detailQuote.counterOffers[0].proposedPaymentTerms}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {detailQuote.status === "ACCEPTED" && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                          <strong>✓ Proposal Accepted:</strong> Your organisation accepted this commercial proposal on {detailQuote.acceptedAt ? new Date(detailQuote.acceptedAt).toLocaleString() : "record"}.
                        </span>
                        {detailQuote.trade && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 text-white px-2.5 py-1 text-[11px] font-bold font-mono">
                            Trade Created: {detailQuote.trade.tradeNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Accepted Version: v{detailQuote.acceptedVersionNumber || detailQuote.currentVersionNumber} · Commercial Baseline established.
                      </p>
                    </div>
                  )}

                  {detailQuote.status === "REJECTED" && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 text-xs text-red-950">
                      <strong>✕ Proposal Declined:</strong> This commercial proposal was declined. {detailQuote.rejectionReason ? `Reason: ${detailQuote.rejectionReason}` : ""}
                    </div>
                  )}

                  {/* 11-LINE BREAKDOWN (READ-ONLY) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#173f35]">
                        Itemised Commercial Cost Breakdown
                      </h3>
                      <span className="text-xs text-[#6e7d77] font-medium">
                        Currency: <strong className="text-[#173f35]">{detailQuote.currency} ({formatCurrencySymbol(detailQuote.currency)})</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(Object.keys(BREAKDOWN_FIELD_LABELS) as Array<keyof CommercialBreakdown>).map((key) => {
                        const val = detailQuote.currentVersion[key] || 0;
                        return (
                          <div key={key} className="rounded-xl border border-[#e2dccd] bg-[#fbf9f4]/30 p-3 flex items-center justify-between">
                            <span className="text-xs text-[#52635c] font-medium">
                              {BREAKDOWN_FIELD_LABELS[key]}
                            </span>
                            <span className="font-mono font-bold text-xs text-[#173f35]">
                              {formatMonetaryDisplay(val, detailQuote.currency)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COMMERCIAL TERMS */}
                  <div className="rounded-2xl border border-[#e2dccd] bg-[#fbf9f4]/50 p-4">
                    <h3 className="text-xs font-bold text-[#173f35] uppercase tracking-wider mb-3">
                      Commercial & Trade Terms
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-[#6e7d77] block font-semibold">Incoterm</span>
                        <strong className="text-[#173f35]">{detailQuote.currentVersion.incoterm || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#6e7d77] block font-semibold">Payment Terms</span>
                        <strong className="text-[#173f35]">{detailQuote.currentVersion.paymentTerms || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#6e7d77] block font-semibold">Validity Date</span>
                        <strong className="text-[#173f35]">
                          {detailQuote.currentVersion.validUntil
                            ? new Date(detailQuote.currentVersion.validUntil).toLocaleDateString()
                            : "—"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#6e7d77] block font-semibold">Current Version</span>
                        <strong className="text-[#173f35]">v{detailQuote.currentVersionNumber}</strong>
                      </div>
                    </div>

                    {detailQuote.currentVersion.commercialNotes && (
                      <div className="mt-3 border-t border-[#e2dccd] pt-3 text-xs text-[#52635c]">
                        <span className="text-[11px] text-[#6e7d77] block font-semibold">Trader Commercial Notes</span>
                        <p className="italic mt-0.5">&ldquo;{detailQuote.currentVersion.commercialNotes}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* TIMELINE TAB */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#173f35]">
                      Negotiation Timeline & Audit History
                    </h3>
                    <span className="text-xs text-[#6e7d77]">
                      {detailQuote.timeline?.length || 0} Events Recorded
                    </span>
                  </div>

                  {!detailQuote.timeline || detailQuote.timeline.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#6e7d77]">
                      No events recorded yet.
                    </div>
                  ) : (
                    <div className="relative border-l border-[#173f35]/20 pl-6 ml-3 space-y-6">
                      {detailQuote.timeline.map((evt) => (
                        <div key={evt.id} className="relative">
                          <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 border-white bg-[#173f35]" />
                          <div className="rounded-xl border border-[#e2dccd] bg-white p-3.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-[#173f35]">{evt.title}</h4>
                              <span className="text-[10px] text-[#6e7d77]">
                                {new Date(evt.occurredAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[#52635c]">{evt.description}</p>
                            {evt.actorEmail && (
                              <p className="mt-1 text-[10px] text-[#6e7d77]">
                                Actor: {evt.actorEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-[#e2dccd] bg-[#fbf9f4] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-xl border border-[#e2dccd] bg-white px-4 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1]"
              >
                Close
              </button>

              {detailQuote.status === "SENT" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActionModal("reject")}
                    className="rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-all"
                  >
                    Decline Proposal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionModal("counter")}
                    className="rounded-xl border border-purple-400 bg-white px-4 py-2 text-xs font-bold text-purple-900 hover:bg-purple-50 transition-all"
                  >
                    Submit Counter-Offer
                  </button>
                  <button
                    type="button"
                    disabled={isExpired(detailQuote.currentVersion.validUntil)}
                    onClick={() => setActionModal("accept")}
                    className="rounded-xl bg-emerald-800 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition-all disabled:opacity-50"
                  >
                    Accept Proposal ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACCEPT CONFIRMATION MODAL */}
      {actionModal === "accept" && detailQuote && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#0d221c]/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#e2dccd] bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#173f35]">Confirm Proposal Acceptance</h3>
            <p className="text-xs text-[#52635c] leading-relaxed">
              You are officially accepting Quotation <strong className="text-[#173f35]">{detailQuote.quoteNumber} (v{detailQuote.currentVersionNumber})</strong> for a total amount of{" "}
              <strong className="text-[#173f35]">{formatMonetaryDisplay(detailQuote.currentVersion.totalAmount, detailQuote.currency)}</strong>.
            </p>
            <p className="text-xs text-[#6e7d77] bg-[#fbf9f4] p-3 rounded-xl border border-[#e2dccd]">
              Acceptance applies strictly to the dispatched version. Once accepted, this proposal establishes the authoritative Trade transaction baseline.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={() => setActionModal(null)}
                className="rounded-xl border border-[#e2dccd] px-4 py-2 text-xs font-semibold text-[#52635c]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={handleAccept}
                className="rounded-xl bg-emerald-800 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-900 disabled:opacity-50"
              >
                {actionSubmitting ? "Accepting..." : "Confirm Acceptance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {actionModal === "reject" && detailQuote && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#0d221c]/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#e2dccd] bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-red-900">Decline Commercial Proposal</h3>
            <p className="text-xs text-[#52635c]">
              Please state an optional reason for declining quotation <strong className="text-[#173f35]">{detailQuote.quoteNumber}</strong>.
            </p>
            <div>
              <label htmlFor="rejection-reason" className="block text-xs font-semibold text-[#173f35] mb-1">
                Decline Reason (Optional)
              </label>
              <textarea
                id="rejection-reason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Budget constraints, alternate sourcing secured, requested delivery date unmet..."
                className="w-full rounded-xl border border-[#e2dccd] p-3 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={() => setActionModal(null)}
                className="rounded-xl border border-[#e2dccd] px-4 py-2 text-xs font-semibold text-[#52635c]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={handleReject}
                className="rounded-xl bg-red-700 px-5 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {actionSubmitting ? "Declining..." : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COUNTER-OFFER MODAL */}
      {actionModal === "counter" && detailQuote && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#0d221c]/70 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#e2dccd] bg-white p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-black text-[#173f35]">Submit Commercial Counter-Offer</h3>
              <p className="text-xs text-[#52635c] mt-0.5">
                Propose adjustments to commercial terms for quotation <strong className="text-[#173f35]">{detailQuote.quoteNumber} (v{detailQuote.currentVersionNumber})</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-[#fbf9f4] rounded-2xl border border-[#e2dccd] text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6e7d77] block">Current Product Value</span>
                <strong className="text-[#173f35]">{formatMonetaryDisplay(detailQuote.currentVersion.productValue, detailQuote.currency)}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6e7d77] block">Current Total Quote</span>
                <strong className="text-[#173f35]">{formatMonetaryDisplay(detailQuote.currentVersion.totalAmount, detailQuote.currency)}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="counter-product-value" className="block text-xs font-semibold text-[#173f35] mb-1">
                  Proposed Product Value ({detailQuote.currency})
                </label>
                <input
                  id="counter-product-value"
                  type="number"
                  step="0.01"
                  value={proposedProductValue}
                  onChange={(e) => setProposedProductValue(e.target.value)}
                  className="w-full rounded-xl border border-[#e2dccd] px-3 py-2 text-xs font-semibold text-[#173f35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="counter-incoterm" className="block text-xs font-semibold text-[#173f35] mb-1">
                    Proposed Incoterm
                  </label>
                  <input
                    id="counter-incoterm"
                    type="text"
                    value={proposedIncoterm}
                    onChange={(e) => setProposedIncoterm(e.target.value)}
                    placeholder="e.g. CIF, FOB, DAP"
                    className="w-full rounded-xl border border-[#e2dccd] px-3 py-2 text-xs font-semibold text-[#173f35]"
                  />
                </div>
                <div>
                  <label htmlFor="counter-payment-terms" className="block text-xs font-semibold text-[#173f35] mb-1">
                    Proposed Payment Terms
                  </label>
                  <input
                    id="counter-payment-terms"
                    type="text"
                    value={proposedPaymentTerms}
                    onChange={(e) => setProposedPaymentTerms(e.target.value)}
                    placeholder="e.g. 60_DAYS_NET"
                    className="w-full rounded-xl border border-[#e2dccd] px-3 py-2 text-xs font-semibold text-[#173f35]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="counter-note" className="block text-xs font-semibold text-[#173f35] mb-1">
                  Commercial Rationale / Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="counter-note"
                  rows={3}
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="Explain your proposed commercial adjustments (e.g. requested price per tonne, payment schedule)..."
                  className="w-full rounded-xl border border-[#e2dccd] p-3 text-xs text-[#173f35]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#e2dccd]">
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={() => setActionModal(null)}
                className="rounded-xl border border-[#e2dccd] px-4 py-2 text-xs font-semibold text-[#52635c]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={handleCounter}
                className="rounded-xl bg-purple-900 px-5 py-2 text-xs font-bold text-white hover:bg-purple-950 disabled:opacity-50"
              >
                {actionSubmitting ? "Submitting..." : "Submit Counter-Offer →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
