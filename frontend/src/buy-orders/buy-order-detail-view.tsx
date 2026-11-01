"use client";

import { useEffect, useState } from "react";

import { cancelBuyOrder, deleteBuyOrder, getBuyOrder, submitBuyOrder } from "./api";
import {
  BUY_ORDER_STATUS_COLORS,
  BUY_ORDER_STATUS_LABELS,
  type BuyOrderDetail,
  MATERIAL_TYPE_LABELS,
  type MaterialType,
  PRODUCT_FORM_LABELS,
  type ProductForm,
  QUANTITY_UNIT_LABELS,
  type QuantityUnit,
  TARGET_PRICE_UNIT_LABELS,
  type TargetPriceUnit,
} from "./contracts";

interface BuyOrderDetailViewProps {
  buyOrderId: string;
  onBack: () => void;
  onEdit?: (order: BuyOrderDetail) => void;
  isTrader?: boolean;
  onOpenMatching?: (buyOrderId: string) => void;
}

export function BuyOrderDetailView({
  buyOrderId,
  onBack,
  onEdit,
  isTrader,
  onOpenMatching,
}: BuyOrderDetailViewProps) {
  const [order, setOrder] = useState<BuyOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getBuyOrder(buyOrderId);
        if (isMounted) setOrder(data);
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load buy order.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [buyOrderId]);

  const handleSubmit = async () => {
    if (!order) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const updated = await submitBuyOrder(order.id);
      setOrder(updated);
      setActionMessage("Buy Order submitted successfully to the trading desk.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to submit buy order.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (
      !window.confirm(
        "Are you sure you want to cancel this Buy Order? This will withdraw the demand request.",
      )
    ) {
      return;
    }
    setActionLoading(true);
    setActionMessage(null);
    try {
      const updated = await cancelBuyOrder(order.id);
      setOrder(updated);
      setActionMessage("Buy Order has been cancelled.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel buy order.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    if (
      !window.confirm(
        "Delete this draft?\nThis action cannot be undone.",
      )
    ) {
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await deleteBuyOrder(order.id);
      onBack();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete draft.",
      );
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 text-xs font-semibold text-[#173f35] hover:underline"
        >
          ← Back to Buy Orders
        </button>
        <div className="h-64 animate-pulse rounded-2xl border border-[#e2dccd] bg-white" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 text-xs font-semibold text-[#173f35] hover:underline"
        >
          ← Back to Buy Orders
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
          {error || "Buy Order not found."}
        </div>
      </div>
    );
  }

  const statusConfig =
    BUY_ORDER_STATUS_COLORS[order.status] || BUY_ORDER_STATUS_COLORS.DRAFT;
  const materialLabel =
    MATERIAL_TYPE_LABELS[order.materialType as MaterialType] ||
    order.materialType;
  const formLabel = order.productForm
    ? PRODUCT_FORM_LABELS[order.productForm as ProductForm] || order.productForm
    : "Any Form";
  const quantityUnitLabel =
    QUANTITY_UNIT_LABELS[order.quantityUnit as QuantityUnit] ||
    order.quantityUnit;
  const priceUnitLabel =
    TARGET_PRICE_UNIT_LABELS[order.targetPriceUnit as TargetPriceUnit] ||
    order.targetPriceUnit;

  return (
    <div className="space-y-6">
      {/* Back link and breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 text-xs font-semibold text-[#173f35] transition-colors hover:text-[#204e42] hover:underline"
        >
          ← Back to Buy Orders
        </button>
      </div>

      {actionMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          {actionMessage}
        </div>
      )}

      {/* Main Header Card */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-[#173f35] sm:text-2xl">
                {materialLabel} Demand
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
                {BUY_ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#52635c]">
              Buy Order #{order.id.substring(0, 8)} • Created{" "}
              {new Date(order.createdAt).toLocaleDateString()} • Updated{" "}
              {new Date(order.updatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons based on Status */}
          <div className="flex flex-wrap items-center gap-2">
            {order.status === "DRAFT" && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(order)}
                    type="button"
                    disabled={actionLoading}
                    className="rounded-lg border border-[#173f35] px-4 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#173f35]/5 disabled:opacity-50"
                  >
                    Edit Draft
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  type="button"
                  disabled={actionLoading}
                  className="rounded-lg bg-[#173f35] px-4 py-2 text-xs font-semibold text-[#fffaf0] shadow-sm hover:bg-[#204e42] disabled:opacity-50"
                >
                  {actionLoading ? "Submitting..." : "Submit Buy Order"}
                </button>
                <button
                  onClick={handleCancel}
                  type="button"
                  disabled={actionLoading}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-[#52635c] hover:bg-stone-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  type="button"
                  disabled={actionLoading}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  {actionLoading ? "Deleting..." : "Delete Draft"}
                </button>
              </>
            )}

            {order.status === "OPEN" && (
              <>
                {isTrader && onOpenMatching && (
                  <button
                    onClick={() => onOpenMatching(order.id)}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#173f35] px-4 py-2 text-xs font-bold text-[#fffaf0] shadow-2xs transition-colors hover:bg-[#204e42]"
                  >
                    <span>Match Supply →</span>
                  </button>
                )}
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  type="button"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  {actionLoading ? "Processing…" : "Cancel Demand"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Non-binding UX notice */}
        <div className="mt-5 rounded-xl border border-[#fae3b4] bg-[#fef9ee] p-3 text-xs text-[#875908]">
          <span className="font-bold">Non-binding Demand Request:</span> This Buy Order specifies your structured material demand. It is reviewed by the I Do Grow trading desk for match analysis and does not constitute a confirmed purchase or binding trade obligation.
        </div>
      </div>

      {/* Grid of Specification Panels */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Panel 1: Material & Commercial Scope */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-[#173f35] border-b border-[#f0ece1] pb-3 mb-4">
            Commercial & Volume Scope
          </h2>
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#f6f2e8]">
              <dt className="text-[#52635c]">Natural Fibre:</dt>
              <dd className="font-semibold text-[#173f35]">{materialLabel}</dd>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f6f2e8]">
              <dt className="text-[#52635c]">Product Form:</dt>
              <dd className="font-semibold text-[#173f35]">{formLabel}</dd>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f6f2e8]">
              <dt className="text-[#52635c]">Target Quantity:</dt>
              <dd className="font-bold text-[#173f35]">
                {order.quantity.toLocaleString()} {quantityUnitLabel}
              </dd>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f6f2e8]">
              <dt className="text-[#52635c]">Target Price:</dt>
              <dd className="font-semibold text-[#173f35]">
                {order.targetPriceAmount !== null && order.targetPriceAmount !== undefined
                  ? `${order.targetPriceAmount.toLocaleString()} ${priceUnitLabel}`
                  : "Market quotes requested"}
              </dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-[#52635c]">Currency Baseline:</dt>
              <dd className="font-medium text-[#173f35]">{order.currency}</dd>
            </div>
          </dl>
        </div>

        {/* Panel 2: Delivery & Logistics */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-[#173f35] border-b border-[#f0ece1] pb-3 mb-4">
            Delivery & Logistics
          </h2>
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#f6f2e8]">
              <dt className="text-[#52635c]">Destination Country:</dt>
              <dd className="font-semibold text-[#173f35]">
                {order.deliveryCountry || "Not specified"}
              </dd>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f6f2e8]">
              <dt className="text-[#52635c]">Destination Address:</dt>
              <dd className="font-semibold text-[#173f35]">
                {order.deliveryDestination || "To be confirmed upon quote"}
              </dd>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f6f2e8]">
              <dt className="text-[#52635c]">Requested Delivery Date:</dt>
              <dd className="font-semibold text-[#173f35]">
                {order.requestedDeliveryDate
                  ? new Date(order.requestedDeliveryDate).toLocaleDateString()
                  : "Flexible / As available"}
              </dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-[#52635c]">Transport Preferences:</dt>
              <dd className="font-medium text-[#173f35]">
                {order.transportPreferences || "Standard carrier dispatch"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Panel 3: Quality & Packaging Requirements */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-[#173f35] border-b border-[#f0ece1] pb-3 mb-4">
            Quality & Packaging Requirements
          </h2>
          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-[#52635c] mb-1">Acceptable Origins:</p>
              <p className="text-[#173f35] font-medium bg-[#faf8f1] p-2.5 rounded-lg border border-[#e2dccd]">
                {order.acceptableOriginCountries || "Any source region accepted"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#52635c] mb-1">Quality Specifications:</p>
              <p className="text-[#173f35] bg-[#faf8f1] p-2.5 rounded-lg border border-[#e2dccd]">
                {order.qualityRequirements || "Standard merchantable quality"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#52635c] mb-1">Packaging Specifications:</p>
              <p className="text-[#173f35] bg-[#faf8f1] p-2.5 rounded-lg border border-[#e2dccd]">
                {order.packagingRequirements || "Standard commercial strapping & bales"}
              </p>
            </div>
          </div>
        </div>

        {/* Panel 4: Certifications & Payment Terms */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-[#173f35] border-b border-[#f0ece1] pb-3 mb-4">
            Certifications & Trade Terms
          </h2>
          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-[#52635c] mb-1">Required Certifications:</p>
              <p className="text-[#173f35] font-medium bg-[#faf8f1] p-2.5 rounded-lg border border-[#e2dccd]">
                {order.certificationRequirements || "No special certification requested"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#52635c] mb-1">Payment Terms:</p>
              <p className="text-[#173f35] bg-[#faf8f1] p-2.5 rounded-lg border border-[#e2dccd]">
                {order.paymentTerms || "Standard I Do Grow trade settlement terms"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
