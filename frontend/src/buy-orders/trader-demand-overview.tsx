"use client";

import { useEffect, useState } from "react";

import {
  createBuyOrder,
  deleteBuyOrder,
  listBuyerOrganisationsForTrader,
  listTraderDemand,
  listTraderDrafts,
  updateBuyOrder,
} from "./api";
import {
  APPROVED_MATERIAL_TYPES,
  BUY_ORDER_STATUS_COLORS,
  BUY_ORDER_STATUS_LABELS,
  type BuyOrderDetail,
  type CreateBuyOrderInput,
  MATERIAL_TYPE_LABELS,
  type MaterialType,
  PRODUCT_FORM_LABELS,
  type ProductForm,
  QUANTITY_UNIT_LABELS,
  type QuantityUnit,
  TARGET_PRICE_UNIT_LABELS,
  type TargetPriceUnit,
  type TraderDemandSummary,
} from "./contracts";
import { BuyOrderDetailView } from "./buy-order-detail-view";
import { CreateEditBuyOrderModal } from "./create-edit-buy-order-modal";
import { MatchingWorkspaceView } from "../matching";
import { getTraderCockpit } from "../matching/api";
import type { CockpitBuyOrder } from "../matching/contracts";

export type DemandTab = "TO_PROCESS" | "IN_PROGRESS" | "READY_OR_SENT" | "DRAFT";

