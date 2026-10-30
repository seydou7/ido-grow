"use client";

import { useEffect, useRef, useState } from "react";
import { formatMaterialType, formatOriginCountry, formatProductForm } from "./formatters";
import type { PublicMarketplaceFacets } from "./public-contracts";

export interface HorizontalFilterToolbarProps {
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
  readonly facets?: PublicMarketplaceFacets;
  readonly activeCount: number;
  readonly onUpdateParam: (updates: Record<string, string | null>) => void;
  readonly onOpenAllFilters: () => void;
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

export function HorizontalFilterToolbar({
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
  facets,
  activeCount,
  onUpdateParam,
  onOpenAllFilters,
}: HorizontalFilterToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Local draft states for volume and price ranges
  const [localMinQty, setLocalMinQty] = useState(minQuantity);
  const [localMaxQty, setLocalMaxQty] = useState(maxQuantity);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Sync drafts when props change
  useEffect(() => {
    setLocalMinQty(minQuantity);
    setLocalMaxQty(maxQuantity);
  }, [minQuantity, maxQuantity]);

  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  // Click outside to close any open dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  return (
    <div
      ref={toolbarRef}
      className="sticky top-[64px] z-30 bg-[#faf8f1]/95 backdrop-blur-md border-y border-[#e2dcce] py-3 shadow-xs"
    >
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Horizontal Filter Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            {/* 1. Material Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("material")}
                aria-expanded={openDropdown === "material"}
                className={`inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedMaterial !== "ALL"
                    ? "bg-[#173f35] text-white border-[#173f35] shadow-xs"
                    : "bg-white text-[#173f35] border-[#d8d1bd] hover:border-[#173f35] hover:bg-[#fbf9f4]"
                }`}
              >
                <span>
                  {selectedMaterial !== "ALL"
                    ? `Material: ${formatMaterialType(selectedMaterial)}`
                    : "Material"}
                </span>
                <span className="text-[10px] opacity-70">▾</span>
              </button>

              {openDropdown === "material" && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl border border-[#ded8c4] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7d8f85] px-2 py-1 mb-1">
                    Select Material
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateParam({ materialType: null });
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                        selectedMaterial === "ALL"
                          ? "bg-[#173f35] text-white font-bold"
                          : "text-[#173f35] hover:bg-[#f4f0e2]"
                      }`}
                    >
                      <span>All Materials</span>
                    </button>
                    {MATERIALS.map((mat) => {
                      const count = facets?.materials.find(
                        (m) => m.value.toUpperCase() === mat,
                      )?.count;
                      const isSelected = selectedMaterial === mat;
                      return (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => {
                            onUpdateParam({ materialType: mat });
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                            isSelected
                              ? "bg-[#173f35] text-white font-bold"
                              : "text-[#173f35] hover:bg-[#f4f0e2]"
                          }`}
                        >
                          <span>{formatMaterialType(mat)}</span>
                          {count !== undefined && (
                            <span
                              className={`text-[10px] ${
                                isSelected ? "text-white/80" : "text-[#7d8f85]"
                              }`}
                            >
                              ({count})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Product Form Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("form")}
                aria-expanded={openDropdown === "form"}
                className={`inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedForm !== "ALL"
                    ? "bg-[#173f35] text-white border-[#173f35] shadow-xs"
                    : "bg-white text-[#173f35] border-[#d8d1bd] hover:border-[#173f35] hover:bg-[#fbf9f4]"
                }`}
              >
                <span>
                  {selectedForm !== "ALL"
                    ? `Form: ${formatProductForm(selectedForm)}`
                    : "Product Form"}
                </span>
                <span className="text-[10px] opacity-70">▾</span>
              </button>

              {openDropdown === "form" && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl border border-[#ded8c4] shadow-xl p-3 z-50 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7d8f85] px-2 py-1 mb-1">
                    Select Product Form
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateParam({ productForm: null });
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                        selectedForm === "ALL"
                          ? "bg-[#173f35] text-white font-bold"
                          : "text-[#173f35] hover:bg-[#f4f0e2]"
                      }`}
                    >
                      <span>All Forms</span>
                    </button>
                    {PRODUCT_FORMS.map((form) => {
                      const isSelected = selectedForm === form;
                      return (
                        <button
                          key={form}
                          type="button"
                          onClick={() => {
                            onUpdateParam({ productForm: form });
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                            isSelected
                              ? "bg-[#173f35] text-white font-bold"
                              : "text-[#173f35] hover:bg-[#f4f0e2]"
                          }`}
                        >
                          <span>{formatProductForm(form)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Origin Country Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("origin")}
                aria-expanded={openDropdown === "origin"}
                className={`inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedCountry !== "ALL"
                    ? "bg-[#173f35] text-white border-[#173f35] shadow-xs"
                    : "bg-white text-[#173f35] border-[#d8d1bd] hover:border-[#173f35] hover:bg-[#fbf9f4]"
                }`}
              >
                <span>
                  {selectedCountry !== "ALL"
                    ? `Origin: ${formatOriginCountry(selectedCountry)}`
                    : "Origin"}
                </span>
                <span className="text-[10px] opacity-70">▾</span>
              </button>

              {openDropdown === "origin" && (
                <div className="absolute left-0 mt-2 w-60 bg-white rounded-xl border border-[#ded8c4] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7d8f85] px-2 py-1 mb-1">
                    Select Origin
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateParam({ originCountry: null });
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                        selectedCountry === "ALL"
                          ? "bg-[#173f35] text-white font-bold"
                          : "text-[#173f35] hover:bg-[#f4f0e2]"
                      }`}
                    >
                      <span>All Origins</span>
                    </button>
                    {COUNTRIES.map((c) => {
                      const isSelected =
                        selectedCountry === c.code || selectedCountry === c.name;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            onUpdateParam({ originCountry: c.code });
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                            isSelected
                              ? "bg-[#173f35] text-white font-bold"
                              : "text-[#173f35] hover:bg-[#f4f0e2]"
                          }`}
                        >
                          <span>{c.name}</span>
                          <span
                            className={`text-[10px] ${
                              isSelected ? "text-white/80" : "text-[#7d8f85]"
                            }`}
                          >
                            {c.code}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Volume Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("volume")}
                aria-expanded={openDropdown === "volume"}
                className={`inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border transition-all ${
                  minQuantity || maxQuantity
                    ? "bg-[#173f35] text-white border-[#173f35] shadow-xs"
                    : "bg-white text-[#173f35] border-[#d8d1bd] hover:border-[#173f35] hover:bg-[#fbf9f4]"
                }`}
              >
                <span>
                  {minQuantity || maxQuantity
                    ? `Volume: ${minQuantity || "0"}–${maxQuantity || "∞"} t`
                    : "Volume"}
                </span>
                <span className="text-[10px] opacity-70">▾</span>
              </button>

              {openDropdown === "volume" && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl border border-[#ded8c4] shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7d8f85] mb-2">
                    Volume Range (Tonnes)
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">
                        Min
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={localMinQty}
                        onChange={(e) => setLocalMinQty(e.target.value)}
                        className="w-full py-1.5 px-2 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">
                        Max
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="500"
                        value={localMaxQty}
                        onChange={(e) => setLocalMaxQty(e.target.value)}
                        className="w-full py-1.5 px-2 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0ebe0]">
                    <button
                      type="button"
                      onClick={() => {
                        setLocalMinQty("");
                        setLocalMaxQty("");
                        onUpdateParam({ minQuantity: null, maxQuantity: null });
                        setOpenDropdown(null);
                      }}
                      className="text-xs text-[#6d7e76] hover:text-[#173f35] font-semibold"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateParam({
                          minQuantity: localMinQty.trim() || null,
                          maxQuantity: localMaxQty.trim() || null,
                        });
                        setOpenDropdown(null);
                      }}
                      className="py-1.5 px-3 bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Price Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("price")}
                aria-expanded={openDropdown === "price"}
                className={`inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border transition-all ${
                  minPrice || maxPrice
                    ? "bg-[#173f35] text-white border-[#173f35] shadow-xs"
                    : "bg-white text-[#173f35] border-[#d8d1bd] hover:border-[#173f35] hover:bg-[#fbf9f4]"
                }`}
              >
                <span>
                  {minPrice || maxPrice
                    ? `Price: €${minPrice || "0"}–€${maxPrice || "∞"}`
                    : "Price"}
                </span>
                <span className="text-[10px] opacity-70">▾</span>
              </button>

              {openDropdown === "price" && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl border border-[#ded8c4] shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7d8f85] mb-2">
                    Indicative Price (€/tonne)
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">
                        Min €
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={localMinPrice}
                        onChange={(e) => setLocalMinPrice(e.target.value)}
                        className="w-full py-1.5 px-2 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">
                        Max €
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="1200"
                        value={localMaxPrice}
                        onChange={(e) => setLocalMaxPrice(e.target.value)}
                        className="w-full py-1.5 px-2 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0ebe0]">
                    <button
                      type="button"
                      onClick={() => {
                        setLocalMinPrice("");
                        setLocalMaxPrice("");
                        onUpdateParam({ minPrice: null, maxPrice: null });
                        setOpenDropdown(null);
                      }}
                      className="text-xs text-[#6d7e76] hover:text-[#173f35] font-semibold"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateParam({
                          minPrice: localMinPrice.trim() || null,
                          maxPrice: localMaxPrice.trim() || null,
                        });
                        setOpenDropdown(null);
                      }}
                      className="py-1.5 px-3 bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Quality Toggle Button */}
            <button
              type="button"
              onClick={() =>
                onUpdateParam({ hasQualityApproved: hasQualityApproved ? null : "true" })
              }
              className={`inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border transition-all ${
                hasQualityApproved
                  ? "bg-[#173f35] text-white border-[#173f35] shadow-xs"
                  : "bg-white text-[#173f35] border-[#d8d1bd] hover:border-[#173f35] hover:bg-[#fbf9f4]"
              }`}
            >
              {hasQualityApproved && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#c89b3c]" />
              )}
              <span>Quality Verified</span>
            </button>

