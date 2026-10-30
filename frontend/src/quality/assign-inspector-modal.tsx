"use client";

import React, { useEffect, useState } from "react";
import { getAssignableInspectors, assignInspector, QualityRequestError } from "./api";
import { AssignableInspectorSummary, InspectionDetail } from "./contracts";

interface AssignInspectorModalProps {
  inspectionId: string;
  inspectionReference: string;
  isOpen: boolean;
  onClose: () => void;
  onAssigned: (inspection: InspectionDetail) => void;
}

export function AssignInspectorModal({
  inspectionId,
  inspectionReference,
  isOpen,
  onClose,
  onAssigned,
}: AssignInspectorModalProps) {
  const [inspectors, setInspectors] = useState<AssignableInspectorSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      setError(null);
      getAssignableInspectors()
        .then((res) => {
          setInspectors(res.items);
          if (res.items.length > 0) {
            setSelectedUserId(res.items[0].userId);
          }
        })
        .catch((err: unknown) => {
          if (err instanceof QualityRequestError) {
            setError(err.message);
          } else {
            setError("Failed to load active quality inspectors.");
          }
        })
        .finally(() => setFetching(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError("Please select a Quality Inspector.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await assignInspector(inspectionId, {
        inspectorUserId: selectedUserId,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });
      onAssigned(updated);
      onClose();
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to assign inspector.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#e2dccd] bg-white shadow-xl overflow-hidden">
        <div className="border-b border-[#e2dccd] bg-[#fbf9f4] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#173f35]">
              Assign Quality Inspector
            </h3>
            <p className="text-xs text-[#6e7d77] mt-0.5">
              Task: <strong className="font-mono text-[#173f35]">{inspectionReference}</strong>
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

          {fetching ? (
            <div className="py-6 text-center text-xs text-[#6e7d77]">
              Loading active Quality Inspectors...
            </div>
          ) : inspectors.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              No active users with the <strong>Quality Inspector</strong> role were found in the platform.
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#173f35]">
                  Select Quality Inspector *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-xl border border-[#e2dccd] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-none"
                >
                  {inspectors.map((insp) => (
                    <option key={insp.userId} value={insp.userId}>
                      {insp.email} ({insp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#173f35]">
                  Scheduled Date (Optional)
                </label>
                <input
                  type="date"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-xl border border-[#e2dccd] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-none"
                />
              </div>
            </>
          )}

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
              disabled={loading || inspectors.length === 0}
              className="rounded-xl bg-[#173f35] px-4 py-2 text-xs font-bold text-white hover:bg-[#123129] shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
