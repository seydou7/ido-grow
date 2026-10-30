"use client";

import { useEffect, useState } from "react";
import type { ShipmentDetail, ShipmentSummary } from "./contracts";
import { fetchShipmentById, fetchShipments } from "./api";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}

interface TraderShipmentsViewProps {
  onNavigateSection?: (section: string) => void;
  onOpenContract?: (contractId: string) => void;
}

export function TraderShipmentsView({
  onNavigateSection,
  onOpenContract,
}: TraderShipmentsViewProps) {
  const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedShipment, setSelectedShipment] = useState<ShipmentDetail | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShipments();
      setShipments(data.items ?? []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load shipments"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectShipment = async (shipmentId: string) => {
    try {
      const detail = await fetchShipmentById(shipmentId);
      setSelectedShipment(detail);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load shipment details"));
    }
  };

  const filteredShipments = shipments.filter((s) => {
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = s.shipmentNumber.toLowerCase().includes(q);
      const matchContract = s.contractNumber.toLowerCase().includes(q);
      const matchBuyer = s.buyerOrganisationName?.toLowerCase().includes(q);
      const matchSupplier = s.supplierOrganisationName?.toLowerCase().includes(q);
      return matchNumber || matchContract || matchBuyer || matchSupplier;
    }
    return true;
  });

  return (
    <div className="space-y-4" data-testid="trader-shipments-view">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece7dc] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#173f35]">Logistics &amp; Shipments Ledger</h2>
          <p className="text-xs text-[#6e7d77]">
            Active freight operations, quote comparisons, and carrier selections across confirmed contracts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="rounded-lg border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] shadow-xs"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fbfaf6] p-3 rounded-xl border border-[#e2dccd]">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <input
            type="text"
            data-testid="shipment-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shipment #, contract #, or party..."
            className="w-full rounded-lg border border-[#e2dccd] bg-white px-3 py-1.5 text-xs text-[#173f35] placeholder:text-[#8a9992]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#6e7d77] text-[11px] font-semibold">Status:</span>
          {["ALL", "PLANNING", "QUOTE_REQUESTED", "CARRIER_SELECTED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                statusFilter === st
                  ? "bg-[#173f35] text-white"
                  : "bg-white text-[#6e7d77] border border-[#e2dccd] hover:bg-[#f5f2e9]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#6e7d77]">Loading shipments ledger...</div>
      ) : filteredShipments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#dcd7cb] bg-white p-8 text-center" data-testid="empty-shipments-view">
          <div className="text-sm font-semibold text-[#173f35]">No shipments found</div>
          <p className="mt-1 text-xs text-[#6e7d77]">
            Shipments are created from Confirmed Contracts in the Contracts or Transactions workspace.
          </p>
          {onNavigateSection && (
            <button
              type="button"
              onClick={() => onNavigateSection("trader-contracts")}
              className="mt-3 rounded-lg bg-[#173f35] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#123129]"
            >
              View Contracts →
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e2dccd] bg-white shadow-xs">
          <table className="w-full text-left text-xs" data-testid="shipments-table">
            <thead className="bg-[#faf8f1] text-[11px] font-bold text-[#52635c] border-b border-[#e2dccd]">
              <tr>
                <th className="px-3 py-2.5">Shipment #</th>
                <th className="px-3 py-2.5">Contract #</th>
                <th className="px-3 py-2.5">Buyer</th>
                <th className="px-3 py-2.5">Supplier</th>
                <th className="px-3 py-2.5">Origin → Destination</th>
                <th className="px-3 py-2.5">Quantity</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Quotes</th>
                <th className="px-3 py-2.5">Updated</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece1]">
              {filteredShipments.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-[#fbfaf6] transition-colors cursor-pointer"
                  onClick={() => handleSelectShipment(s.id)}
                  data-testid={`shipment-row-${s.id}`}
                >
                  <td className="px-3 py-2.5 font-bold text-[#173f35]">
                    {s.shipmentNumber}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-[#52635c]">
                    {s.contractNumber}
                  </td>
                  <td className="px-3 py-2.5 text-[#173f35]">
                    {s.buyerOrganisationName}
                  </td>
                  <td className="px-3 py-2.5 text-[#173f35]">
                    {s.supplierOrganisationName}
                  </td>
                  <td className="px-3 py-2.5 text-[#6e7d77]">
                    {s.origin || "TBD"} → {s.destination || "TBD"}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-[#173f35]">
                    {s.shipmentQuantity?.toLocaleString()} {s.quantityUnit}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        s.status === "CARRIER_SELECTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : s.status === "QUOTE_REQUESTED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-semibold text-[#173f35]">{s.quotationCount}</span>
                    <span className="text-[10px] text-[#6e7d77]"> ({s.requestCount} req)</span>
                  </td>
                  <td className="px-3 py-2.5 text-[#8a9992] text-[11px]">
                    {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      data-testid={`view-shipment-btn-${s.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectShipment(s.id);
                      }}
                      className="text-xs font-bold text-[#173f35] hover:underline"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" data-testid="shipment-detail-modal">
          <div className="w-full max-w-2xl rounded-xl border border-[#e2dccd] bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ece7dc] pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#6e7d77]">Shipment Overview</span>
                <h3 className="text-base font-bold text-[#173f35]">{selectedShipment.shipmentNumber}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                    selectedShipment.status === "CARRIER_SELECTED"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedShipment.status === "QUOTE_REQUESTED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedShipment.status}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedShipment(null)}
                  className="rounded-lg p-1 text-[#6e7d77] hover:bg-[#f0ece1] text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#faf8f1] p-3 rounded-lg border border-[#e2dccd]">
                <div>
                  <span className="text-[10px] text-[#6e7d77] block">Contract</span>
                  <span className="font-bold text-[#173f35]">{selectedShipment.contractNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6e7d77] block">Quantity</span>
                  <span className="font-bold text-[#173f35]">
                    {selectedShipment.shipmentQuantity?.toLocaleString()} {selectedShipment.quantityUnit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6e7d77] block">Origin</span>
                  <span className="font-bold text-[#173f35]">{selectedShipment.origin || "TBD"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6e7d77] block">Destination</span>
                  <span className="font-bold text-[#173f35]">{selectedShipment.destination || "TBD"}</span>
                </div>
              </div>

              {selectedShipment.status === "CARRIER_SELECTED" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                  <div className="font-bold text-emerald-900 mb-1">Selected Operational Carrier</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#6e7d77] block">Carrier</span>
                      <span className="font-semibold text-[#173f35]">
                        {selectedShipment.selectedCarrierName || "Logistics Partner"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6e7d77] block">Agreed Freight</span>
                      <span className="font-mono font-bold text-[#173f35]">
                        {selectedShipment.carrierTotalCost?.toLocaleString()} {selectedShipment.carrierCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-[#6e7d77] block">Requested Pickup Date</span>
                  <span className="font-semibold text-[#173f35]">
                    {selectedShipment.requestedPickupDate
                      ? new Date(selectedShipment.requestedPickupDate).toLocaleDateString()
                      : "Flexible"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6e7d77] block">Requested Delivery Date</span>
                  <span className="font-semibold text-[#173f35]">
                    {selectedShipment.requestedDeliveryDate
                      ? new Date(selectedShipment.requestedDeliveryDate).toLocaleDateString()
                      : "Flexible"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#6e7d77] block">Transport Requirements</span>
                <p className="mt-0.5 text-[#173f35] bg-white p-2 rounded border border-[#e2dccd]">
                  {selectedShipment.transportRequirements || "Standard dry freight"}
                </p>
              </div>

              {selectedShipment.notes && (
                <div>
                  <span className="text-[10px] text-[#6e7d77] block">Special Instructions / Notes</span>
                  <p className="mt-0.5 text-[#173f35] bg-white p-2 rounded border border-[#e2dccd]">
                    {selectedShipment.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-[#f0ece1]">
              {onOpenContract && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShipment(null);
                    onOpenContract(selectedShipment.contractId);
                  }}
                  className="rounded-lg border border-[#e2dccd] px-3.5 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1]"
                >
                  Open Contract Workspace →
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedShipment(null)}
                className="rounded-lg bg-[#173f35] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#123129]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
