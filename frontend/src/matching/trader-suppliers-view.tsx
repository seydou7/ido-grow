"use client";

import { useEffect, useState } from "react";
import {
  APPROVED_MATERIAL_TYPES,
  APPROVED_PRICE_UNITS,
  APPROVED_PRODUCT_FORMS,
  APPROVED_QUANTITY_UNITS,
  type CreateListingInput,
  type MaterialType,
  type ProductForm,
  type QuantityUnit,
  type PriceUnit,
  MATERIAL_TYPE_LABELS,
  PRODUCT_FORM_LABELS,
  QUANTITY_UNIT_LABELS,
} from "../listings/contracts";
import { createListing } from "../listings/api";
import { getSupplierDetailForTrader, listSuppliersForTrader } from "./api";
import type {
  TraderSupplierDetail,
  TraderSupplierSummary,
} from "./contracts";

export interface TraderSuppliersViewProps {
  initialSupplierId?: string | null;
  onSelectSupplier?: (supplierId: string | null) => void;
}

export function TraderSuppliersView({
  initialSupplierId,
  onSelectSupplier,
}: TraderSuppliersViewProps) {
  const [suppliers, setSuppliers] = useState<TraderSupplierSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("ALL");

  // Selection
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    initialSupplierId ?? null,
  );
  const [detail, setDetail] = useState<TraderSupplierDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (initialSupplierId !== undefined) {
      setSelectedSupplierId(initialSupplierId);
    }
  }, [initialSupplierId]);

  // Tabs in detail view
  const [activeTab, setActiveTab] = useState<"listings" | "sites" | "documents" | "profile">("listings");

  // On-behalf listing creation modal/card
  const [isAddingListing, setIsAddingListing] = useState(false);
  const [listingSubmitting, setListingSubmitting] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);

  // Form fields for on-behalf listing
  const [listingTitle, setListingTitle] = useState("");
  const [listingMaterial, setListingMaterial] = useState<string>("HEMP");
  const [listingForm, setListingForm] = useState<string>("STRAW_RETTED");
  const [listingQuantity, setListingQuantity] = useState<number>(50);
  const [listingQuantityUnit, setListingQuantityUnit] = useState<string>("TONNES");
  const [listingPrice, setListingPrice] = useState<string>("");
  const [listingPriceUnit, setListingPriceUnit] = useState<string>("PER_TONNE");
  const [listingSiteId, setListingSiteId] = useState<string>("");
  const [listingHarvestYear, setListingHarvestYear] = useState<number>(new Date().getFullYear());
  const [listingStatus, setListingStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listSuppliersForTrader({
        search: search.trim() !== "" ? search : undefined,
        verificationStatus: verificationFilter !== "ALL" ? verificationFilter : undefined,
      });
      setSuppliers(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadSuppliers();
  };

  const loadSupplierDetail = async (id: string) => {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await getSupplierDetailForTrader(id);
      setDetail(res);
      if (res.sites && res.sites.length > 0 && !listingSiteId) {
        setListingSiteId(res.sites[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load supplier details.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSupplierId) {
      void loadSupplierDetail(selectedSupplierId);
    } else {
      setDetail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSupplierId]);

  const handleSelect = (id: string) => {
    setSelectedSupplierId(id);
    onSelectSupplier?.(id);
  };

  const handleBack = () => {
    setSelectedSupplierId(null);
    onSelectSupplier?.(null);
    void loadSuppliers();
  };

  const handleCreateListingOnBehalf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;

    if (!listingTitle.trim()) {
      setListingError("Listing title is required.");
      return;
    }

    setListingSubmitting(true);
    setListingError(null);

    try {
      const input: CreateListingInput = {
        title: listingTitle.trim(),
        materialType: listingMaterial as MaterialType,
        productForm: listingForm as ProductForm,
        quantity: Number(listingQuantity),
        quantityUnit: listingQuantityUnit as QuantityUnit,
        priceAmount: listingPrice.trim() !== "" ? Number(listingPrice) : undefined,
        currency: "EUR",
        priceUnit: listingPriceUnit as PriceUnit,
        siteId: listingSiteId || undefined,
        originCountry: detail.country ?? undefined,
        harvestYear: listingHarvestYear ? Number(listingHarvestYear) : undefined,
        status: listingStatus,
      };

      await createListing(detail.id, input);

      setIsAddingListing(false);
      setListingTitle("");
      setListingPrice("");
      await loadSupplierDetail(detail.id);
    } catch (err: unknown) {
      setListingError(err instanceof Error ? err.message : "Failed to create listing on behalf.");
    } finally {
      setListingSubmitting(false);
    }
  };

  // DETAIL VIEW
  if (selectedSupplierId) {
    if (detailLoading && !detail) {
      return (
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-40 rounded-lg bg-[#e2dccd]/60" />
          <div className="h-28 rounded-2xl bg-white border border-[#e2dccd]" />
          <div className="h-80 rounded-2xl bg-white border border-[#e2dccd]" />
        </div>
      );
    }

    if (!detail) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
          <p className="font-semibold">Supplier could not be loaded.</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-3 rounded-xl bg-red-700 px-3.5 py-1.5 text-xs font-semibold text-white"
          >
            ← Back to Suppliers
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Top Return Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173f35] hover:text-[#245347] transition-colors"
          >
            <span>← Back to Suppliers Directory</span>
          </button>

          <span className="rounded-md bg-[#faf8f1] px-2.5 py-1 text-[11px] font-semibold text-[#52635c] border border-[#e2dccd]">
            ID: {detail.id}
          </span>
        </div>

        {/* Supplier Profile Header Card */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#173f35] text-xs font-bold text-[#e5b84b]">
                  {detail.name.substring(0, 2).toUpperCase()}
                </span>
                <h1 className="text-xl font-bold text-[#173f35] sm:text-2xl">
                  {detail.name}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    detail.verificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : detail.verificationStatus === "UNDER_REVIEW"
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {detail.verificationStatus}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#52635c]">
                {detail.legalName && `${detail.legalName} · `}
                {detail.city ? `${detail.city}, ` : ""}
                {detail.country || "Country not specified"}
                {detail.businessType && ` · ${detail.businessType}`}
              </p>
            </div>

            {/* Quick stats badges */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3.5 py-2 text-center">
                <span className="block text-base font-bold text-[#173f35]">
                  {detail.summary.publishedListingCount}
                </span>
                <span className="text-[10px] text-[#6e7d77] uppercase tracking-wider font-medium">
                  Live Listings
                </span>
              </div>
              <div className="rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3.5 py-2 text-center">
                <span className="block text-base font-bold text-[#173f35]">
                  {detail.summary.draftListingCount}
                </span>
                <span className="text-[10px] text-[#6e7d77] uppercase tracking-wider font-medium">
                  Drafts
                </span>
              </div>
              <div className="rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3.5 py-2 text-center">
                <span className="block text-base font-bold text-[#173f35]">
                  {detail.summary.siteCount}
                </span>
                <span className="text-[10px] text-[#6e7d77] uppercase tracking-wider font-medium">
                  Sites
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details strip */}
          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#f0ece1] pt-4 sm:grid-cols-3 text-xs text-[#52635c]">
            <div>
              <span className="block text-[10px] font-semibold uppercase text-[#6e7d77]">Contact Person</span>
              <span className="font-medium text-[#173f35]">{detail.contactName || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-[#6e7d77]">Contact Email</span>
              <span className="font-medium text-[#173f35]">{detail.contactEmail || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-[#6e7d77]">Phone</span>
              <span className="font-medium text-[#173f35]">{detail.contactPhone || "—"}</span>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
          {/* Sub-navigation Tabs */}
          <div className="flex border-b border-[#e2dccd] bg-[#fbf9f4] px-4">
            <button
              type="button"
              onClick={() => setActiveTab("listings")}
              className={`border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                activeTab === "listings"
                  ? "border-[#173f35] text-[#173f35]"
                  : "border-transparent text-[#6e7d77] hover:text-[#173f35]"
              }`}
            >
              Product Listings ({detail.listings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sites")}
              className={`border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                activeTab === "sites"
                  ? "border-[#173f35] text-[#173f35]"
                  : "border-transparent text-[#6e7d77] hover:text-[#173f35]"
              }`}
            >
              Production Sites ({detail.sites.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("documents")}
              className={`border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                activeTab === "documents"
                  ? "border-[#173f35] text-[#173f35]"
                  : "border-transparent text-[#6e7d77] hover:text-[#173f35]"
              }`}
            >
              Compliance Documents ({detail.complianceDocuments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                activeTab === "profile"
                  ? "border-[#173f35] text-[#173f35]"
                  : "border-transparent text-[#6e7d77] hover:text-[#173f35]"
              }`}
            >
              Legal & Org Details
            </button>
          </div>

          {/* TAB 1: LISTINGS */}
          {activeTab === "listings" && (
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#173f35]">Supplier Raw Material Offers</h3>
                  <p className="text-xs text-[#52635c]">Active and draft listings owned by {detail.name}</p>
                </div>
                {!isAddingListing && (
                  <button
                    type="button"
                    onClick={() => setIsAddingListing(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#173f35] px-3.5 py-2 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all"
                  >
                    <span>+ Create Listing on Behalf</span>
                  </button>
                )}
              </div>

              {/* ON-BEHALF LISTING CREATION FORM */}
              {isAddingListing && (
                <form
                  onSubmit={handleCreateListingOnBehalf}
                  className="rounded-xl border border-[#245347]/30 bg-[#faf8f1] p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#e2dccd] pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#173f35]">
                      Create New Listing on Behalf of {detail.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingListing(false)}
                      className="text-xs font-semibold text-[#6e7d77] hover:text-[#173f35]"
                    >
                      Cancel
                    </button>
                  </div>

                  {listingError && (
                    <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                      {listingError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#173f35]">Listing Title *</label>
                      <input
                        type="text"
                        value={listingTitle}
                        onChange={(e) => setListingTitle(e.target.value)}
                        placeholder="e.g. Normandy Field-Retted Straw 2026"
                        required
                        className="mt-1 w-full rounded-lg border border-[#e2dccd] bg-white p-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#173f35]">Natural Fibre Material *</label>
                      <select
                        value={listingMaterial}
                        onChange={(e) => setListingMaterial(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#e2dccd] bg-white p-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-none"
                      >
                        {APPROVED_MATERIAL_TYPES.map((mat) => (
                          <option key={mat} value={mat}>
                            {MATERIAL_TYPE_LABELS[mat] || mat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#173f35]">Product Form *</label>
                      <select
                        value={listingForm}
                        onChange={(e) => setListingForm(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#e2dccd] bg-white p-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-none"
                      >
                        {APPROVED_PRODUCT_FORMS.map((form) => (
                          <option key={form} value={form}>
                            {PRODUCT_FORM_LABELS[form] || form}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#173f35]">Production Site</label>
                      <select
                        value={listingSiteId}
                        onChange={(e) => setListingSiteId(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#e2dccd] bg-white p-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-none"
                      >
                        <option value="">None (Supplier wide)</option>
                        {detail.sites.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} {s.city ? `(${s.city})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#173f35]">Quantity *</label>
                        <input
                          type="number"
                          value={listingQuantity}
                          onChange={(e) => setListingQuantity(Number(e.target.value))}
                          min={1}
                          required
                          className="mt-1 w-full rounded-lg border border-[#e2dccd] bg-white p-2 text-xs text-[#173f35]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#173f35]">Unit</label>
                        <select
                          value={listingQuantityUnit}
                          onChange={(e) => setListingQuantityUnit(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#e2dccd] bg-white p-2 text-xs text-[#173f35]"
                        >
                          {APPROVED_QUANTITY_UNITS.map((u) => (
                            <option key={u} value={u}>
                              {QUANTITY_UNIT_LABELS[u] || u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#173f35]">Price (EUR)</label>
                        <input
                          type="number"
                          value={listingPrice}
                          onChange={(e) => setListingPrice(e.target.value)}
                          placeholder="Optional"
                          min={0}
                          className="mt-1 w-full rounded-lg border border-[#e2dccd] bg-white p-2 text-xs text-[#173f35]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#173f35]">Price Unit</label>
                        <select
                          value={listingPriceUnit}
                          onChange={(e) => setListingPriceUnit(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#e2dccd] bg-white p-2 text-xs text-[#173f35]"
                        >
                          {APPROVED_PRICE_UNITS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#173f35]">Harvest Year</label>
                      <input
                        type="number"
                        value={listingHarvestYear}
                        onChange={(e) => setListingHarvestYear(Number(e.target.value))}
                        className="mt-1 w-full rounded-lg border border-[#e2dccd] bg-white p-2 text-xs text-[#173f35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#173f35]">Publication Status</label>
                      <select
                        value={listingStatus}
                        onChange={(e) => setListingStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                        className="mt-1 w-full rounded-lg border border-[#e2dccd] bg-white p-2 text-xs text-[#173f35]"
                      >
                        <option value="PUBLISHED">PUBLISHED (Marketplace Live)</option>
                        <option value="DRAFT">DRAFT (Internal)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2dccd]">
                    <button
                      type="button"
                      onClick={() => setIsAddingListing(false)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#52635c] hover:bg-[#f6f2e8]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={listingSubmitting}
                      className="rounded-lg bg-[#173f35] px-4 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] disabled:opacity-50"
                    >
                      {listingSubmitting ? "Creating..." : "Save Listing on Behalf"}
                    </button>
                  </div>
                </form>
              )}

              {/* LISTINGS TABLE */}
              {detail.listings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#e2dccd] p-8 text-center text-xs text-[#6e7d77]">
                  No listings registered for this supplier yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[10px] font-bold uppercase tracking-wider text-[#6e7d77]">
                        <th className="py-2.5 px-3">Title & Material</th>
                        <th className="py-2.5 px-3">Product Form</th>
                        <th className="py-2.5 px-3">Quantity</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3">Site</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0ece1]">
                      {detail.listings.map((l) => (
                        <tr key={l.id} className="hover:bg-[#fcfaf5]">
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#173f35] block">{l.title}</span>
                            <span className="text-[10px] text-[#6e7d77]">{l.materialType} · Harvest {l.harvestYear || "—"}</span>
                          </td>
                          <td className="py-3 px-3 text-[#52635c]">
                            {PRODUCT_FORM_LABELS[l.productForm as keyof typeof PRODUCT_FORM_LABELS] || l.productForm || "—"}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#173f35]">
                            {l.quantity} {l.quantityUnit}
                          </td>
                          <td className="py-3 px-3 text-[#52635c]">
                            {l.priceAmount ? `€${l.priceAmount} / ${l.priceUnit === "PER_KG" ? "kg" : "t"}` : "Not specified"}
                          </td>
                          <td className="py-3 px-3 text-[#52635c]">
                            {l.siteName || "—"}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                l.status === "PUBLISHED"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTION SITES */}
          {activeTab === "sites" && (
            <div className="p-5">
              <h3 className="text-sm font-bold text-[#173f35] mb-3">Registered Production Sites</h3>
              {detail.sites.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#e2dccd] p-8 text-center text-xs text-[#6e7d77]">
                  No production sites registered for this supplier.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {detail.sites.map((s) => (
                    <div key={s.id} className="rounded-xl border border-[#e2dccd] p-4 bg-[#faf8f1]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#173f35]">{s.name}</span>
                        {s.facilityType && (
                          <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-[#52635c] border border-[#e2dccd]">
                            {s.facilityType}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-[#6e7d77]">
                        {s.address ? `${s.address}, ` : ""}
                        {s.city ? `${s.city}, ` : ""}
                        {s.country || "—"}
                      </p>
                      {s.landAreaHectares && (
                        <p className="mt-2 text-[10px] font-semibold text-[#173f35]">
                          Land area: {s.landAreaHectares} ha
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPLIANCE DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="p-5">
              <h3 className="text-sm font-bold text-[#173f35] mb-3">Compliance & Verification Evidence</h3>
              {detail.complianceDocuments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#e2dccd] p-8 text-center text-xs text-[#6e7d77]">
                  No compliance documents submitted by this supplier.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[10px] font-bold uppercase tracking-wider text-[#6e7d77]">
                        <th className="py-2.5 px-3">Document Type</th>
                        <th className="py-2.5 px-3">Filename</th>
                        <th className="py-2.5 px-3">File Size</th>
                        <th className="py-2.5 px-3">Submitted</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0ece1]">
                      {detail.complianceDocuments.map((d) => (
                        <tr key={d.id}>
                          <td className="py-3 px-3 font-semibold text-[#173f35]">
                            {d.documentType.replace(/_/g, " ")}
                          </td>
                          <td className="py-3 px-3 text-[#52635c]">{d.originalFilename}</td>
                          <td className="py-3 px-3 text-[#6e7d77]">
                            {(d.fileSize / 1024).toFixed(1)} KB
                          </td>
                          <td className="py-3 px-3 text-[#6e7d77]">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LEGAL & PROFILE */}
          {activeTab === "profile" && (
            <div className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#173f35]">Organisation Identification</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-[#e2dccd] p-3 bg-[#faf8f1]">
                  <span className="block text-[10px] uppercase font-semibold text-[#6e7d77]">Legal Name</span>
                  <span className="font-bold text-[#173f35]">{detail.legalName || "—"}</span>
                </div>
                <div className="rounded-xl border border-[#e2dccd] p-3 bg-[#faf8f1]">
                  <span className="block text-[10px] uppercase font-semibold text-[#6e7d77]">Business Type</span>
                  <span className="font-bold text-[#173f35]">{detail.businessType || "—"}</span>
                </div>
                <div className="rounded-xl border border-[#e2dccd] p-3 bg-[#faf8f1]">
                  <span className="block text-[10px] uppercase font-semibold text-[#6e7d77]">Registration / Chamber of Commerce</span>
                  <span className="font-bold text-[#173f35]">{detail.registrationNumber || "—"}</span>
                </div>
                <div className="rounded-xl border border-[#e2dccd] p-3 bg-[#faf8f1]">
                  <span className="block text-[10px] uppercase font-semibold text-[#6e7d77]">VAT ID</span>
                  <span className="font-bold text-[#173f35]">{detail.vatNumber || "—"}</span>
                </div>
                <div className="rounded-xl border border-[#e2dccd] p-3 bg-[#faf8f1] sm:col-span-2">
                  <span className="block text-[10px] uppercase font-semibold text-[#6e7d77]">Registered Address</span>
                  <span className="font-bold text-[#173f35]">
                    {detail.address ? `${detail.address}, ` : ""}
                    {detail.postalCode ? `${detail.postalCode} ` : ""}
                    {detail.city ? `${detail.city}, ` : ""}
                    {detail.country || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SUPPLIERS DIRECTORY LIST VIEW
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#173f35] sm:text-2xl">
          Supplier Management
        </h1>
        <p className="mt-1 text-xs text-[#52635c] sm:text-sm">
          Platform-wide natural fibre suppliers, production facilities & inventory capacity
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name, city or country..."
            className="w-full max-w-sm rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3.5 py-2 text-xs text-[#173f35] placeholder-[#6e7d77] focus:border-[#173f35] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#173f35] px-3.5 py-2 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6e7d77]">Status:</span>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3 py-2 text-xs font-semibold text-[#173f35] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Suppliers Table */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6e7d77]">Loading suppliers...</div>
        ) : suppliers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-[#173f35]">No suppliers found</p>
            <p className="mt-1 text-xs text-[#6e7d77]">
              Try adjusting your search criteria or verification status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2dccd] bg-[#fbf9f4]/60 text-[11px] font-bold uppercase tracking-wider text-[#6e7d77]">
                  <th className="py-3 px-4">Supplier Organisation</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-center">Live Supply</th>
                  <th className="py-3 px-4 text-center">Drafts</th>
                  <th className="py-3 px-4 text-center">Sites</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece1]">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#fcfaf5] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#173f35]">
                      <div>
                        <p>{s.name}</p>
                        {s.legalName && s.legalName !== s.name && (
                          <p className="text-[10px] font-normal text-[#6e7d77]">{s.legalName}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#52635c]">
                      {s.city ? `${s.city}, ` : ""}{s.country || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          s.verificationStatus === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : s.verificationStatus === "UNDER_REVIEW"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {s.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#173f35]">
                      {s.publishedListingCount}
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#52635c]">
                      {s.draftListingCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-[#173f35]">
                      {s.siteCount}
                    </td>
                    <td className="py-3.5 px-4 text-[#6e7d77] text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelect(s.id)}
                        className="inline-flex items-center rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] transition-all"
                      >
                        View Supplier
                      </button>
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
