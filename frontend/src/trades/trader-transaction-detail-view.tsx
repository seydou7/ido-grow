"use client";

import { useEffect, useState, useCallback } from "react";
import { BREAKDOWN_FIELD_LABELS, type CommercialBreakdown } from "../quotes/contracts";
import { getTraderTradeById, TradesRequestError } from "./api";
import type { TradeDetail } from "./contracts";
import { TradeContractSection } from "../contracts/trade-contract-section";
import { getContractByTradeId } from "../contracts/api";
import type { ContractDetail, ContractSummary } from "../contracts/contracts";
import { CreateInspectionModal, AssignInspectorModal } from "../quality";
import { getInspectionById, getCertificateFileUrl } from "../quality/api";
import type { InspectionDetail } from "../quality/contracts";
import { TradeLogisticsSection } from "../logistics";
import { fetchSettlementByTradeId } from "../logistics/api";
import type { SettlementDetail } from "../logistics/contracts";
import { fetchPassports, fetchPassportQr, getPassportPdfUrl } from "../dpp/api";
import { DppQrModal } from "../dpp/dpp-qr-modal";
import type { DigitalProductPassportResponse, DppQrResult } from "../dpp/contracts";

export type TransactionTab =
  | "overview"
  | "commercial"
  | "quality"
  | "logistics"
  | "documents"
  | "activity";

export interface TraderTransactionDetailViewProps {
  tradeId: string;
  onBack: () => void;
  onNavigateSection?: (section: string) => void;
  onOpenInspection?: (inspectionId: string) => void;
  onOpenMatchingWorkspace?: (buyOrderId: string) => void;
}

