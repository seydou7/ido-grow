"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n-provider";
import { formatMaterialType, formatOriginCountry, formatProductForm } from "./formatters";
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
const COUNTRIES = ["FR", "BE", "NL", "ES", "DE"];

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
  const { locale, t } = useI18n();
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

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-filters-title"
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl overscroll-contain"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4ded0] bg-[#faf8f1]">
          <div className="flex items-center gap-2.5">
            <h2
              id="all-filters-title"
              className="text-base font-bold text-[#173f35] tracking-tight"
            >
              {t("marketplace.filter.allFilters")}
            </h2>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#173f35] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {activeCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("action.cancel")}
            className="w-9 h-9 flex items-center justify-center rounded-sm text-[#5c6e66] hover:text-[#173f35] hover:bg-[#ece6d6] transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-6">
          {/* 1. Material Category */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6a22] mb-2.5">
              {t("marketplace.filter.material")}
            </div>
            <div className="space-y-1">
              <label className="flex items-center space-x-2.5 text-xs text-[#173f35] cursor-pointer p-1.5 rounded-sm hover:bg-[#faf8f1]">
                <input
                  type="radio"
                  name="drawerMaterial"
                  checked={selectedMaterial === "ALL"}
                  onChange={() => onUpdateParam({ materialType: null })}
                  className="w-4 h-4 accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-medium">
                  {t("marketplace.filter.allMaterials")}
                </span>
              </label>
              {MATERIALS.map((mat) => {
                const count = facets?.materials.find(
                  (m) => m.value.toUpperCase() === mat,
                )?.count;
                const isSelected = selectedMaterial === mat;
                return (
                  <label
                    key={mat}
                    className="flex items-center space-x-2.5 text-xs text-[#173f35] cursor-pointer p-1.5 rounded-sm hover:bg-[#faf8f1]"
                  >
                    <input
                      type="radio"
                      name="drawerMaterial"
                      checked={isSelected}
                      onChange={() => onUpdateParam({ materialType: mat })}
                      className="w-4 h-4 accent-[#173f35] cursor-pointer"
                    />
                    <span className="flex-1">{formatMaterialType(mat, locale)}</span>
                    {count !== undefined && (
                      <span className="text-[11px] text-[#5c6e66] font-semibold tabular-nums">
                        ({count})
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Product Form */}
          <div className="border-t border-[#e4ded0] pt-5">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6a22] mb-2.5">
              {t("marketplace.filter.form")}
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center space-x-2.5 text-xs text-[#173f35] cursor-pointer p-1.5 rounded-sm hover:bg-[#faf8f1]">
                <input
                  type="radio"
                  name="drawerForm"
                  checked={selectedForm === "ALL"}
                  onChange={() => onUpdateParam({ productForm: null })}
                  className="w-4 h-4 accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-medium">{t("marketplace.filter.allForms")}</span>
              </label>
              {PRODUCT_FORMS.map((form) => (
                <label
                  key={form}
                  className="flex items-center space-x-2.5 text-xs text-[#173f35] cursor-pointer p-1.5 rounded-sm hover:bg-[#faf8f1]"
                >
                  <input
                    type="radio"
                    name="drawerForm"
                    checked={selectedForm === form}
                    onChange={() => onUpdateParam({ productForm: form })}
                    className="w-4 h-4 accent-[#173f35] cursor-pointer"
                  />
                  <span className="flex-1">{formatProductForm(form, locale)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Origin Country */}
          <div className="border-t border-[#e4ded0] pt-5">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6a22] mb-2.5">
              {t("marketplace.filter.origin")}
            </div>
            <div className="space-y-1">
              <label className="flex items-center space-x-2.5 text-xs text-[#173f35] cursor-pointer p-1.5 rounded-sm hover:bg-[#faf8f1]">
                <input
                  type="radio"
                  name="drawerCountry"
                  checked={selectedCountry === "ALL"}
                  onChange={() => onUpdateParam({ originCountry: null })}
                  className="w-4 h-4 accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-medium">
                  {t("marketplace.filter.allOrigins")}
                </span>
              </label>
              {COUNTRIES.map((code) => (
                <label
                  key={code}
                  className="flex items-center space-x-2.5 text-xs text-[#173f35] cursor-pointer p-1.5 rounded-sm hover:bg-[#faf8f1]"
                >
                  <input
                    type="radio"
                    name="drawerCountry"
                    checked={selectedCountry === code}
                    onChange={() => onUpdateParam({ originCountry: code })}
                    className="w-4 h-4 accent-[#173f35] cursor-pointer"
                  />
                  <span className="flex-1">{formatOriginCountry(code, locale)}</span>
                  <span className="text-[10px] text-[#5c6e66] font-semibold">{code}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Trust & Compliance */}
          <div className="border-t border-[#e4ded0] pt-5">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6a22] mb-2.5">
              {t("marketplace.filter.trustHeading")}
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 text-xs text-[#173f35] cursor-pointer p-1.5 rounded-sm hover:bg-[#faf8f1]">
                <input
                  type="checkbox"
                  checked={hasDpp}
                  onChange={(e) => onUpdateParam({ hasDpp: e.target.checked ? "true" : null })}
                  className="w-4 h-4 rounded-xs accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-semibold">{t("marketplace.filter.dppFull")}</span>
              </label>
              <label className="flex items-center space-x-2.5 text-xs text-[#173f35] cursor-pointer p-1.5 rounded-sm hover:bg-[#faf8f1]">
                <input
                  type="checkbox"
                  checked={hasQualityApproved}
                  onChange={(e) =>
                    onUpdateParam({ hasQualityApproved: e.target.checked ? "true" : null })
                  }
                  className="w-4 h-4 rounded-xs accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-semibold">
                  {t("marketplace.filter.qualityFull")}
                </span>
              </label>
              <label className="flex items-center space-x-2.5 text-xs text-[#173f35] cursor-pointer p-1.5 rounded-sm hover:bg-[#faf8f1]">
                <input
                  type="checkbox"
                  checked={hasCertifications}
                  onChange={(e) =>
                    onUpdateParam({ hasCertifications: e.target.checked ? "true" : null })
                  }
                  className="w-4 h-4 rounded-xs accent-[#173f35] cursor-pointer"
                />
                <span className="flex-1 font-semibold">
                  {t("marketplace.filter.certsFull")}
                </span>
              </label>
            </div>
          </div>

          {/* 5. Volume Range */}
          <div className="border-t border-[#e4ded0] pt-5">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6a22] mb-2.5">
              {t("marketplace.filter.volumeRange")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#5c6e66] uppercase mb-1">
                  {t("marketplace.filter.min")}
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={localMinQty}
                  onChange={(e) => setLocalMinQty(e.target.value)}
                  onBlur={handleApplyRanges}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-sm text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#5c6e66] uppercase mb-1">
                  {t("marketplace.filter.max")}
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="500"
                  value={localMaxQty}
                  onChange={(e) => setLocalMaxQty(e.target.value)}
                  onBlur={handleApplyRanges}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-sm text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                />
              </div>
            </div>
          </div>

          {/* 6. Indicative Price Range */}
          <div className="border-t border-[#e4ded0] pt-5">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6a22] mb-2.5">
              {t("marketplace.filter.priceRange")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#5c6e66] uppercase mb-1">
                  {t("marketplace.filter.min")} €
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  onBlur={handleApplyRanges}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-sm text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#5c6e66] uppercase mb-1">
                  {t("marketplace.filter.max")} €
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="1200"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  onBlur={handleApplyRanges}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-sm text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                />
              </div>
            </div>
          </div>

          {/* 7. Sort Order */}
          <div className="border-t border-[#e4ded0] pt-5">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6a22] mb-2.5">
              {t("marketplace.sort.label")}
            </div>
            <select
              value={sort}
              onChange={(e) => onUpdateParam({ sort: e.target.value })}
              className="w-full py-2 px-3 bg-[#faf8f1] border border-[#d8d1bd] rounded-sm text-xs font-semibold text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
            >
              <option value="newest">{t("marketplace.sort.newest")}</option>
              <option value="price_asc">{t("marketplace.sort.priceAsc")}</option>
              <option value="price_desc">{t("marketplace.sort.priceDesc")}</option>
              <option value="quantity_desc">{t("marketplace.sort.volumeDesc")}</option>
              <option value="oldest">{t("marketplace.sort.oldest")}</option>
            </select>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="px-6 py-4 border-t border-[#e4ded0] bg-[#faf8f1] grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClearAll}
            className="h-11 rounded-sm border border-[#d8d1bd] text-xs font-bold text-[#173f35] hover:bg-white transition-colors cursor-pointer"
          >
            {t("marketplace.filter.clearAll")}
          </button>
          <button
            type="button"
            onClick={() => {
              handleApplyRanges();
              onClose();
            }}
            className="h-11 rounded-sm bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {loading
              ? t("state.loading")
              : `${t("marketplace.filter.showResults")} (${totalResults})`}
          </button>
        </div>
      </div>
    </div>
  );
}
