"use client";

import { useEffect, useState } from "react";

import {
  createBuyOrder,
  deleteBuyOrder,
  listBuyerOrganisationsForTrader,
  listTraderDemand,
  listTraderDrafts,
  updateBuyOrder,
} from "./api";
import {
  APPROVED_MATERIAL_TYPES,
  BUY_ORDER_STATUS_COLORS,
  BUY_ORDER_STATUS_LABELS,
  type BuyOrderDetail,
  type CreateBuyOrderInput,
  MATERIAL_TYPE_LABELS,
  type MaterialType,
  PRODUCT_FORM_LABELS,
  type ProductForm,
  QUANTITY_UNIT_LABELS,
  type QuantityUnit,
  TARGET_PRICE_UNIT_LABELS,
  type TargetPriceUnit,
  type TraderDemandSummary,
} from "./contracts";
import { BuyOrderDetailView } from "./buy-order-detail-view";
import { CreateEditBuyOrderModal } from "./create-edit-buy-order-modal";
import { MatchingWorkspaceView } from "../matching";

export function TraderDemandOverview() {
  const [activeTab, setActiveTab] = useState<"OPEN" | "DRAFT">("OPEN");
  const [demands, setDemands] = useState<TraderDemandSummary[]>([]);
  const [drafts, setDrafts] = useState<TraderDemandSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [materialFilter, setMaterialFilter] = useState<string>("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [matchingOrderId, setMatchingOrderId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<BuyOrderDetail | null>(null);
  const [buyerOrganisations, setBuyerOrganisations] = useState<
    Array<{ id: string; name: string; country: string | null }>
  >([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "OPEN") {
        const response = await listTraderDemand({
          materialType: materialFilter !== "ALL" ? materialFilter : undefined,
        });
        setDemands(response.items);
      } else {
        const response = await listTraderDrafts({
          materialType: materialFilter !== "ALL" ? materialFilter : undefined,
        });
        setDrafts(response.items);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load buyer demand overview.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadBuyerOrganisations = async () => {
    try {
      const res = await listBuyerOrganisationsForTrader();
      setBuyerOrganisations(res.items);
    } catch {
      // Ignored if fail
    }
  };

  useEffect(() => {
    void loadData();
    void loadBuyerOrganisations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, materialFilter]);

  const handleOpenCreateModal = async () => {
    await loadBuyerOrganisations();
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleSaveDraft = async (
    input: CreateBuyOrderInput,
    targetBuyerOrgId?: string,
  ) => {
    if (editingOrder) {
      await updateBuyOrder(editingOrder.id, input);
    } else {
      await createBuyOrder(input, targetBuyerOrgId);
    }
    setEditingOrder(null);
    await loadData();
  };

  const handleSubmitDirectly = async (
    input: CreateBuyOrderInput,
    targetBuyerOrgId?: string,
  ) => {
    if (editingOrder) {
      await updateBuyOrder(editingOrder.id, input);
      const { submitBuyOrder } = await import("./api");
      await submitBuyOrder(editingOrder.id);
    } else {
      await createBuyOrder(
        { ...input, submitDirectly: true },
        targetBuyerOrgId,
      );
    }
    setEditingOrder(null);
    await loadData();
  };

  if (matchingOrderId) {
    return (
      <MatchingWorkspaceView
        buyOrderId={matchingOrderId}
        onBack={() => {
          setMatchingOrderId(null);
          void loadData();
        }}
      />
    );
  }

  if (selectedOrderId) {
    return (
      <BuyOrderDetailView
        buyOrderId={selectedOrderId}
        isTrader={true}
        onOpenMatching={(id) => {
          setSelectedOrderId(null);
          setMatchingOrderId(id);
        }}
        onBack={() => {
          setSelectedOrderId(null);
          void loadData();
        }}
        onEdit={(ord) => {
          setSelectedOrderId(null);
          setEditingOrder(ord);
          setIsModalOpen(true);
        }}
      />
    );
  }

  const currentItems = activeTab === "OPEN" ? demands : drafts;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e2dccd] bg-[#173f35] p-6 text-[#fffaf0] shadow-sm sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5b84b]">
            Trader Demand Review Desk
          </span>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Buyer Demand Overview
          </h1>
          <p className="mt-1 text-xs text-[#a8bbb4]">
            Review active buyer demand and manage on-behalf draft requests.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#e5b84b] px-4 py-2.5 text-xs font-bold text-[#173f35] shadow-sm transition-all hover:bg-[#edd07e] hover:shadow-md"
        >
          <span>+ Create Buy Order</span>
        </button>
      </div>

      {/* Tabs & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
        {/* Tabs: Active Demand vs My Drafts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("OPEN")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "OPEN"
                ? "bg-[#173f35] text-[#fffaf0]"
                : "bg-[#faf8f1] text-[#52635c] hover:bg-[#e8e2d2] hover:text-[#173f35]"
            }`}
          >
            Active Demand
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("DRAFT")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "DRAFT"
                ? "bg-[#173f35] text-[#fffaf0]"
                : "bg-[#faf8f1] text-[#52635c] hover:bg-[#e8e2d2] hover:text-[#173f35]"
            }`}
          >
            My Drafts
          </button>
        </div>

        {/* Material Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="trader-mat-filter" className="text-xs font-semibold text-[#173f35]">
            Filter Material:
          </label>
          <select
            id="trader-mat-filter"
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="rounded-lg border border-[#d4cdbc] bg-white px-3 py-1.5 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
          >
            <option value="ALL">All Fibre Materials</option>
            {APPROVED_MATERIAL_TYPES.map((mat) => (
              <option key={mat} value={mat}>
                {MATERIAL_TYPE_LABELS[mat]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-2xl border border-[#e2dccd] bg-white p-5"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && currentItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#d4cdbc] bg-white p-12 text-center">
          <h3 className="text-sm font-bold text-[#173f35]">
            {activeTab === "OPEN"
              ? "No Active Buyer Demands"
              : "No Draft Buy Orders"}
          </h3>
          <p className="mt-1 text-xs text-[#52635c]">
            {activeTab === "OPEN"
              ? "There are currently no submitted OPEN buy orders matching the criteria."
              : "You have not saved any draft buy orders on behalf of buyers."}
          </p>
          {activeTab === "DRAFT" && (
            <button
              onClick={handleOpenCreateModal}
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#173f35] px-4 py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#204e42]"
            >
              + Create Buy Order on behalf of Buyer
            </button>
          )}
        </div>
      )}

      {/* Cards Grid */}
      {!loading && currentItems.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((demand) => {
            const statusConfig =
              BUY_ORDER_STATUS_COLORS[demand.status] ||
              (demand.status === "DRAFT"
                ? BUY_ORDER_STATUS_COLORS.DRAFT
                : BUY_ORDER_STATUS_COLORS.OPEN);
            const materialLabel =
              MATERIAL_TYPE_LABELS[demand.materialType as MaterialType] ||
              demand.materialType;
            const formLabel = demand.productForm
              ? PRODUCT_FORM_LABELS[demand.productForm as ProductForm] ||
                demand.productForm
              : "Any Form";
            const quantityUnitLabel =
              QUANTITY_UNIT_LABELS[demand.quantityUnit as QuantityUnit] ||
              demand.quantityUnit;
            const priceUnitLabel =
              TARGET_PRICE_UNIT_LABELS[
                demand.targetPriceUnit as TargetPriceUnit
              ] || demand.targetPriceUnit;

            return (
              <div
                key={demand.id}
                className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs transition-all hover:border-[#173f35]/40 hover:shadow-md"
              >
                <div>
                  {/* Buyer Organisation Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#f0ece1] pb-2.5">
                    <div>
                      <p className="text-xs font-bold text-[#173f35] truncate">
                        {demand.buyerOrganisation.name}
                      </p>
                      <p className="text-[10px] text-[#718079]">
                        {demand.buyerOrganisation.country || "Location not set"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                      />
                      {BUY_ORDER_STATUS_LABELS[demand.status]}
                    </span>
                  </div>

                  {/* Material & Volume */}
                  <div className="mt-3">
                    <span className="rounded-md bg-[#faf8f1] px-2 py-0.5 text-[11px] font-bold text-[#173f35]">
                      {materialLabel}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-[#173f35]">
                      {formLabel}
                    </h3>
                    <p className="text-base font-extrabold text-[#173f35] mt-0.5">
                      {demand.quantity.toLocaleString()} {quantityUnitLabel}
                    </p>
                  </div>

                  {/* Destination & Target Price */}
                  <div className="mt-3 space-y-1 text-[11px] text-[#52635c]">
                    <p>
                      <span className="font-semibold text-[#173f35]">
                        Destination:
                      </span>{" "}
                      {demand.deliveryCountry || "Unspecified"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#173f35]">
                        Target Price:
                      </span>{" "}
                      {demand.targetPriceAmount !== null &&
                      demand.targetPriceAmount !== undefined
                        ? `${demand.targetPriceAmount.toLocaleString()} ${priceUnitLabel}`
                        : "Market quotes"}
                    </p>
                    {demand.requestedDeliveryDate && (
                      <p>
                        <span className="font-semibold text-[#173f35]">
                          Delivery Date:
                        </span>{" "}
                        {new Date(
                          demand.requestedDeliveryDate,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-[#f0ece1] pt-3">
                  <span className="text-[10px] text-[#85968f]">
                    #{demand.id.substring(0, 8)}
                  </span>
                  <div className="flex items-center gap-2">
                    {demand.status === "DRAFT" && (
                      <>
                        <button
                          onClick={() => {
                            setEditingOrder(demand);
                            setIsModalOpen(true);
                          }}
                          type="button"
                          className="rounded-lg border border-[#173f35] px-2.5 py-1 text-xs font-semibold text-[#173f35] hover:bg-[#173f35]/5"
                        >
                          Edit Draft
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Delete this draft?\nThis action cannot be undone.",
                              )
                            ) {
                              return;
                            }
                            setError(null);
                            try {
                              await deleteBuyOrder(demand.id);
                              setDrafts((prev) => prev.filter((d) => d.id !== demand.id));
                              await loadData();
                            } catch (err: unknown) {
                              setError(
                                err instanceof Error
                                  ? err.message
                                  : "Failed to delete draft.",
                              );
                            }
                          }}
                          type="button"
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {demand.status === "OPEN" && (
                      <button
                        onClick={() => setMatchingOrderId(demand.id)}
                        type="button"
                        className="rounded-lg bg-[#e5b84b] px-3 py-1 text-xs font-bold text-[#173f35] transition-colors hover:bg-[#edd07e]"
                      >
                        Match Supply →
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrderId(demand.id)}
                      type="button"
                      className="rounded-lg border border-[#173f35] bg-white px-3 py-1 text-xs font-bold text-[#173f35] transition-colors hover:bg-[#faf8f1]"
                    >
                      {demand.status === "DRAFT" ? "Details →" : "Inspect →"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Buy Order on behalf of Buyer Modal */}
      {isModalOpen && (
        <CreateEditBuyOrderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOrder(null);
          }}
          onSaveDraft={handleSaveDraft}
          onSubmitDirectly={handleSubmitDirectly}
          existingOrder={editingOrder}
          isTrader={true}
          buyerOrganisations={buyerOrganisations}
        />
      )}
    </div>
  );
}
