"use client";

import { useEffect, useState } from "react";
import { formatMaterialType, formatProductForm } from "./formatters";
import type { PublicMarketplaceFacets } from "./public-contracts";

export interface AllFiltersDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly selectedMaterial: string;
  readonly selectedForm: string;
  readonly selectedCountry: string;
  readonly minQuantity: string;
  readonly maxQuantity: string;
  readonly minPrice: string;
  readonly maxPrice: string;
  readonly hasDpp: boolean;
  readonly hasQualityApproved: boolean;
  readonly hasCertifications: boolean;
  readonly sort: string;
  readonly totalResults?: number;
  readonly loading?: boolean;
  readonly facets?: PublicMarketplaceFacets;
  readonly activeCount: number;
  readonly onUpdateParam: (updates: Record<string, string | null>) => void;
  readonly onClearAll: () => void;
}

const MATERIALS = ["HEMP", "FLAX", "SISAL", "JUTE", "COIR", "KENAF"];
const PRODUCT_FORMS = [
  "STRAW_RETTED",
  "STRAW_RAW",
  "FIBRE_TECHNICAL",
  "SCUTCHED_FLAX",
  "TOW",
  "YARN",
  "HURDS",
];
const COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "BE", name: "Belgium" },
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "DE", name: "Germany" },
];

