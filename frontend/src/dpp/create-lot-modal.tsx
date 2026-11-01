"use client";

import React, { useEffect, useState } from "react";
import { getLocalApiBaseUrl } from "@/auth/config";
import type { CreateLotDto, TraceableLotResponse } from "./contracts";
import { createLot } from "./api";

interface ListingOption {
  id: string;
  title: string;
  organisationId: string;
  organisationName?: string;
  siteId?: string | null;
  materialType: string;
  productForm?: string | null;
  quantity: number;
  quantityUnit: string;
  originCountry?: string | null;
}

interface CreateLotModalProps {
  isOpen: boolean;
  preselectedListingId?: string;
  onClose: () => void;
  onLotCreated: (lot: TraceableLotResponse) => void;
}

export function CreateLotModal({
  isOpen,
  preselectedListingId,
  onClose,
  onLotCreated,
}: Readonly<CreateLotModalProps>) {
  const [listings, setListings] = useState<ListingOption[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(preselectedListingId ?? "");
  const [quantity, setQuantity] = useState<number | "">("");
  const [quantityUnit, setQuantityUnit] = useState("TONNES");
  const [materialType, setMaterialType] = useState("");
  const [productForm, setProductForm] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [regionOfOrigin, setRegionOfOrigin] = useState("");
  const [batchReference, setBatchReference] = useState("");
  const [productionDate, setProductionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadListings() {
      setLoadingListings(true);
      setError(null);
      try {
        const baseUrl = getLocalApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
        const res = await fetch(`${baseUrl}/api/v1/listings`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          const items: ListingOption[] = Array.isArray(data)
            ? data
            : (data.items ?? []);
          setListings(items);

          if (preselectedListingId) {
            const found = items.find((l) => l.id === preselectedListingId);
            if (found) {
              applyListingDefaults(found);
            }
          }
        }
      } catch {
        setError("Unable to load listings. You can still enter listing ID manually.");
      } finally {
        setLoadingListings(false);
      }
    }

    loadListings();
  }, [isOpen, preselectedListingId]);

  function applyListingDefaults(listing: ListingOption) {
    setSelectedListingId(listing.id);
    setMaterialType(listing.materialType || "");
    setProductForm(listing.productForm || "");
    setQuantity(listing.quantity || "");
    setQuantityUnit(listing.quantityUnit || "TONNES");
    setCountryOfOrigin(listing.originCountry || "");
  }

  function handleListingChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelectedListingId(id);
    const found = listings.find((l) => l.id === id);
    if (found) {
      applyListingDefaults(found);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedListingId) {
      setError("Please select a source listing.");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: CreateLotDto = {
        listingId: selectedListingId,
        quantity: Number(quantity),
        quantityUnit,
        materialType: materialType || undefined,
        productForm: productForm || undefined,
        countryOfOrigin: countryOfOrigin || undefined,
        regionOfOrigin: regionOfOrigin || undefined,
        batchReference: batchReference || undefined,
        productionDate: productionDate ? new Date(productionDate).toISOString() : undefined,
        notes: notes || undefined,
      };

      const lot = await createLot(payload);
      onLotCreated(lot);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create traceable lot.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0f1f1a] border border-[#234d40] p-6 shadow-2xl text-[#f3f4f6]">
        <div className="flex items-center justify-between border-b border-[#234d40] pb-4 mb-5">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Create Traceable Lot</h2>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              Establish an authoritative lot for physical batch traceability and DPP provenance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9ca3af] hover:text-white hover:bg-[#1a382f] transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="source-listing" className="block text-xs font-medium text-[#d1d5db] mb-1.5">
              Source Listing <span className="text-emerald-400">*</span>
            </label>
            {loadingListings ? (
              <div className="text-xs text-[#9ca3af] py-2">Loading supplier listings...</div>
            ) : listings.length > 0 ? (
              <select
                id="source-listing"
                value={selectedListingId}
                onChange={handleListingChange}
                required
                className="w-full rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Select a listing --</option>
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.materialType} — {l.quantity} {l.quantityUnit})
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="source-listing"
                type="text"
                placeholder="Listing UUID"
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                required
                className="w-full rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lot-material" className="block text-xs font-medium text-[#d1d5db] mb-1">
                Material Type <span className="text-emerald-400">*</span>
              </label>
              <input
                id="lot-material"
                type="text"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                required
                className="w-full rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="lot-product-form" className="block text-xs font-medium text-[#d1d5db] mb-1">Product Form</label>
              <input
                id="lot-product-form"
                type="text"
                placeholder="e.g. STRAW, HURD, FIBRE"
                value={productForm}
                onChange={(e) => setProductForm(e.target.value)}
                className="w-full rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lot-quantity" className="block text-xs font-medium text-[#d1d5db] mb-1">
                Lot Quantity <span className="text-emerald-400">*</span>
              </label>
              <input
                id="lot-quantity"
                type="number"
                step="any"
                min="0.001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                required
                className="w-full rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="lot-quantity-unit" className="block text-xs font-medium text-[#d1d5db] mb-1">Quantity Unit</label>
              <input
                id="lot-quantity-unit"
                type="text"
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
                className="w-full rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lot-country" className="block text-xs font-medium text-[#d1d5db] mb-1">Country of Origin</label>
              <input
                id="lot-country"
                type="text"
                placeholder="e.g. France, Senegal"
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                className="w-full rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="lot-region" className="block text-xs font-medium text-[#d1d5db] mb-1">Region / Farm Parcel</label>
              <input
                id="lot-region"
                type="text"
                placeholder="e.g. Normandy, Thiès"
                value={regionOfOrigin}
                onChange={(e) => setRegionOfOrigin(e.target.value)}
                className="w-full rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lot-batch-ref" className="block text-xs font-medium text-[#d1d5db] mb-1">
                Batch Reference (Optional)
              </label>
              <input
                id="lot-batch-ref"
                type="text"
                placeholder="External batch or bale code"
                value={batchReference}
                onChange={(e) => setBatchReference(e.target.value)}
                className="w-full rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="lot-prod-date" className="block text-xs font-medium text-[#d1d5db] mb-1">Production / Harvest Date</label>
              <input
                id="lot-prod-date"
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="w-full rounded-xl bg-[#142922] border border-[#234d40] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lot-notes" className="block text-xs font-medium text-[#d1d5db] mb-1">Operational Notes</label>
            <textarea
              id="lot-notes"
              rows={2}
              placeholder="Storage conditions, harvest specifics or batch remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-[#142922] border border-[#234d40] p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#234d40]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#234d40] px-4 py-2.5 text-xs font-medium text-[#9ca3af] hover:text-white hover:bg-[#1a382f] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating Lot..." : "Create Lot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