            {/* 7. Certifications Toggle Button */}
            <button
              type="button"
              onClick={() =>
                onUpdateParam({ hasCertifications: hasCertifications ? null : "true" })
              }
              className={`inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border transition-all ${
                hasCertifications
                  ? "bg-[#173f35] text-white border-[#173f35] shadow-xs"
                  : "bg-white text-[#173f35] border-[#d8d1bd] hover:border-[#173f35] hover:bg-[#fbf9f4]"
              }`}
            >
              {hasCertifications && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#c89b3c]" />
              )}
              <span>Certifications</span>
            </button>

            {/* 8. Traceability / DPP Toggle Button */}
            <button
              type="button"
              onClick={() => onUpdateParam({ hasDpp: hasDpp ? null : "true" })}
              className={`inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border transition-all ${
                hasDpp
                  ? "bg-[#173f35] text-white border-[#173f35] shadow-xs"
                  : "bg-white text-[#173f35] border-[#d8d1bd] hover:border-[#173f35] hover:bg-[#fbf9f4]"
              }`}
            >
              {hasDpp && <span className="w-1.5 h-1.5 rounded-full bg-[#c89b3c]" />}
              <span>Traceability (DPP)</span>
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAllFilters}
              className="flex items-center gap-2 py-2 px-3.5 bg-white border border-[#c8c0aa] rounded-lg text-xs font-bold text-[#173f35] shadow-xs hover:bg-[#f4f0e2]"
            >
              <svg
                className="w-4 h-4 text-[#173f35]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Filters</span>
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#173f35] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Right: All Filters Modal Trigger & Sort */}
          <div className="flex items-center gap-3">
            {/* All Filters Button (Desktop) */}
            <button
              type="button"
              onClick={onOpenAllFilters}
              className="hidden lg:inline-flex items-center gap-2 py-2 px-3.5 bg-white border border-[#d8d1bd] hover:border-[#173f35] rounded-lg text-xs font-bold text-[#173f35] shadow-xs hover:bg-[#fbf9f4] transition-all"
            >
              <svg
                className="w-3.5 h-3.5 text-[#173f35]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span>All Filters</span>
              {activeCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#c89b3c] text-[#13352c] text-[10px] font-extrabold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="toolbar-sort-select"
                className="text-xs font-semibold text-[#5c6e66] hidden sm:inline"
              >
                Sort:
              </label>
              <select
                id="toolbar-sort-select"
                value={sort}
                onChange={(e) => onUpdateParam({ sort: e.target.value })}
                className="py-2 px-3 bg-white border border-[#d8d1bd] hover:border-[#173f35] rounded-lg text-xs font-semibold text-[#173f35] focus:outline-none focus:ring-2 focus:ring-[#173f35] cursor-pointer shadow-xs"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="quantity_desc">Volume: High to Low</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
