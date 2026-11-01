"use client";

import { useEffect, useState } from "react";
import { QuoteBuilderModal } from "../quotes";

import {
  approveMatch,
  cancelMatch,
  getMatchingWorkspace,
  selectCandidateAsMatch,
} from "./api";
import type {
  CandidateListing,
  MatchingWorkspace,
  MatchSummary,
} from "./contracts";
import {
  type MaterialType,
  MATERIAL_TYPE_LABELS,
  type ProductForm,
  PRODUCT_FORM_LABELS,
  type QuantityUnit,
  QUANTITY_UNIT_LABELS,
} from "../buy-orders/contracts";
import {
  explainCandidateLot,
  summarizeCandidateComparison,
} from "../ai/trader-copilot-service";

interface MatchingWorkspaceViewProps {
  buyOrderId: string;
  onBack: () => void;
}

export function MatchingWorkspaceView({
  buyOrderId,
  onBack,
}: MatchingWorkspaceViewProps) {
  const [workspace, setWorkspace] = useState<MatchingWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Tabs: Candidates Discovery, Comparison Matrix
  const [activeTab, setActiveTab] = useState<"CANDIDATES" | "COMPARISON">(
    "CANDIDATES",
  );

  // Selection for side-by-side comparison (2-4 candidates) — INDEPENDENT from matching
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>(
    [],
  );

  // Candidate chosen for Match
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );
  const [selectingCandidateId, setSelectingCandidateId] = useState<string | null>(
    null,
  );
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);
  const [traderNotes, setTraderNotes] = useState<string>("");

  // Approval confirmation modal state
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // Cancel confirmation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Expanded technical details drawer for candidate cards
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);

  // AI helper popovers / states (placeholders for TRADER-AI-01)
  const [aiExplainingLotId, setAiExplainingLotId] = useState<string | null>(null);
  const [showAiComparisonSummary, setShowAiComparisonSummary] = useState(false);

  const loadWorkspace = async (preferredCandidateId?: string | null) => {
    try {
      const data = await getMatchingWorkspace(buyOrderId);
      setWorkspace(data);

      // Resolve active match and candidate selection
      if (data.activeApprovedMatch) {
        const approvedCand = data.candidates.find(
          (c) => c.id === data.activeApprovedMatch?.listingId,
        );
        if (approvedCand) {
          setSelectedCandidateId(approvedCand.id);
          setSelectedMatch(data.activeApprovedMatch);
          if (data.activeApprovedMatch.traderNotes) {
            setTraderNotes(data.activeApprovedMatch.traderNotes);
          }
        }
        // Clear any stale selection feedback when an approved match is active
        setActionSuccess((prev) =>
          prev && prev.startsWith("Selected") ? null : prev,
        );
      } else if (preferredCandidateId) {
        const prefCand = data.candidates.find(
          (c) => c.id === preferredCandidateId,
        );
        if (prefCand) {
          setSelectedCandidateId(prefCand.id);
          setSelectedMatch(prefCand.match);
        } else {
          setSelectedCandidateId(null);
          setSelectedMatch(null);
        }
      } else if (preferredCandidateId === null) {
        // Explicitly cleared (e.g. after revocation / cancellation)
        setSelectedCandidateId(null);
        setSelectedMatch(null);
        setTraderNotes("");
      } else if (selectedCandidateId) {
        // Preserve currently selected candidate if still valid in refreshed data
        const currentCand = data.candidates.find(
          (c) => c.id === selectedCandidateId,
        );
        if (currentCand) {
          setSelectedCandidateId(currentCand.id);
          setSelectedMatch(currentCand.match);
        }
      } else if (data.candidates.length > 0) {
        // Initial load or browser refresh: resolve candidate linked to the most recent DRAFT match
        const activeDraftMatches = (data.matches || [])
          .filter((m) => m.status === "DRAFT")
          .sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.createdAt).getTime();
            const timeB = new Date(b.updatedAt || b.createdAt).getTime();
            return timeB - timeA;
          });
        const latestDraftMatch = activeDraftMatches[0] ?? null;
        if (latestDraftMatch) {
          const matchingCand = data.candidates.find(
            (c) => c.id === latestDraftMatch.listingId,
          );
          if (matchingCand) {
            setSelectedCandidateId(matchingCand.id);
            setSelectedMatch(latestDraftMatch);
            if (latestDraftMatch.traderNotes) {
              setTraderNotes(latestDraftMatch.traderNotes);
            }
          }
        }
      }

      // Pre-select 2 candidates for comparison if not already initialized
      setSelectedComparisonIds((prev) => {
        if (prev.length === 0 && data.candidates.length > 0) {
          return data.candidates.slice(0, 2).map((c) => c.id);
        }
        return prev;
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load matching workspace.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    void loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyOrderId]);

  // Handle explicit Candidate Selection
  const handleSelectCandidate = async (candidate: CandidateListing) => {
    if (actionLoading) return;
    if (workspace?.activeApprovedMatch) {
      setError(
        "An approved match is already active. Please revoke or cancel the approved match before selecting another candidate.",
      );
      return;
    }
    if (selectedCandidateId === candidate.id && selectedMatch) {
      return;
    }
    setError(null);
    setActionSuccess(null);
    setSelectingCandidateId(candidate.id);
    setActionLoading(true);
    try {
      const match = await selectCandidateAsMatch(buyOrderId, {
        listingId: candidate.id,
        traderNotes: traderNotes || undefined,
      });
      setSelectedCandidateId(candidate.id);
      setSelectedMatch(match);
      setActionSuccess(
        `Selected "${candidate.title}" as candidate.`,
      );
      await loadWorkspace(candidate.id);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to select candidate.",
      );
    } finally {
      setActionLoading(false);
      setSelectingCandidateId(null);
    }
  };

  // Open Approval Modal Synchronously
  const handleOpenApproveModal = () => {
    setApproveError(null);
    setIsApproveModalOpen(true);
  };

  // Execute Approval
  const handleConfirmApprove = async () => {
    if (!selectedMatch || actionLoading) return;
    setApproveError(null);
    setActionSuccess(null);
    setActionLoading(true);
    try {
      const approved = await approveMatch(selectedMatch.id, {
        traderNotes: traderNotes || undefined,
      });
      setSelectedMatch(approved);
      setIsApproveModalOpen(false);
      setActionSuccess(
        `Match validé avec succès ! Ouverture directe de la préparation du devis...`,
      );
      await loadWorkspace(selectedCandidateId);
      setIsQuoteModalOpen(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to approve match.";
      setApproveError(msg);
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Cancel Modal Synchronously
  const handleOpenCancelModal = () => {
    setCancelError(null);
    setIsCancelModalOpen(true);
  };

  // Execute Cancel
  const handleConfirmCancel = async () => {
    const matchIdToCancel =
      selectedMatch?.status === "APPROVED"
        ? selectedMatch.id
        : workspace?.activeApprovedMatch?.id;

    if (!matchIdToCancel || actionLoading) return;
    setCancelError(null);
    setActionSuccess(null);
    setActionLoading(true);
    try {
      await cancelMatch(matchIdToCancel, {
        reason: cancelReason || "Trader revoked approval",
      });
      setIsCancelModalOpen(false);
      setCancelReason("");
      setSelectedMatch(null);
      setActionSuccess(
        "Approved match revoked. You may now evaluate and select an alternative candidate.",
      );
      await loadWorkspace(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to cancel match.";
      setCancelError(msg);
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectForComparison = (listingId: string) => {
    setSelectedComparisonIds((prev) => {
      if (prev.includes(listingId)) {
        return prev.filter((id) => id !== listingId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), listingId];
      }
      return [...prev, listingId];
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-[#e2dccd] bg-white p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#e2dccd] border-t-[#173f35]" />
        <p className="mt-3 text-xs font-semibold text-[#52635c]">
          Loading Trader Matching Workspace…
        </p>
      </div>
    );
  }

  if (error && !workspace) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-bold text-red-800">{error}</p>
        <button
          onClick={onBack}
          type="button"
          className="mt-4 rounded-xl bg-[#173f35] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#204e42]"
        >
          ← Return to Buyer Demand
        </button>
      </div>
    );
  }

  if (!workspace) return null;

  const { buyOrder, candidates, activeApprovedMatch } = workspace;
  const selectedCandidate =
    candidates.find((c) => c.id === selectedCandidateId) ?? null;

  const comparisonCandidates = candidates.filter((c) =>
    selectedComparisonIds.includes(c.id),
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e2dccd] pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-[#d5cfbe] bg-white px-2.5 py-1 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1]"
            >
              ← Retour aux demandes
            </button>
            <span className="rounded-md bg-[#faf8f1] px-2.5 py-0.5 text-xs font-bold text-[#173f35]">
              Espace de Rapprochement Commercial
            </span>
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-[#173f35] sm:text-2xl">
            Rapprochement pour la demande #{buyOrder.id.substring(0, 8)}
          </h1>
          <p className="mt-0.5 text-xs text-[#52635c]">
            Comparez les lots fournisseurs disponibles, sélectionnez les offres candidates et préparez le devis commercial.
          </p>
        </div>

        {/* Commercial Match Status Badge */}
        <div className="flex items-center gap-3">
          {activeApprovedMatch ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 shadow-2xs">
              <div>
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  MATCH VALIDÉ
                </span>
                <p className="text-xs font-bold text-emerald-950">
                  Prêt pour devis
                </p>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                type="button"
                className="rounded-lg bg-[#173f35] px-3 py-1.5 text-[11px] font-bold text-[#fffaf0] hover:bg-[#245347] transition-all shadow-xs flex items-center gap-1"
              >
                Préparer le devis →
              </button>
              <button
                onClick={handleOpenCancelModal}
                type="button"
                className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-50"
              >
                Annuler le match
              </button>
            </div>
          ) : selectedCandidate ? (
            <div className="rounded-2xl border border-[#173f35]/30 bg-[#f7fbf9] px-4 py-2.5 shadow-2xs text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
                Offre sélectionnée
              </span>
              <p className="text-xs font-bold text-[#173f35]">
                En attente de validation
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e2dccd] bg-white px-4 py-2.5 shadow-2xs text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#85968f]">
                Statut du rapprochement
              </span>
              <p className="text-xs font-bold text-[#173f35]">
                En attente de sélection
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-2xs">
          <span>✓ {actionSuccess}</span>
          <button
            onClick={() => setActionSuccess(null)}
            type="button"
            className="font-bold text-emerald-700 hover:text-emerald-950"
          >
            ✕
          </button>
        </div>
      )}

      {error && !isApproveModalOpen && !isCancelModalOpen && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800 shadow-2xs">
          <span>⚠ {error}</span>
          <button
            onClick={() => setError(null)}
            type="button"
            className="font-bold text-red-700 hover:text-red-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* A. BUYER DEMAND SUMMARY (Always Visible) */}
      <div className="rounded-2xl border border-[#d5cfbe] bg-[#faf8f1] p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-3 border-b border-[#e5dfce] pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#173f35] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                Buyer Demand Request
              </span>
              <span className="text-xs font-bold text-[#173f35]">
                {buyOrder.buyerOrganisationName}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-[#173f35]">
              {MATERIAL_TYPE_LABELS[buyOrder.materialType as MaterialType] ||
                buyOrder.materialType}{" "}
              •{" "}
              {buyOrder.productForm
                ? PRODUCT_FORM_LABELS[buyOrder.productForm as ProductForm] ||
                  buyOrder.productForm
                : "Any Product Form"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-extrabold text-[#173f35]">
              Target: {buyOrder.quantity.toLocaleString()}{" "}
              {QUANTITY_UNIT_LABELS[buyOrder.quantityUnit as QuantityUnit] ||
                buyOrder.quantityUnit}
            </span>
            <span className="rounded-lg border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-extrabold text-[#173f35]">
              Target Price:{" "}
              {buyOrder.targetPriceAmount !== null
                ? `${buyOrder.targetPriceAmount.toLocaleString()} ${buyOrder.currency}`
                : "Not specified (Market Quotes)"}
            </span>
          </div>
        </div>

        {/* Structured Demand Grid */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
          <div>
            <span className="font-semibold text-[#85968f]">
              Delivery Destination:
            </span>
            <p className="font-bold text-[#173f35] mt-0.5">
              {buyOrder.deliveryCountry
                ? `${buyOrder.deliveryCountry}${buyOrder.deliveryDestination ? ` (${buyOrder.deliveryDestination})` : ""}`
                : "Not specified"}
            </p>
          </div>
          <div>
            <span className="font-semibold text-[#85968f]">
              Requested Delivery Date:
            </span>
            <p className="font-bold text-[#173f35] mt-0.5">
              {buyOrder.requestedDeliveryDate
                ? new Date(buyOrder.requestedDeliveryDate).toLocaleDateString()
                : "Flexible / As available"}
            </p>
          </div>
          <div>
            <span className="font-semibold text-[#85968f]">
              Acceptable Origins:
            </span>
            <p className="font-bold text-[#173f35] mt-0.5">
              {buyOrder.acceptableOriginCountries || "Not specified (Any origin)"}
            </p>
          </div>
          <div>
            <span className="font-semibold text-[#85968f]">
              Payment & Commercial Terms:
            </span>
            <p className="font-bold text-[#173f35] mt-0.5">
              {buyOrder.paymentTerms || "Standard B2B settlement"}
            </p>
          </div>
        </div>

        {/* Requirements Badges */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e5dfce] pt-3 text-[11px]">
          <span className="rounded-md border border-[#e2dccd] bg-white px-2 py-0.5 text-[#52635c]">
            <strong className="text-[#173f35]">Quality:</strong>{" "}
            {buyOrder.qualityRequirements || "Standard merchantable quality"}
          </span>
          <span className="rounded-md border border-[#e2dccd] bg-white px-2 py-0.5 text-[#52635c]">
            <strong className="text-[#173f35]">Packaging:</strong>{" "}
            {buyOrder.packagingRequirements || "Standard commercial packaging"}
          </span>
          <span className="rounded-md border border-[#e2dccd] bg-white px-2 py-0.5 text-[#52635c]">
            <strong className="text-[#173f35]">Certifications:</strong>{" "}
            {buyOrder.certificationRequirements || "None specified"}
          </span>
          <span className="rounded-md border border-[#e2dccd] bg-white px-2 py-0.5 text-[#52635c]">
            <strong className="text-[#173f35]">Logistics:</strong>{" "}
            {buyOrder.transportPreferences || "Standard carrier"}
          </span>
        </div>
      </div>

      {/* Tabs / Switcher */}
      <div className="flex items-center justify-between border-b border-[#e2dccd]">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("CANDIDATES")}
            type="button"
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
              activeTab === "CANDIDATES"
                ? "border-[#173f35] text-[#173f35]"
                : "border-transparent text-[#52635c] hover:text-[#173f35]"
            }`}
          >
            Candidate Supply ({candidates.length})
          </button>
          <button
            onClick={() => setActiveTab("COMPARISON")}
            type="button"
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
              activeTab === "COMPARISON"
                ? "border-[#173f35] text-[#173f35]"
                : "border-transparent text-[#52635c] hover:text-[#173f35]"
            }`}
          >
            Comparaison comparative ({comparisonCandidates.length})
          </button>
        </div>

        <span className="text-[11px] font-semibold text-[#85968f] hidden sm:inline">
          Indicateurs déterministes • Décision manuelle Trader • 1 offre validée maximum
        </span>
      </div>

      {/* B. CANDIDATE SUPPLY (Discovery Grid) */}
      {activeTab === "CANDIDATES" && (
        <div className="space-y-4">
          {candidates.length === 0 ? (
            <div className="rounded-2xl border border-[#e2dccd] bg-white p-12 text-center">
              <span className="text-3xl">🌾</span>
              <h3 className="mt-3 text-base font-bold text-[#173f35]">
                Aucune offre publiée correspondante
              </h3>
              <p className="mt-1 text-xs text-[#52635c]">
                Il n'y a actuellement aucune offre fournisseur publiée pour la matière{" "}
                <strong>{buyOrder.materialType}</strong>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {candidates.map((candidate) => {
                const isThisCandidateApproved = Boolean(
                  candidate.match?.status === "APPROVED" ||
                    activeApprovedMatch?.listingId === candidate.id,
                );
                const isApprovedMatchActive = Boolean(activeApprovedMatch);
                const isSelected =
                  !isApprovedMatchActive &&
                  selectedCandidateId === candidate.id;
                const isSelectedForComp = selectedComparisonIds.includes(
                  candidate.id,
                );

                return (
                  <div
                    key={candidate.id}
                    className={`flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-2xs ${
                      isThisCandidateApproved
                        ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400"
                        : isSelected
                          ? "border-[#173f35] bg-[#f7fbf9] ring-2 ring-[#173f35]"
                          : "border-[#e2dccd] bg-white hover:border-[#173f35]/50"
                    }`}
                  >
                    <div>
                      {/* Top Supplier & Title */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#173f35]">
                              {candidate.organisationName}
                            </span>
                            {candidate.organisationCountry && (
                              <span className="rounded bg-[#faf8f1] px-1.5 py-0.5 text-[10px] font-semibold text-[#52635c]">
                                {candidate.organisationCountry}
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                candidate.verificationStatus === "VERIFIED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {candidate.verificationStatus}
                            </span>
                          </div>
                          <h3 className="mt-1 text-sm font-bold text-[#173f35]">
                            {candidate.title}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        {isThisCandidateApproved ? (
                          <span className="rounded-full bg-emerald-700 px-3 py-1 text-[10px] font-extrabold text-white">
                            APPROVED MATCH
                          </span>
                        ) : isSelected ? (
                          <span className="rounded-full bg-[#173f35] px-3 py-1 text-[10px] font-extrabold text-white">
                            SELECTED CANDIDATE
                          </span>
                        ) : null}
                      </div>

                      {/* Deterministic Compatibility Indicators (No Scores/Weights) */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px]">
                        {/* Material Indicator */}
                        <span
                          className={`rounded-md px-2 py-0.5 font-bold ${
                            candidate.compatibility.material === "MATCH"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : "bg-red-100 text-red-900 border border-red-200"
                          }`}
                        >
                          Material: {candidate.compatibility.material}
                        </span>

                        {/* Form Indicator */}
                        <span
                          className={`rounded-md px-2 py-0.5 font-bold ${
                            candidate.compatibility.productForm === "MATCH"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : candidate.compatibility.productForm === "MISMATCH"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-stone-100 text-stone-700 border border-stone-200"
                          }`}
                        >
                          Form:{" "}
                          {candidate.productForm
                            ? PRODUCT_FORM_LABELS[
                                candidate.productForm as ProductForm
                              ] || candidate.productForm
                            : "Not specified"}
                        </span>

                        {/* Quantity Indicator */}
                        <span
                          className={`rounded-md px-2 py-0.5 font-bold ${
                            candidate.compatibility.quantity === "SUFFICIENT"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : "bg-amber-100 text-amber-900 border border-amber-200"
                          }`}
                        >
                          Quantity: {candidate.quantity.toLocaleString()}{" "}
                          {candidate.quantityUnit} (
                          {candidate.compatibility.quantity})
                        </span>

                        {/* Origin Indicator */}
                        <span
                          className={`rounded-md px-2 py-0.5 font-bold ${
                            candidate.compatibility.origin === "ACCEPTABLE"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : candidate.compatibility.origin ===
                                  "NOT_ACCEPTABLE"
                                ? "bg-red-100 text-red-900 border border-red-200"
                                : "bg-stone-100 text-stone-700 border border-stone-200"
                          }`}
                        >
                          Origin:{" "}
                          {candidate.originCountry || "Not specified"} (
                          {candidate.compatibility.origin})
                        </span>
                      </div>

                      {/* Price & Commercial Details */}
                      <div className="mt-3 rounded-xl border border-[#e2dccd] bg-white p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#85968f] font-semibold">
                            Supplier Asking Price:
                          </span>
                          <span className="font-bold text-[#173f35]">
                            {candidate.priceAmount !== null
                              ? `${candidate.priceAmount.toLocaleString()} ${candidate.currency} / ${candidate.priceUnit}`
                              : "Not specified (Contact Supplier)"}
                          </span>
                        </div>
                        {candidate.compatibility.priceComparison.priceDifference !==
                          null && (
                          <p className="mt-1 text-[11px] text-[#52635c]">
                            Delta vs Buyer Target:{" "}
                            {candidate.compatibility.priceComparison
                              .priceDifference <= 0 ? (
                              <strong className="text-emerald-700 font-bold">
                                {candidate.compatibility.priceComparison.priceDifference.toLocaleString()}{" "}
                                {candidate.currency} (Under Target)
                              </strong>
                            ) : (
                              <strong className="text-amber-700 font-bold">
                                +
                                {candidate.compatibility.priceComparison.priceDifference.toLocaleString()}{" "}
                                {candidate.currency} (Above Target)
                              </strong>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Description / Notes */}
                      {candidate.description && (
                        <p className="mt-2 text-xs text-[#52635c] line-clamp-2">
                          {candidate.description}
                        </p>
                      )}

                      {/* AI Lot Explanation (TRADER-AI-01 Contextual) */}
                      {aiExplainingLotId === candidate.id && (() => {
                        const explanation = explainCandidateLot({
                          demand: {
                            materialType: workspace.buyOrder.materialType,
                            productForm: workspace.buyOrder.productForm,
                            quantity: workspace.buyOrder.quantity,
                            quantityUnit: workspace.buyOrder.quantityUnit,
                            deliveryCountry: workspace.buyOrder.deliveryCountry,
                            targetPriceAmount: workspace.buyOrder.targetPriceAmount,
                            currency: workspace.buyOrder.currency,
                          },
                          candidate: {
                            id: candidate.id,
                            title: candidate.title,
                            organisationName: candidate.organisationName,
                            materialType: candidate.materialType,
                            productForm: candidate.productForm,
                            quantity: candidate.quantity,
                            quantityUnit: candidate.quantityUnit,
                            priceAmount: candidate.priceAmount,
                            currency: candidate.currency,
                            originCountry: candidate.originCountry,
                            verifiedProducer: true,
                            harvestYear: candidate.harvestYear,
                            moisturePercentage: null,
                            certification: candidate.compatibility.certification,
                          },
                        });

                        return (
                          <div className="mt-3 rounded-xl border border-[#c89b3c]/40 bg-[#faf6ee] p-3.5 text-xs text-[#7d5e1a] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5 text-[#173f35]">
                                <span>✨</span> Pourquoi ce lot ?
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-[#8a6a22]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#7d5e1a]">
                                  {explanation.matchLevel} ({explanation.scorePercentage}%)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setAiExplainingLotId(null)}
                                  className="text-[11px] font-bold text-[#8a6a22] hover:text-[#5c4613]"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            {/* Pros */}
                            {explanation.pros.length > 0 && (
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                  Points forts
                                </span>
                                <ul className="space-y-0.5 text-[11px] text-[#173f35]">
                                  {explanation.pros.map((pro, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <span className="text-emerald-600 font-bold">+</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Watchpoints */}
                            {explanation.watchpoints.length > 0 && (
                              <div className="space-y-0.5 pt-1 border-t border-[#c89b3c]/20">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                  Attention &amp; Écarts
                                </span>
                                <ul className="space-y-0.5 text-[11px] text-[#8a6a22]">
                                  {explanation.watchpoints.map((wp, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <span className="text-amber-600 font-bold">⚠️</span>
                                      <span>{wp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Operational Risks */}
                            {explanation.operationalRisks.length > 0 && (
                              <div className="space-y-0.5 pt-1 border-t border-[#c89b3c]/20">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                                  Risques opérationnels
                                </span>
                                <ul className="space-y-0.5 text-[11px] text-rose-700">
                                  {explanation.operationalRisks.map((risk, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <span className="font-bold">•</span>
                                      <span>{risk}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <p className="pt-1 border-t border-[#c89b3c]/20 text-[11px] leading-relaxed italic text-[#52635c]">
                              {explanation.summaryText}
                            </p>
                          </div>
                        );
                      })()}

                      {/* Technical Details Drawer */}
                      {expandedDetailsId === candidate.id && (
                        <div className="mt-3 rounded-xl border border-[#e2dccd] bg-[#fbf9f4] p-3 text-xs text-[#52635c] space-y-1.5">
                          <div className="flex items-center justify-between border-b border-[#e2dccd] pb-1 font-bold text-[#173f35] text-[11px]">
                            <span>Spécifications techniques & Traçabilité</span>
                            <button
                              type="button"
                              onClick={() => setExpandedDetailsId(null)}
                              className="font-normal text-[#85968f] hover:text-[#173f35]"
                            >
                              Masquer ↑
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-[#85968f]">Année de récolte :</span>{" "}
                              <strong>{candidate.harvestYear || "Non spécifiée"}</strong>
                            </div>
                            <div>
                              <span className="text-[#85968f]">Site de production :</span>{" "}
                              <strong>{candidate.siteName || "Site enregistré"}</strong>
                            </div>
                            <div>
                              <span className="text-[#85968f]">Certifications :</span>{" "}
                              <strong>{candidate.compatibility.certification}</strong>
                            </div>
                            <div>
                              <span className="text-[#85968f]">Devise :</span>{" "}
                              <strong>{candidate.currency}</strong>
                            </div>
                          </div>
                          {candidate.description && (
                            <p className="text-[11px] italic text-[#6e7d77] pt-1 border-t border-[#f0ece1]">
                              &ldquo;{candidate.description}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Bar — Distinct Comparison, Details & Commercial Actions */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#f0ece1] pt-3">
                      {/* Left: Comparison checkbox & Quick AI / Details helpers */}
                      <div className="flex flex-wrap items-center gap-2">
                        <label
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                            isSelectedForComp
                              ? "border-[#173f35] bg-[#173f35]/5 text-[#173f35]"
                              : "border-[#d5cfbe] bg-white text-[#52635c] hover:bg-[#faf8f1]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelectedForComp}
                            onChange={() =>
                              toggleSelectForComparison(candidate.id)
                            }
                            className="rounded border-[#d5cfbe] text-[#173f35] focus:ring-[#173f35]"
                            aria-label={`${
                              isSelectedForComp
                                ? "Remove from comparison"
                                : "Add to comparison"
                            } for ${candidate.title}`}
                          />
                          <span>
                            {isSelectedForComp
                              ? "Sélectionné pour comparer"
                              : "Comparer"}
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            setAiExplainingLotId(
                              aiExplainingLotId === candidate.id ? null : candidate.id,
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-[#c89b3c]/30 bg-[#faf6ee] px-2 py-1 text-[11px] font-medium text-[#7d5e1a] hover:bg-[#f5ebd2]"
                          title="Aperçu Copilote IA"
                        >
                          <span>✨</span>
                          <span>Pourquoi ce lot ?</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDetailsId(
                              expandedDetailsId === candidate.id ? null : candidate.id,
                            )
                          }
                          className="rounded-lg border border-[#e2dccd] bg-white px-2 py-1 text-[11px] font-semibold text-[#52635c] hover:bg-[#faf8f1]"
                        >
                          {expandedDetailsId === candidate.id ? "Moins de détails ↑" : "Détails techniques ↓"}
                        </button>
                      </div>

                      {/* Right: Commercial Action */}
                      <div className="flex items-center gap-2">
                        {isApprovedMatchActive ? (
                          isThisCandidateApproved ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-900 border border-emerald-300">
                              ✓ Match validé
                            </span>
                          ) : (
                            <div className="flex flex-col items-end">
                              <button
                                disabled
                                type="button"
                                className="cursor-not-allowed rounded-lg border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-400"
                                title="Révoquez ou annulez le match approuvé pour sélectionner un autre fournisseur."
                              >
                                Match déjà actif
                              </button>
                            </div>
                          )
                        ) : (
                          <button
                            onClick={() => handleSelectCandidate(candidate)}
                            disabled={actionLoading}
                            type="button"
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs disabled:opacity-50 ${
                              isSelected
                                ? "bg-[#173f35] text-white ring-1 ring-[#173f35]"
                                : "border border-[#173f35] bg-white text-[#173f35] hover:bg-[#173f35]/5"
                            }`}
                          >
                            {selectingCandidateId === candidate.id
                              ? "Sélection en cours…"
                              : isSelected
                                ? "Candidat sélectionné ✓"
                                : "Sélectionner ce lot"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* C. SIDE-BY-SIDE COMPARISON MATRIX */}
      {activeTab === "COMPARISON" && (
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs overflow-x-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#173f35]">
                Évaluation comparative côte-à-côte (2–4 lots)
              </h3>
              <p className="text-xs text-[#52635c]">
                Comparez les dimensions critiques sans télémétrie technique brute.
              </p>
            </div>

            {comparisonCandidates.length >= 2 && (
              <button
                type="button"
                onClick={() => setShowAiComparisonSummary(!showAiComparisonSummary)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#c89b3c]/40 bg-[#faf6ee] px-3 py-1.5 text-xs font-semibold text-[#7d5e1a] hover:bg-[#f5ebd2] transition-all shadow-2xs self-start sm:self-auto"
              >
                <span>✨</span>
                <span>Résumer les différences (IA)</span>
              </button>
            )}
          </div>

          {showAiComparisonSummary && comparisonCandidates.length >= 2 && (() => {
            const synthesis = summarizeCandidateComparison(
              workspace.buyOrder.quantity,
              comparisonCandidates.map((c) => ({
                id: c.id,
                organisationName: c.organisationName,
                title: c.title,
                priceAmount: c.priceAmount,
                currency: c.currency,
                quantity: c.quantity,
                quantityUnit: c.quantityUnit,
                originCountry: c.originCountry,
                certification: c.compatibility.certification,
                harvestYear: c.harvestYear,
                moisturePercentage: null,
              })),
            );

            return (
              <div className="mb-4 rounded-xl border border-[#c89b3c]/40 bg-[#faf6ee] p-4 text-xs text-[#7d5e1a] space-y-3">
                <div className="flex items-center justify-between border-b border-[#c89b3c]/20 pb-2">
                  <span className="font-bold flex items-center gap-1.5 text-sm text-[#173f35]">
                    <span>✨</span> Synthèse comparative des offres (Copilote IA)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAiComparisonSummary(false)}
                    className="font-bold text-[#8a6a22] hover:text-[#5c4613]"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-lg bg-white/80 p-2.5 border border-[#c89b3c]/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Meilleur choix économique
                    </span>
                    <strong className="text-xs text-[#173f35] block mt-0.5">
                      {synthesis.bestEconomicChoice.organisationName}
                    </strong>
                    <span className="text-[11px] text-[#52635c]">
                      {synthesis.bestEconomicChoice.detail}
                    </span>
                  </div>

                  <div className="rounded-lg bg-white/80 p-2.5 border border-[#c89b3c]/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                      Meilleur choix qualité
                    </span>
                    <strong className="text-xs text-[#173f35] block mt-0.5">
                      {synthesis.bestQualityChoice.organisationName}
                    </strong>
                    <span className="text-[11px] text-[#52635c]">
                      {synthesis.bestQualityChoice.detail}
                    </span>
                  </div>

                  <div className="rounded-lg bg-white/80 p-2.5 border border-[#c89b3c]/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                      Meilleure disponibilité
                    </span>
                    <strong className="text-xs text-[#173f35] block mt-0.5">
                      {synthesis.bestAvailabilityChoice.organisationName}
                    </strong>
                    <span className="text-[11px] text-[#52635c]">
                      {synthesis.bestAvailabilityChoice.detail}
                    </span>
                  </div>
                </div>

                {synthesis.keyTradeoffs.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
                      Principaux compromis
                    </span>
                    <ul className="space-y-1 text-[11px] text-[#52635c] list-disc pl-4">
                      {synthesis.keyTradeoffs.map((t, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-lg bg-[#173f35]/5 p-2.5 border border-[#173f35]/15 text-[11px] text-[#173f35]">
                  <strong>Recommandation :</strong> {synthesis.recommendation}
                  <p className="mt-1 text-[10px] text-[#6e7d77]">
                    Décision humaine : la sélection et la validation du devis restent sous votre responsabilité.
                  </p>
                </div>
              </div>
            );
          })()}

          {comparisonCandidates.length === 0 ? (
            <p className="text-xs text-[#52635c]">
              Aucune offre sélectionnée pour la comparaison. Cochez 2 à 4 offres candidates dans la liste ci-dessus.
            </p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2dccd] bg-[#faf8f1]">
                  <th className="p-3 font-bold text-[#85968f] w-48">
                    Critères &amp; Spécifications
                  </th>
                  <th className="p-3 font-extrabold text-[#173f35] bg-[#f0ece1] min-w-[200px]">
                    Buyer Demand Request
                  </th>
                  {comparisonCandidates.map((cand) => (
                    <th
                      key={cand.id}
                      className="p-3 font-bold text-[#173f35] min-w-[200px]"
                    >
                      {cand.organisationName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece1]">
                <tr>
                  <td className="p-3 font-semibold text-[#85968f]">
                    Natural Fibre Material
                  </td>
                  <td className="p-3 font-extrabold text-[#173f35] bg-[#fbf9f4]">
                    {buyOrder.materialType}
                  </td>
                  {comparisonCandidates.map((cand) => (
                    <td key={cand.id} className="p-3">
                      <span className="font-semibold">{cand.materialType}</span>{" "}
                      {cand.compatibility.material === "MATCH" ? (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          MATCH
                        </span>
                      ) : (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800">
                          MISMATCH
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-[#85968f]">
                    Product Form
                  </td>
                  <td className="p-3 font-extrabold text-[#173f35] bg-[#fbf9f4]">
                    {buyOrder.productForm || "Not specified (Any form)"}
                  </td>
                  {comparisonCandidates.map((cand) => (
                    <td key={cand.id} className="p-3">
                      <span className="font-semibold">
                        {cand.productForm || "Not specified"}
                      </span>{" "}
                      {cand.compatibility.productForm === "MATCH" && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          MATCH
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-[#85968f]">
                    Volume / Quantity
                  </td>
                  <td className="p-3 font-extrabold text-[#173f35] bg-[#fbf9f4]">
                    {buyOrder.quantity.toLocaleString()} {buyOrder.quantityUnit}
                  </td>
                  {comparisonCandidates.map((cand) => (
                    <td key={cand.id} className="p-3">
                      <span className="font-semibold">
                        {cand.quantity.toLocaleString()} {cand.quantityUnit}
                      </span>{" "}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          cand.compatibility.quantity === "SUFFICIENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {cand.compatibility.quantity}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-[#85968f]">
                    Price Comparison
                  </td>
                  <td className="p-3 font-extrabold text-[#173f35] bg-[#fbf9f4]">
                    {buyOrder.targetPriceAmount !== null
                      ? `${buyOrder.targetPriceAmount} ${buyOrder.currency}`
                      : "Not specified"}
                  </td>
                  {comparisonCandidates.map((cand) => (
                    <td key={cand.id} className="p-3">
                      <span className="font-semibold">
                        {cand.priceAmount !== null
                          ? `${cand.priceAmount} ${cand.currency}`
                          : "Not specified"}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-[#85968f]">
                    Origin Country
                  </td>
                  <td className="p-3 font-extrabold text-[#173f35] bg-[#fbf9f4]">
                    {buyOrder.acceptableOriginCountries || "Not specified"}
                  </td>
                  {comparisonCandidates.map((cand) => (
                    <td key={cand.id} className="p-3">
                      <span className="font-semibold">
                        {cand.originCountry || "Not specified"}
                      </span>{" "}
                      <span className="rounded bg-[#faf8f1] px-1.5 py-0.5 text-[10px] font-bold text-[#52635c]">
                        {cand.compatibility.origin}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-[#85968f]">
                    Supplier Verification
                  </td>
                  <td className="p-3 font-extrabold text-[#173f35] bg-[#fbf9f4]">
                    Verified Platform Buyer
                  </td>
                  {comparisonCandidates.map((cand) => (
                    <td key={cand.id} className="p-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          cand.verificationStatus === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {cand.verificationStatus}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-[#85968f]">
                    Commercial Action
                  </td>
                  <td className="p-3 font-extrabold text-[#173f35] bg-[#fbf9f4]">
                    Single Candidate Match
                  </td>
                  {comparisonCandidates.map((cand) => {
                    const isCandApproved = Boolean(
                      cand.match?.status === "APPROVED" ||
                        activeApprovedMatch?.listingId === cand.id,
                    );
                    const isApprovedMatchActive = Boolean(activeApprovedMatch);
                    const isCandSelected =
                      !isApprovedMatchActive &&
                      selectedCandidateId === cand.id;

                    return (
                      <td key={cand.id} className="p-3">
                        {isApprovedMatchActive ? (
                          isCandApproved ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
                              ✓ Match validé
                            </span>
                          ) : (
                            <span
                              className="text-[11px] text-stone-400 font-medium block"
                              title="Revoke or cancel the approved match before selecting another supplier."
                            >
                              Approved match active
                            </span>
                          )
                        ) : (
                          <button
                            onClick={() => handleSelectCandidate(cand)}
                            disabled={actionLoading}
                            type="button"
                            className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors disabled:opacity-50 ${
                              isCandSelected
                                ? "bg-[#173f35] text-white ring-1 ring-[#173f35]"
                                : "border border-[#173f35] bg-white text-[#173f35] hover:bg-[#173f35]/5"
                            }`}
                          >
                            {selectingCandidateId === cand.id
                              ? "Selecting…"
                              : isCandSelected
                                ? "Selected"
                                : "Select candidate"}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* D & E. SELECTED CANDIDATE & APPROVAL PANEL */}
      {selectedCandidate ? (
        <div
          className={`rounded-2xl border bg-white p-6 shadow-2xs ${
            activeApprovedMatch
              ? "border-emerald-300 ring-1 ring-emerald-200"
              : "border-[#173f35] ring-1 ring-[#173f35]/30"
          }`}
        >
          <div className="flex flex-col justify-between gap-3 border-b border-[#f0ece1] pb-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                    activeApprovedMatch
                      ? "bg-emerald-700 text-white"
                      : "bg-[#173f35] text-white"
                  }`}
                >
                  {activeApprovedMatch ? "APPROVED MATCH" : "SELECTED CANDIDATE"}
                </span>
                <span className="text-xs font-bold text-[#173f35]">
                  {selectedCandidate.organisationName}
                </span>
              </div>
              <h3 className="mt-1 text-base font-bold text-[#173f35]">
                {selectedCandidate.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {activeApprovedMatch ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsQuoteModalOpen(true)}
                    type="button"
                    className="rounded-xl bg-[#173f35] px-4 py-2 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>📄</span>
                    <span>Préparer le devis →</span>
                  </button>
                  <button
                    onClick={handleOpenCancelModal}
                    type="button"
                    className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Révoquer / Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenApproveModal}
                  disabled={actionLoading || !selectedMatch}
                  type="button"
                  className="rounded-xl bg-[#173f35] px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#204e42] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <span>✓</span>
                  <span>Approuver le match &amp; Préparer devis →</span>
                </button>
              )}
            </div>
          </div>

          {/* Key Commercial Attributes */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-[#e2dccd] bg-[#faf8f1] p-3 text-xs">
            <div>
              <span className="text-[#85968f] font-semibold text-[11px] block">
                Fournisseur
              </span>
              <strong className="text-[#173f35] font-bold">
                {selectedCandidate.organisationName}
                {selectedCandidate.organisationCountry
                  ? ` (${selectedCandidate.organisationCountry})`
                  : ""}
              </strong>
            </div>
            <div>
              <span className="text-[#85968f] font-semibold text-[11px] block">
                Offre / Lot
              </span>
              <strong
                className="text-[#173f35] font-bold truncate block"
                title={selectedCandidate.title}
              >
                {selectedCandidate.title}
              </strong>
            </div>
            <div>
              <span className="text-[#85968f] font-semibold text-[11px] block">
                Matière &amp; Forme
              </span>
              <strong className="text-[#173f35] font-bold">
                {selectedCandidate.materialType} ·{" "}
                {selectedCandidate.productForm
                  ? PRODUCT_FORM_LABELS[
                      selectedCandidate.productForm as ProductForm
                    ] || selectedCandidate.productForm
                  : "Toute forme"}
              </strong>
            </div>
            <div>
              <span className="text-[#85968f] font-semibold text-[11px] block">
                Quantité &amp; Prix
              </span>
              <strong className="text-[#173f35] font-bold">
                {selectedCandidate.quantity.toLocaleString()}{" "}
                {selectedCandidate.quantityUnit}
                {selectedCandidate.priceAmount !== null
                  ? ` • ${selectedCandidate.priceAmount.toLocaleString()} ${selectedCandidate.currency} / ${selectedCandidate.priceUnit}`
                  : ""}
              </strong>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-bold text-[#173f35]">
              Notes opérationnelles Trader{" "}
              {activeApprovedMatch
                ? "(Enregistrées avec le match approuvé)"
                : "(Optionnel)"}
            </label>
            <textarea
              rows={2}
              disabled={Boolean(activeApprovedMatch)}
              value={traderNotes}
              onChange={(e) => setTraderNotes(e.target.value)}
              placeholder="Raison du choix, vérification qualité ou contexte commercial..."
              className={`mt-1 w-full rounded-lg border p-2.5 text-xs text-[#173f35] focus:border-[#173f35] ${
                activeApprovedMatch
                  ? "border-[#e2dccd] bg-stone-50 text-[#52635c] cursor-not-allowed"
                  : "border-[#d5cfbe] bg-white"
              }`}
            />
          </div>

          {/* Quotation Notice */}
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-[11px] font-medium text-emerald-900">
            ℹ <strong>Enchaînement commercial continu :</strong> Valider ce rapprochement enregistre le lot retenu pour la demande et ouvre automatiquement le formulaire de proposition commerciale (Quote Builder) pré-rempli.
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#d5cfbe] bg-[#faf8f1] p-6 text-center text-xs text-[#52635c]">
          Veuillez cliquer sur <strong>&quot;Sélectionner ce lot&quot;</strong> sur l&apos;un des lots candidats ci-dessus
          pour vérifier et approuver le rapprochement commercial.
        </div>
      )}

      {/* APPROVE MATCH CONFIRMATION MODAL */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#e2dccd]">
            <h3 className="text-base font-bold text-[#173f35]">
              Approve Commercial Match?
            </h3>
            <p className="mt-2 text-xs text-[#52635c] leading-relaxed">
              This match is <strong>non-binding</strong> and will be used as the
              basis for quotation preparation.
            </p>
            <p className="mt-2 text-xs font-semibold text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              Note: Only ONE candidate may be approved as the active commercial
              Match for this Buy Order at a time.
            </p>

            {approveError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-800">
                ⚠ {approveError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsApproveModalOpen(false);
                  setApproveError(null);
                }}
                disabled={actionLoading}
                className="rounded-xl border border-[#d5cfbe] bg-white px-4 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={actionLoading || !selectedMatch}
                className="rounded-xl bg-[#173f35] px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#204e42] disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "Validation en cours…" : "Valider & Préparer devis →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MATCH CONFIRMATION MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-red-200">
            <h3 className="text-base font-bold text-red-900">
              Annuler le match validé ?
            </h3>
            <p className="mt-2 text-xs text-[#52635c] leading-relaxed">
              Cette action retirera le rapprochement commercial validé pour cette demande d'achat. Vous pourrez ensuite sélectionner et approuver une autre offre candidate.
            </p>

            {cancelError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-800">
                ⚠ {cancelError}
              </div>
            )}

            <div className="mt-4">
              <label className="text-xs font-bold text-[#173f35]">
                Cancellation Reason (Optional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Supplier pricing changed, quality requirements..."
                className="mt-1 w-full rounded-lg border border-[#d5cfbe] bg-white px-3 py-2 text-xs text-[#173f35]"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setCancelError(null);
                }}
                disabled={actionLoading}
                className="rounded-xl border border-[#d5cfbe] bg-white px-4 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] disabled:opacity-50"
              >
                Keep Match
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={actionLoading}
                className="rounded-xl bg-red-700 px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-red-800 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "Cancelling…" : "Confirm Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeApprovedMatch && (
        <QuoteBuilderModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          matchId={activeApprovedMatch.id}
          matchedContext={{
            materialType: buyOrder?.materialType || "",
            productForm: buyOrder?.productForm || null,
            quantity: buyOrder?.quantity || 0,
            quantityUnit: buyOrder?.quantityUnit || "TONNES",
            buyerOrganisationName: buyOrder?.buyerOrganisationName || "",
            supplierOrganisationName:
              selectedCandidate?.organisationName ||
              workspace?.candidates.find((c) => c.id === activeApprovedMatch.listingId)
                ?.organisationName ||
              "",
            buyOrderId: buyOrder?.id,
            listingId: activeApprovedMatch.listingId,
            currency: buyOrder?.currency || undefined,
            paymentTerms: buyOrder?.paymentTerms || null,
            supplierPriceAmount:
              selectedCandidate?.priceAmount ??
              workspace?.candidates.find((c) => c.id === activeApprovedMatch.listingId)?.priceAmount ??
              null,
            originCountry:
              selectedCandidate?.originCountry ??
              workspace?.candidates.find((c) => c.id === activeApprovedMatch.listingId)?.originCountry ??
              null,
            destinationCountry: buyOrder?.deliveryCountry ?? null,
          }}
        />
      )}
    </div>
  );
}