export function AllFiltersDrawer({
  isOpen,
  onClose,
  selectedMaterial,
  selectedForm,
  selectedCountry,
  minQuantity,
  maxQuantity,
  minPrice,
  maxPrice,
  hasDpp,
  hasQualityApproved,
  hasCertifications,
  sort,
  totalResults = 0,
  loading = false,
  facets,
  activeCount,
  onUpdateParam,
  onClearAll,
}: AllFiltersDrawerProps) {
  // Local drafts for inputs
  const [localMinQty, setLocalMinQty] = useState(minQuantity);
  const [localMaxQty, setLocalMaxQty] = useState(maxQuantity);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    setLocalMinQty(minQuantity);
    setLocalMaxQty(maxQuantity);
  }, [minQuantity, maxQuantity]);

  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyRanges = () => {
    onUpdateParam({
      minQuantity: localMinQty.trim() || null,
      maxQuantity: localMaxQty.trim() || null,
      minPrice: localMinPrice.trim() || null,
      maxPrice: localMaxPrice.trim() || null,
    });
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-filters-title"
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4decb] bg-[#faf8f1]">
          <div className="flex items-center gap-2.5">
            <h2 id="all-filters-title" className="text-base font-extrabold text-[#173f35] tracking-tight">
              All Sourcing Filters
            </h2>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#173f35] text-white text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters drawer"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#5c6e66] hover:text-[#173f35] hover:bg-[#ece6d6] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* 1. Material Category */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#173f35] mb-2.5">
              Material Category
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35] p-1.5 rounded-lg hover:bg-[#fbf9f4]">
                <input
                  type="radio"
                  name="drawerMaterial"
                  checked={selectedMaterial === "ALL"}
                  onChange={() => onUpdateParam({ materialType: null })}
                  className="w-4 h-4 accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-medium">All Materials</span>
              </label>
              {MATERIALS.map((mat) => {
                const count = facets?.materials.find((m) => m.value.toUpperCase() === mat)?.count;
                const isSelected = selectedMaterial === mat;
                return (
                  <label
                    key={mat}
                    className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35] p-1.5 rounded-lg hover:bg-[#fbf9f4]"
                  >
                    <input
                      type="radio"
                      name="drawerMaterial"
                      checked={isSelected}
                      onChange={() => onUpdateParam({ materialType: mat })}
                      className="w-4 h-4 accent-[#173f35] cursor-pointer"
                    />
                    <span className="flex-1">{formatMaterialType(mat)}</span>
                    {count !== undefined && (
                      <span className="text-[11px] text-[#7d8f85] font-semibold">({count})</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Product Form */}
          <div className="border-t border-[#f0ebe0] pt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#173f35] mb-2.5">
              Product Form
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35] p-1.5 rounded-lg hover:bg-[#fbf9f4]">
                <input
                  type="radio"
                  name="drawerForm"
                  checked={selectedForm === "ALL"}
                  onChange={() => onUpdateParam({ productForm: null })}
                  className="w-4 h-4 accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-medium">All Forms</span>
              </label>
              {PRODUCT_FORMS.map((form) => (
                <label
                  key={form}
                  className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35] p-1.5 rounded-lg hover:bg-[#fbf9f4]"
                >
                  <input
                    type="radio"
                    name="drawerForm"
                    checked={selectedForm === form}
                    onChange={() => onUpdateParam({ productForm: form })}
                    className="w-4 h-4 accent-[#173f35] cursor-pointer"
                  />
                  <span className="flex-1">{formatProductForm(form)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Origin Country */}
          <div className="border-t border-[#f0ebe0] pt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#173f35] mb-2.5">
              Origin Country
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35] p-1.5 rounded-lg hover:bg-[#fbf9f4]">
                <input
                  type="radio"
                  name="drawerCountry"
                  checked={selectedCountry === "ALL"}
                  onChange={() => onUpdateParam({ originCountry: null })}
                  className="w-4 h-4 accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-medium">All Origins</span>
              </label>
              {COUNTRIES.map((c) => (
                <label
                  key={c.code}
                  className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35] p-1.5 rounded-lg hover:bg-[#fbf9f4]"
                >
                  <input
                    type="radio"
                    name="drawerCountry"
                    checked={selectedCountry === c.code || selectedCountry === c.name}
                    onChange={() => onUpdateParam({ originCountry: c.code })}
                    className="w-4 h-4 accent-[#173f35] cursor-pointer"
                  />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-[10px] text-[#7d8f85] font-semibold">{c.code}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Trust & Compliance */}
          <div className="border-t border-[#f0ebe0] pt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#173f35] mb-2.5">
              Trust & Compliance
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35] p-1.5 rounded-lg hover:bg-[#fbf9f4]">
                <input
                  type="checkbox"
                  checked={hasDpp}
                  onChange={(e) => onUpdateParam({ hasDpp: e.target.checked ? "true" : null })}
                  className="w-4 h-4 rounded accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-semibold text-[#173f35]">Digital Product Passport (DPP)</span>
              </label>
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35] p-1.5 rounded-lg hover:bg-[#fbf9f4]">
                <input
                  type="checkbox"
                  checked={hasQualityApproved}
                  onChange={(e) => onUpdateParam({ hasQualityApproved: e.target.checked ? "true" : null })}
                  className="w-4 h-4 rounded accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-semibold text-[#173f35]">Quality Inspected & Approved</span>
              </label>
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35] p-1.5 rounded-lg hover:bg-[#fbf9f4]">
                <input
                  type="checkbox"
                  checked={hasCertifications}
                  onChange={(e) => onUpdateParam({ hasCertifications: e.target.checked ? "true" : null })}
                  className="w-4 h-4 rounded accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-semibold text-[#173f35]">Verified Supplier Certifications</span>
              </label>
            </div>
          </div>

          {/* 5. Volume Range */}
          <div className="border-t border-[#f0ebe0] pt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#173f35] mb-2.5">
              Volume Range (Tonnes)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">Min Tonnes</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={localMinQty}
                  onChange={(e) => setLocalMinQty(e.target.value)}
                  onBlur={handleApplyRanges}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">Max Tonnes</label>
                <input
                  type="number"
                  min={0}
                  placeholder="500"
                  value={localMaxQty}
                  onChange={(e) => setLocalMaxQty(e.target.value)}
                  onBlur={handleApplyRanges}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                />
              </div>
            </div>
          </div>

          {/* 6. Indicative Price Range */}
          <div className="border-t border-[#f0ebe0] pt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#173f35] mb-2.5">
              Indicative Price Range (€/tonne)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">Min €/t</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  onBlur={handleApplyRanges}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">Max €/t</label>
                <input
                  type="number"
                  min={0}
                  placeholder="1200"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  onBlur={handleApplyRanges}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                />
              </div>
            </div>
          </div>

          {/* 7. Sort Order */}
          <div className="border-t border-[#f0ebe0] pt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#173f35] mb-2.5">
              Sort Order
            </div>
            <select
              value={sort}
              onChange={(e) => onUpdateParam({ sort: e.target.value })}
              className="w-full py-2 px-3 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs font-semibold text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="quantity_desc">Volume: High to Low</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="px-6 py-4 border-t border-[#e4decb] bg-[#faf8f1] grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClearAll}
            className="h-11 rounded-lg border border-[#d8d1bd] text-xs font-bold text-[#173f35] hover:bg-white transition-colors"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => {
              handleApplyRanges();
              onClose();
            }}
            className="h-11 rounded-lg bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold shadow-sm transition-colors"
          >
            {loading ? "Loading..." : `Show ${totalResults} Results`}
          </button>
        </div>
      </div>
    </div>
  );
}
