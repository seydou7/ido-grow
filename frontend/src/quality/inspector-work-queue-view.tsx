"use client";

import React, { useEffect, useState } from "react";
import { getMyInspections, getAllInspections, startInspection, QualityRequestError } from "./api";
import {
  InspectionSummary,
  InspectionStatus,
  INSPECTION_STATUS_CONFIG,
  INSPECTION_METHOD_LABELS,
  InspectionMethod,
} from "./contracts";

interface InspectorWorkQueueViewProps {
  isTraderView?: boolean;
  onOpenInspection?: (inspectionId: string) => void;
}

export function InspectorWorkQueueView({
  isTraderView = false,
  onOpenInspection,
}: InspectorWorkQueueViewProps) {
  const [inspections, setInspections] = useState<InspectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [startingId, setStartingId] = useState<string | null>(null);

  const fetchInspections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = isTraderView ? await getAllInspections() : await getMyInspections();
      setInspections(res.items);
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Unable to load quality inspections.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInspections();
  }, [isTraderView]);

  const handleStartInspection = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStartingId(id);
    try {
      await startInspection(id);
      if (onOpenInspection) {
        onOpenInspection(id);
      } else {
        await fetchInspections();
      }
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to start inspection.");
      }
    } finally {
      setStartingId(null);
    }
  };

  const filteredInspections = inspections.filter((ins) => {
    const matchesSearch =
      ins.inspectionReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ins.tradeNumber && ins.tradeNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ins.supplierOrganisationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.materialType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || ins.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e2dccd] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#173f35]">
            {isTraderView ? "Quality Inspections Overview" : "Inspector Work Queue"}
          </h2>
          <p className="text-sm text-[#52635c] mt-0.5">
            {isTraderView
              ? "Monitor scheduled, in-progress, and completed product quality inspections."
              : "Assigned tasks for physical and laboratory verification of raw materials."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchInspections()}
          disabled={loading}
          className="self-start sm:self-auto rounded-xl border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh Queue"}
        </button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-bold hover:underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference, trade #, supplier, or material..."
            className="w-full rounded-xl border border-[#e2dccd] bg-white px-3.5 py-2 text-xs text-[#173f35] placeholder:text-[#889791] focus:border-[#173f35] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["ALL", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "DRAFT"] as const).map(
            (status) => {
              const label =
                status === "ALL"
                  ? "All Tasks"
                  : status === "DRAFT"
                  ? "Unassigned"
                  : status === "ASSIGNED"
                  ? "Assigned"
                  : status === "IN_PROGRESS"
                  ? "In Progress"
                  : "Data Complete";

              const count =
                status === "ALL"
                  ? inspections.length
                  : inspections.filter((i) => i.status === status).length;

              const isSelected = statusFilter === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#173f35] text-white shadow-sm"
                      : "bg-[#f5f2e9] text-[#52635c] hover:bg-[#ece7da]"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* CONTENT: LOADING, EMPTY OR LIST */}
      {loading ? (
        <div className="space-y-3 py-6">
          <div className="h-16 w-full animate-pulse rounded-xl bg-[#f5f2e9]" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-[#f5f2e9]" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-[#f5f2e9]" />
        </div>
      ) : filteredInspections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d8d1be] bg-[#faf8f1] p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#ede7d8] flex items-center justify-center text-[#173f35] font-bold text-lg mb-3">
            ✓
          </div>
          <h3 className="text-sm font-bold text-[#173f35]">No inspection tasks found</h3>
          <p className="text-xs text-[#6e7d77] max-w-sm mx-auto mt-1">
            {searchQuery || statusFilter !== "ALL"
              ? "No inspections match your active search filter."
              : isTraderView
              ? "No quality inspection tasks have been created yet."
              : "You currently have no inspection tasks assigned to your account."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* MOBILE CARDS / DESKTOP RESPONSIVE LIST */}
          <div className="grid grid-cols-1 gap-3">
            {filteredInspections.map((ins) => {
              const statusCfg =
                INSPECTION_STATUS_CONFIG[ins.status] || {
                  label: ins.status,
                  badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
                };

              const methodLabel =
                INSPECTION_METHOD_LABELS[ins.inspectionMethod as InspectionMethod] ||
                ins.inspectionMethod;

              return (
                <div
                  key={ins.id}
                  onClick={() => onOpenInspection && onOpenInspection(ins.id)}
                  className="rounded-xl border border-[#e2dccd] bg-white p-4 hover:border-[#173f35]/50 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-[#173f35] group-hover:underline">
                          {ins.inspectionReference}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusCfg.badgeClass}`}
                        >
                          {statusCfg.label}
                        </span>
                        {ins.tradeNumber && (
                          <span className="text-xs text-[#6e7d77]">
                            Trade: <strong className="font-mono text-[#173f35]">{ins.tradeNumber}</strong>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#52635c] flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          <strong>Material:</strong> {ins.materialType}{" "}
                          {ins.productForm ? `(${ins.productForm})` : ""}
                        </span>
                        <span>
                          <strong>Volume:</strong> {ins.quantity} {ins.quantityUnit}
                        </span>
                        <span>
                          <strong>Supplier:</strong> {ins.supplierOrganisationName}
                        </span>
                        <span>
                          <strong>Method:</strong> {methodLabel}
                        </span>
                        {ins.assignedInspectorEmail && (
                          <span>
                            <strong>Inspector:</strong> {ins.assignedInspectorEmail}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {ins.status === "ASSIGNED" && !isTraderView && (
                        <button
                          type="button"
                          onClick={(e) => handleStartInspection(e, ins.id)}
                          disabled={startingId === ins.id}
                          className="rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#123129] transition-all disabled:opacity-50"
                        >
                          {startingId === ins.id ? "Starting..." : "Start Inspection"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenInspection && onOpenInspection(ins.id)}
                        className="rounded-lg border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
                      >
                        Open Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
