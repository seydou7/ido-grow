"use client";

import { useEffect, useState } from "react";
import { QuoteBuilderModal } from "../quotes";
import { getTraderCockpit, MatchingRequestError } from "./api";
import { getTraderTrades } from "../trades/api";
import { fetchShipments } from "../logistics/api";
import type {
  CockpitApprovedMatch,
  CockpitBuyOrder,
  OperationalQueueItem,
  TraderCockpitResponse,
} from "./contracts";
import type { TradeSummary } from "../trades/contracts";
import type { ShipmentSummary } from "../logistics/contracts";
import { MatchingWorkspaceView } from "./matching-workspace-view";

export interface TraderCockpitViewProps {
  onOpenMatching?: (buyOrderId: string) => void;
  onNavigateSection?: (section: string) => void;
  onNavigateToSupplier?: (supplierId: string) => void;
  onNavigateToBuyer?: (buyerId: string) => void;
}

interface PriorityItem {
  id: string;
  level: "URGENT" | "TO_PROCESS" | "IN_PROGRESS";
  typeBadge: string;
  typeColor: string;
  reference: string;
  title: string;
  description: string;
  timestamp: string;
  actionLabel: string;
  onAction: () => void;
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}

function isOlderThan48h(dateString: string): boolean {
  const created = new Date(dateString).getTime();
  const now = Date.now();
  return now - created > 48 * 3600 * 1000;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Récemment";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "À l'instant";
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return "Récemment";
  }
}

