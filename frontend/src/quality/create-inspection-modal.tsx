"use client";

import React, { useState } from "react";
import { createInspection, QualityRequestError } from "./api";
import {
  InspectionMethod,
  INSPECTION_METHOD_LABELS,
  InspectionDetail,
} from "./contracts";

interface CreateInspectionModalProps {
  tradeId: string;
  tradeNumber: string;
  materialType: string;
  quantity: number;
  quantityUnit: string;
  supplierName: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (inspection: InspectionDetail) => void;
}

export function CreateInspectionModal({
  tradeId,
  tradeNumber,
  materialType,
  quantity,
  quantityUnit,
  supplierName,
  isOpen,
  onClose,
  onCreated,
}: CreateInspectionModalProps) {
  const [method, setMethod] = useState<InspectionMethod>(
    "INDEPENDENT_PHYSICAL_INSPECTION",
  );
  const [externalLotReference, setExternalLotReference] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const inspection = await createInspection({
        tradeId,
        inspectionMethod: method,
        externalLotReference: externalLotReference.trim() || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });
      onCreated(inspection);
      onClose();
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to create inspection task.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#e2dccd] bg-white shadow-xl overflow-hidden">
        <div className="border-b border-[#e2dccd] bg-[#fbf9f4] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#173f35]">
              Request Product Quality Inspection
            </h3>
            <p className="text-xs text-[#6e7d77] mt-0.5">
              Trade Context: <strong className="font-mono text-[#173f35]">{tradeNumber}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-[#6e7d77] hover:text-[#173f35]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {error}
            </div>
          )}

          {/* CONTEXT SUMMARY */}
          <div className="rounded-xl border border-[#e2dccd] bg-[#faf8f1] p-3 text-xs text-[#52635c] space-y-1">
            <div>
              <strong>Material:</strong> {materialType} ({quantity} {quantityUnit})
            </div>
            <div>
              <strong>Supplier:</strong> {supplierName}
            </div>
            <div>
              <strong>Standard Template:</strong> European Hemp Straw Quality Inspection (v1)
            </div>
          </div>

          {/* INSPECTION METHOD */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#173f35]">
              Inspection Verification Method *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as InspectionMethod)}
              className="w-full rounded-xl border border-[#e2dccd] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-none"
            >
              {(Object.keys(INSPECTION_METHOD_LABELS) as InspectionMethod[]).map((m) => (
                <option key={m} value={m}>
                  {INSPECTION_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          {/* EXTERNAL LOT REFERENCE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#173f35]">
              External Lot / Batch Reference (Optional)
            </label>
            <input
              type="text"
              value={externalLotReference}
              placeholder="e.g. LOT-2026-FR-0042 (Supplier harvest lot identifier)"
              onChange={(e) => setExternalLotReference(e.target.value)}
              className="w-full rounded-xl border border-[#e2dccd] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-none"
            />
            <p className="text-[11px] text-[#6e7d77]">
              Non-canonical operational reference provided by supplier or warehouse.
            </p>
          </div>

          {/* SCHEDULED DATE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#173f35]">
              Target / Scheduled Date (Optional)
            </label>
            <input
              type="date"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-xl border border-[#e2dccd] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2dccd]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e2dccd] bg-white px-4 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#173f35] px-4 py-2 text-xs font-bold text-white hover:bg-[#123129] shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Inspection Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
