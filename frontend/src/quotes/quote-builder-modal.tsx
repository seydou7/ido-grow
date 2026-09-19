"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  type CommercialBreakdown,
  type QuoteDetail,
  type QuoteVersionSummary,
  BREAKDOWN_FIELD_LABELS,
} from "./contracts";
import {
  createQuote,
  fetchQuoteById,
  fetchQuoteByMatchId,
  returnQuoteToDraft,
  submitQuoteForInternalReview,
  updateQuote,
  sendQuote,
  reviseCounterQuote,
  QuotesRequestError,
} from "./api";

export function formatCurrencySymbol(currencyCode: string): string {
  const normalized = (currencyCode || "").trim().toUpperCase();
  switch (normalized) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    default:
      return normalized || "—";
  }
}

export function formatMonetaryDisplay(amount: number, currencyCode: string): string {
  const sym = formatCurrencySymbol(currencyCode);
  const formattedNumber = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (sym === "€" || sym === "$" || sym === "£") {
    return `${sym}${formattedNumber} ${currencyCode}`;
  }
  return `${formattedNumber} ${currencyCode}`;
}

interface QuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId?: string;
  quoteId?: string;
  matchedContext?: {
    materialType: string;
    productForm?: string | null;
    quantity: number;
    quantityUnit: string;
    buyerOrganisationName: string;
    supplierOrganisationName: string;
    buyOrderId?: string;
    listingId?: string;
    currency?: string;
    incoterm?: string | null;
    paymentTerms?: string | null;
  };
  onQuoteUpdated?: (quote: QuoteDetail) => void;
}

const DEFAULT_BREAKDOWN: CommercialBreakdown = {
  productValue: 0,
  idoGrowMarginCommission: 0,
  inspectionCost: 0,
  packagingCost: 0,
  inlandTransportCost: 0,
  internationalFreightCost: 0,
  customsCost: 0,
  insuranceCost: 0,
  storageCost: 0,
  taxAmount: 0,
  otherServiceFees: 0,
};

