"use client";

import { useEffect, useState } from "react";
import type { ContractSummary } from "./contracts";
import { downloadContractDocument, getContracts, ContractsRequestError } from "./api";

interface TraderContractsViewProps {
  onNavigateSection?: (section: string) => void;
  onOpenTrade?: (tradeId: string) => void;
}

export function TraderContractsView({
  onNavigateSection,
  onOpenTrade,
}: TraderContractsViewProps) {
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContracts();
      setContracts(data.items);
    } catch (err) {
      if (err instanceof ContractsRequestError && err.status === 403) {
        setError("Access restricted. Contracts are accessible to authenticated Trader organisations.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load contracts.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContracts();
  }, []);

  const handleDownloadPdf = async (contractId: string) => {
    setDownloadingId(contractId);
    setError(null);
    try {
      const { blob, filename } = await downloadContractDocument(contractId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download contract PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  // KPIs
  const totalCount = contracts.length;
  const confirmedCount = contracts.filter((c) => c.status === "CONFIRMED").length;
  const draftCount = contracts.filter((c) => c.status === "DRAFT").length;
  const totalVolume = contracts.reduce((acc, c) => acc + c.quantity, 0);

  return (
    <div className="space-y-6" data-testid="trader-contracts-view">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2dccd] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
              Sprint 08 · Logistics &amp; Contracts
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#173f35]">
            Commercial Legal Contracts
          </h1>
          <p className="mt-0.5 text-xs text-[#52635c]">
            Structured bilateral contracts establishing binding terms from accepted trade baselines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateSection && (
            <button
              type="button"
              onClick={() => onNavigateSection("trader-trades")}
              className="rounded-xl border border-[#e2dccd] bg-white px-3.5 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
            >
              ← Back to Trades
            </button>
          )}
          <button
            type="button"
            data-testid="refresh-contracts-button"
            onClick={() => void loadContracts()}
            disabled={loading}
            className="rounded-xl border border-[#e2dccd] bg-white px-3.5 py-2 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh Contracts"}
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div data-testid="contracts-error-alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-[#6e7d77] uppercase tracking-wider">
            Total Contracts
          </p>
          <p className="mt-1 text-2xl font-bold text-[#173f35]">{totalCount}</p>
          <p className="mt-1 text-[11px] text-[#52635c]">Legal records created</p>
        </div>

        <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-[#6e7d77] uppercase tracking-wider">
            Confirmed Contracts
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{confirmedCount}</p>
          <p className="mt-1 text-[11px] text-[#52635c]">Immutable &amp; PDF generated</p>
        </div>

        <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-[#6e7d77] uppercase tracking-wider">
            Draft Contracts
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{draftCount}</p>
          <p className="mt-1 text-[11px] text-[#52635c]">Pending term finalization</p>
        </div>

        <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-[#6e7d77] uppercase tracking-wider">
            Contracted Volume
          </p>
          <p className="mt-1 text-2xl font-bold text-[#173f35]">
            {totalVolume.toLocaleString()} <span className="text-xs font-normal">tonnes</span>
          </p>
          <p className="mt-1 text-[11px] text-[#52635c]">Total volume covered</p>
        </div>
      </div>

      {/* CONTRACTS TABLE */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-[#e2dccd] bg-[#fbf9f4] px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#173f35] tracking-tight">
            Contracts Ledger
          </h2>
          <span className="text-xs text-[#6e7d77]">
            {contracts.length} {contracts.length === 1 ? "record" : "records"}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#6e7d77]">
            Loading contracts ledger...
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6e7d77]">
            No contract records found. Contracts are created from accepted Trade records in the Trade Details view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" data-testid="contracts-table">
              <thead className="border-b border-[#e2dccd] bg-[#faf8f1] text-[10px] uppercase font-bold text-[#6e7d77] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Contract</th>
                  <th className="px-4 py-3">Trade</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Material / Product</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Commercial Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pickup Date</th>
                  <th className="px-4 py-3">Delivery Date</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece1]">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-[#fcfaf5] transition-colors" data-testid={`contract-row-${contract.id}`}>
                    <td className="px-4 py-3 font-mono font-bold text-[#173f35]">
                      {contract.contractNumber}
                    </td>
                    <td className="px-4 py-3">
                      {onOpenTrade ? (
                        <button
                          type="button"
                          onClick={() => onOpenTrade(contract.tradeId)}
                          className="font-mono text-xs font-semibold text-[#173f35] hover:underline"
                        >
                          {contract.tradeNumber}
                        </button>
                      ) : (
                        <span className="font-mono text-[#52635c]">{contract.tradeNumber}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#173f35]">
                      {contract.buyerOrganisationName}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#173f35]">
                      {contract.supplierOrganisationName}
                    </td>
                    <td className="px-4 py-3 text-[#173f35]">
                      <span className="font-semibold">{contract.materialType}</span>
                      {contract.productForm && (
                        <span className="text-[#6e7d77] block text-[10px]">{contract.productForm}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#173f35]">
                      {contract.quantity.toLocaleString()} {contract.quantityUnit}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-[#173f35]">
                      {contract.acceptedCommercialAmount.toLocaleString()} {contract.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                          contract.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {contract.status === "CONFIRMED" ? "CONFIRMED" : "DRAFT"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#52635c]">
                      {contract.pickupDate ? new Date(contract.pickupDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#52635c]">
                      {contract.deliveryDate ? new Date(contract.deliveryDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#52635c]">
                      {new Date(contract.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {contract.hasDocument ? (
                        <button
                          type="button"
                          data-testid={`download-pdf-btn-${contract.id}`}
                          onClick={() => handleDownloadPdf(contract.id)}
                          disabled={downloadingId === contract.id}
                          className="rounded-lg border border-[#e2dccd] bg-white px-2.5 py-1 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all disabled:opacity-50"
                        >
                          {downloadingId === contract.id ? "Loading..." : "PDF"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#6e7d77] italic">Draft</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