export function TraderTransactionDetailView({
  tradeId,
  onBack,
  onNavigateSection,
  onOpenInspection,
  onOpenMatchingWorkspace,
}: TraderTransactionDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TransactionTab>("overview");
  const [trade, setTrade] = useState<TradeDetail | null>(null);
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const [settlement, setSettlement] = useState<SettlementDetail | null>(null);
  const [dpp, setDpp] = useState<DigitalProductPassportResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Progressive disclosure states
  const [show11Lines, setShow11Lines] = useState(false);

  // Modals state
  const [isCreateInspectionOpen, setIsCreateInspectionOpen] = useState(false);
  const [isAssignInspectionOpen, setIsAssignInspectionOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<DppQrResult | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Authoritative Trade Detail
      const tradeData = await getTraderTradeById(tradeId);
      setTrade(tradeData);

      // 2. Concurrently load associated entities if linked
      const promises: Promise<unknown>[] = [];

      // Contract
      promises.push(
        getContractByTradeId(tradeId)
          .then((c) => setContract(c))
          .catch(() => setContract(null)),
      );

      // Inspection
      if (tradeData.latestInspection?.id) {
        promises.push(
          getInspectionById(tradeData.latestInspection.id)
            .then((ins) => setInspection(ins))
            .catch(() => setInspection(null)),
        );
      }

      // Settlement
      promises.push(
        fetchSettlementByTradeId(tradeId)
          .then((s) => setSettlement(s))
          .catch(() => setSettlement(null)),
      );

      // Digital Product Passport
      promises.push(
        fetchPassports()
          .then((passports) => {
            const matched = passports.find(
              (p) =>
                p.lot?.listingId === tradeData.listingId ||
                p.lot?.batchReference === tradeData.tradeNumber,
            );
            setDpp(matched ?? (passports[0] || null));
          })
          .catch(() => setDpp(null)),
      );

      await Promise.allSettled(promises);
    } catch (err) {
      if (err instanceof TradesRequestError && err.status === 403) {
        setError("Accès restreint. Ce dossier est réservé aux traders autorisés.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de charger la transaction.");
      }
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-4 rounded-2xl border border-[#e2dccd] bg-white p-8 text-center shadow-xs">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#173f35] border-t-transparent" />
        <p className="text-sm font-medium text-[#173f35]">Chargement du dossier transactionnel...</p>
        <p className="text-xs text-[#52635c]">Consolidation du devis, contrat, qualité, logistique et passeport</p>
      </div>
    );
  }

  if (error || !trade) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50/60 p-6 shadow-xs">
        <div className="flex items-center gap-3 text-red-800">
          <span className="text-lg">⚠️</span>
          <h2 className="text-base font-bold">Erreur de chargement de la transaction</h2>
        </div>
        <p className="text-xs text-red-700">{error || "Dossier introuvable."}</p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-50 transition-all"
        >
          ← Retour aux transactions
        </button>
      </div>
    );
  }

  // --- Financial & Commercial Calculations ---
  const totalAmount = trade.acceptedTotalAmount;
  const currency = trade.currency || "";
  const marginAmount = trade.acceptedBreakdown?.idoGrowMarginCommission || 0;
  const marginPercent = totalAmount > 0 ? (marginAmount / totalAmount) * 100 : 0;
  const supplierPrice = trade.acceptedBreakdown?.productValue || 0;
  const otherCosts = Math.max(0, totalAmount - supplierPrice - marginAmount);

  // --- Unified Inspection Data Normalization ---
  const inspectionId = inspection?.id ?? trade.latestInspection?.id ?? null;
  const inspectionRef = inspection?.inspectionReference ?? trade.latestInspection?.inspectionReference ?? null;
  const inspectionStatus = inspection?.status ?? trade.latestInspection?.status ?? null;
  const inspectionMethod = inspection?.inspectionMethod ?? trade.latestInspection?.inspectionMethod ?? "Standard";
  const inspectorEmail = inspection?.assignedInspector?.email ?? trade.latestInspection?.assignedInspectorEmail ?? null;
  const qualityDecision = inspection?.qualityResult?.decision ?? trade.latestInspection?.qualityDecision ?? null;
  const certificateNumber = inspection?.certificate?.certificateNumber ?? trade.latestInspection?.certificateNumber ?? null;
  const classificationLabel = inspection?.qualityResult?.classificationLabel ?? trade.latestInspection?.classificationLabel ?? null;
  const openNonConformities = inspection?.nonConformities?.filter((nc) => nc.status === "OPEN").length ?? trade.latestInspection?.openNonConformitiesCount ?? 0;
  const evidenceCount = inspection?.evidence?.length ?? trade.latestInspection?.evidenceCount ?? 0;
  const physicalInspectionRequired = inspection?.physicalInspectionRequired ?? trade.latestInspection?.physicalInspectionRequired ?? false;
  const assessmentStatus = inspection?.assessmentStatus ?? trade.latestInspection?.assessmentStatus ?? null;

  // --- Milestone Progression States ---
  // 1. Contract:
  const isContractConfirmed = contract?.status === "CONFIRMED";
  const isContractDraft = Boolean(contract && contract.status === "DRAFT");
  const contractMilestoneStatus: "completed" | "in_progress" | "pending" =
    isContractConfirmed ? "completed" : isContractDraft ? "in_progress" : "pending";

  // 2. Quality:
  const isQualityCompleted = inspectionStatus === "COMPLETED" && qualityDecision === "APPROVED";
  const isQualityRejected = qualityDecision === "REJECTED";
  const isQualityInProgress = Boolean(
    inspectionStatus && (inspectionStatus === "IN_PROGRESS" || inspectionStatus === "ASSIGNED" || inspectionStatus === "COMPLETED"),
  );
  const qualityMilestoneStatus: "completed" | "in_progress" | "blocked" | "pending" =
    isQualityCompleted
      ? "completed"
      : isQualityRejected
      ? "blocked"
      : isQualityInProgress
      ? "in_progress"
      : "pending";

  // 3. Logistics:
  const isLogisticsCompleted = false; // until shipment is delivered
  const logisticsMilestoneStatus: "completed" | "in_progress" | "pending" =
    !isContractConfirmed ? "pending" : isLogisticsCompleted ? "completed" : "in_progress";

  // 4. Documents & Clôture:
  const isDocumentsCompleted = Boolean(dpp && settlement?.paymentStatus === "SETTLED");
  const documentsMilestoneStatus: "completed" | "in_progress" | "pending" =
    isDocumentsCompleted ? "completed" : dpp || settlement ? "in_progress" : "pending";

  // --- Contextual Next Action Resolution ---
  let nextAction = {
    label: "Confirmer le contrat commercial",
    subtitle: "Le devis est validé. Les 11 clauses contractuelles doivent être revues et confirmées.",
    tab: "commercial" as TransactionTab,
    buttonText: "Ouvrir le contrat →",
  };

  if (!isContractConfirmed) {
    nextAction = {
      label: "Confirmer le contrat commercial",
      subtitle: "Le devis est validé. Les 11 clauses contractuelles doivent être revues et confirmées.",
      tab: "commercial",
      buttonText: "Revoir & confirmer le contrat →",
    };
  } else if (!inspectionRef) {
    nextAction = {
      label: "Affecter une inspection qualité",
      subtitle: "Le contrat est confirmé. Le protocole d'inspection du lot doit être mandaté.",
      tab: "quality",
      buttonText: "Initier l'inspection →",
    };
  } else if (inspectionStatus === "DRAFT" || !inspectorEmail) {
    nextAction = {
      label: "Assigner un inspecteur qualité",
      subtitle: `L'inspection ${inspectionRef} est créée mais attend la désignation d'un inspecteur accrédité.`,
      tab: "quality",
      buttonText: "Désigner l'inspecteur →",
    };
  } else if (inspectionStatus === "IN_PROGRESS" || inspectionStatus === "ASSIGNED") {
    nextAction = {
      label: "Suivre la saisie des mesures qualité",
      subtitle: `Contrôle en cours sur site (${inspectionMethod}). Rapport d'essais attendu.`,
      tab: "quality",
      buttonText: "Consulter l'inspection →",
    };
  } else if (inspectionStatus === "COMPLETED" && !qualityDecision) {
    nextAction = {
      label: "Valider la conformité & décision qualité",
      subtitle: "Toutes les mesures techniques sont enregistrées. La décision finale et le certificat doivent être validés.",
      tab: "quality",
      buttonText: "Émettre la décision qualité →",
    };
  } else if (isQualityCompleted && !isLogisticsCompleted) {
    nextAction = {
      label: "Planifier l'expédition & sélectionner le fret",
      subtitle: "Qualité certifiée conforme. Sélectionner l'offre de transport et fixer le rendez-vous d'enlèvement.",
      tab: "logistics",
      buttonText: "Gérer l'expédition →",
    };
  } else if (isLogisticsCompleted && !isDocumentsCompleted) {
    nextAction = {
      label: "Émettre & sceller le Passeport Numérique (DPP)",
      subtitle: "Livraison attestée. Consolider la chaîne de possession et vérifier l'exhaustivité du passeport.",
      tab: "documents",
      buttonText: "Consulter le DPP →",
    };
  } else {
    nextAction = {
      label: "Dossier soldé & archivé",
      subtitle: "Toutes les étapes contractuelles, logistiques, de certification et de règlement sont exécutées.",
      tab: "overview",
      buttonText: "Revue complète 360°",
    };
  }

  // Handle open DPP QR
  const handleOpenQr = async () => {
    if (!dpp) return;
    setLoadingQr(true);
    try {
      const qr = await fetchPassportQr(dpp.id);
      setQrModalData(qr);
    } catch {
      // Fallback object matching DppQrResult
      setQrModalData({
        dppId: dpp.id,
        passportNumber: dpp.passportNumber,
        targetUrl: window.location.href,
        route: `/dpp/${dpp.id}`,
        qrSvg: "",
        qrDataUrl: "",
        requiresAuth: true,
        generatedAt: new Date().toISOString(),
      });
    } finally {
      setLoadingQr(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER DU DOSSIER (Compact, clair et professionnel) */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs">
        {/* Top actions & Back */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#f0ece1]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#f0ece1] transition-all"
            >
              ← Retour aux transactions
            </button>
            <span className="font-mono text-xs font-bold text-[#173f35] bg-[#173f35]/5 px-2.5 py-1 rounded-lg border border-[#173f35]/15">
              {trade.tradeNumber}
            </span>
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isContractConfirmed
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {isContractConfirmed ? "Contrat confirmé" : "Devis accepté · Contrat en attente"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-xl border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#52635c] hover:bg-[#faf8f1] hover:text-[#173f35] transition-all"
            >
              ↻ Rafraîchir
            </button>
            {onOpenMatchingWorkspace && (
              <button
                type="button"
                onClick={() => onOpenMatchingWorkspace(trade.buyOrderId)}
                className="rounded-xl border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
              >
                Voir le sourcing →
              </button>
            )}
          </div>
        </div>

        {/* Counterparties & Commercial summary bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Parties */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#6e7d77] uppercase tracking-wider">
              <span>Acheteur</span>
              <span>↔</span>
              <span>Fournisseur</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-base font-bold text-[#173f35]">
              <span>{trade.buyerOrganisationName}</span>
              <span className="text-[#a89f91] font-normal">↔</span>
              <span>{trade.supplierOrganisationName}</span>
            </div>
            <p className="mt-0.5 text-xs text-[#52635c]">
              <strong className="text-[#173f35]">
                {trade.quantity} {trade.quantityUnit}
              </strong>{" "}
              — {trade.materialType} {trade.productForm ? `(${trade.productForm})` : ""}
            </p>
          </div>

          {/* Value & Protected Margin */}
          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-[#f0ece1] pt-3 md:pt-0 md:pl-4">
            <div className="flex items-baseline justify-between md:justify-start md:gap-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6e7d77]">
                  Valeur totale client
                </span>
                <span className="text-base font-bold text-[#173f35]">
                  {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  <span className="text-xs font-semibold text-[#6e7d77]">{currency}</span>
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Marge Trader protégée
                </span>
                <span className="text-base font-bold text-emerald-700">
                  {marginPercent.toFixed(1)} %{" "}
                  <span className="text-xs font-medium text-emerald-600">
                    ({marginAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency})
                  </span>
                </span>
              </div>
            </div>
            <p className="mt-0.5 text-[11px] text-[#52635c]">
              Incoterm : <strong className="text-[#173f35]">{trade.incoterm || "N/A"}</strong> · Paiement :{" "}
              <strong className="text-[#173f35]">{trade.paymentTerms || "Per Bilateral Agreement"}</strong>
            </p>
          </div>

          {/* Contextual Next Action Callout */}
          <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-[#f0ece1] pt-3 md:pt-0 md:pl-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6e7d77]">
              Prochaine action attendue
            </span>
            <p className="mt-0.5 text-xs font-bold text-[#173f35] truncate">
              {nextAction.label}
            </p>
            <button
              type="button"
              onClick={() => setActiveTab(nextAction.tab)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#173f35] px-3 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all shadow-xs"
            >
              {nextAction.buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION PAR ONGLETS (6 Onglets opérationnels structurés) */}
      <div className="flex border-b border-[#e2dccd] overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "border-[#173f35] text-[#173f35]"
              : "border-transparent text-[#52635c] hover:border-[#a89f91] hover:text-[#173f35]"
          }`}
        >
          <span>👁️ Vue 360° (Overview)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("commercial")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "commercial"
              ? "border-[#173f35] text-[#173f35]"
              : "border-transparent text-[#52635c] hover:border-[#a89f91] hover:text-[#173f35]"
          }`}
        >
          <span>💼 Commercial (Devis &amp; Contrat)</span>
          {isContractConfirmed ? (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
              ✓
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
              À confirmer
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quality")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "quality"
              ? "border-[#173f35] text-[#173f35]"
              : "border-transparent text-[#52635c] hover:border-[#a89f91] hover:text-[#173f35]"
          }`}
        >
          <span>🔬 Qualité (Inspection)</span>
          {inspectionStatus && (
            <span className="rounded-full bg-[#173f35]/10 px-1.5 py-0.2 text-[9px] font-bold text-[#173f35]">
              {inspectionStatus}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logistics")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "logistics"
              ? "border-[#173f35] text-[#173f35]"
              : "border-transparent text-[#52635c] hover:border-[#a89f91] hover:text-[#173f35]"
          }`}
        >
          <span>🚚 Logistique (Expédition)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "documents"
              ? "border-[#173f35] text-[#173f35]"
              : "border-transparent text-[#52635c] hover:border-[#a89f91] hover:text-[#173f35]"
          }`}
        >
          <span>📄 Documents (DPP &amp; Clôture)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "activity"
              ? "border-[#173f35] text-[#173f35]"
              : "border-transparent text-[#52635c] hover:border-[#a89f91] hover:text-[#173f35]"
          }`}
        >
          <span>⏱️ Activité (Chronologie)</span>
        </button>
      </div>

      {/* 3. ONGLET 1 : OVERVIEW (Vue 360° du cycle) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Progression Pipeline (5 grands jalons) */}
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs">
            <div className="pb-3 border-b border-[#f0ece1]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#173f35]">
                Pipeline d'exécution de la transaction
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
              {/* Milestone 1: Quote */}
              <div
                onClick={() => setActiveTab("commercial")}
                className="cursor-pointer rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 hover:bg-emerald-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    1. Devis (Quote)
                  </span>
                  <span className="text-xs font-bold text-emerald-700">✓ Terminé</span>
                </div>
                <p className="mt-1 font-bold text-xs text-[#173f35]">Accepté par acheteur</p>
                <p className="text-[11px] text-[#52635c] truncate">
                  v{trade.acceptedQuoteVersionNumber} · {new Date(trade.acceptedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Milestone 2: Contract */}
              <div
                onClick={() => setActiveTab("commercial")}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  contractMilestoneStatus === "completed"
                    ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                    : contractMilestoneStatus === "in_progress"
                    ? "border-amber-200 bg-amber-50/50 hover:bg-amber-50"
                    : "border-[#e2dccd] bg-[#fbf9f4] hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      contractMilestoneStatus === "completed"
                        ? "text-emerald-800"
                        : contractMilestoneStatus === "in_progress"
                        ? "text-amber-800"
                        : "text-[#6e7d77]"
                    }`}
                  >
                    2. Contrat
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      contractMilestoneStatus === "completed"
                        ? "text-emerald-700"
                        : contractMilestoneStatus === "in_progress"
                        ? "text-amber-700"
                        : "text-[#6e7d77]"
                    }`}
                  >
                    {contractMilestoneStatus === "completed"
                      ? "✓ Confirmé"
                      : contractMilestoneStatus === "in_progress"
                      ? "⏳ En cours"
                      : "○ À venir"}
                  </span>
                </div>
                <p className="mt-1 font-bold text-xs text-[#173f35]">
                  {contract?.contractNumber || "Non généré"}
                </p>
                <p className="text-[11px] text-[#52635c]">
                  {isContractConfirmed ? "Signatures validées" : "Validation requise"}
                </p>
              </div>

              {/* Milestone 3: Quality */}
              <div
                onClick={() => setActiveTab("quality")}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  qualityMilestoneStatus === "completed"
                    ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                    : qualityMilestoneStatus === "in_progress"
                    ? "border-purple-200 bg-purple-50/50 hover:bg-purple-50"
                    : qualityMilestoneStatus === "blocked"
                    ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50"
                    : "border-[#e2dccd] bg-[#fbf9f4] hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      qualityMilestoneStatus === "completed"
                        ? "text-emerald-800"
                        : qualityMilestoneStatus === "in_progress"
                        ? "text-purple-800"
                        : qualityMilestoneStatus === "blocked"
                        ? "text-rose-800"
                        : "text-[#6e7d77]"
                    }`}
                  >
                    3. Qualité
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      qualityMilestoneStatus === "completed"
                        ? "text-emerald-700"
                        : qualityMilestoneStatus === "in_progress"
                        ? "text-purple-700"
                        : qualityMilestoneStatus === "blocked"
                        ? "text-rose-700"
                        : "text-[#6e7d77]"
                    }`}
                  >
                    {qualityMilestoneStatus === "completed"
                      ? "✓ Conforme"
                      : qualityMilestoneStatus === "in_progress"
                      ? "⏳ En cours"
                      : qualityMilestoneStatus === "blocked"
                      ? "✕ Rejeté"
                      : "○ À venir"}
                  </span>
                </div>
                <p className="mt-1 font-bold text-xs text-[#173f35]">
                  {inspectionRef || "À initier"}
                </p>
                <p className="text-[11px] text-[#52635c] truncate">
                  {certificateNumber ? `Cert: ${certificateNumber}` : "Contrôle lot"}
                </p>
              </div>

              {/* Milestone 4: Logistics */}
              <div
                onClick={() => setActiveTab("logistics")}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  logisticsMilestoneStatus === "completed"
                    ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                    : logisticsMilestoneStatus === "in_progress"
                    ? "border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50"
                    : "border-[#e2dccd] bg-[#fbf9f4] hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      logisticsMilestoneStatus === "completed"
                        ? "text-emerald-800"
                        : logisticsMilestoneStatus === "in_progress"
                        ? "text-indigo-800"
                        : "text-[#6e7d77]"
                    }`}
                  >
                    4. Logistique
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      logisticsMilestoneStatus === "completed"
                        ? "text-emerald-700"
                        : logisticsMilestoneStatus === "in_progress"
                        ? "text-indigo-700"
                        : "text-[#6e7d77]"
                    }`}
                  >
                    {logisticsMilestoneStatus === "completed"
                      ? "✓ Livré"
                      : logisticsMilestoneStatus === "in_progress"
                      ? "⏳ En cours"
                      : "○ En attente"}
                  </span>
                </div>
                <p className="mt-1 font-bold text-xs text-[#173f35]">
                  {trade.incoterm || "Fret standard"}
                </p>
                <p className="text-[11px] text-[#52635c]">
                  {isContractConfirmed ? "Offres fret dispo" : "Attente contrat"}
                </p>
              </div>

              {/* Milestone 5: Documents & DPP */}
              <div
                onClick={() => setActiveTab("documents")}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  documentsMilestoneStatus === "completed"
                    ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                    : documentsMilestoneStatus === "in_progress"
                    ? "border-teal-200 bg-teal-50/50 hover:bg-teal-50"
                    : "border-[#e2dccd] bg-[#fbf9f4] hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      documentsMilestoneStatus === "completed"
                        ? "text-emerald-800"
                        : documentsMilestoneStatus === "in_progress"
                        ? "text-teal-800"
                        : "text-[#6e7d77]"
                    }`}
                  >
                    5. DPP &amp; Clôture
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      documentsMilestoneStatus === "completed"
                        ? "text-emerald-700"
                        : documentsMilestoneStatus === "in_progress"
                        ? "text-teal-700"
                        : "text-[#6e7d77]"
                    }`}
                  >
                    {documentsMilestoneStatus === "completed"
                      ? "✓ Scellé"
                      : documentsMilestoneStatus === "in_progress"
                      ? "⏳ Traçabilité"
                      : "○ Clôture"}
                  </span>
                </div>
                <p className="mt-1 font-bold text-xs text-[#173f35]">
                  {dpp?.passportNumber || "Passeport"}
                </p>
                <p className="text-[11px] text-[#52635c]">
                  {settlement?.paymentStatus === "SETTLED" ? "Règlement soldé" : "Règlement & DPP"}
                </p>
              </div>
            </div>
          </div>

          {/* Action principale prioritaire contextuelle */}
          <div className="rounded-2xl border border-[#173f35]/20 bg-[#f4f7f5] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#173f35] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#fffaf0]">
                  Action prioritaire
                </span>
                <span className="text-xs font-bold text-[#173f35]">{nextAction.label}</span>
              </div>
              <p className="mt-1 text-xs text-[#52635c]">{nextAction.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab(nextAction.tab)}
              className="shrink-0 rounded-xl bg-[#173f35] px-4 py-2 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all shadow-xs"
            >
              {nextAction.buttonText}
            </button>
          </div>

          {/* Parties prenantes & Synthèse commerciale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Buyer Card */}
            <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#f0ece1] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#173f35]">
                  Partie Acheteur
                </span>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  Acheteur Vérifié
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#173f35]">{trade.buyerOrganisationName}</h4>
                <p className="text-xs text-[#52635c] mt-0.5">
                  {[trade.buyerAddress, trade.buyerCity, trade.buyerCountry].filter(Boolean).join(", ") ||
                    "Coordonnées commerciales renseignées"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#f0ece1]">
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Commande d'achat (Demand)</span>
                  <span className="font-mono font-semibold text-[#173f35]">{trade.buyOrderId}</span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Devis accepté</span>
                  <span className="font-mono font-semibold text-[#173f35]">
                    {trade.quoteNumber} (v{trade.acceptedQuoteVersionNumber})
                  </span>
                </div>
              </div>
            </div>

            {/* Supplier Card */}
            <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#f0ece1] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#173f35]">
                  Partie Fournisseur
                </span>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  Fournisseur Vérifié
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#173f35]">{trade.supplierOrganisationName}</h4>
                <p className="text-xs text-[#52635c] mt-0.5">
                  {[trade.supplierAddress, trade.supplierCity, trade.supplierCountry].filter(Boolean).join(", ") ||
                    "Site de production certifié"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#f0ece1]">
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Offre / Listing d'origine</span>
                  <span className="font-mono font-semibold text-[#173f35]">{trade.listingId}</span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Paire commerciale</span>
                  <span className="font-mono font-semibold text-[#173f35]">{trade.matchId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ONGLET 2 : COMMERCIAL (Devis & Contrat fusionnés) */}
      {activeTab === "commercial" && (
        <div className="space-y-6">
          {/* Section 1 : Devis Commercial Accepté (Quote) */}
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ece1] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
                    Devis Commercial Accepté
                  </span>
                  <span className="font-mono text-xs font-bold text-[#173f35]">
                    {trade.quoteNumber} (v{trade.acceptedQuoteVersionNumber})
                  </span>
                </div>
                <h3 className="mt-1 text-base font-bold text-[#173f35]">
                  Décomposition Commerciale &amp; Marge Trader
                </h3>
              </div>

              <div className="flex items-center gap-2" />
            </div>

            {/* Synthèse 4 blocs principaux */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-[#e2dccd] bg-[#fbf9f4] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e7d77] block">
                  1. Prix matière fournisseur
                </span>
                <span className="text-sm font-bold text-[#173f35] mt-1 block">
                  {supplierPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  <span className="text-[10px] font-normal text-[#6e7d77]">{currency}</span>
                </span>
              </div>

              <div className="rounded-xl border border-[#e2dccd] bg-[#fbf9f4] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e7d77] block">
                  2. Frais logistiques &amp; annexes
                </span>
                <span className="text-sm font-bold text-[#173f35] mt-1 block">
                  {otherCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  <span className="text-[10px] font-normal text-[#6e7d77]">{currency}</span>
                </span>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    3. Marge Trader
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    🔒 Confidentielle
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-700 mt-1 block">
                  {marginPercent.toFixed(1)} %{" "}
                  <span className="text-[11px] font-medium text-emerald-600">
                    ({marginAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                    {currency})
                  </span>
                </span>
              </div>

              <div className="rounded-xl border border-[#173f35]/20 bg-[#173f35]/5 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#173f35] block">
                  4. Prix total client
                </span>
                <span className="text-sm font-bold text-[#173f35] mt-1 block">
                  {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  <span className="text-[10px] font-normal text-[#6e7d77]">{currency}</span>
                </span>
              </div>
            </div>

            {/* Progressive disclosure toggle: 11 cost lines */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShow11Lines(!show11Lines)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173f35] hover:underline"
              >
                <span>{show11Lines ? "Masquer les 11 postes commerciaux ▲" : "Afficher les 11 postes commerciaux détaillés ▼"}</span>
              </button>

              {show11Lines && trade.acceptedBreakdown && (
                <div className="mt-3 rounded-xl border border-[#e2dccd] bg-[#fcfaf5] p-4 text-xs space-y-1.5">
                  {(
                    Object.keys(trade.acceptedBreakdown) as Array<keyof CommercialBreakdown>
                  ).map((fieldKey) => {
                    const amount = trade.acceptedBreakdown[fieldKey] || 0;
                    const label = BREAKDOWN_FIELD_LABELS[fieldKey] || fieldKey;
                    const isMargin = fieldKey === "idoGrowMarginCommission";

                    return (
                      <div
                        key={fieldKey}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${
                          isMargin ? "bg-emerald-50 font-semibold text-emerald-900" : "border-b border-[#f0ece1]"
                        }`}
                      >
                        <span className={isMargin ? "text-emerald-900" : "text-[#52635c]"}>
                          {label} {isMargin && "(Marge Trader protégée)"}
                        </span>
                        <span className="font-mono text-[#173f35]">
                          {amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {currency}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 2 : Contrat Bilatéral (Contract) - Réutilisation directe de TradeContractSection */}
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs">
            <TradeContractSection
              trade={trade}
              hideLogistics={true}
              onContractUpdated={(updatedContract: ContractSummary) => {
                setContract((prev) => (prev ? { ...prev, ...updatedContract } : null));
              }}
            />
          </div>
        </div>
      )}

      {/* 5. ONGLET 3 : QUALITY (Inspection liée à CETTE transaction / CE lot) */}
      {activeTab === "quality" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ece1] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
                    Contrôle Qualité du Lot
                  </span>
                  {inspectionRef && (
                    <span className="font-mono text-xs font-bold text-[#173f35]">
                      {inspectionRef}
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-base font-bold text-[#173f35]">
                  Inspection &amp; Certification Technique
                </h3>
              </div>
            </div>

            {inspectionRef ? (
              <div className="space-y-4">
                {/* Inspection Summary Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#fcfaf5] p-3.5 rounded-xl border border-[#f0ece1] text-xs">
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Référence d'inspection</span>
                    <span className="font-mono font-bold text-[#173f35]">{inspectionRef}</span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Méthode de contrôle</span>
                    <span className="font-semibold text-[#173f35]">{inspectionMethod}</span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Inspecteur accrédité</span>
                    <span className="font-medium text-[#173f35]">
                      {inspectorEmail || "Non assigné"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Statut opérationnel</span>
                    <span className="font-bold text-[#173f35]">{inspectionStatus}</span>
                  </div>
                </div>

                {/* Evidence & Assessment */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#faf8f1] p-3.5 rounded-xl border border-[#e2dccd] text-xs">
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Preuves &amp; Photos</span>
                    <span className="font-semibold text-[#173f35]">{evidenceCount} fichiers</span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Évaluation préliminaire</span>
                    <span className="font-semibold text-[#173f35]">
                      {assessmentStatus === "ASSESSMENT_RECORDED" ? "Enregistrée" : "En cours"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Non-conformités</span>
                    <span
                      className={`font-semibold ${
                        openNonConformities > 0 ? "text-amber-700" : "text-emerald-700"
                      }`}
                    >
                      {openNonConformities > 0
                        ? `${openNonConformities} Ouvertes`
                        : "Aucune anomalie"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Contrôle physique</span>
                    <span
                      className={`font-semibold ${
                        physicalInspectionRequired ? "text-rose-700 font-bold" : "text-[#52635c]"
                      }`}
                    >
                      {physicalInspectionRequired ? "REQUIS" : "Standard"}
                    </span>
                  </div>
                </div>

                {/* Final Decision & Official Certificate */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#faf8f1] p-4 rounded-xl border border-[#e2dccd] text-xs">
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Décision Qualité Finale</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold ${
                          qualityDecision === "APPROVED"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : qualityDecision === "REJECTED"
                            ? "bg-rose-100 text-rose-900 border-rose-300"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {qualityDecision || "Décision en attente"}
                      </span>
                      {classificationLabel && (
                        <span className="font-semibold text-[#173f35]">
                          ({classificationLabel})
                        </span>
                      )}
                    </div>
                  </div>

                  {certificateNumber && inspectionId && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#173f35]">
                        Certificat : {certificateNumber}
                      </span>
                      <a
                        href={getCertificateFileUrl(inspectionId)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#123129] transition-all"
                      >
                        Télécharger le Certificat (PDF) →
                      </a>
                    </div>
                  )}
                </div>

                {/* Contextual Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {!inspectorEmail && (
                    <button
                      type="button"
                      onClick={() => setIsAssignInspectionOpen(true)}
                      className="rounded-xl bg-[#173f35] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#123129] transition-all"
                    >
                      Assigner un inspecteur
                    </button>
                  )}

                  {onOpenInspection && inspectionId && (
                    <button
                      type="button"
                      onClick={() => onOpenInspection(inspectionId)}
                      className="rounded-xl border border-[#e2dccd] bg-white px-3.5 py-2 text-xs font-bold text-[#173f35] hover:bg-[#faf8f1] transition-all"
                    >
                      Ouvrir l'inspection complète →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#fcfaf5] p-5 rounded-xl border border-[#f0ece1]">
                <div>
                  <h4 className="text-xs font-bold text-[#173f35]">Aucune inspection qualité initiée</h4>
                  <p className="mt-0.5 text-xs text-[#52635c]">
                    Initiez une inspection pour valider les paramètres physiques et débloquer le certificat d'origine.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateInspectionOpen(true)}
                  className="rounded-xl bg-[#173f35] px-4 py-2 text-xs font-bold text-white hover:bg-[#123129] shadow-xs transition-all"
                >
                  Initier une inspection qualité →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. ONGLET 4 : LOGISTICS (Expédition & Transport) */}
      {activeTab === "logistics" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ece1] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
                    Exécution Logistique
                  </span>
                  <span className="text-xs font-bold text-[#173f35]">
                    Incoterm : {trade.incoterm || "N/A"}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-bold text-[#173f35]">
                  Fret, Expéditions &amp; Jalons de Transport
                </h3>
              </div>
            </div>

            {/* If contract is confirmed: render TradeLogisticsSection */}
            {contract && contract.status === "CONFIRMED" ? (
              <TradeLogisticsSection contract={contract} />
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#fcfaf5] p-5 rounded-xl border border-[#f0ece1]">
                <div>
                  <h4 className="text-xs font-bold text-[#173f35]">Contrat en attente de confirmation</h4>
                  <p className="mt-0.5 text-xs text-[#52635c]">
                    Les demandes de cotations de fret et les expéditions s'activent dès que le contrat commercial bilatéral est confirmé.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("commercial")}
                  className="rounded-xl bg-[#173f35] px-4 py-2 text-xs font-bold text-white hover:bg-[#123129] shadow-xs transition-all"
                >
                  Aller au contrat pour confirmer →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. ONGLET 5 : DOCUMENTS (Settlement & DPP) */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Section 1 : Règlement & Settlement */}
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ece1] pb-3">
              <div>
                <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
                  Règlement &amp; Facturation
                </span>
                <h3 className="mt-1 text-base font-bold text-[#173f35]">
                  Statut de Règlement &amp; Réconciliation
                </h3>
              </div>
            </div>

            {settlement ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#fcfaf5] p-4 rounded-xl border border-[#f0ece1] text-xs">
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Statut Règlement</span>
                  <span className="font-bold text-[#173f35]">{settlement.paymentStatus}</span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Montant Final</span>
                  <span className="font-bold text-[#173f35]">
                    {settlement.finalSettlementAmount.toLocaleString()} {currency}
                  </span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Modalités</span>
                  <span className="font-medium text-[#173f35]">
                    {trade.paymentTerms || "Standard Bilateral"}
                  </span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Réclamation / Litige</span>
                  <span className="font-medium text-[#52635c]">
                    {settlement.claims?.length ? `${settlement.claims.length} Réclamation(s)` : "Aucun litige"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#fcfaf5] p-4 rounded-xl border border-[#f0ece1] text-xs text-[#52635c]">
                Le dossier de règlement financier est initialisé lors de l'exécution logistique et de la confirmation de livraison.
              </div>
            )}
          </div>

          {/* Section 2 : Passeport Numérique de Produit (DPP) */}
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ece1] pb-3">
              <div>
                <span className="rounded-md bg-teal-100 text-teal-900 border border-teal-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Traçabilité Européenne DPP
                </span>
                <h3 className="mt-1 text-base font-bold text-[#173f35]">
                  Digital Product Passport (DPP)
                </h3>
              </div>

              {dpp && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenQr}
                    disabled={loadingQr}
                    className="rounded-xl border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
                  >
                    {loadingQr ? "Chargement QR..." : "📱 Voir QR Code"}
                  </button>
                  <a
                    href={getPassportPdfUrl(dpp.id, dpp.currentVersionNumber)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-[#173f35] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#123129] transition-all"
                  >
                    Télécharger Passeport (PDF) →
                  </a>
                </div>
              )}
            </div>

            {dpp ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#fcfaf5] p-4 rounded-xl border border-[#f0ece1] text-xs">
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">N° Passeport</span>
                    <span className="font-mono font-bold text-[#173f35]">{dpp.passportNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Statut de vérification</span>
                    <span className="font-bold text-teal-800">{dpp.status}</span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Version active</span>
                    <span className="font-semibold text-[#173f35]">v{dpp.currentVersionNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px]">Événements enregistrés</span>
                    <span className="font-semibold text-[#173f35]">{dpp.eventsCount ?? 0} jalons</span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#faf8f1] p-3 text-xs text-[#52635c] border border-[#e2dccd]">
                  Le passeport numérique agrège la traçabilité parcellaire, les résultats d'essais qualité et les jalons de transport conformément aux spécifications DPP Sprint 09.
                </div>
              </div>
            ) : (
              <div className="bg-[#fcfaf5] p-4 rounded-xl border border-[#f0ece1] text-xs text-[#52635c]">
                Le passeport numérique de produit (DPP) sera émis à la finalisation du contrôle qualité et de la documentation d'origine.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. ONGLET 6 : ACTIVITY (Timeline chronologique unifiée) */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-4">
            <div className="border-b border-[#f0ece1] pb-3">
              <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
                Piste d'Audit &amp; Journalisation
              </span>
              <h3 className="mt-1 text-base font-bold text-[#173f35]">
                Chronologie Unifiée de la Transaction
              </h3>
              <p className="mt-0.5 text-xs text-[#52635c]">
                Enchaînement chronologique des événements réels consolidés depuis la création du match.
              </p>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2dccd]">
              {/* Event 1: Creation */}
              <div className="relative">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#173f35]" />
                <div className="text-xs">
                  <span className="font-mono text-[10px] text-[#6e7d77]">
                    {new Date(trade.createdAt).toLocaleString()}
                  </span>
                  <p className="font-bold text-[#173f35] mt-0.5">
                    Transaction commerciale créée (Réf: {trade.tradeNumber})
                  </p>
                  <p className="text-[#52635c] mt-0.5">
                    Rapprochement validé entre la demande {trade.buyOrderId} et l'offre {trade.listingId}.
                  </p>
                </div>
              </div>

              {/* Event 2: Quote Accepted */}
              <div className="relative">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-600" />
                <div className="text-xs">
                  <span className="font-mono text-[10px] text-[#6e7d77]">
                    {new Date(trade.acceptedAt).toLocaleString()}
                  </span>
                  <p className="font-bold text-[#173f35] mt-0.5">
                    Devis #{trade.quoteNumber} (v{trade.acceptedQuoteVersionNumber}) accepté par l'acheteur
                  </p>
                  <p className="text-[#52635c] mt-0.5">
                    Total convenu : {totalAmount.toLocaleString()} {currency} pour {trade.quantity} {trade.quantityUnit}.
                  </p>
                </div>
              </div>

              {/* Event 3: Contract */}
              {contract && (
                <div className="relative">
                  <span
                    className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      isContractConfirmed ? "bg-emerald-600" : "bg-amber-500"
                    }`}
                  />
                  <div className="text-xs">
                    <span className="font-mono text-[10px] text-[#6e7d77]">
                      {contract.confirmedAt
                        ? new Date(contract.confirmedAt).toLocaleString()
                        : new Date(contract.createdAt).toLocaleString()}
                    </span>
                    <p className="font-bold text-[#173f35] mt-0.5">
                      Contrat {contract.contractNumber} —{" "}
                      {isContractConfirmed ? "Confirmé par les deux parties" : "Brouillon en attente de confirmation"}
                    </p>
                    <p className="text-[#52635c] mt-0.5">
                      Incoterm : {contract.incoterm || trade.incoterm || "N/A"}. Loi applicable :{" "}
                      {contract.governingLaw || "Non renseignée"}.
                    </p>
                  </div>
                </div>
              )}

              {/* Event 4: Quality */}
              {inspectionRef && (
                <div className="relative">
                  <span
                    className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      qualityDecision === "APPROVED"
                        ? "bg-emerald-600"
                        : qualityDecision === "REJECTED"
                        ? "bg-rose-600"
                        : "bg-blue-600"
                    }`}
                  />
                  <div className="text-xs">
                    <span className="font-mono text-[10px] text-[#6e7d77]">
                      {inspectionStatus === "COMPLETED" ? "Complété" : "En cours"}
                    </span>
                    <p className="font-bold text-[#173f35] mt-0.5">
                      Inspection {inspectionRef} — Statut : {inspectionStatus}
                    </p>
                    <p className="text-[#52635c] mt-0.5">
                      Inspecteur : {inspectorEmail || "Non assigné"}.{" "}
                      {qualityDecision
                        ? `Décision : ${qualityDecision}`
                        : "Mesures techniques en cours d'enregistrement."}
                    </p>
                  </div>
                </div>
              )}

              {/* Event 5: DPP */}
              {dpp && (
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-teal-600" />
                  <div className="text-xs">
                    <span className="font-mono text-[10px] text-[#6e7d77]">
                      {new Date(dpp.updatedAt || dpp.createdAt).toLocaleString()}
                    </span>
                    <p className="font-bold text-[#173f35] mt-0.5">
                      Passeport Numérique {dpp.passportNumber} (v{dpp.currentVersionNumber})
                    </p>
                    <p className="text-[#52635c] mt-0.5">
                      Traçabilité enregistrée avec {dpp.eventsCount ?? 0} événements scellés.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL QR CODE DPP */}
      {qrModalData && (
        <DppQrModal qrData={qrModalData} onClose={() => setQrModalData(null)} />
      )}

      {/* MODALS QUALITÉ */}
      {isCreateInspectionOpen && (
        <CreateInspectionModal
          isOpen={isCreateInspectionOpen}
          onClose={() => setIsCreateInspectionOpen(false)}
          tradeId={trade.id}
          tradeNumber={trade.tradeNumber}
          materialType={trade.materialType}
          quantity={trade.quantity}
          quantityUnit={trade.quantityUnit}
          supplierName={trade.supplierOrganisationName}
          onCreated={() => {
            setIsCreateInspectionOpen(false);
            void loadData();
          }}
        />
      )}

      {isAssignInspectionOpen && inspectionId && inspectionRef && (
        <AssignInspectorModal
          isOpen={isAssignInspectionOpen}
          onClose={() => setIsAssignInspectionOpen(false)}
          inspectionId={inspectionId}
          inspectionReference={inspectionRef}
          onAssigned={() => {
            setIsAssignInspectionOpen(false);
            void loadData();
          }}
        />
      )}
    </div>
  );
}