export function QuoteBuilderModal({
  isOpen,
  onClose,
  matchId,
  quoteId,
  matchedContext,
  onQuoteUpdated,
}: QuoteBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<"proposal" | "history" | "timeline">("proposal");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [quote, setQuote] = useState<QuoteDetail | null>(null);

  // Form State — initialize without invented defaults
  const [breakdown, setBreakdown] = useState<CommercialBreakdown>(DEFAULT_BREAKDOWN);
  const [incoterm, setIncoterm] = useState<string>("");
  const [paymentTerms, setPaymentTerms] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [commercialNotes, setCommercialNotes] = useState<string>("");

  const populateFormFromQuote = (q: QuoteDetail) => {
    const cur = q.currentVersion;
    if (cur) {
      setBreakdown({
        productValue: cur.productValue,
        idoGrowMarginCommission: cur.idoGrowMarginCommission,
        inspectionCost: cur.inspectionCost,
        packagingCost: cur.packagingCost,
        inlandTransportCost: cur.inlandTransportCost,
        internationalFreightCost: cur.internationalFreightCost,
        customsCost: cur.customsCost,
        insuranceCost: cur.insuranceCost,
        storageCost: cur.storageCost,
        taxAmount: cur.taxAmount,
        otherServiceFees: cur.otherServiceFees,
      });
      setIncoterm(cur.incoterm || "");
      setPaymentTerms(cur.paymentTerms || "");
      setValidUntil(cur.validUntil ? cur.validUntil.split("T")[0] : "");
      setCommercialNotes(cur.commercialNotes || "");
    }
  };

  const resetForm = () => {
    setBreakdown(DEFAULT_BREAKDOWN);
    // Prefill from matched context if available, otherwise blank
    setIncoterm(matchedContext?.incoterm || "");
    setPaymentTerms(matchedContext?.paymentTerms || "");
    // Default valid until is blank — Trader explicitly chooses if needed
    setValidUntil("");
    setCommercialNotes("");
  };

  // Load existing quote for this match or quote ID
  useEffect(() => {
    if (!isOpen || (!matchId && !quoteId)) return;

    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const loader = quoteId
      ? fetchQuoteById(quoteId)
      : matchId
        ? fetchQuoteByMatchId(matchId)
        : Promise.resolve(null);

    loader
      .then((existingQuote) => {
        if (!isMounted) return;
        if (existingQuote) {
          setQuote(existingQuote);
          populateFormFromQuote(existingQuote);
        } else {
          setQuote(null);
          resetForm();
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMessage(
          err instanceof QuotesRequestError ? err.message : "Failed to load quotation details.",
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, matchId, quoteId]);

  // Real-time live total calculation
  const calculatedLiveTotal = useMemo(() => {
    const total =
      (Number(breakdown.productValue) || 0) +
      (Number(breakdown.idoGrowMarginCommission) || 0) +
      (Number(breakdown.inspectionCost) || 0) +
      (Number(breakdown.packagingCost) || 0) +
      (Number(breakdown.inlandTransportCost) || 0) +
      (Number(breakdown.internationalFreightCost) || 0) +
      (Number(breakdown.customsCost) || 0) +
      (Number(breakdown.insuranceCost) || 0) +
      (Number(breakdown.storageCost) || 0) +
      (Number(breakdown.taxAmount) || 0) +
      (Number(breakdown.otherServiceFees) || 0);

    return Math.round(total * 100) / 100;
  }, [breakdown]);

  const activeCurrency = quote?.currency || matchedContext?.currency || null;
  const currencySymbol = activeCurrency ? formatCurrencySymbol(activeCurrency) : "";

  const displayMaterial =
    quote?.materialType || matchedContext?.materialType || "";
  const displayBuyer =
    quote?.buyerOrganisationName || matchedContext?.buyerOrganisationName || "";
  const displaySupplier =
    quote?.supplierOrganisationName || matchedContext?.supplierOrganisationName || "";
  const displayQuantity =
    quote?.quantity ?? (matchedContext?.quantity !== undefined && matchedContext.quantity > 0 ? matchedContext.quantity : null);
  const displayUnit =
    quote?.quantityUnit || matchedContext?.quantityUnit || "";
  const hasValidCommercialContext = Boolean(
    quote || (
      displayMaterial &&
      displayQuantity !== null &&
      displayQuantity > 0 &&
      activeCurrency
    )
  );

  const handleFieldChange = (field: keyof CommercialBreakdown, value: string) => {
    const numericVal = value === "" ? 0 : parseFloat(value);
    setBreakdown((prev) => ({
      ...prev,
      [field]: isNaN(numericVal) ? 0 : Math.max(0, numericVal),
    }));
  };

  const handleSaveDraft = async () => {
    if (saving) return;

    if (!quote && !hasValidCommercialContext) {
      setErrorMessage("Cannot create quotation: required commercial context (material, volume, or currency) is missing.");
      return;
    }

    if (!breakdown.productValue || breakdown.productValue <= 0) {
      setErrorMessage("Base product value must be greater than zero.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let savedQuote: QuoteDetail;

      if (!quote) {
        // First version creation
        if (!matchId) {
          setErrorMessage("Cannot create quotation: Match ID is required.");
          return;
        }
        savedQuote = await createQuote({
          matchId,
          commercialBreakdown: breakdown,
          incoterm: incoterm || null,
          paymentTerms: paymentTerms || null,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
          commercialNotes: commercialNotes || null,
        });
        setSuccessMessage(`Quote ${savedQuote.quoteNumber} created as Draft Version 1.`);
      } else {
        // Sequential revision
        savedQuote = await updateQuote(quote.id, {
          commercialBreakdown: breakdown,
          incoterm: incoterm || null,
          paymentTerms: paymentTerms || null,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
          commercialNotes: commercialNotes || null,
        });
        setSuccessMessage(`Draft updated. New Version v${savedQuote.currentVersionNumber} generated.`);
      }

      setQuote(savedQuote);
      populateFormFromQuote(savedQuote);
      onQuoteUpdated?.(savedQuote);
    } catch (err) {
      setErrorMessage(
        err instanceof QuotesRequestError ? err.message : "Failed to save quotation.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!quote || saving) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await submitQuoteForInternalReview(quote.id);
      setQuote(updated);
      setSuccessMessage("Quote submitted for Internal Review. Form is now locked for review.");
      onQuoteUpdated?.(updated);
    } catch (err) {
      setErrorMessage(
        err instanceof QuotesRequestError ? err.message : "Failed to submit for internal review.",
      );
    } finally {
      setSaving(false);
    }
  };


  const handleSendQuote = async () => {
    if (!quote || saving) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await sendQuote(quote.id);
      setQuote(updated);
      setSuccessMessage(`Quote ${updated.quoteNumber} (v${updated.currentVersionNumber}) successfully sent to Buyer.`);
      onQuoteUpdated?.(updated);
    } catch (err) {
      setErrorMessage(
        err instanceof QuotesRequestError ? err.message : "Failed to send quotation to Buyer.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReviseCounter = async () => {
    if (!quote || saving) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await reviseCounterQuote(quote.id, {
        commercialBreakdown: breakdown,
        incoterm: incoterm || null,
        paymentTerms: paymentTerms || null,
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        commercialNotes: commercialNotes || null,
      });
      setQuote(updated);
      populateFormFromQuote(updated);
      setSuccessMessage(`Revised proposal v${updated.currentVersionNumber} created as Draft. Review and submit when ready.`);
      onQuoteUpdated?.(updated);
    } catch (err) {
      setErrorMessage(
        err instanceof QuotesRequestError ? err.message : "Failed to revise counter-offer.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReturnToDraft = async () => {
    if (!quote || saving) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await returnQuoteToDraft(quote.id);
      setQuote(updated);
      populateFormFromQuote(updated);
      setSuccessMessage("Quote returned to Draft status. You can now edit terms and save revisions.");
      onQuoteUpdated?.(updated);
    } catch (err) {
      setErrorMessage(
        err instanceof QuotesRequestError ? err.message : "Failed to return quote to draft.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isLocked = quote
    ? quote.status !== "DRAFT" && quote.status !== "COUNTERED"
    : false;

  // Dirty state detection in DRAFT to prevent silent loss of unsaved changes
  const isFormDirty = useMemo(() => {
    if (!quote || quote.status !== "DRAFT" || !quote.currentVersion) return false;
    const cur = quote.currentVersion;

    const breakdownDirty =
      Number(breakdown.productValue) !== Number(cur.productValue) ||
      Number(breakdown.idoGrowMarginCommission) !== Number(cur.idoGrowMarginCommission) ||
      Number(breakdown.inspectionCost) !== Number(cur.inspectionCost) ||
      Number(breakdown.packagingCost) !== Number(cur.packagingCost) ||
      Number(breakdown.inlandTransportCost) !== Number(cur.inlandTransportCost) ||
      Number(breakdown.internationalFreightCost) !== Number(cur.internationalFreightCost) ||
      Number(breakdown.customsCost) !== Number(cur.customsCost) ||
      Number(breakdown.insuranceCost) !== Number(cur.insuranceCost) ||
      Number(breakdown.storageCost) !== Number(cur.storageCost) ||
      Number(breakdown.taxAmount) !== Number(cur.taxAmount) ||
      Number(breakdown.otherServiceFees) !== Number(cur.otherServiceFees);

    const incotermDirty = (incoterm || "") !== (cur.incoterm || "");
    const paymentTermsDirty = (paymentTerms || "") !== (cur.paymentTerms || "");
    const validUntilDirty = (validUntil || "") !== (cur.validUntil ? cur.validUntil.split("T")[0] : "");
    const commercialNotesDirty = (commercialNotes || "") !== (cur.commercialNotes || "");

    return breakdownDirty || incotermDirty || paymentTermsDirty || validUntilDirty || commercialNotesDirty;
  }, [quote, breakdown, incoterm, paymentTerms, validUntil, commercialNotes]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d221c]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-builder-title"
    >
      <div className="relative w-full max-w-5xl rounded-3xl border border-[#e2dccd] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="border-b border-[#e2dccd] bg-[#fbf9f4] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#173f35] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#fffaf0]">
                  Commercial Proposal
                </span>
                {quote ? (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      quote.status === "DRAFT"
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : quote.status === "INTERNAL_REVIEW"
                        ? "bg-blue-100 text-blue-900 border-blue-300"
                        : quote.status === "SENT"
                        ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                        : quote.status === "COUNTERED"
                        ? "bg-purple-100 text-purple-900 border-purple-300"
                        : quote.status === "ACCEPTED"
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-red-100 text-red-900 border-red-300"
                    }`}
                  >
                    {quote.status === "DRAFT"
                      ? "Draft Proposal"
                      : quote.status === "INTERNAL_REVIEW"
                      ? "Internal Review"
                      : quote.status === "SENT"
                      ? "Sent to Buyer"
                      : quote.status === "COUNTERED"
                      ? "Counter-Offer Received"
                      : quote.status === "ACCEPTED"
                      ? "Accepted by Buyer"
                      : "Declined"}
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                    New Quotation
                  </span>
                )}
                {quote && (
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-[#173f35] border border-[#e2dccd]">
                    v{quote.currentVersionNumber}
                  </span>
                )}
              </div>

              <h1 id="quote-builder-title" className="mt-1.5 text-xl font-black tracking-tight text-[#173f35]">
                {quote ? quote.quoteNumber : "Draft Commercial Proposal"}
              </h1>

              {/* Matched context overview */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#52635c]">
                <span>
                  <strong className="text-[#173f35]">Material:</strong>{" "}
                  {displayMaterial || <em className="text-amber-800">Context unavailable</em>}
                  {matchedContext?.productForm ? ` (${matchedContext.productForm})` : ""}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-[#173f35]">Volume:</strong>{" "}
                  {displayQuantity !== null ? `${displayQuantity} ${displayUnit}` : <em className="text-amber-800">Context unavailable</em>}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-[#173f35]">Buyer:</strong>{" "}
                  {displayBuyer || <em className="text-amber-800">Context unavailable</em>}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-[#173f35]">Supplier:</strong>{" "}
                  {displaySupplier || <em className="text-amber-800">Context unavailable</em>}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Total Quote Value Card */}
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 px-4 py-2.5 text-right shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  {activeCurrency ? `Total Quote (${activeCurrency})` : "Total Quote"}
                </span>
                <p className="text-xl font-black text-emerald-950">
                  {activeCurrency
                    ? formatMonetaryDisplay(calculatedLiveTotal, activeCurrency)
                    : calculatedLiveTotal.toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-[#6e7d77] hover:bg-[#e2dccd]/50 transition-colors"
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
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
              onClick={() => setActiveTab("history")}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "border-[#173f35] text-[#173f35]"
                  : "border-transparent text-[#6e7d77] hover:text-[#173f35]"
              }`}
            >
              <span>Version History & Traceability</span>
              {quote && (
                <span className="rounded-full bg-[#173f35]/10 px-1.5 py-0.2 text-[10px] font-extrabold text-[#173f35]">
                  {quote.versionsCount}
                </span>
              )}
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
              {quote && (
                <span className="rounded-full bg-[#173f35]/10 px-1.5 py-0.2 text-[10px] font-extrabold text-[#173f35]">
                  {quote.timeline?.length || 0}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-xs font-semibold text-red-800 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-900 font-bold">
              ✕
            </button>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <span>{successMessage}</span>
            <button type="button" onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {loading ? (
            <div className="py-16 text-center text-sm font-semibold text-[#6e7d77]">
              Loading quote data...
            </div>
          ) : activeTab === "proposal" ? (
            <div className="space-y-6">
              {/* STATUS-SPECIFIC LOCKED BANNERS */}
              {quote?.status === "INTERNAL_REVIEW" && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3">
                  <span className="text-base">🔒</span>
                  <div>
                    <h2 className="font-bold text-blue-950">Proposal Locked for Internal Review</h2>
                    <p className="mt-0.5 text-blue-800">
                      This quotation is currently under review and cannot be modified directly.
                      To make commercial adjustments and create a new version, return the quote to Draft.
                    </p>
                  </div>
                </div>
              )}

              {!quote && !activeCurrency && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
                  Commercial currency will be resolved from the matched Buy Order / Listing when the quote is created.
                </div>
              )}

              {/* SENT STATUS BANNER */}
              {quote?.status === "SENT" && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs text-indigo-950 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-base">🔒</span>
                    <div>
                      <h2 className="font-bold text-indigo-950">Proposal Sent to Buyer</h2>
                      <p className="mt-0.5 text-indigo-900">
                        This quotation has been sent to the Buyer and is locked while awaiting the Buyer&apos;s response.
                      </p>
                      {quote.sentAt && (
                        <p className="mt-1 text-[11px] text-indigo-700">
                          Submitted on {new Date(quote.sentAt).toLocaleString()}.
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 px-2.5 py-0.5 font-bold text-[10px] shrink-0">
                    Awaiting Buyer
                  </span>
                </div>
              )}

              {quote?.status === "COUNTERED" && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50/80 p-4 text-xs text-purple-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="font-bold flex items-center gap-1.5">
                      <span>⚡</span> Buyer Counter-Offer Received
                    </strong>
                    <span className="rounded-full bg-purple-100 text-purple-950 border border-purple-300 px-2.5 py-0.5 font-bold text-[10px]">
                      Action Required
                    </span>
                  </div>
                  {quote.counterOffers && quote.counterOffers.length > 0 && (
                    <div className="bg-white/80 p-3 rounded-xl border border-purple-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-purple-800 border-b border-purple-100 pb-1">
                        <span>Responding to Proposal <strong>v{quote.counterOffers[0].sourceVersionNumber}</strong></span>
                        {quote.counterOffers[0].createdAt && (
                          <span>{new Date(quote.counterOffers[0].createdAt).toLocaleString()}</span>
                        )}
                      </div>
                      <p><strong>Buyer Rationale:</strong> &ldquo;{quote.counterOffers[0].buyerNote}&rdquo;</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-purple-100">
                        {quote.counterOffers[0].proposedProductValue != null && (
                          <p>
                            <span className="text-[#6e7d77]">Proposed Base Product Value:</span>{" "}
                            <strong className="text-purple-950">{formatMonetaryDisplay(quote.counterOffers[0].proposedProductValue, activeCurrency || quote.currency)}</strong>
                          </p>
                        )}
                        {quote.counterOffers[0].proposedTotalAmount != null && (
                          <p>
                            <span className="text-[#6e7d77]">Proposed Total Amount:</span>{" "}
                            <strong className="text-purple-950">{formatMonetaryDisplay(quote.counterOffers[0].proposedTotalAmount, activeCurrency || quote.currency)}</strong>
                          </p>
                        )}
                        {quote.counterOffers[0].proposedIncoterm && (
                          <p>
                            <span className="text-[#6e7d77]">Proposed Incoterm:</span>{" "}
                            <strong className="text-purple-950">{quote.counterOffers[0].proposedIncoterm}</strong>
                          </p>
                        )}
                        {quote.counterOffers[0].proposedPaymentTerms && (
                          <p>
                            <span className="text-[#6e7d77]">Proposed Payment Terms:</span>{" "}
                            <strong className="text-purple-950">{quote.counterOffers[0].proposedPaymentTerms}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-purple-900">
                    Review the Buyer&apos;s counter-offer and prepare your revised proposal below. The previous Trader proposal remains unchanged. Adjust the values as needed, then create the next version.
                  </p>
                </div>
              )}

              {/* PERSISTENT BUYER COUNTER-OFFER REFERENCE IN DRAFT (v2+) */}
              {quote?.status === "DRAFT" && quote.counterOffers && quote.counterOffers.length > 0 && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 text-xs text-purple-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="font-bold flex items-center gap-1.5 text-purple-950">
                      <span>⚡</span> Buyer Counter-Offer Reference
                    </strong>
                    <span className="rounded-full bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wide">
                      Negotiation Reference • v{quote.counterOffers[0].sourceVersionNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    Reference terms proposed by the Buyer for Version v{quote.counterOffers[0].sourceVersionNumber}. These values are provided for context and are not automatically applied to this draft.
                  </p>
                  <div className="bg-white/90 p-3 rounded-xl border border-purple-200 text-xs space-y-1.5">
                    <p>
                      <strong>Buyer Rationale:</strong> &ldquo;{quote.counterOffers[0].buyerNote}&rdquo;
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-purple-100">
                      {quote.counterOffers[0].proposedProductValue != null && (
                        <p>
                          <span className="text-[#6e7d77]">Proposed Base Product Value:</span>{" "}
                          <strong className="text-purple-950">
                            {formatMonetaryDisplay(quote.counterOffers[0].proposedProductValue, activeCurrency || quote.currency)}
                          </strong>
                        </p>
                      )}
                      {quote.counterOffers[0].proposedTotalAmount != null && (
                        <p>
                          <span className="text-[#6e7d77]">Proposed Total Amount:</span>{" "}
                          <strong className="text-purple-950">
                            {formatMonetaryDisplay(quote.counterOffers[0].proposedTotalAmount, activeCurrency || quote.currency)}
                          </strong>
                        </p>
                      )}
                      {quote.counterOffers[0].proposedIncoterm && (
                        <p>
                          <span className="text-[#6e7d77]">Proposed Incoterm:</span>{" "}
                          <strong className="text-purple-950">{quote.counterOffers[0].proposedIncoterm}</strong>
                        </p>
                      )}
                      {quote.counterOffers[0].proposedPaymentTerms && (
                        <p>
                          <span className="text-[#6e7d77]">Proposed Payment Terms:</span>{" "}
                          <strong className="text-purple-950">{quote.counterOffers[0].proposedPaymentTerms}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {quote?.status === "ACCEPTED" && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950 flex items-center justify-between">
                  <div>
                    <strong>✓ Proposal Accepted:</strong> Buyer accepted Version v{quote.acceptedVersionNumber || quote.currentVersionNumber} on {quote.acceptedAt ? new Date(quote.acceptedAt).toLocaleString() : "record"}. Ready for contract conversion.
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 font-bold text-[10px]">
                    Accepted
                  </span>
                </div>
              )}

              {quote?.status === "REJECTED" && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-950 flex items-center justify-between">
                  <div>
                    <strong>✕ Proposal Declined:</strong> Buyer declined this quotation on {quote.rejectedAt ? new Date(quote.rejectedAt).toLocaleString() : "record"}. {quote.rejectionReason ? `Reason: ${quote.rejectionReason}` : ""}
                  </div>
                  <span className="rounded-full bg-red-100 text-red-900 border border-red-300 px-2.5 py-0.5 font-bold text-[10px]">
                    Declined
                  </span>
                </div>
              )}

              {/* SECTION A: 11-LINE COMMERCIAL BREAKDOWN */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#173f35] flex items-center gap-2">
                      <span>11-Line Commercial Cost Breakdown</span>
                      {quote?.status === "COUNTERED" && (
                        <span className="rounded-md bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase">
                          Prospective Revised Proposal (v{quote.currentVersionNumber + 1})
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-[#52635c]">
                      {quote?.status === "COUNTERED"
                        ? `Adjust prospective commercial values for Version v${quote.currentVersionNumber + 1}. Previous version v${quote.currentVersionNumber} remains immutable.`
                        : activeCurrency
                        ? `Server-authoritative proposal breakdown. All values in ${activeCurrency}.`
                        : "Server-authoritative proposal breakdown."}
                    </p>
                  </div>
                  <span className="text-xs text-[#6e7d77] font-medium">
                    Currency:{" "}
                    {activeCurrency ? (
                      <strong className="text-[#173f35]">
                        {activeCurrency} ({currencySymbol})
                      </strong>
                    ) : (
                      <strong className="text-amber-800 font-semibold">Currency unavailable</strong>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Group 1: Product & Margin */}
                  <div className="rounded-2xl border border-[#e2dccd] bg-[#fbf9f4]/40 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-[#173f35] uppercase tracking-wider border-b border-[#e2dccd] pb-1.5">
                      Core Product & Intermediation
                    </h3>
                    <div>
                      <label htmlFor="quote-field-productValue" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.productValue} <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-productValue"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.productValue || ""}
                          onChange={(e) => handleFieldChange("productValue", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="quote-field-idoGrowMarginCommission" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.idoGrowMarginCommission}
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-idoGrowMarginCommission"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.idoGrowMarginCommission || ""}
                          onChange={(e) => handleFieldChange("idoGrowMarginCommission", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group 2: Quality & Packaging */}
                  <div className="rounded-2xl border border-[#e2dccd] bg-[#fbf9f4]/40 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-[#173f35] uppercase tracking-wider border-b border-[#e2dccd] pb-1.5">
                      Quality, Packaging & Handling
                    </h3>
                    <div>
                      <label htmlFor="quote-field-inspectionCost" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.inspectionCost}
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-inspectionCost"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.inspectionCost || ""}
                          onChange={(e) => handleFieldChange("inspectionCost", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="quote-field-packagingCost" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.packagingCost}
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-packagingCost"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.packagingCost || ""}
                          onChange={(e) => handleFieldChange("packagingCost", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group 3: Transport & Freight */}
                  <div className="rounded-2xl border border-[#e2dccd] bg-[#fbf9f4]/40 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-[#173f35] uppercase tracking-wider border-b border-[#e2dccd] pb-1.5">
                      Logistics & Freight
                    </h3>
                    <div>
                      <label htmlFor="quote-field-inlandTransportCost" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.inlandTransportCost}
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-inlandTransportCost"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.inlandTransportCost || ""}
                          onChange={(e) => handleFieldChange("inlandTransportCost", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="quote-field-internationalFreightCost" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.internationalFreightCost}
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-internationalFreightCost"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.internationalFreightCost || ""}
                          onChange={(e) => handleFieldChange("internationalFreightCost", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="quote-field-storageCost" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.storageCost}
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-storageCost"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.storageCost || ""}
                          onChange={(e) => handleFieldChange("storageCost", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group 4: Customs, Insurance, Taxes & Other */}
                  <div className="rounded-2xl border border-[#e2dccd] bg-[#fbf9f4]/40 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-[#173f35] uppercase tracking-wider border-b border-[#e2dccd] pb-1.5">
                      Clearance, Insurance & Fiscal Duties
                    </h3>
                    <div>
                      <label htmlFor="quote-field-customsCost" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.customsCost}
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-customsCost"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.customsCost || ""}
                          onChange={(e) => handleFieldChange("customsCost", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="quote-field-insuranceCost" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.insuranceCost}
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-insuranceCost"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.insuranceCost || ""}
                          onChange={(e) => handleFieldChange("insuranceCost", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="quote-field-taxAmount" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.taxAmount}
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-taxAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.taxAmount || ""}
                          onChange={(e) => handleFieldChange("taxAmount", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="quote-field-otherServiceFees" className="block text-xs font-semibold text-[#173f35]">
                        {BREAKDOWN_FIELD_LABELS.otherServiceFees}
                      </label>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6e7d77]">{currencySymbol}</span>
                        <input
                          id="quote-field-otherServiceFees"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isLocked}
                          value={breakdown.otherServiceFees || ""}
                          onChange={(e) => handleFieldChange("otherServiceFees", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#e2dccd] bg-white pl-8 pr-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: COMMERCIAL TERMS & NOTES */}
              <div className="rounded-2xl border border-[#e2dccd] bg-[#fbf9f4]/40 p-4 space-y-4">
                <h3 className="text-xs font-bold text-[#173f35] uppercase tracking-wider border-b border-[#e2dccd] pb-1.5">
                  Commercial Terms & Proposal Parameters
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="quote-select-incoterm" className="block text-xs font-semibold text-[#173f35]">Incoterm</label>
                    <select
                      id="quote-select-incoterm"
                      disabled={isLocked}
                      value={incoterm}
                      onChange={(e) => setIncoterm(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#e2dccd] bg-white px-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100"
                    >
                      <option value="">Select Incoterm (Optional)</option>
                      <option value="EXW">EXW — Ex Works</option>
                      <option value="FCA">FCA — Free Carrier</option>
                      <option value="FOB">FOB — Free on Board</option>
                      <option value="CFR">CFR — Cost and Freight</option>
                      <option value="CIF">CIF — Cost, Insurance and Freight</option>
                      <option value="DAP">DAP — Delivered at Place</option>
                      <option value="DDP">DDP — Delivered Duty Paid</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quote-input-paymentTerms" className="block text-xs font-semibold text-[#173f35]">Payment Terms</label>
                    <input
                      id="quote-input-paymentTerms"
                      type="text"
                      disabled={isLocked}
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="e.g. 30% Adv / 70% BL, LC at sight, Net 30"
                      className="mt-1 w-full rounded-xl border border-[#e2dccd] bg-white px-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="quote-input-validUntil" className="block text-xs font-semibold text-[#173f35]">Quote Validity Until</label>
                    <input
                      id="quote-input-validUntil"
                      type="date"
                      disabled={isLocked}
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#e2dccd] bg-white px-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="quote-input-commercialNotes" className="block text-xs font-semibold text-[#173f35]">Commercial Notes & Specifications</label>
                  <textarea
                    id="quote-input-commercialNotes"
                    rows={2}
                    disabled={isLocked}
                    value={commercialNotes}
                    onChange={(e) => setCommercialNotes(e.target.value)}
                    placeholder="Specific delivery instructions, packaging requirements, moisture tolerance, etc."
                    className="mt-1 w-full rounded-xl border border-[#e2dccd] bg-white px-3 py-2 text-xs font-semibold text-[#173f35] focus:border-[#173f35] focus:outline-hidden disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
                    ) : activeTab === "history" ? (
            /* TAB 2: VERSION HISTORY */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#173f35]">
                    Traceable Version History
                  </h2>
                  <p className="text-xs text-[#52635c]">
                    Immutable sequential audit trail of all generated commercial proposals.
                  </p>
                </div>
                <span className="text-xs text-[#6e7d77]">
                  {quote?.versions.length || 0} Recorded Version{(quote?.versions.length || 0) > 1 ? "s" : ""}
                </span>
              </div>

              {!quote || quote.versions.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6e7d77]">
                  No versions recorded yet. Save a draft to generate Version 1.
                </div>
              ) : (
                <div className="space-y-3">
                  {[...(quote.versions || [])]
                    .sort((a, b) => b.versionNumber - a.versionNumber)
                    .map((v: QuoteVersionSummary) => {
                      const isCurrent = v.versionNumber === quote.currentVersionNumber;
                      const formattedDate = new Date(v.createdAt).toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={v.id}
                          className={`rounded-2xl border p-5 transition-all ${
                            isCurrent
                              ? "border-emerald-300 bg-emerald-50/40 shadow-xs"
                              : "border-[#e2dccd] bg-white"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="rounded-md bg-[#173f35] px-2.5 py-1 text-xs font-extrabold text-[#fffaf0]">
                                v{v.versionNumber}
                              </span>
                              {isCurrent && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900 border border-emerald-300">
                                  Current Active Version
                                </span>
                              )}
                              <span className="text-xs text-[#6e7d77]">
                                Created {formattedDate} {v.createdByUserEmail ? `by ${v.createdByUserEmail}` : ""}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-base font-black text-[#173f35]">
                                {formatMonetaryDisplay(v.totalAmount, v.currency)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#52635c] border-t border-[#e2dccd]/60 pt-3">
                            <div>
                              <strong>Incoterm:</strong> {v.incoterm || "—"}
                            </div>
                            <div>
                              <strong>Payment Terms:</strong> {v.paymentTerms || "—"}
                            </div>
                            <div>
                              <strong>Valid Until:</strong>{" "}
                              {v.validUntil ? new Date(v.validUntil).toLocaleDateString() : "—"}
                            </div>
                            <div>
                              <strong>Product Value:</strong> {formatMonetaryDisplay(v.productValue, v.currency)}
                            </div>
                          </div>

                          {v.commercialNotes && (
                            <p className="mt-2 text-xs italic text-[#6e7d77] bg-[#fbf9f4] p-2 rounded-lg border border-[#e2dccd]">
                              &ldquo;{v.commercialNotes}&rdquo;
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: TIMELINE */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#173f35]">
                    Negotiation Timeline & Audit Trail
                  </h2>
                  <p className="text-xs text-[#52635c]">
                    Chronological milestone history covering quote drafts, reviews, dispatches, and decisions.
                  </p>
                </div>
                <span className="text-xs text-[#6e7d77]">
                  {quote?.timeline?.length || 0} Recorded Event{(quote?.timeline?.length || 0) > 1 ? "s" : ""}
                </span>
              </div>

              {!quote?.timeline || quote.timeline.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6e7d77]">
                  No timeline events recorded yet.
                </div>
              ) : (
                <div className="relative border-l border-[#173f35]/20 pl-6 ml-3 space-y-6">
                  {quote.timeline.map((evt) => (
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

        {/* MODAL FOOTER ACTIONS */}
        <div className="border-t border-[#e2dccd] bg-[#fbf9f4] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#52635c]">
            {quote ? (
              <span>
                Proposal Status: <strong className="text-[#173f35]">{quote.status}</strong> (v{quote.currentVersionNumber})
              </span>
            ) : (
              <span>New draft proposal awaiting initial save</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e2dccd] bg-white px-4 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
            >
              Close
            </button>

            {quote?.status === "INTERNAL_REVIEW" ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleReturnToDraft}
                  className="rounded-xl border border-amber-400 bg-white px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 transition-all disabled:opacity-50"
                >
                  {saving ? "Returning..." : "← Return to Draft"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSendQuote}
                  className="rounded-xl bg-indigo-900 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-950 transition-all disabled:opacity-50"
                >
                  {saving ? "Sending..." : "Send to Buyer →"}
                </button>
              </div>
            ) : quote?.status === "COUNTERED" ? (
              <button
                type="button"
                disabled={saving}
                onClick={handleReviseCounter}
                className="rounded-xl bg-purple-900 px-5 py-2 text-xs font-bold text-white hover:bg-purple-950 transition-all disabled:opacity-50"
              >
                {saving ? "Creating Revision..." : `Prepare Revised Proposal (v${quote.currentVersionNumber + 1}) →`}
              </button>
            ) : quote?.status === "SENT" ? (
              <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                Awaiting Buyer Decision
              </span>
            ) : quote?.status === "ACCEPTED" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  Proposal Accepted ✓
                </span>
                {quote.trade && (
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1.5 rounded-lg border border-emerald-300">
                    Trade: {quote.trade.tradeNumber}
                  </span>
                )}
              </div>
            ) : quote?.status === "REJECTED" ? (
              <span className="text-xs font-bold text-red-900 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                Proposal Declined
              </span>
            ) : (
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                {quote && quote.status === "DRAFT" && isFormDirty && (
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    Save your changes as a new version before submitting for Internal Review.
                  </span>
                )}
                <button
                  type="button"
                  disabled={saving || (!quote && !hasValidCommercialContext)}
                  onClick={handleSaveDraft}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 ${
                    isFormDirty
                      ? "border-amber-600 bg-amber-50 text-amber-950 hover:bg-amber-100 font-extrabold"
                      : "border-[#173f35] bg-white text-[#173f35] hover:bg-[#faf8f1]"
                  }`}
                >
                  {saving
                    ? "Saving..."
                    : quote
                    ? "Save as Next Version"
                    : "Create Initial Draft (v1)"}
                </button>

                {quote && quote.status === "DRAFT" && (
                  <button
                    type="button"
                    disabled={saving || isFormDirty}
                    onClick={handleSubmitForReview}
                    className="rounded-xl bg-[#173f35] px-4 py-2 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      isFormDirty
                        ? "Save your changes as a new version before submitting for Internal Review."
                        : undefined
                    }
                  >
                    {saving ? "Submitting..." : "Submit for Internal Review →"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
