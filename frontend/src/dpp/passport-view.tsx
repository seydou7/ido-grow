"use client";

import React, { useState } from "react";
import type { PassportViewResponse } from "./contracts";
import { downloadPassportPdf, fetchPassportView } from "./api";
import { DppQrModal } from "./dpp-qr-modal";

interface PassportViewProps {
  initialData: PassportViewResponse;
  onBack?: () => void;
  userRole?: string | null;
}

export function PassportView({
  initialData,
  onBack,
  userRole,
}: PassportViewProps) {
  const [data, setData] = useState<PassportViewResponse>(initialData);
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapshot = data.snapshot;

  const handleVersionChange = async (vNum: number) => {
    if (vNum === data.versionNumber) return;
    setLoadingVersion(true);
    setError(null);
    try {
      const updated = await fetchPassportView(data.dppId, vNum);
      setData(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load version.");
    } finally {
      setLoadingVersion(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    setError(null);
    try {
      await downloadPassportPdf(data.dppId, data.versionNumber);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to download passport PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const renderValue = (val: unknown) => {
    if (val === null || val === undefined || String(val).trim() === "") {
      return <span className="text-slate-400 italic">Not recorded</span>;
    }
    return <span className="text-slate-800 font-medium">{String(val)}</span>;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 print:p-0 print:space-y-4">
      {/* Top Action Bar (Hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              ← Back
            </button>
          )}
          <span className="text-xs font-medium text-slate-500">
            Digital Product Passport
          </span>
          {userRole && (
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {userRole} VIEW
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Version Selector */}
          {data.availableVersions.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Version:</span>
              <select
                value={data.versionNumber}
                onChange={(e) => handleVersionChange(Number(e.target.value))}
                disabled={loadingVersion}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm focus:border-emerald-600 focus:outline-none"
              >
                {data.availableVersions.map((v) => (
                  <option key={v.versionNumber} value={v.versionNumber}>
                    v{v.versionNumber} {v.versionNumber === data.totalVersions ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* QR Code Action */}
          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <span>📱 QR Code</span>
          </button>

          {/* Download PDF Action */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 transition"
          >
            {downloadingPdf ? "Generating PDF..." : "📥 Download Passport PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 print:hidden">
          {error}
        </div>
      )}

      {/* Historical Snapshot Notice */}
      {data.isHistorical && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <div>
              <p className="font-bold">Viewing Historical Snapshot (Version {data.versionNumber} of {data.totalVersions})</p>
              <p className="text-amber-700">
                Created on {new Date(data.versionCreatedAt).toLocaleDateString()} at {new Date(data.versionCreatedAt).toLocaleTimeString()}. Historical snapshots are immutable records.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleVersionChange(data.totalVersions)}
            className="text-xs font-semibold underline hover:text-amber-950"
          >
            Switch to Current Version (v{data.totalVersions})
          </button>
        </div>
      )}

      {/* Main Passport Document Shell */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Passport Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                🌱 Natural Fibre Digital Product Passport
              </span>
              <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {data.passportNumber}
              </h1>
              <p className="mt-1 font-mono text-xs text-slate-300">
                Lot Reference: <span className="font-bold text-white">{data.lotNumber}</span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              <span className="rounded-lg bg-white/10 px-3 py-1 font-mono text-xs font-bold text-white backdrop-blur">
                v{data.versionNumber} {data.isHistorical ? "(HISTORICAL)" : "(ACTIVE)"}
              </span>
              <p className="text-[11px] text-slate-400">
                Rendered: {new Date(data.renderedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Passport Content Body */}
        <div className="divide-y divide-slate-100 p-6 sm:p-8 space-y-8">
          {/* Section 1: Product Identity */}
          <div className="pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              1. Product Identity
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Material</span>
                <p className="mt-1 text-sm font-bold text-slate-900">{snapshot.identity?.materialType}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Product Form</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">{renderValue(snapshot.identity?.productForm)}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Volume / Quantity</span>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {snapshot.identity?.quantity} {snapshot.identity?.quantityUnit}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 sm:col-span-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Batch Identifier</span>
                <p className="mt-1 text-xs font-mono text-slate-700">{renderValue(snapshot.identity?.batchReference)}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Origin & Producer */}
          <div className="pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              2. Origin & Producer
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Supplier / Producer</span>
                <p className="mt-1 text-sm font-bold text-slate-900">{snapshot.origin?.supplierName}</p>
                <p className="text-xs text-slate-500">{renderValue(snapshot.origin?.supplierCountry)}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Country & Region of Origin</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {renderValue(snapshot.origin?.countryOfOrigin || snapshot.origin?.supplierCountry)}
                  {snapshot.origin?.regionOfOrigin && ` (${snapshot.origin.regionOfOrigin})`}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Production Site</span>
                <p className="mt-1 text-sm text-slate-800">{renderValue(snapshot.origin?.productionSiteName)}</p>
                <p className="text-xs text-slate-500">{renderValue(snapshot.origin?.productionSiteAddress)}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Production Date</span>
                <p className="mt-1 text-sm text-slate-800">
                  {snapshot.origin?.productionDate
                    ? new Date(snapshot.origin.productionDate).toLocaleDateString()
                    : <span className="text-slate-400 italic">Not recorded</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Quality & Inspection */}
          <div className="pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              3. Quality & Technical Inspection
            </h2>
            {snapshot.quality?.inspections && snapshot.quality.inspections.length > 0 ? (
              <div className="mt-4 space-y-3">
                {snapshot.quality.inspections.map((insp, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {insp.inspectionReference}
                      </span>
                      <div className="flex items-center gap-2">
                        {insp.decision === "APPROVED" && (
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            ✓ QUALITY APPROVED
                          </span>
                        )}
                        {insp.decision === "REJECTED" && (
                          <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                            ✕ QUALITY REJECTED
                          </span>
                        )}
                        {insp.certificateReference && (
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            Cert: {insp.certificateReference}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">Classification: </span>
                        {renderValue(insp.humanClassificationLabel)}
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Completed: </span>
                        {insp.completedAt ? new Date(insp.completedAt).toLocaleDateString() : "Not recorded"}
                      </div>
                      {insp.summary && (
                        <div className="sm:col-span-2 text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          &ldquo;{insp.summary}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 italic">No quality inspection records recorded for this passport.</p>
            )}
          </div>

          {/* Section 4: Certifications & Compliance */}
          <div className="pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              4. Certifications & Compliance
            </h2>
            {snapshot.certifications && snapshot.certifications.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {snapshot.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{cert.documentType}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{cert.originalFilename}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      {cert.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 italic">No supplier compliance certificates recorded.</p>
            )}
          </div>

          {/* Section 5: Commercial Transaction */}
          <div className="pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              5. Commercial Transaction
            </h2>
            {snapshot.transaction && snapshot.transaction.length > 0 ? (
              <div className="mt-4 space-y-3">
                {snapshot.transaction.map((tr, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {tr.tradeNumber}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        Accepted: {new Date(tr.acceptedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Buyer: </span>
                        <span className="font-semibold text-slate-800">{tr.buyerOrganisationName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Volume: </span>
                        <span className="font-semibold text-slate-800">{tr.quantity} {tr.quantityUnit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 italic">No commercial transaction associated.</p>
            )}
          </div>

          {/* Section 6: Logistics & Execution */}
          <div className="pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              6. Logistics & Shipment Execution
            </h2>
            {snapshot.logistics && snapshot.logistics.length > 0 ? (
              <div className="mt-4 space-y-3">
                {snapshot.logistics.map((sh, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {sh.shipmentNumber}
                      </span>
                      <span className="rounded bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700 border border-sky-200">
                        {sh.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Routing: </span>
                        <span className="font-medium text-slate-800">{renderValue(sh.origin)} → {renderValue(sh.destination)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Carrier: </span>
                        <span className="font-medium text-slate-800">{renderValue(sh.carrierName)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Pickup: </span>
                        {sh.actualPickupAt ? new Date(sh.actualPickupAt).toLocaleDateString() : "Not recorded"}
                      </div>
                      <div>
                        <span className="text-slate-500">Delivered: </span>
                        {sh.deliveredAt ? new Date(sh.deliveredAt).toLocaleDateString() : "Not recorded"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 italic">No shipment execution linked yet.</p>
            )}
          </div>

          {/* Section 7: Provenance Journey Timeline */}
          <div className="pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              7. Provenance Journey Timeline (Authoritative Events)
            </h2>
            {data.provenanceEvents && data.provenanceEvents.length > 0 ? (
              <div className="mt-4 relative pl-6 border-l-2 border-slate-200 space-y-6">
                {data.provenanceEvents.map((evt) => (
                  <div key={evt.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-600 shadow-sm" />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {evt.eventType}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {new Date(evt.occurredAt).toLocaleDateString()} {new Date(evt.occurredAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                        {evt.sourceType}:{evt.sourceId.slice(0, 8)}...
                      </span>
                      {evt.responsibleOrganisationName && (
                        <span>By {evt.responsibleOrganisationName}</span>
                      )}
                      <span className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                        evt.verificationStatus === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {evt.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 italic">No provenance events recorded.</p>
            )}
          </div>
        </div>

        {/* Passport Footer */}
        <div className="border-t border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-500">
          <p className="font-medium text-slate-700">
            I Do Grow - Authoritative Natural-Fibre B2B Traceability Passport
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Protected entry point: <span className="font-mono">{data.qr.targetUrl}</span> (Authentication required)
          </p>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <DppQrModal
          qrData={{
            dppId: data.dppId,
            passportNumber: data.passportNumber,
            targetUrl: data.qr.targetUrl,
            route: data.qr.route,
            qrSvg: data.qr.qrSvg,
            qrDataUrl: data.qr.qrDataUrl,
            requiresAuth: data.qr.requiresAuth,
            generatedAt: data.renderedAt,
          }}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
}
