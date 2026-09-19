"use client";

import { useEffect, useState } from "react";
import { QuoteBuilderModal } from "../quotes";
import { getTraderCockpit, MatchingRequestError } from "./api";
import type {
  CockpitApprovedMatch,
  CockpitBuyOrder,
  OperationalQueueCategory,
  OperationalQueueItem,
  TraderCockpitResponse,
} from "./contracts";
import { MatchingWorkspaceView } from "./matching-workspace-view";

export interface TraderCockpitViewProps {
  onOpenMatching?: (buyOrderId: string) => void;
  onNavigateSection?: (section: string) => void;
  onNavigateToSupplier?: (supplierId: string) => void;
  onNavigateToBuyer?: (buyerId: string) => void;
}

export function TraderCockpitView({
  onOpenMatching,
  onNavigateSection,
  onNavigateToSupplier,
  onNavigateToBuyer,
}: TraderCockpitViewProps) {
  const [data, setData] = useState<TraderCockpitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Active filter for the Operational Queue
  const [activeQueueFilter, setActiveQueueFilter] = useState<"ALL" | OperationalQueueCategory>("ALL");

  // In-cockpit Matching Workspace navigation state
  const [internalMatchingOrderId, setInternalMatchingOrderId] = useState<string | null>(null);
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

  const loadCockpitData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await getTraderCockpit();
      setData(response);
      setLastRefreshedAt(new Date());
    } catch (err: unknown) {
      if (err instanceof MatchingRequestError && err.status === 403) {
        setError("Access restricted. The Trader Cockpit is reserved for authenticated Trader organisations.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load Trader Cockpit operational data. Please ensure the backend is running.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadCockpitData();
  }, []);

  const handleActionClick = (item: OperationalQueueItem) => {
    if (item.category === "buyer_demand") {
      const boId = item.meta?.buyOrderId || item.referenceId;
      if (onOpenMatching) {
        onOpenMatching(boId);
      } else {
        setInternalMatchingOrderId(boId);
      }
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
    } else if (item.category === "supplier_onboarding") {
      const supplierId = (item.meta?.organisationId as string) || item.referenceId;
      if (onNavigateToSupplier && supplierId) {
        onNavigateToSupplier(supplierId);
      } else if (onNavigateSection) {
        onNavigateSection("trader-suppliers");
      }
    } else if (item.category === "listing_review") {
      const supplierId = item.meta?.organisationId as string;
      if (onNavigateToSupplier && supplierId) {
        onNavigateToSupplier(supplierId);
      } else if (onNavigateSection) {
        onNavigateSection("trader-suppliers");
      }
    } else if (item.category === "quote_accepted") {
      if (onNavigateSection) {
        onNavigateSection("trader-trades");
      }
    } else if (
      item.category === "quote_internal_review" ||
      item.category === "quote_countered" ||
      item.category === "quote_awaiting_buyer"
    ) {
      if (item.meta?.matchId) {
        setSelectedMatchForQuote({
          matchId: item.meta.matchId as string,
          context: {
            materialType: (item.meta.materialType as string) || "Natural Fibre",
            quantity: (item.meta.quantity as number) || 0,
            quantityUnit: (item.meta.quantityUnit as string) || "TONNES",
            buyerOrganisationName: item.organisationName,
            supplierOrganisationName: "Supplier",
            buyOrderId: item.meta?.buyOrderId as string | undefined,
          },
        });
      } else if (item.meta?.buyOrderId) {
        handleOpenDemandMatching(item.meta.buyOrderId as string);
      }
    }
  };

  const handleOpenDemandMatching = (buyOrderId: string) => {
    if (onOpenMatching) {
      onOpenMatching(buyOrderId);
    } else {
      setInternalMatchingOrderId(buyOrderId);
    }
  };

  // If a matching workspace is open internally, render the actual Block 01 MatchingWorkspaceView
  if (internalMatchingOrderId) {
    return (
      <MatchingWorkspaceView
        buyOrderId={internalMatchingOrderId}
        onBack={() => {
          setInternalMatchingOrderId(null);
          void loadCockpitData(true);
        }}
      />
    );
  }

  // Loading skeleton
  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-[#e2dccd]/60" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-[#e2dccd] bg-white p-4" />
          ))}
        </div>
        <div className="h-96 rounded-2xl border border-[#e2dccd] bg-white" />
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h2 className="text-base font-bold">Unable to load Trader Cockpit</h2>
        <p className="mt-1 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void loadCockpitData()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const summary = data?.summary ?? {
    supplierOnboardingCount: 0,
    pendingListingsCount: 0,
    publishedListingsCount: 0,
    openBuyOrdersCount: 0,
    approvedMatchesCount: 0,
  };

  const operationalQueue = data?.operationalQueue ?? [];
  const openBuyOrders = data?.openBuyOrders ?? [];
  const approvedMatches = data?.approvedMatches ?? [];

  const filteredQueue = activeQueueFilter === "ALL"
    ? operationalQueue
    : operationalQueue.filter((item) => item.category === activeQueueFilter);

  return (
    <div className="space-y-8">
      {/* Cockpit Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#173f35] text-xs font-bold text-[#e5b84b]">
              TC
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[#173f35] sm:text-2xl">
              Trader Cockpit
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#52635c] sm:text-sm">
            Operational Centre · Real-time pipeline, pending queues, demand fulfilment & matching
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#6e7d77]">
            Last updated: {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button
            type="button"
            onClick={() => void loadCockpitData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#245347] bg-[#173f35] px-3.5 py-1.5 text-xs font-semibold text-[#fffaf0] hover:bg-[#245347] transition-all disabled:opacity-50"
          >
            <svg
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (Derived exclusively from real PostgreSQL entities) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Metric 1: Open Buyer Demands */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e7d77]">
              Open Demands
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-md bg-amber-50 text-xs text-amber-700">
              📋
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-[#173f35]">
              {summary.openBuyOrdersCount}
            </span>
            <p className="mt-0.5 text-[11px] text-[#52635c]">Active buyer orders</p>
          </div>
        </div>

        {/* Metric 2: Supplier Onboarding Attention */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e7d77]">
              Onboarding
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-md bg-purple-50 text-xs text-purple-700">
              🏢
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-[#173f35]">
              {summary.supplierOnboardingCount}
            </span>
            <p className="mt-0.5 text-[11px] text-[#52635c]">Suppliers pending review</p>
          </div>
        </div>

        {/* Metric 3: Draft / Pending Listings */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e7d77]">
              Draft Listings
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-md bg-yellow-50 text-xs text-yellow-700">
              📝
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-[#173f35]">
              {summary.pendingListingsCount}
            </span>
            <p className="mt-0.5 text-[11px] text-[#52635c]">Awaiting publication</p>
          </div>
        </div>

        {/* Metric 4: Published Supply */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e7d77]">
              Live Inventory
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-50 text-xs text-emerald-700">
              🌾
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-[#173f35]">
              {summary.publishedListingsCount}
            </span>
            <p className="mt-0.5 text-[11px] text-[#52635c]">Marketplace listings</p>
          </div>
        </div>

        {/* Metric 5: Approved Matches */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e7d77]">
              Approved Matches
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-md bg-teal-50 text-xs text-teal-700">
              🤝
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-[#173f35]">
              {summary.approvedMatchesCount}
            </span>
            <p className="mt-0.5 text-[11px] text-[#1b6b47] font-medium">Ready for quotation</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: OPERATIONAL QUEUE */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
        {/* Queue Header & Tabs */}
        <div className="border-b border-[#e2dccd] bg-[#fbf9f4] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#173f35]">
                Operational Queue
              </h2>
              <p className="mt-0.5 text-xs text-[#52635c]">
                Deterministic queue of actionable items requiring Trader intervention
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#e2dccd] bg-white p-1">
              <button
                type="button"
                onClick={() => setActiveQueueFilter("ALL")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  activeQueueFilter === "ALL"
                    ? "bg-[#173f35] text-[#fffaf0]"
                    : "text-[#52635c] hover:bg-[#faf8f1]"
                }`}
              >
                All ({operationalQueue.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveQueueFilter("buyer_demand")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  activeQueueFilter === "buyer_demand"
                    ? "bg-[#173f35] text-[#fffaf0]"
                    : "text-[#52635c] hover:bg-[#faf8f1]"
                }`}
              >
                Demands ({operationalQueue.filter((q) => q.category === "buyer_demand").length})
              </button>
              <button
                type="button"
                onClick={() => setActiveQueueFilter("supplier_onboarding")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  activeQueueFilter === "supplier_onboarding"
                    ? "bg-[#173f35] text-[#fffaf0]"
                    : "text-[#52635c] hover:bg-[#faf8f1]"
                }`}
              >
                Onboarding ({operationalQueue.filter((q) => q.category === "supplier_onboarding").length})
              </button>
              <button
                type="button"
                onClick={() => setActiveQueueFilter("listing_review")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  activeQueueFilter === "listing_review"
                    ? "bg-[#173f35] text-[#fffaf0]"
                    : "text-[#52635c] hover:bg-[#faf8f1]"
                }`}
              >
                Listings ({operationalQueue.filter((q) => q.category === "listing_review").length})
              </button>
              <button
                type="button"
                onClick={() => setActiveQueueFilter("approved_match")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  activeQueueFilter === "approved_match"
                    ? "bg-[#173f35] text-[#fffaf0]"
                    : "text-[#52635c] hover:bg-[#faf8f1]"
                }`}
              >
                Approved ({operationalQueue.filter((q) => q.category === "approved_match").length})
              </button>
            </div>
          </div>
        </div>

        {/* Queue Items Table */}
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-[#173f35]">No actionable items in this category</p>
            <p className="mt-1 text-xs text-[#6e7d77]">
              All items in the current operational pipeline are up to date.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[11px] font-bold uppercase tracking-wider text-[#6e7d77]">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Organisation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Attention Reason</th>
                  <th className="py-3 px-4">Created / Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece1]">
                {filteredQueue.map((item) => {
                  let badgeBg = "bg-gray-100 text-gray-800";
                  let categoryLabel: string = item.category;

                  if (item.category === "buyer_demand") {
                    categoryLabel = "Buyer Demand";
                    badgeBg = item.currentStatus === "OPEN"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-blue-100 text-blue-900 border border-blue-300";
                  } else if (item.category === "supplier_onboarding") {
                    categoryLabel = "Supplier Onboarding";
                    badgeBg = "bg-purple-100 text-purple-900 border border-purple-300";
                  } else if (item.category === "listing_review") {
                    categoryLabel = "Listing Review";
                    badgeBg = "bg-yellow-100 text-yellow-900 border border-yellow-300";
                  } else if (item.category === "approved_match") {
                    categoryLabel = "Approved Match";
                    badgeBg = "bg-emerald-100 text-emerald-900 border border-emerald-300";
                  } else if (item.category === "quote_accepted") {
                    categoryLabel = "Trade / Accepted";
                    badgeBg = "bg-emerald-100 text-emerald-900 border border-emerald-300";
                  } else if (item.category === "quote_countered") {
                    categoryLabel = "Countered Quote";
                    badgeBg = "bg-purple-100 text-purple-900 border border-purple-300";
                  } else if (item.category === "quote_internal_review") {
                    categoryLabel = "Quote Review";
                    badgeBg = "bg-indigo-100 text-indigo-900 border border-indigo-300";
                  } else if (item.category === "quote_awaiting_buyer") {
                    categoryLabel = "Dispatched Quote";
                    badgeBg = "bg-blue-100 text-blue-900 border border-blue-300";
                  }

                  const formattedDate = new Date(item.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr key={item.id} className="hover:bg-[#fcfaf5] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#173f35]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${badgeBg}`}>
                            {categoryLabel}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#173f35] max-w-[200px] truncate">
                        {item.referenceDisplay}
                      </td>
                      <td className="py-3.5 px-4 text-[#52635c] max-w-[180px] truncate">
                        {item.organisationName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center rounded-full bg-[#faf8f1] px-2.5 py-0.5 text-[10px] font-semibold text-[#173f35] border border-[#e2dccd]">
                          {item.currentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#52635c] text-[11px] max-w-[240px]">
                        {item.attentionReason}
                      </td>
                      <td className="py-3.5 px-4 text-[#6e7d77] text-[11px]">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleActionClick(item)}
                          className="inline-flex items-center rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all"
                        >
                          {item.nextActionLabel}
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

      {/* SECTION 2: OPEN BUYER DEMANDS (ACTUAL BUY ORDER RECORDS) */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-[#e2dccd] bg-[#fbf9f4] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#173f35]">
                Open Buyer Demands
              </h2>
              <p className="mt-0.5 text-xs text-[#52635c]">
                Live BuyOrder procurement demands registered in the platform
              </p>
            </div>
            <span className="rounded-full bg-[#faf8f1] px-3 py-1 text-xs font-bold text-[#173f35] border border-[#e2dccd]">
              {openBuyOrders.length} Open
            </span>
          </div>
        </div>

        {openBuyOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6e7d77]">
            No OPEN buyer orders registered currently.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[11px] font-bold uppercase tracking-wider text-[#6e7d77]">
                  <th className="py-3 px-4">Buyer Organisation</th>
                  <th className="py-3 px-4">Material & Form</th>
                  <th className="py-3 px-4">Requested Quantity</th>
                  <th className="py-3 px-4">Destination & Date</th>
                  <th className="py-3 px-4">Match Status</th>
                  <th className="py-3 px-4 text-right">Matching Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece1]">
                {openBuyOrders.map((bo: CockpitBuyOrder) => {
                  let matchBadgeBg = "bg-amber-50 text-amber-800 border-amber-200";
                  if (bo.matchStatus === "Approved Match") {
                    matchBadgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
                  } else if (bo.matchStatus === "Draft Match") {
                    matchBadgeBg = "bg-blue-50 text-blue-800 border-blue-200";
                  }

                  const formattedDelivery = bo.requestedDeliveryDate
                    ? new Date(bo.requestedDeliveryDate).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Open Schedule";

                  return (
                    <tr key={bo.id} className="hover:bg-[#fcfaf5] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#173f35]">
                        <div className="flex items-center gap-2">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#faf8f1] text-[10px] font-bold text-[#173f35] border border-[#e2dccd]">
                            {bo.buyerOrganisationName.substring(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <button type="button" onClick={() => onNavigateToBuyer?.(bo.buyerOrganisationId)} className="truncate max-w-[180px] text-left hover:underline hover:text-[#1b6b47] transition-all">{bo.buyerOrganisationName}</button>
                            {bo.buyerCountry && (
                              <p className="text-[10px] font-normal text-[#6e7d77]">{bo.buyerCountry}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#173f35]">{bo.materialType}</span>
                        {bo.productForm && (
                          <span className="block text-[11px] text-[#52635c]">{bo.productForm}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#173f35]">
                        {bo.quantity} {bo.quantityUnit}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#52635c]">
                        <p className="font-medium text-[#173f35]">{bo.deliveryDestination || bo.deliveryCountry || "Not specified"}</p>
                        <p className="text-[#6e7d77]">{formattedDelivery}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${matchBadgeBg}`}>
                          {bo.matchStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDemandMatching(bo.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#173f35] px-3.5 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all"
                        >
                          {bo.matchStatus === "Approved Match" ? (
                            "View Workspace"
                          ) : bo.matchStatus === "Draft Match" ? (
                            "Review Match"
                          ) : (
                            <>
                              <span>Find Match</span>
                              <span className="text-[#e5b84b]">→</span>
                            </>
                          )}
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

      {/* SECTION 3: APPROVED MATCHES (READY FOR QUOTATION HANDOVER) */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-[#e2dccd] bg-[#fbf9f4] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#173f35]">
                Approved Matches
              </h2>
              <p className="mt-0.5 text-xs text-[#52635c]">
                Commercial pairings approved by Trader · Handover point for Sprint 06 Quotation
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              {approvedMatches.length} Approved
            </span>
          </div>
        </div>

        {approvedMatches.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6e7d77]">
            No APPROVED matches currently. Matches approved in Block 01 will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[11px] font-bold uppercase tracking-wider text-[#6e7d77]">
                  <th className="py-3 px-4">Buyer Organisation</th>
                  <th className="py-3 px-4">Supplier Organisation</th>
                  <th className="py-3 px-4">Matched Material</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Approved At</th>
                  <th className="py-3 px-4">Handoff Lifecycle</th>
                  <th className="py-3 px-4 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece1]">
                {approvedMatches.map((m: CockpitApprovedMatch) => {
                  const formattedApproved = m.approvedAt
                    ? new Date(m.approvedAt).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Approved";

                  return (
                    <tr key={m.id} className="hover:bg-[#fcfaf5] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#173f35]">
                        {m.buyerOrganisationId ? <button type="button" onClick={() => onNavigateToBuyer?.(m.buyerOrganisationId!)} className="hover:underline hover:text-[#1b6b47] text-left transition-all">{m.buyerOrganisationName}</button> : m.buyerOrganisationName}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#52635c]">
                        {m.supplierOrganisationId ? <button type="button" onClick={() => onNavigateToSupplier?.(m.supplierOrganisationId!)} className="hover:underline hover:text-[#173f35] text-left transition-all">{m.supplierOrganisationName}</button> : m.supplierOrganisationName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#173f35]">{m.materialType}</span>
                        {m.productForm && (
                          <span className="block text-[10px] text-[#6e7d77]">{m.productForm}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#173f35]">
                        {m.quantity} {m.quantityUnit}
                      </td>
                      <td className="py-3.5 px-4 text-[#6e7d77] text-[11px]">
                        {formattedApproved}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Ready for Quotation
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
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
                              })
                            }
                            className="inline-flex items-center rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all shadow-xs"
                          >
                            Prepare Quote →
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDemandMatching(m.buyOrderId)}
                            className="inline-flex items-center rounded-lg border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
                          >
                            View Workspace
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMatchForQuote && (
        <QuoteBuilderModal
          isOpen={true}
          onClose={() => setSelectedMatchForQuote(null)}
          matchId={selectedMatchForQuote.matchId}
          matchedContext={selectedMatchForQuote.context}
        />
      )}
    </div>
  );
}
