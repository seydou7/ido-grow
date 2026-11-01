"use client";

import React, { useEffect, useState } from "react";
import type { DigitalProductPassportResponse, PassportViewResponse } from "./contracts";
import { downloadPassportPdf, fetchPassportQr, fetchPassports, fetchPassportView } from "./api";
import { PassportView } from "./passport-view";
import { DppQrModal } from "./dpp-qr-modal";

interface CounterpartyDppViewProps {
  userRole: "BUYER" | "SUPPLIER";
}

export function CounterpartyDppView({ userRole }: CounterpartyDppViewProps) {
  const [passports, setPassports] = useState<DigitalProductPassportResponse[]>([]);
  const [selectedDppId, setSelectedDppId] = useState<string | null>(null);
  const [passportViewData, setPassportViewData] = useState<PassportViewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewLoading, setViewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeQr, setActiveQr] = useState<import("./contracts").DppQrResult | null>(null);

  useEffect(() => {
    loadPassports();
  }, []);

  async function loadPassports() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPassports();
      setPassports(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load Digital Product Passports.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenPassport(dppId: string) {
    setSelectedDppId(dppId);
    setViewLoading(true);
    setError(null);
    try {
      const data = await fetchPassportView(dppId);
      setPassportViewData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load passport view.");
      setSelectedDppId(null);
    } finally {
      setViewLoading(false);
    }
  }

  async function handleDownloadPdf(dppId: string, versionNumber?: number) {
    setDownloadingId(dppId);
    setError(null);
    try {
      await downloadPassportPdf(dppId, versionNumber);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to download passport PDF.");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleShowQr(dppId: string) {
    try {
      const qr = await fetchPassportQr(dppId);
      setActiveQr(qr);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load QR code.");
    }
  }

  if (selectedDppId && passportViewData) {
    return (
      <PassportView
        initialData={passportViewData}
        userRole={userRole}
        onBack={() => {
          setSelectedDppId(null);
          setPassportViewData(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {userRole === "BUYER" ? "Purchased Product Passports" : "My Traceable Product Passports"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {userRole === "BUYER"
              ? "Authoritative Digital Product Passports for natural-fibre lots purchased through your transactions."
              : "Digital Product Passports and origin provenance records for your supply lots."}
          </p>
        </div>

        <button
          onClick={loadPassports}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          Loading Digital Product Passports...
        </div>
      ) : passports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">No Digital Product Passports Found</p>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            {userRole === "BUYER"
              ? "When transactions are confirmed and lots are prepared, their passports and provenance will appear here."
              : "When your traceable lots are registered with Digital Product Passports, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="py-3 px-4">Passport Identifier</th>
                <th className="py-3 px-4">Traceable Lot</th>
                <th className="py-3 px-4">Material & Form</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Origin</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {passports.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {p.passportNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {p.lot.lotNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900">{p.lot.materialType}</span>
                    {p.lot.productForm && (
                      <span className="ml-1 text-slate-500">({p.lot.productForm})</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {p.lot.quantity} {p.lot.quantityUnit}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {p.lot.countryOfOrigin || p.lot.supplierName || "Not recorded"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                      v{p.currentVersionNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleShowQr(p.id)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                        title="Show QR Code"
                      >
                        📱 QR
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(p.id, p.currentVersionNumber)}
                        disabled={downloadingId === p.id}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition disabled:opacity-50"
                        title="Download PDF"
                      >
                        {downloadingId === p.id ? "..." : "📥 PDF"}
                      </button>
                      <button
                        onClick={() => handleOpenPassport(p.id)}
                        disabled={viewLoading}
                        className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800 shadow-sm transition"
                      >
                        View Passport →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal */}
      {activeQr && (
        <DppQrModal
          qrData={activeQr}
          onClose={() => setActiveQr(null)}
        />
      )}
    </div>
  );
}