export function TraderDemandOverview() {
  const [activeTab, setActiveTab] = useState<DemandTab>("TO_PROCESS");
  const [demands, setDemands] = useState<TraderDemandSummary[]>([]);
  const [drafts, setDrafts] = useState<TraderDemandSummary[]>([]);
  const [cockpitOrders, setCockpitOrders] = useState<CockpitBuyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [materialFilter, setMaterialFilter] = useState<string>("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [matchingOrderId, setMatchingOrderId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<BuyOrderDetail | null>(null);
  const [buyerOrganisations, setBuyerOrganisations] = useState<
    Array<{ id: string; name: string; country: string | null }>
  >([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [demandRes, draftsRes, cockpitRes] = await Promise.allSettled([
        listTraderDemand({
          materialType: materialFilter !== "ALL" ? materialFilter : undefined,
        }),
        listTraderDrafts({
          materialType: materialFilter !== "ALL" ? materialFilter : undefined,
        }),
        getTraderCockpit(),
      ]);

      if (demandRes.status === "fulfilled") {
        setDemands(demandRes.value.items);
      }
      if (draftsRes.status === "fulfilled") {
        setDrafts(draftsRes.value.items);
      }
      if (cockpitRes.status === "fulfilled") {
        setCockpitOrders(cockpitRes.value.openBuyOrders || []);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Impossible de charger les demandes acheteurs.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadBuyerOrganisations = async () => {
    try {
      const res = await listBuyerOrganisationsForTrader();
      setBuyerOrganisations(res.items);
    } catch {
      // Ignored if fail
    }
  };

  useEffect(() => {
    void loadData();
    void loadBuyerOrganisations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialFilter]);

  const handleOpenCreateModal = async () => {
    await loadBuyerOrganisations();
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleSaveDraft = async (
    input: CreateBuyOrderInput,
    targetBuyerOrgId?: string,
  ) => {
    if (editingOrder) {
      await updateBuyOrder(editingOrder.id, input);
    } else {
      await createBuyOrder(input, targetBuyerOrgId);
    }
    setEditingOrder(null);
    await loadData();
  };

  const handleSubmitDirectly = async (
    input: CreateBuyOrderInput,
    targetBuyerOrgId?: string,
  ) => {
    if (editingOrder) {
      await updateBuyOrder(editingOrder.id, input);
      const { submitBuyOrder } = await import("./api");
      await submitBuyOrder(editingOrder.id);
    } else {
      await createBuyOrder(
        { ...input, submitDirectly: true },
        targetBuyerOrgId,
      );
    }
    setEditingOrder(null);
    await loadData();
  };

  if (matchingOrderId) {
    return (
      <MatchingWorkspaceView
        buyOrderId={matchingOrderId}
        onBack={() => {
          setMatchingOrderId(null);
          void loadData();
        }}
      />
    );
  }

  if (selectedOrderId) {
    return (
      <BuyOrderDetailView
        buyOrderId={selectedOrderId}
        isTrader={true}
        onOpenMatching={(id) => {
          setSelectedOrderId(null);
          setMatchingOrderId(id);
        }}
        onBack={() => {
          setSelectedOrderId(null);
          void loadData();
        }}
        onEdit={(ord) => {
          setSelectedOrderId(null);
          setEditingOrder(ord);
          setIsModalOpen(true);
        }}
      />
    );
  }

  // Build cockpit lookup map by ID
  const cockpitMap = new Map<string, CockpitBuyOrder>();
  for (const c of cockpitOrders) {
    cockpitMap.set(c.id, c);
  }

  // Categorize demands
  const toProcessDemands = demands.filter((d) => {
    const c = cockpitMap.get(d.id);
    return !c || c.matchStatus === "No Match";
  });

  const inProgressDemands = demands.filter((d) => {
    const c = cockpitMap.get(d.id);
    return c?.matchStatus === "Draft Match";
  });

  const readyOrSentDemands = demands.filter((d) => {
    const c = cockpitMap.get(d.id);
    return c?.matchStatus === "Approved Match";
  });

  const currentItems =
    activeTab === "TO_PROCESS"
      ? toProcessDemands
      : activeTab === "IN_PROGRESS"
      ? inProgressDemands
      : activeTab === "READY_OR_SENT"
      ? readyOrSentDemands
      : drafts;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#e2dccd] pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#173f35]">
            Espace Matching & Demandes Acheteurs
          </h1>
          <p className="mt-0.5 text-xs text-[#52635c]">
            Rapprochez les demandes d'achat ouvertes avec les lots disponibles et préparez les devis.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#173f35] px-4 py-2 text-xs font-semibold text-[#fffaf0] shadow-2xs transition-all hover:bg-[#123129]"
        >
          <span>+ Créer une demande acheteur</span>
        </button>
      </div>

      {/* Tabs & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e2dccd] bg-white p-3 shadow-2xs">
        {/* Operational Categories Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("TO_PROCESS")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "TO_PROCESS"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-[#52635c] hover:bg-[#faf8f1]"
            }`}
          >
            <span>⚡ À traiter</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "TO_PROCESS"
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {toProcessDemands.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("IN_PROGRESS")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "IN_PROGRESS"
                ? "bg-[#173f35] text-white shadow-2xs"
                : "text-[#52635c] hover:bg-[#faf8f1]"
            }`}
          >
            <span>⏳ En cours</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "IN_PROGRESS"
                  ? "bg-white/20 text-white"
                  : "bg-[#173f35]/10 text-[#173f35]"
              }`}
            >
              {inProgressDemands.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("READY_OR_SENT")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "READY_OR_SENT"
                ? "bg-emerald-700 text-white shadow-2xs"
                : "text-[#52635c] hover:bg-[#faf8f1]"
            }`}
          >
            <span>✓ Devis prêt / envoyé</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "READY_OR_SENT"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {readyOrSentDemands.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DRAFT")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "DRAFT"
                ? "bg-[#52635c] text-white shadow-2xs"
                : "text-[#52635c] hover:bg-[#faf8f1]"
            }`}
          >
            <span>📝 Brouillons</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "DRAFT"
                  ? "bg-white/20 text-white"
                  : "bg-stone-100 text-stone-700"
              }`}
            >
              {drafts.length}
            </span>
          </button>
        </div>

        {/* Material Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="trader-mat-filter" className="text-xs font-medium text-[#52635c]">
            Matière :
          </label>
          <select
            id="trader-mat-filter"
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="rounded-xl border border-[#d4cdbc] bg-white px-3 py-1.5 text-xs font-medium text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
          >
            <option value="ALL">Toutes les fibres</option>
            {APPROVED_MATERIAL_TYPES.map((mat) => (
              <option key={mat} value={mat}>
                {MATERIAL_TYPE_LABELS[mat]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-[#e2dccd] bg-white p-5"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && currentItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#d4cdbc] bg-white p-10 text-center">
          <h3 className="text-sm font-bold text-[#173f35]">
            {activeTab === "TO_PROCESS"
              ? "Aucune demande à traiter"
              : activeTab === "IN_PROGRESS"
              ? "Aucun rapprochement en cours"
              : activeTab === "READY_OR_SENT"
              ? "Aucun devis prêt ou envoyé"
              : "Aucun brouillon de demande"}
          </h3>
          <p className="mt-1 text-xs text-[#52635c]">
            {activeTab === "TO_PROCESS"
              ? "Toutes les demandes d'achat ouvertes disposent d'un matching ou d'un devis actif."
              : "Aucune demande n'est actuellement enregistrée dans cette catégorie."}
          </p>
          {activeTab === "DRAFT" && (
            <button
              onClick={handleOpenCreateModal}
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#173f35] px-4 py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#204e42]"
            >
              + Créer une demande au nom de l'acheteur
            </button>
          )}
        </div>
      )}

      {/* Demands Cards Grid */}
      {!loading && currentItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((demand) => {
            const cockpitInfo = cockpitMap.get(demand.id);
            const matchStatus = cockpitInfo?.matchStatus ?? (demand.status === "DRAFT" ? "DRAFT" : "No Match");

            const materialLabel =
              MATERIAL_TYPE_LABELS[demand.materialType as MaterialType] ||
              demand.materialType;
            const formLabel = demand.productForm
              ? PRODUCT_FORM_LABELS[demand.productForm as ProductForm] ||
                demand.productForm
              : "Toute forme";
            const quantityUnitLabel =
              QUANTITY_UNIT_LABELS[demand.quantityUnit as QuantityUnit] ||
              demand.quantityUnit;
            const priceUnitLabel =
              TARGET_PRICE_UNIT_LABELS[
                demand.targetPriceUnit as TargetPriceUnit
              ] || demand.targetPriceUnit;

            const isApproved = matchStatus === "Approved Match";
            const isDraftMatch = matchStatus === "Draft Match";

            return (
              <div
                key={demand.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-4.5 shadow-2xs transition-all hover:border-[#173f35]/50 hover:shadow-sm ${
                  isApproved
                    ? "border-emerald-300 ring-1 ring-emerald-200"
                    : isDraftMatch
                    ? "border-blue-300 ring-1 ring-blue-100"
                    : "border-[#e2dccd]"
                }`}
              >
                <div>
                  {/* Buyer Organisation Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#f0ece1] pb-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#173f35] truncate">
                        {demand.buyerOrganisation.name}
                      </p>
                      <p className="text-[10px] text-[#718079]">
                        {demand.buyerOrganisation.country || "Localisation non définie"}
                      </p>
                    </div>

                    {/* Operational Match Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        demand.status === "DRAFT"
                          ? "bg-stone-50 text-stone-700 border-stone-200"
                          : isApproved
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : isDraftMatch
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          demand.status === "DRAFT"
                            ? "bg-stone-400"
                            : isApproved
                            ? "bg-emerald-600"
                            : isDraftMatch
                            ? "bg-blue-600"
                            : "bg-amber-600"
                        }`}
                      />
                      {demand.status === "DRAFT"
                        ? "Brouillon"
                        : isApproved
                        ? "Match approuvé"
                        : isDraftMatch
                        ? "Matching en cours"
                        : "À sourcer"}
                    </span>
                  </div>

                  {/* Material & Volume */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-[#faf8f1] px-2 py-0.5 text-[11px] font-bold text-[#173f35] border border-[#e2dccd]">
                        {materialLabel}
                      </span>
                      <span className="text-xs font-semibold text-[#52635c] truncate">
                        {formLabel}
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-[#173f35] mt-1 tabular-nums">
                      {demand.quantity.toLocaleString()} {quantityUnitLabel}
                    </p>
                  </div>

                  {/* Destination & Target Price */}
                  <div className="mt-3 space-y-1 text-xs text-[#52635c]">
                    <p>
                      <span className="font-semibold text-[#173f35]">Destination :</span>{" "}
                      {demand.deliveryCountry || "Non spécifiée"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#173f35]">Prix cible :</span>{" "}
                      {demand.targetPriceAmount !== null && demand.targetPriceAmount !== undefined
                        ? `${demand.targetPriceAmount.toLocaleString()} ${priceUnitLabel}`
                        : "Prix de marché"}
                    </p>
                    {demand.requestedDeliveryDate && (
                      <p>
                        <span className="font-semibold text-[#173f35]">Date souhaitée :</span>{" "}
                        {new Date(demand.requestedDeliveryDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-[#f0ece1] pt-3">
                  <span className="font-mono text-[10px] text-[#85968f]">
                    #BO-{demand.id.slice(-4).toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    {demand.status === "DRAFT" ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingOrder(demand);
                            setIsModalOpen(true);
                          }}
                          type="button"
                          className="rounded-xl border border-[#173f35] px-2.5 py-1 text-xs font-semibold text-[#173f35] hover:bg-[#173f35]/5"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Supprimer ce brouillon ?")) return;
                            setError(null);
                            try {
                              await deleteBuyOrder(demand.id);
                              setDrafts((prev) => prev.filter((d) => d.id !== demand.id));
                              await loadData();
                            } catch (err: unknown) {
                              setError(
                                err instanceof Error ? err.message : "Échec de la suppression.",
                              );
                            }
                          }}
                          type="button"
                          className="rounded-xl border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          Supprimer
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedOrderId(demand.id)}
                          type="button"
                          className="rounded-xl border border-[#e2dccd] bg-white px-2.5 py-1 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1]"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => setMatchingOrderId(demand.id)}
                          type="button"
                          className={`rounded-xl px-3 py-1 text-xs font-bold transition-all shadow-2xs ${
                            isApproved
                              ? "bg-emerald-700 text-white hover:bg-emerald-800"
                              : "bg-[#173f35] text-white hover:bg-[#123129]"
                          }`}
                        >
                          {isApproved ? "Voir le match →" : "Ouvrir le matching →"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Buy Order on behalf of Buyer Modal */}
      {isModalOpen && (
        <CreateEditBuyOrderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOrder(null);
          }}
          onSaveDraft={handleSaveDraft}
          onSubmitDirectly={handleSubmitDirectly}
          existingOrder={editingOrder}
          isTrader={true}
          buyerOrganisations={buyerOrganisations}
        />
      )}
    </div>
  );
}
