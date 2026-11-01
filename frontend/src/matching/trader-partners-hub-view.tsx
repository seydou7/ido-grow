"use client";

import { useEffect, useState } from "react";
import type { NavSection } from "../organisations/app-shell";
import { TraderSuppliersView } from "./trader-suppliers-view";
import { TraderBuyersView } from "./trader-buyers-view";

export type PartnersTab = "suppliers" | "buyers" | "logistics";

export interface TraderPartnersHubViewProps {
  initialTab?: PartnersTab;
  selectedSupplierId?: string | null;
  onSelectSupplier?: (supplierId: string | null) => void;
  selectedBuyerId?: string | null;
  onSelectBuyer?: (buyerId: string | null) => void;
  onOpenMatching?: (buyOrderId: string) => void;
  onNavigateSection?: (section: NavSection) => void;
}

export function TraderPartnersHubView({
  initialTab = "suppliers",
  selectedSupplierId,
  onSelectSupplier,
  selectedBuyerId,
  onSelectBuyer,
  onOpenMatching,
  onNavigateSection,
}: TraderPartnersHubViewProps) {
  const [activeTab, setActiveTab] = useState<PartnersTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="space-y-6">
      {/* Partners Workspace Header & Tab Bar */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#f0ece1]">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
                Répertoire &amp; Contreparties
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#173f35]">
              Partenaires &amp; Comptes
            </h1>
            <p className="mt-0.5 text-xs text-[#52635c]">
              Gestion des coopératives agricoles, producteurs, acheteurs industriels et prestataires de transport.
            </p>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("suppliers")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "suppliers"
                ? "bg-[#173f35] text-[#fffaf0] shadow-sm"
                : "border border-[#e2dccd] bg-white text-[#52635c] hover:bg-[#faf8f1] hover:text-[#173f35]"
            }`}
          >
            <span>Fournisseurs &amp; Producteurs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("buyers")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "buyers"
                ? "bg-[#173f35] text-[#fffaf0] shadow-sm"
                : "border border-[#e2dccd] bg-white text-[#52635c] hover:bg-[#faf8f1] hover:text-[#173f35]"
            }`}
          >
            <span>Acheteurs &amp; Industriels</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logistics")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "logistics"
                ? "bg-[#173f35] text-[#fffaf0] shadow-sm"
                : "border border-[#e2dccd] bg-white text-[#52635c] hover:bg-[#faf8f1] hover:text-[#173f35]"
            }`}
          >
            <span>Transporteurs &amp; Fret</span>
          </button>
        </div>
      </div>

      {activeTab === "suppliers" && (
        <TraderSuppliersView
          initialSupplierId={selectedSupplierId}
          onSelectSupplier={onSelectSupplier}
        />
      )}

      {activeTab === "buyers" && (
        <TraderBuyersView
          initialBuyerId={selectedBuyerId}
          onSelectBuyer={onSelectBuyer}
          onOpenMatching={onOpenMatching}
        />
      )}

      {activeTab === "logistics" && (
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-[#f0ece1] pb-3">
            <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
              Prestataires de Transport
            </span>
            <h3 className="mt-1 text-base font-bold text-[#173f35]">
              Réseau de Fret &amp; Transporteurs Partenaires
            </h3>
            <p className="mt-0.5 text-xs text-[#52635c]">
              Gestion opérationnelle des cotations de transport et affectation des transporteurs.
            </p>
          </div>

          <div className="rounded-xl bg-[#faf8f1] p-5 text-xs text-[#52635c] border border-[#e2dccd] space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🚚</span>
              <div className="space-y-1.5">
                <p className="font-bold text-[#173f35]">Fonctionnement du réseau logistique</p>
                <p className="leading-relaxed">
                  Dans le modèle actuel I Do Grow, les transporteurs interviennent par appel d'offres de fret direct rattaché aux contrats confirmés (<strong className="text-[#173f35]">Freight Quotation Requests</strong>). Chaque offre est nominative et comprend le tarif convenu, l'incoterm et les délais d'enlèvement.
                </p>
                <p className="leading-relaxed">
                  Un annuaire centralisé des prestataires logistiques avec scoring de ponctualité et accréditation européenne sera déployé lors de l'onboarding logistique dédié (Sprint 10+).
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#f0ece1] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-[#6e7d77]">
                Pour consulter les cotations en cours et sélectionner un transporteur :
              </span>
              {onNavigateSection && (
                <button
                  type="button"
                  onClick={() => onNavigateSection("trader-transactions")}
                  className="rounded-xl bg-[#173f35] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#245347] transition-all"
                >
                  Ouvrir les expéditions en cours →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
