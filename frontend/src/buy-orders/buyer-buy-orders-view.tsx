"use client";

import { useEffect, useState } from "react";

import {
  createBuyOrder,
  deleteBuyOrder,
  listBuyOrders,
  updateBuyOrder,
} from "./api";
import {
  APPROVED_MATERIAL_TYPES,
  BUY_ORDER_STATUS_COLORS,
  BUY_ORDER_STATUS_LABELS,
  type BuyOrderDetail,
  type BuyOrderStatus,
  type BuyOrderSummary,
  type CreateBuyOrderInput,
  MATERIAL_TYPE_LABELS,
  type MaterialType,
  PRODUCT_FORM_LABELS,
  type ProductForm,
  QUANTITY_UNIT_LABELS,
  type QuantityUnit,
  TARGET_PRICE_UNIT_LABELS,
  type TargetPriceUnit,
} from "./contracts";
import { CreateEditBuyOrderModal } from "./create-edit-buy-order-modal";
import { BuyOrderDetailView } from "./buy-order-detail-view";

interface BuyerBuyOrdersViewProps {
  buyerOrganisationId?: string;
}

export function BuyerBuyOrdersView({
  buyerOrganisationId,
}: BuyerBuyOrdersViewProps) {
  const [orders, setOrders] = useState<BuyOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [materialFilter, setMaterialFilter] = useState<string>("ALL");

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<BuyOrderDetail | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listBuyOrders(buyerOrganisationId, {
        status: statusFilter !== "ALL" ? (statusFilter as BuyOrderStatus) : undefined,
        materialType: materialFilter !== "ALL" ? materialFilter : undefined,
      });
      setOrders(response.items);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load buy orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerOrganisationId, statusFilter, materialFilter]);

  const handleSaveDraft = async (input: CreateBuyOrderInput) => {
    if (editingOrder) {
      await updateBuyOrder(editingOrder.id, input);
    } else {
      await createBuyOrder(input, buyerOrganisationId);
    }
    setEditingOrder(null);
    await loadOrders();
  };

  const handleSubmitDirectly = async (input: CreateBuyOrderInput) => {
    if (editingOrder) {
      await updateBuyOrder(editingOrder.id, input);
      // Submit it
      const { submitBuyOrder } = await import("./api");
      await submitBuyOrder(editingOrder.id);
    } else {
      await createBuyOrder({ ...input, submitDirectly: true }, buyerOrganisationId);
    }
    setEditingOrder(null);
    await loadOrders();
  };

  if (selectedOrderId) {
    return (
      <BuyOrderDetailView
        buyOrderId={selectedOrderId}
        onBack={() => {
          setSelectedOrderId(null);
          void loadOrders();
        }}
        onEdit={(ord) => {
          setSelectedOrderId(null);
          setEditingOrder(ord);
          setIsModalOpen(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e2dccd] bg-[#173f35] p-6 text-[#fffaf0] shadow-sm sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5b84b]">
            Demand Sourcing Workspace
          </span>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            My Buy Orders
          </h1>
          <p className="mt-1 text-xs text-[#a8bbb4]">
            Manage structured natural fibre procurement demand and submit orders for matching.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOrder(null);
            setIsModalOpen(true);
          }}
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#e5b84b] px-4 py-2.5 text-xs font-bold text-[#173f35] shadow-sm transition-all hover:bg-[#edd07e] hover:shadow-md"
        >
          <span>+ Create Buy Order</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "DRAFT", "OPEN", "CANCELLED"].map((status) => {
            const active = statusFilter === status;
            const label =
              status === "ALL"
                ? "All Demands"
                : BUY_ORDER_STATUS_LABELS[status as BuyOrderStatus] || status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-[#173f35] text-[#fffaf0]"
                    : "bg-[#faf8f1] text-[#52635c] hover:bg-[#e8e2d2] hover:text-[#173f35]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Material Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="mat-filter" className="text-xs font-medium text-[#52635c]">
            Material:
          </label>
          <select
            id="mat-filter"
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="rounded-lg border border-[#d4cdbc] bg-white px-2.5 py-1.5 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
          >
            <option value="ALL">All Materials</option>
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
              className="h-48 animate-pulse rounded-2xl border border-[#e2dccd] bg-white p-5"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#d4cdbc] bg-white p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#faf8f1] text-[#173f35]">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-sm font-bold text-[#173f35]">
            No Buy Orders Found
          </h3>
          <p className="mt-1 text-xs text-[#52635c]">
            {statusFilter !== "ALL" || materialFilter !== "ALL"
              ? "No buy orders match the selected filters."
              : "You haven't submitted any raw material buy orders yet."}
          </p>
          <button
            onClick={() => {
              setEditingOrder(null);
              setIsModalOpen(true);
            }}
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#173f35] px-4 py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#204e42]"
          >
            + Create your first Buy Order
          </button>
        </div>
      )}

      {/* Card Grid */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => {
            const statusConfig =
              BUY_ORDER_STATUS_COLORS[order.status] ||
              BUY_ORDER_STATUS_COLORS.DRAFT;
            const materialLabel =
              MATERIAL_TYPE_LABELS[order.materialType as MaterialType] ||
              order.materialType;
            const formLabel = order.productForm
              ? PRODUCT_FORM_LABELS[order.productForm as ProductForm] ||
                order.productForm
              : "Any Form";
            const quantityUnitLabel =
              QUANTITY_UNIT_LABELS[order.quantityUnit as QuantityUnit] ||
              order.quantityUnit;
            const priceUnitLabel =
              TARGET_PRICE_UNIT_LABELS[
                order.targetPriceUnit as TargetPriceUnit
              ] || order.targetPriceUnit;

            return (
              <div
                key={order.id}
                className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs transition-all hover:border-[#173f35]/40 hover:shadow-md"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#faf8f1] px-2 py-0.5 text-[11px] font-bold text-[#173f35]">
                      {materialLabel}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                      />
                      {BUY_ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  {/* Form & Quantity */}
                  <h3 className="mt-3 text-sm font-bold text-[#173f35]">
                    {formLabel}
                  </h3>
                  <p className="text-base font-extrabold text-[#173f35] mt-1">
                    {order.quantity.toLocaleString()} {quantityUnitLabel}
                  </p>

                  {/* Details summary */}
                  <div className="mt-3 space-y-1 text-[11px] text-[#52635c]">
                    <p>
                      <span className="font-semibold text-[#173f35]">
                        Destination:
                      </span>{" "}
                      {order.deliveryCountry || "Unspecified"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#173f35]">
                        Target Price:
                      </span>{" "}
                      {order.targetPriceAmount !== null &&
                      order.targetPriceAmount !== undefined
                        ? `${order.targetPriceAmount.toLocaleString()} ${priceUnitLabel}`
                        : "Market quotes"}
                    </p>
                    {order.requestedDeliveryDate && (
                      <p>
                        <span className="font-semibold text-[#173f35]">
                          Delivery:
                        </span>{" "}
                        {new Date(
                          order.requestedDeliveryDate,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 flex items-center justify-between border-t border-[#f0ece1] pt-3">
                  <span className="text-[10px] text-[#85968f]">
                    #{order.id.substring(0, 8)}
                  </span>
                  <div className="flex items-center gap-2">
                    {order.status === "DRAFT" && (
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
                            await deleteBuyOrder(order.id);
                            setOrders((prev) => prev.filter((o) => o.id !== order.id));
                            await loadOrders();
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
                    )}
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      type="button"
                      className="rounded-lg bg-[#faf8f1] px-3 py-1.5 text-xs font-bold text-[#173f35] transition-colors hover:bg-[#173f35] hover:text-[#fffaf0]"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
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
        />
      )}
    </div>
  );
}
