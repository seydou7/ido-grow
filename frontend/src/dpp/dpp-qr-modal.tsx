"use client";

import React, { useState } from "react";
import type { DppQrResult } from "./contracts";

interface DppQrModalProps {
  qrData: DppQrResult;
  onClose: () => void;
}

export function DppQrModal({ qrData, onClose }: DppQrModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrData.targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 id="qr-modal-title" className="text-lg font-bold text-slate-900">
              Digital Product Passport QR
            </h3>
            <p className="text-xs font-mono font-medium text-slate-500">
              {qrData.passportNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* QR Code Container */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
            <div
              className="h-56 w-56 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: qrData.qrSvg }}
            />
          </div>
          <p className="mt-3 text-xs font-medium text-slate-600 text-center">
            Scan to open this Digital Product Passport.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 border border-amber-200 text-[11px] font-medium text-amber-800">
            <span>🔒 Authorised Access Required</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 text-center max-w-xs">
            Scanning redirects to authentication. Only related counterparties (Trader, Buyer, Supplier) may access this passport.
          </p>
        </div>

        {/* Destination Route */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 mb-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Protected Route:</span>
            <button
              onClick={handleCopyUrl}
              className="text-emerald-700 hover:text-emerald-800 font-medium"
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
          </div>
          <p className="font-mono text-xs text-slate-700 break-all select-all">
            {qrData.targetUrl}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
