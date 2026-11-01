"use client";

import { useEffect, useState } from "react";
import { TraderTradesView } from "./trader-trades-view";
import { TraderTransactionDetailView } from "./trader-transaction-detail-view";
import { TraderContractsView } from "../contracts/trader-contracts-view";
import { TraderShipmentsView } from "../logistics/trader-shipments-view";
import { TraderDppView } from "../dpp/trader-dpp-view";
import type { NavSection } from "../organisations/app-shell";

export type TransactionsTab = "trades" | "contracts" | "shipments" | "dpp";

export interface TraderTransactionsHubViewProps {
  initialTab?: TransactionsTab;
  initialTradeId?: string | null;
  onNavigateSection?: (section: NavSection) => void;
  onOpenInspection?: (inspectionId: string) => void;
  onOpenMatchingWorkspace?: (buyOrderId: string) => void;
}

export function TraderTransactionsHubView({
  initialTab = "trades",
  initialTradeId = null,
  onNavigateSection,
  onOpenInspection,
  onOpenMatchingWorkspace,
}: TraderTransactionsHubViewProps) {
  const [activeTab, setActiveTab] = useState<TransactionsTab>(initialTab);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(initialTradeId);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialTradeId !== undefined) {
      setSelectedTradeId(initialTradeId);
    }
  }, [initialTradeId]);

  const handleNavigateSection = (section: string) => {
    setSelectedTradeId(null);
    if (section === "trader-trades" || section === "trader-transactions") {
      setActiveTab("trades");
    } else if (section === "trader-contracts") {
      setActiveTab("contracts");
    } else if (section === "trader-shipments") {
      setActiveTab("shipments");
    } else if (section === "trader-dpp") {
      setActiveTab("dpp");
    } else {
      onNavigateSection?.(section as NavSection);
    }
  };

  // If a specific trade is selected, render the unified Transaction Dossier!
  if (selectedTradeId) {
    return (
      <TraderTransactionDetailView
        tradeId={selectedTradeId}
        onBack={() => setSelectedTradeId(null)}
        onNavigateSection={(section) => onNavigateSection?.(section as NavSection)}
        onOpenInspection={onOpenInspection}
        onOpenMatchingWorkspace={onOpenMatchingWorkspace}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace Sub-Navigation Tabs */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#f0ece1]">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
                Exécution &amp; Suivi des Transactions
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#173f35]">
              Registre des Transactions
            </h1>
            <p className="mt-0.5 text-xs text-[#52635c]">
              Cycle d'exécution unifié : enregistrement des transactions, contrats bilatéraux, logistique de fret et passeports numériques (DPP).
            </p>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("trades")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === "trades"
                ? "bg-[#173f35] text-[#fffaf0] shadow-sm"
                : "border border-[#e2dccd] bg-white text-[#52635c] hover:bg-[#faf8f1] hover:text-[#173f35]"
            }`}
          >
            <span>Transactions validées</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contracts")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === "contracts"
                ? "bg-[#173f35] text-[#fffaf0] shadow-sm"
                : "border border-[#e2dccd] bg-white text-[#52635c] hover:bg-[#faf8f1] hover:text-[#173f35]"
            }`}
          >
            <span>Contrats commerciaux</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shipments")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === "shipments"
                ? "bg-[#173f35] text-[#fffaf0] shadow-sm"
                : "border border-[#e2dccd] bg-white text-[#52635c] hover:bg-[#faf8f1] hover:text-[#173f35]"
            }`}
          >
            <span>Expéditions &amp; Fret</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dpp")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === "dpp"
                ? "bg-[#173f35] text-[#fffaf0] shadow-sm"
                : "border border-[#e2dccd] bg-white text-[#52635c] hover:bg-[#faf8f1] hover:text-[#173f35]"
            }`}
          >
            <span>Passeports Produits (DPP)</span>
          </button>
        </div>
      </div>

      {/* Active Workspace View */}
      {activeTab === "trades" && (
        <TraderTradesView
          onNavigateSection={handleNavigateSection}
          onOpenInspection={onOpenInspection}
          onOpenMatchingWorkspace={onOpenMatchingWorkspace}
          onSelectTrade={(id) => setSelectedTradeId(id)}
        />
      )}

      {activeTab === "contracts" && (
        <TraderContractsView
          onNavigateSection={handleNavigateSection}
          onOpenTrade={() => setActiveTab("trades")}
        />
      )}

      {activeTab === "shipments" && (
        <TraderShipmentsView
          onNavigateSection={handleNavigateSection}
          onOpenContract={() => setActiveTab("contracts")}
        />
      )}

      {activeTab === "dpp" && <TraderDppView />}
    </div>
  );
}