export function TraderCockpitView({
  onOpenMatching,
  onNavigateSection,
  onNavigateToSupplier,
}: TraderCockpitViewProps) {
  const [data, setData] = useState<TraderCockpitResponse | null>(null);
  const [trades, setTrades] = useState<TradeSummary[]>([]);
  const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Active level in Priority work queue
  const [activePriorityLevel, setActivePriorityLevel] = useState<
    "URGENT" | "TO_PROCESS" | "IN_PROGRESS"
  >("URGENT");

  // In-cockpit Matching Workspace navigation state
  const [internalMatchingOrderId, setInternalMatchingOrderId] = useState<string | null>(null);

  // Quote Builder modal state
  const [selectedMatchForQuote, setSelectedMatchForQuote] = useState<{
    matchId: string;
    context: {
      materialType: string;
      productForm?: string | null;
      quantity: number;
      quantityUnit: string;
      buyerOrganisationName: string;
      supplierOrganisationName: string;
      buyOrderId?: string;
      listingId?: string;
      currency?: string;
    };
  } | null>(null);

  // Recent Activity toggle state
  const [showAllActivity, setShowAllActivity] = useState(false);

  const loadAllDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [cockpitResult, tradesResult, shipmentsResult] = await Promise.allSettled([
        getTraderCockpit(),
        getTraderTrades(),
        fetchShipments(),
      ]);

      if (cockpitResult.status === "fulfilled") {
        setData(cockpitResult.value);
      } else {
        const err = cockpitResult.reason;
        if (err instanceof MatchingRequestError && err.status === 403) {
          setError("Accès restreint. Le tableau de bord est réservé aux opérateurs Trader.");
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les données opérationnelles Trader.",
          );
        }
      }

      if (tradesResult.status === "fulfilled") {
        setTrades(tradesResult.value.items || []);
      }

      if (shipmentsResult.status === "fulfilled") {
        setShipments(shipmentsResult.value.items || []);
      }

      setLastRefreshedAt(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAllDashboardData();
  }, []);

  const handleOpenDemandMatching = (buyOrderId: string) => {
    if (onOpenMatching) {
      onOpenMatching(buyOrderId);
    } else {
      setInternalMatchingOrderId(buyOrderId);
    }
  };

  const handleActionClick = (item: OperationalQueueItem) => {
    if (item.category === "buyer_demand") {
      const boId = item.meta?.buyOrderId || item.referenceId;
      handleOpenDemandMatching(boId);
    } else if (item.category === "approved_match") {
      setSelectedMatchForQuote({
        matchId: item.referenceId,
        context: {
          materialType: item.meta?.materialType || "",
          productForm: item.meta?.productForm || null,
          quantity: item.meta?.quantity || 0,
          quantityUnit: item.meta?.quantityUnit || "TONNES",
          buyerOrganisationName: item.meta?.buyerOrganisationName || item.organisationName,
          supplierOrganisationName: item.meta?.supplierOrganisationName || "",
          buyOrderId: item.meta?.buyOrderId as string | undefined,
          listingId: item.meta?.listingId as string | undefined,
          currency: item.meta?.currency as string | undefined,
        },
      });
    } else if (item.category === "supplier_onboarding" || item.category === "listing_review") {
      const supplierId = (item.meta?.organisationId as string) || item.referenceId;
      if (onNavigateToSupplier && supplierId) {
        onNavigateToSupplier(supplierId);
      } else if (onNavigateSection) {
        onNavigateSection("trader-partners");
      }
    } else if (item.category === "quote_accepted") {
      onNavigateSection?.("trader-transactions");
    }
  };

  // If a matching workspace is open internally, render the actual MatchingWorkspaceView
  if (internalMatchingOrderId) {
    return (
      <MatchingWorkspaceView
        buyOrderId={internalMatchingOrderId}
        onBack={() => {
          setInternalMatchingOrderId(null);
          void loadAllDashboardData(true);
        }}
      />
    );
  }

  // Loading Skeleton
  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-[#e2dccd]/70" />
        <div className="h-32 rounded-2xl border border-[#e2dccd] bg-white p-6" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-[#e2dccd] bg-white p-4" />
          ))}
        </div>
        <div className="h-80 rounded-2xl border border-[#e2dccd] bg-white" />
      </div>
    );
  }

  // Error State
  if (error && !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-2xs">
        <h2 className="text-base font-bold text-[#173f35]">
          Impossible de charger le tableau de bord Trader
        </h2>
        <p className="mt-1 text-xs text-rose-700">{error}</p>
        <button
          type="button"
          onClick={() => void loadAllDashboardData()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#173f35] px-4 py-2 text-xs font-semibold text-white hover:bg-[#123129] transition-colors"
        >
          Réessayer la connexion
        </button>
      </div>
    );
  }

  // Data Derivation
  const operationalQueue = data?.operationalQueue ?? [];
  const openBuyOrders = data?.openBuyOrders ?? [];
  const approvedMatches = data?.approvedMatches ?? [];

  // Demandes ouvertes sans offre
  const openDemandsNoMatch = openBuyOrders.filter((bo) => bo.matchStatus === "No Match");
  const urgentDemands = openDemandsNoMatch.filter((bo) => isOlderThan48h(bo.createdAt));

  // Expéditions critiques
  const delayedOrDisputedShipments = shipments.filter(
    (s) => s.status === "DELAYED" || s.status === "DISPUTED",
  );
  const activeShipments = shipments.filter(
    (s) =>
      s.status === "IN_TRANSIT" ||
      s.status === "PICKED_UP" ||
      s.status === "PICKUP_SCHEDULED",
  );

  // Volume sous contrat ce mois
  const now = new Date();
  const currentMonthTrades = trades.filter((t) => {
    const d = new Date(t.acceptedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyTons = currentMonthTrades.reduce((acc, t) => acc + (t.quantity || 0), 0);

  // ── Constructing Priority Items ──────────────────────────────
  const urgentItems: PriorityItem[] = [
    ...urgentDemands.map((bo) => ({
      id: `urgent-demand-${bo.id}`,
      level: "URGENT" as const,
      typeBadge: "Demande sans offre > 48h",
      typeColor: "bg-rose-50 text-rose-800 border-rose-200",
      reference: `#BO-${bo.id.slice(-4).toUpperCase()}`,
      title: `${bo.materialType} · ${bo.quantity} ${bo.quantityUnit}`,
      description: `${bo.buyerOrganisationName} · Destination : ${bo.deliveryCountry || "Europe"}`,
      timestamp: bo.createdAt,
      actionLabel: "Matcher →",
      onAction: () => handleOpenDemandMatching(bo.id),
    })),
    ...delayedOrDisputedShipments.map((s) => ({
      id: `urgent-shipment-${s.id}`,
      level: "URGENT" as const,
      typeBadge: s.status === "DELAYED" ? "Expédition en retard" : "Expédition contestée",
      typeColor: "bg-rose-50 text-rose-800 border-rose-200",
      reference: s.shipmentNumber || `#SH-${s.id.slice(-4).toUpperCase()}`,
      title: `Transport ${s.shipmentQuantity} ${s.quantityUnit} (${s.status})`,
      description: `${s.origin || "Origine"} → ${s.destination || "Destination"} · ${s.supplierOrganisationName || "Fournisseur"}`,
      timestamp: s.updatedAt || s.createdAt,
      actionLabel: "Résoudre →",
      onAction: () => onNavigateSection?.("trader-transactions"),
    })),
  ];

  const toProcessItems: PriorityItem[] = [
    ...approvedMatches.map((m) => ({
      id: `to-process-match-${m.id}`,
      level: "TO_PROCESS" as const,
      typeBadge: "Match à deviser",
      typeColor: "bg-amber-50 text-amber-800 border-amber-200",
      reference: `#M-${m.id.slice(-4).toUpperCase()}`,
      title: `${m.materialType} · ${m.quantity} ${m.quantityUnit}`,
      description: `${m.buyerOrganisationName} ↔ ${m.supplierOrganisationName}`,
      timestamp: m.approvedAt || m.createdAt,
      actionLabel: "Préparer devis →",
      onAction: () =>
        setSelectedMatchForQuote({
          matchId: m.id,
          context: {
            materialType: m.materialType,
            productForm: m.productForm,
            quantity: m.quantity,
            quantityUnit: m.quantityUnit,
            buyerOrganisationName: m.buyerOrganisationName,
            supplierOrganisationName: m.supplierOrganisationName,
            buyOrderId: m.buyOrderId,
            listingId: m.listingId,
            currency: m.currency,
          },
        }),
    })),
    ...openDemandsNoMatch
      .filter((bo) => !isOlderThan48h(bo.createdAt))
      .map((bo) => ({
        id: `to-process-demand-${bo.id}`,
        level: "TO_PROCESS" as const,
        typeBadge: "Nouvelle demande",
        typeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        reference: `#BO-${bo.id.slice(-4).toUpperCase()}`,
        title: `${bo.materialType} · ${bo.quantity} ${bo.quantityUnit}`,
        description: `${bo.buyerOrganisationName} · Destination : ${bo.deliveryCountry || "Europe"}`,
        timestamp: bo.createdAt,
        actionLabel: "Matcher →",
        onAction: () => handleOpenDemandMatching(bo.id),
      })),
    ...operationalQueue
      .filter((q) => q.category === "supplier_onboarding" || q.category === "listing_review")
      .map((q) => ({
        id: q.id,
        level: "TO_PROCESS" as const,
        typeBadge: q.category === "supplier_onboarding" ? "Vérification Fournisseur" : "Revue Offre",
        typeColor: "bg-blue-50 text-blue-800 border-blue-200",
        reference: q.referenceDisplay,
        title: q.organisationName,
        description: q.attentionReason,
        timestamp: q.createdAt,
        actionLabel: "Examiner →",
        onAction: () => handleActionClick(q),
      })),
  ];

  const inProgressItems: PriorityItem[] = [
    ...activeShipments.map((s) => ({
      id: `in-progress-ship-${s.id}`,
      level: "IN_PROGRESS" as const,
      typeBadge: "Expédition en cours",
      typeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
      reference: s.shipmentNumber || `#SH-${s.id.slice(-4).toUpperCase()}`,
      title: `Transport ${s.shipmentQuantity} ${s.quantityUnit} (${s.status})`,
      description: `${s.origin || "Origine"} → ${s.destination || "Destination"} · ${s.supplierOrganisationName || "Fournisseur"}`,
      timestamp: s.updatedAt || s.createdAt,
      actionLabel: "Voir transport →",
      onAction: () => onNavigateSection?.("trader-transactions"),
    })),
    ...trades.slice(0, 5).map((t) => ({
      id: `in-progress-trade-${t.id}`,
      level: "IN_PROGRESS" as const,
      typeBadge: "Dossier transactionnel",
      typeColor: "bg-teal-50 text-teal-800 border-teal-200",
      reference: t.tradeNumber,
      title: `${t.materialType} · ${t.quantity} ${t.quantityUnit}`,
      description: `${t.buyerOrganisationName} ↔ ${t.supplierOrganisationName} · Total : ${t.acceptedTotalAmount.toLocaleString()} ${t.currency}`,
      timestamp: t.acceptedAt,
      actionLabel: "Ouvrir dossier →",
      onAction: () => onNavigateSection?.("trader-transactions"),
    })),
  ];

  // Total items requiring attention
  const totalAttentionCount = urgentItems.length + toProcessItems.length;

  // ── Constructing Recent Activity Events ───────────────────────
  const activityEvents: ActivityEvent[] = [
    ...trades.slice(0, 4).map((t) => ({
      id: `act-trade-${t.id}`,
      timestamp: t.acceptedAt,
      title: `Transaction confirmée ${t.tradeNumber}`,
      description: `${t.quantity} ${t.quantityUnit} de ${t.materialType} pour ${t.buyerOrganisationName}`,
      badge: "Transaction",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    })),
    ...approvedMatches.slice(0, 3).map((m) => ({
      id: `act-match-${m.id}`,
      timestamp: m.approvedAt || m.createdAt,
      title: `Match approuvé pour devis`,
      description: `${m.quantity} ${m.quantityUnit} · ${m.buyerOrganisationName} ↔ ${m.supplierOrganisationName}`,
      badge: "Matching",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    })),
    ...openBuyOrders.slice(0, 3).map((bo) => ({
      id: `act-bo-${bo.id}`,
      timestamp: bo.createdAt,
      title: `Demande d'achat enregistrée`,
      description: `${bo.quantity} ${bo.quantityUnit} de ${bo.materialType} (${bo.buyerOrganisationName})`,
      badge: "Demande",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    })),
    ...shipments.slice(0, 3).map((s) => ({
      id: `act-ship-${s.id}`,
      timestamp: s.updatedAt || s.createdAt,
      title: `Expédition mise à jour (${s.status})`,
      description: `${s.shipmentNumber || "Lot"} · ${s.shipmentQuantity} ${s.quantityUnit} acheminés`,
      badge: "Logistique",
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

  const displayedActivityEvents = showAllActivity
    ? activityEvents
    : activityEvents.slice(0, 5);

  // Active items in the selected priority level
  const displayedPriorityItems =
    activePriorityLevel === "URGENT"
      ? urgentItems
      : activePriorityLevel === "TO_PROCESS"
      ? toProcessItems
      : inProgressItems;

  const todayFormatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Textual summary synthesis for Résumé du jour
  const summaryParts: string[] = [];
  if (urgentDemands.length > 0) {
    summaryParts.push(
      `${urgentDemands.length} demande${urgentDemands.length > 1 ? "s sont" : " est"} sans offre depuis plus de 48h`,
    );
  } else if (openDemandsNoMatch.length > 0) {
    summaryParts.push(
      `${openDemandsNoMatch.length} demande${openDemandsNoMatch.length > 1 ? "s sont" : " est"} en attente d'offre`,
    );
  }

  if (approvedMatches.length > 0) {
    summaryParts.push(
      `${approvedMatches.length} rapprochement${approvedMatches.length > 1 ? "s sont" : " est"} prêt${approvedMatches.length > 1 ? "s" : ""} pour devis`,
    );
  }

  let textSummary = "";
  if (summaryParts.length > 0) {
    textSummary = summaryParts.join(" et ") + ".";
    textSummary = textSummary.charAt(0).toUpperCase() + textSummary.slice(1);
  } else if (totalAttentionCount === 0) {
    textSummary = "Tous vos dossiers sont à jour pour le moment.";
  } else {
    textSummary = `${totalAttentionCount} dossier${totalAttentionCount > 1 ? "s requièrent" : " requiert"} votre suivi.`;
  }

  const logisticsAlertText =
    delayedOrDisputedShipments.length > 0
      ? `${delayedOrDisputedShipments.length} expédition${delayedOrDisputedShipments.length > 1 ? "s signalent" : " signale"} un retard ou un litige nécessitant votre arbitrage.`
      : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. SIMPLE HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#e2dccd] pb-3.5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f35]">
            Bonjour, Trader Operations
          </h1>
          <p className="mt-0.5 text-xs text-[#52635c]">
            Voici ce qui demande votre attention aujourd’hui.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs text-[#6e7d77] capitalize mr-1">
            {todayFormatted}
          </span>

          <button
            type="button"
            onClick={() => void loadAllDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2dccd] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all disabled:opacity-50"
            title="Actualiser les données"
          >
            <span className={refreshing ? "animate-spin" : ""}>↻</span>
            <span className="hidden md:inline">{refreshing ? "Actualisation..." : "Actualiser"}</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT DAY SUMMARY (RÉSUMÉ DU JOUR TEXTUEL) */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#173f35] text-[11px] font-bold text-[#e5b84b] shrink-0 mt-0.5">
            {totalAttentionCount}
          </span>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#173f35]">
              {totalAttentionCount > 0
                ? `${totalAttentionCount} dossier${totalAttentionCount > 1 ? "s demandent" : " demande"} votre attention aujourd’hui.`
                : "Tous vos dossiers sont à jour pour le moment."}
            </h2>
            <p className="text-xs text-[#52635c] leading-relaxed">
              {textSummary}
            </p>
            {logisticsAlertText && (
              <p className="text-xs font-medium text-rose-700">
                {logisticsAlertText}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. 3 ACTIONABLE KPIS (EXACTEMENT 3 KPI CLIQUABLES) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* KPI 1: Demandes ouvertes sans offre */}
        <button
          type="button"
          onClick={() => onNavigateSection?.("trader-matching")}
          className="group flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-3.5 sm:p-4 text-left shadow-2xs hover:border-[#173f35]/50 hover:bg-[#fcfaf5] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e7d77]">
              Demandes sans offre
            </span>
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
              Matching
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-[#173f35] tabular-nums">
              {openDemandsNoMatch.length}
            </span>
            <span className="text-xs font-semibold text-[#173f35] opacity-0 group-hover:opacity-100 transition-opacity">
              Ouvrir →
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#52635c]">
            {urgentDemands.length > 0
              ? `${urgentDemands.length} en retard (> 48h)`
              : "Toutes sous le seuil de 48h"}
          </p>
        </button>

        {/* KPI 2: Devis en attente de décision / prêts */}
        <button
          type="button"
          onClick={() => onNavigateSection?.("trader-transactions")}
          className="group flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-3.5 sm:p-4 text-left shadow-2xs hover:border-[#173f35]/50 hover:bg-[#fcfaf5] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e7d77]">
              Devis &amp; Matchs prêts
            </span>
            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800 border border-blue-200">
              Commercial
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-[#173f35] tabular-nums">
              {approvedMatches.length}
            </span>
            <span className="text-xs font-semibold text-[#173f35] opacity-0 group-hover:opacity-100 transition-opacity">
              Gérer →
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#52635c]">
            Rapprochements validés prêts pour proposition
          </p>
        </button>

        {/* KPI 3: Volume sous contrat ce mois */}
        <button
          type="button"
          onClick={() => onNavigateSection?.("trader-transactions")}
          className="group flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-3.5 sm:p-4 text-left shadow-2xs hover:border-[#173f35]/50 hover:bg-[#fcfaf5] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e7d77]">
              Volume sous contrat
            </span>
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
              Ce mois
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-[#173f35] tabular-nums">
              {monthlyTons.toLocaleString()} <span className="text-sm font-semibold text-[#52635c]">t</span>
            </span>
            <span className="text-xs font-semibold text-[#173f35] opacity-0 group-hover:opacity-100 transition-opacity">
              Contrats →
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#52635c]">
            {currentMonthTrades.length} transaction{currentMonthTrades.length > 1 ? "s" : ""} validée{currentMonthTrades.length > 1 ? "s" : ""}
          </p>
        </button>
      </div>

      {/* 4. ACTIONS RAPIDES (MAXIMUM 4 ACTIONS) */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#e2dccd] bg-[#fbf9f4] p-2.5 sm:p-3 shadow-2xs">
        <span className="px-1.5 text-xs font-medium text-[#6e7d77]">
          Actions rapides
        </span>

        {/* Action 1: Ouvrir Matching */}
        <button
          type="button"
          onClick={() => onNavigateSection?.("trader-matching")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] hover:border-[#173f35]/40 transition-all shadow-2xs"
        >
          <span>📋</span>
          <span>Ouvrir Matching</span>
        </button>

        {/* Action 2: Traiter une demande */}
        <button
          type="button"
          onClick={() => {
            const firstDemand = openDemandsNoMatch[0];
            if (firstDemand) {
              handleOpenDemandMatching(firstDemand.id);
            } else {
              onNavigateSection?.("trader-matching");
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#173f35] px-3 py-1.5 text-xs font-semibold text-[#fffaf0] hover:bg-[#123129] transition-all shadow-2xs"
        >
          <span>⚡</span>
          <span>Traiter une demande</span>
        </button>

        {/* Action 3: Préparer un devis */}
        <button
          type="button"
          onClick={() => {
            const firstMatch = approvedMatches[0];
            if (firstMatch) {
              setSelectedMatchForQuote({
                matchId: firstMatch.id,
                context: {
                  materialType: firstMatch.materialType,
                  productForm: firstMatch.productForm,
                  quantity: firstMatch.quantity,
                  quantityUnit: firstMatch.quantityUnit,
                  buyerOrganisationName: firstMatch.buyerOrganisationName,
                  supplierOrganisationName: firstMatch.supplierOrganisationName,
                  buyOrderId: firstMatch.buyOrderId,
                  listingId: firstMatch.listingId,
                  currency: firstMatch.currency,
                },
              });
            } else {
              onNavigateSection?.("trader-matching");
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] hover:border-[#173f35]/40 transition-all shadow-2xs"
        >
          <span>📄</span>
          <span>Préparer un devis</span>
        </button>

        {/* Action 4: Voir Transactions */}
        <button
          type="button"
          onClick={() => onNavigateSection?.("trader-transactions")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] hover:border-[#173f35]/40 transition-all shadow-2xs"
        >
          <span>📦</span>
          <span>Voir Transactions</span>
        </button>
      </div>

      {/* 5. PRIORITÉS OPÉRATIONNELLES (CŒUR VISUEL - FILE UNIQUE À 3 NIVEAUX) */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
        {/* Work Queue Header & Level Switcher */}
        <div className="border-b border-[#e2dccd] bg-[#fbf9f4] p-3.5 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#173f35]">
                Priorités opérationnelles
              </h2>
              <p className="mt-0.5 text-xs text-[#52635c]">
                File d’attente d’intervention Trader classée par criticité
              </p>
            </div>

            {/* Level Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#e2dccd] bg-white p-1">
              <button
                type="button"
                onClick={() => setActivePriorityLevel("URGENT")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  activePriorityLevel === "URGENT"
                    ? "bg-rose-700 text-white shadow-2xs"
                    : "text-[#52635c] hover:bg-[#faf8f1]"
                }`}
              >
                <span>🚨 Urgent</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activePriorityLevel === "URGENT"
                      ? "bg-white/20 text-white"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {urgentItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActivePriorityLevel("TO_PROCESS")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  activePriorityLevel === "TO_PROCESS"
                    ? "bg-[#173f35] text-white shadow-2xs"
                    : "text-[#52635c] hover:bg-[#faf8f1]"
                }`}
              >
                <span>⚡ À traiter</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activePriorityLevel === "TO_PROCESS"
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {toProcessItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActivePriorityLevel("IN_PROGRESS")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  activePriorityLevel === "IN_PROGRESS"
                    ? "bg-[#284f41] text-white shadow-2xs"
                    : "text-[#52635c] hover:bg-[#faf8f1]"
                }`}
              >
                <span>⏳ En cours</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activePriorityLevel === "IN_PROGRESS"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {inProgressItems.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Priority List (No wide table, clean structured rows) */}
        {displayedPriorityItems.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-[#173f35]">
              Aucun élément dans cette catégorie
            </p>
            <p className="mt-1 text-xs text-[#6e7d77]">
              Toutes les actions requises sont complétées pour ce niveau de priorité.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f0ece1]">
            {displayedPriorityItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:px-4 hover:bg-[#fcfaf5] transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="pt-0.5">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.typeColor}`}
                    >
                      {item.typeBadge}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#173f35]">
                        {item.reference}
                      </span>
                      <span className="text-xs font-semibold text-[#173f35]">
                        {item.title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#52635c] truncate">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t border-[#f0ece1] sm:border-0">
                  <span className="text-[11px] text-[#6e7d77]">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="inline-flex items-center rounded-xl bg-[#173f35] px-3 py-1.5 text-xs font-semibold text-[#fffaf0] hover:bg-[#123129] transition-all shadow-2xs"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. RECENT ACTIVITY (TIMELINE / LISTE CHRONOLOGIQUE) */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#f0ece1] pb-2.5 mb-3.5">
          <div>
            <h2 className="text-sm font-bold text-[#173f35]">
              Activité récente
            </h2>
            <p className="text-xs text-[#52635c]">
              Derniers événements enregistrés sur la plateforme
            </p>
          </div>
          <span className="text-[11px] text-[#6e7d77]">
            Dernière màj : {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {displayedActivityEvents.length === 0 ? (
          <p className="py-4 text-center text-xs text-[#6e7d77]">
            Aucune activité récente enregistrée.
          </p>
        ) : (
          <div className="space-y-3">
            {displayedActivityEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 text-xs"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-[#173f35]/60 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold border uppercase tracking-wider ${event.badgeColor}`}
                    >
                      {event.badge}
                    </span>
                    <span className="font-semibold text-[#173f35]">{event.title}</span>
                    <span className="text-[11px] text-[#6e7d77]">
                      · {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[#52635c]">{event.description}</p>
                </div>
              </div>
            ))}

            {activityEvents.length > 5 && (
              <div className="pt-2 text-center border-t border-[#f0ece1]">
                <button
                  type="button"
                  onClick={() => setShowAllActivity(!showAllActivity)}
                  className="text-xs font-semibold text-[#173f35] hover:text-[#284f41] hover:underline"
                >
                  {showAllActivity
                    ? "Réduire l’activité ↑"
                    : `Voir toute l’activité (${activityEvents.length}) ↓`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QUOTE BUILDER MODAL */}
      {selectedMatchForQuote && (
        <QuoteBuilderModal
          isOpen={true}
          matchId={selectedMatchForQuote.matchId}
          matchedContext={selectedMatchForQuote.context}
          onClose={() => setSelectedMatchForQuote(null)}
          onQuoteUpdated={() => {
            setSelectedMatchForQuote(null);
            void loadAllDashboardData(true);
          }}
        />
      )}
    </div>
  );
}
