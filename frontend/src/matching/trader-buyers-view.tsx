"use client";

import { useEffect, useState } from "react";
import { QuoteBuilderModal } from "../quotes";
import { CreateEditBuyOrderModal } from "../buy-orders/create-edit-buy-order-modal";
import { createBuyOrder, submitBuyOrder } from "../buy-orders/api";
import type { CreateBuyOrderInput } from "../buy-orders/contracts";
import { getBuyerDetailForTrader, listBuyersForTrader } from "./api";
import type {
  TraderBuyerDetail,
  TraderBuyerSummary,
} from "./contracts";

export interface TraderBuyersViewProps {
  initialBuyerId?: string | null;
  onSelectBuyer?: (buyerId: string | null) => void;
  onOpenMatching?: (buyOrderId: string) => void;
}

export function TraderBuyersView({
  initialBuyerId,
  onSelectBuyer,
  onOpenMatching,
}: TraderBuyersViewProps) {
  const [buyers, setBuyers] = useState<TraderBuyerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("ALL");

  // Selection
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(
    initialBuyerId ?? null,
  );
  const [detail, setDetail] = useState<TraderBuyerDetail | null>(null);
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
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedQuoteIdForModal, setSelectedQuoteIdForModal] = useState<string | null>(null);

  useEffect(() => {
    if (initialBuyerId !== undefined) {
      setSelectedBuyerId(initialBuyerId);
    }
  }, [initialBuyerId]);

  // On-behalf BuyOrder modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadBuyers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listBuyersForTrader({
        search: search.trim() !== "" ? search : undefined,
        verificationStatus: verificationFilter !== "ALL" ? verificationFilter : undefined,
      });
      setBuyers(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load buyers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBuyers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadBuyers();
  };

  const loadBuyerDetail = async (id: string) => {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await getBuyerDetailForTrader(id);
      setDetail(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load buyer details.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBuyerId) {
      void loadBuyerDetail(selectedBuyerId);
    } else {
      setDetail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBuyerId]);

  const handleSelect = (id: string) => {
    setSelectedBuyerId(id);
    onSelectBuyer?.(id);
  };

  const handleBack = () => {
    setSelectedBuyerId(null);
    onSelectBuyer?.(null);
    void loadBuyers();
  };

  const handleSaveDraftOnBehalf = async (
    input: CreateBuyOrderInput,
    targetOrgId?: string,
  ) => {
    const orgId = targetOrgId || detail?.id;
    if (!orgId) return;
    await createBuyOrder(input, orgId);
    setIsCreateModalOpen(false);
    if (detail) {
      await loadBuyerDetail(detail.id);
    }
  };

  const handleSubmitDirectlyOnBehalf = async (
    input: CreateBuyOrderInput,
    targetOrgId?: string,
  ) => {
    const orgId = targetOrgId || detail?.id;
    if (!orgId) return;
    const created = await createBuyOrder(
      { ...input, submitDirectly: true },
      orgId,
    );
    if (created && created.status !== "OPEN") {
      await submitBuyOrder(created.id);
    }
    setIsCreateModalOpen(false);
    if (detail) {
      await loadBuyerDetail(detail.id);
    }
  };

  // DETAIL VIEW
  if (selectedBuyerId) {
    if (detailLoading && !detail) {
      return (
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-40 rounded-lg bg-[#e2dccd]/60" />
          <div className="h-28 rounded-2xl bg-white border border-[#e2dccd]" />
          <div className="h-80 rounded-2xl bg-white border border-[#e2dccd]" />
        </div>
      );
    }

    if (!detail) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
          <p className="font-semibold">Buyer could not be loaded.</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-3 rounded-xl bg-red-700 px-3.5 py-1.5 text-xs font-semibold text-white"
          >
            ← Back to Buyers
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Top Return Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173f35] hover:text-[#245347] transition-colors"
          >
            <span>← Back to Buyers Directory</span>
          </button>

          <span className="rounded-md bg-[#faf8f1] px-2.5 py-1 text-[11px] font-semibold text-[#52635c] border border-[#e2dccd]">
            ID: {detail.id}
          </span>
        </div>

        {/* Buyer Profile Header Card */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#173f35] text-xs font-bold text-[#e5b84b]">
                  {detail.name.substring(0, 2).toUpperCase()}
                </span>
                <h1 className="text-xl font-bold text-[#173f35] sm:text-2xl">
                  {detail.name}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    detail.verificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : detail.verificationStatus === "UNDER_REVIEW"
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {detail.verificationStatus}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#52635c]">
                {detail.legalName && `${detail.legalName} · `}
                {detail.city ? `${detail.city}, ` : ""}
                {detail.country || "Country not specified"}
                {detail.businessType && ` · ${detail.businessType}`}
              </p>
            </div>

            {/* Right: Quick actions and stats */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3.5 py-2 text-center">
                <span className="block text-base font-bold text-[#173f35]">
                  {detail.summary.openBuyOrders}
                </span>
                <span className="text-[10px] text-[#6e7d77] uppercase tracking-wider font-medium">
                  Open Demands
                </span>
              </div>
              <div className="rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3.5 py-2 text-center">
                <span className="block text-base font-bold text-[#173f35]">
                  {detail.summary.approvedMatchesCount}
                </span>
                <span className="text-[10px] text-[#6e7d77] uppercase tracking-wider font-medium">
                  Approved Matches
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#173f35] px-4 py-2.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all shadow-xs"
              >
                <span>+ Create Demand on Behalf</span>
              </button>
            </div>
          </div>

          {/* Contact Details strip */}
          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#f0ece1] pt-4 sm:grid-cols-3 text-xs text-[#52635c]">
            <div>
              <span className="block text-[10px] font-semibold uppercase text-[#6e7d77]">Contact Person</span>
              <span className="font-medium text-[#173f35]">{detail.contactName || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-[#6e7d77]">Contact Email</span>
              <span className="font-medium text-[#173f35]">{detail.contactEmail || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-[#6e7d77]">Phone</span>
              <span className="font-medium text-[#173f35]">{detail.contactPhone || "—"}</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: BUY ORDERS (DEMANDS) */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
          <div className="border-b border-[#e2dccd] bg-[#fbf9f4] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#173f35]">
                  Buyer Demand Orders
                </h2>
                <p className="mt-0.5 text-xs text-[#52635c]">
                  All procurement requirements registered for {detail.name}
                </p>
              </div>
              <span className="rounded-full bg-[#faf8f1] px-3 py-1 text-xs font-bold text-[#173f35] border border-[#e2dccd]">
                {detail.buyOrders.length} Total Demands
              </span>
            </div>
          </div>

          {detail.buyOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6e7d77]">
              No Buy Orders registered for this buyer yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[10px] font-bold uppercase tracking-wider text-[#6e7d77]">
                    <th className="py-3 px-4">Material & Form</th>
                    <th className="py-3 px-4">Requested Volume</th>
                    <th className="py-3 px-4">Destination & Delivery</th>
                    <th className="py-3 px-4">Target Price</th>
                    <th className="py-3 px-4">Lifecycle Status</th>
                    <th className="py-3 px-4">Match Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece1]">
                  {detail.buyOrders.map((bo) => {
                    let matchBadgeBg = "bg-amber-50 text-amber-800 border-amber-200";
                    if (bo.matchStatus === "Approved Match") {
                      matchBadgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
                    } else if (bo.matchStatus === "Draft Match") {
                      matchBadgeBg = "bg-blue-50 text-blue-800 border-blue-200";
                    }

                    const formattedDelivery = bo.requestedDeliveryDate
                      ? new Date(bo.requestedDeliveryDate).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Open Schedule";

                    return (
                      <tr key={bo.id} className="hover:bg-[#fcfaf5] transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#173f35] block">{bo.materialType}</span>
                          <span className="text-[10px] text-[#6e7d77]">{bo.productForm || "Any Form"}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#173f35]">
                          {bo.quantity} {bo.quantityUnit}
                        </td>
                        <td className="py-3 px-4 text-[#52635c] text-[11px]">
                          <p className="font-medium text-[#173f35]">{bo.deliveryDestination || bo.deliveryCountry || "Not specified"}</p>
                          <p className="text-[#6e7d77]">{formattedDelivery}</p>
                        </td>
                        <td className="py-3 px-4 text-[#52635c]">
                          {bo.targetPriceAmount ? `€${bo.targetPriceAmount} / t` : "Not specified"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                              bo.status === "OPEN"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : bo.status === "DRAFT"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {bo.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${matchBadgeBg}`}>
                            {bo.matchStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenMatching?.(bo.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all"
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

        {/* SECTION 2: APPROVED MATCHES */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
          <div className="border-b border-[#e2dccd] bg-[#fbf9f4] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#173f35]">
                  Approved Commercial Matches
                </h2>
                <p className="mt-0.5 text-xs text-[#52635c]">
                  Trader-approved pairings ready for Sprint 06 Quotation
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                {detail.approvedMatches.length} Approved
              </span>
            </div>
          </div>

          {detail.approvedMatches.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6e7d77]">
              No approved matches for this buyer yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[10px] font-bold uppercase tracking-wider text-[#6e7d77]">
                    <th className="py-3 px-4">Supplier Organisation</th>
                    <th className="py-3 px-4">Matched Listing</th>
                    <th className="py-3 px-4">Material & Volume</th>
                    <th className="py-3 px-4">Approved Date</th>
                    <th className="py-3 px-4">Lifecycle Status</th>
                    <th className="py-3 px-4 text-right">Workspace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece1]">
                  {detail.approvedMatches.map((m) => (
                    <tr key={m.id} className="hover:bg-[#fcfaf5] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#173f35]">
                        {m.supplierOrganisationName}
                      </td>
                      <td className="py-3 px-4 text-[#52635c]">
                        {m.listingId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#173f35]">{m.materialType}</span>
                        {m.quantity > 0 && (
                          <span className="block text-[10px] text-[#6e7d77]">{m.quantity} {m.quantityUnit}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#6e7d77] text-[11px]">
                        {m.approvedAt ? new Date(m.approvedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Ready for Quotation
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMatchForQuote({
                                matchId: m.id,
                                context: {
                                  materialType: m.materialType,
                                  productForm: m.productForm || null,
                                  quantity: m.quantity,
                                  quantityUnit: m.quantityUnit,
                                  buyerOrganisationName: detail?.name || "Buyer",
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
                            onClick={() => onOpenMatching?.(m.buyOrderId)}
                            className="inline-flex items-center rounded-lg border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
                          >
                            View Workspace
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* SECTION 2B: COMMERCIAL QUOTATIONS */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
          <div className="border-b border-[#e2dccd] bg-[#fbf9f4] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#173f35]">
                  Commercial Quotations
                </h2>
                <p className="mt-0.5 text-xs text-[#52635c]">
                  All quotes, proposals and negotiation history for {detail.name}
                </p>
              </div>
              <span className="rounded-full bg-[#faf8f1] px-3 py-1 text-xs font-bold text-[#173f35] border border-[#e2dccd]">
                {detail.quotes?.length || 0} Quotes
              </span>
            </div>
          </div>

          {!detail.quotes || detail.quotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6e7d77]">
              No quotations created for this buyer yet. Prepare a quote from an approved match above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[10px] font-bold uppercase tracking-wider text-[#6e7d77]">
                    <th className="py-3 px-4">Quote Reference</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Material / Product</th>
                    <th className="py-3 px-4">Total Proposal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece1]">
                  {detail.quotes.map((q) => {
                    let statusBadgeClass = "bg-gray-100 text-gray-800 border-gray-200";
                    if (q.status === "DRAFT") statusBadgeClass = "bg-amber-50 text-amber-800 border-amber-200";
                    else if (q.status === "INTERNAL_REVIEW") statusBadgeClass = "bg-blue-50 text-blue-800 border-blue-200";
                    else if (q.status === "SENT") statusBadgeClass = "bg-purple-50 text-purple-800 border-purple-200";
                    else if (q.status === "COUNTERED") statusBadgeClass = "bg-rose-50 text-rose-800 border-rose-200";
                    else if (q.status === "ACCEPTED") statusBadgeClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
                    else if (q.status === "REJECTED") statusBadgeClass = "bg-red-50 text-red-800 border-red-200";

                    return (
                      <tr key={q.id} className="hover:bg-[#fcfaf5] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#173f35]">
                          {q.quoteNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex rounded bg-[#faf8f1] px-2 py-0.5 text-[10px] font-mono font-bold text-[#173f35] border border-[#e2dccd]">
                            v{q.currentVersionNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#52635c]">
                          {q.materialType}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#173f35]">
                          {q.currency
                            ? `${q.currency} ${q.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : q.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusBadgeClass}`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#6e7d77] text-[11px]">
                          {new Date(q.lastActivity).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedQuoteIdForModal(q.id)}
                            className="inline-flex items-center rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all shadow-xs"
                          >
                            Open Quote →
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

        {/* SECTION 3: LEGAL & CONTACT INFORMATION */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-[#173f35]">Legal Identity & Address</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-[#e2dccd] p-3 bg-[#faf8f1]">
              <span className="block text-[10px] uppercase font-semibold text-[#6e7d77]">Legal Name</span>
              <span className="font-bold text-[#173f35]">{detail.legalName || "—"}</span>
            </div>
            <div className="rounded-xl border border-[#e2dccd] p-3 bg-[#faf8f1]">
              <span className="block text-[10px] uppercase font-semibold text-[#6e7d77]">Registration / Chamber of Commerce</span>
              <span className="font-bold text-[#173f35]">{detail.registrationNumber || "—"}</span>
            </div>
            <div className="rounded-xl border border-[#e2dccd] p-3 bg-[#faf8f1]">
              <span className="block text-[10px] uppercase font-semibold text-[#6e7d77]">VAT ID</span>
              <span className="font-bold text-[#173f35]">{detail.vatNumber || "—"}</span>
            </div>
            <div className="rounded-xl border border-[#e2dccd] p-3 bg-[#faf8f1]">
              <span className="block text-[10px] uppercase font-semibold text-[#6e7d77]">Registered Address</span>
              <span className="font-bold text-[#173f35]">
                {detail.address ? `${detail.address}, ` : ""}
                {detail.postalCode ? `${detail.postalCode} ` : ""}
                {detail.city ? `${detail.city}, ` : ""}
                {detail.country || "—"}
              </span>
            </div>
          </div>
        </div>

        {selectedQuoteIdForModal && (
          <QuoteBuilderModal
            isOpen={true}
            onClose={() => setSelectedQuoteIdForModal(null)}
            quoteId={selectedQuoteIdForModal}
          />
        )}

        {/* CREATE BUY ORDER ON BEHALF MODAL */}
        <CreateEditBuyOrderModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSaveDraft={handleSaveDraftOnBehalf}
          onSubmitDirectly={handleSubmitDirectlyOnBehalf}
          isTrader={true}
          buyerOrganisations={[{ id: detail.id, name: detail.name, country: detail.country }]}
        />
      </div>
    );
  }

  // BUYERS DIRECTORY LIST VIEW
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#173f35] sm:text-2xl">
          Buyer Management
        </h1>
        <p className="mt-1 text-xs text-[#52635c] sm:text-sm">
          Commercial buyer accounts, procurement requirements & matching status
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buyers by name, city or country..."
            className="w-full max-w-sm rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3.5 py-2 text-xs text-[#173f35] placeholder-[#6e7d77] focus:border-[#173f35] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#173f35] px-3.5 py-2 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6e7d77]">Status:</span>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3 py-2 text-xs font-semibold text-[#173f35] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Buyers Table */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6e7d77]">Loading buyers...</div>
        ) : buyers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-[#173f35]">No buyers found</p>
            <p className="mt-1 text-xs text-[#6e7d77]">
              Try adjusting your search criteria or verification filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[11px] font-bold uppercase tracking-wider text-[#6e7d77]">
                  <th className="py-3 px-4">Buyer Organisation</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-center">Total Demands</th>
                  <th className="py-3 px-4 text-center">Open Demands</th>
                  <th className="py-3 px-4 text-center">Approved Matches</th>
                  <th className="py-3 px-4">Latest Activity</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece1]">
                {buyers.map((b) => (
                  <tr key={b.id} className="hover:bg-[#fcfaf5] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#173f35]">
                      <div>
                        <p>{b.name}</p>
                        {b.legalName && b.legalName !== b.name && (
                          <p className="text-[10px] font-normal text-[#6e7d77]">{b.legalName}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#52635c]">
                      {b.city ? `${b.city}, ` : ""}{b.country || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          b.verificationStatus === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : b.verificationStatus === "UNDER_REVIEW"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {b.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#173f35]">
                      {b.totalBuyOrderCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-700">
                      {b.openBuyOrderCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                      {b.approvedMatchCount}
                    </td>
                    <td className="py-3.5 px-4 text-[#6e7d77] text-[11px]">
                      {b.mostRecentDemandDate
                        ? new Date(b.mostRecentDemandDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                        : "No demands"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelect(b.id)}
                        className="inline-flex items-center rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all"
                      >
                        View Buyer
                      </button>
                    </td>
                  </tr>
                ))}
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
