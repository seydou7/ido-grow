"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/i18n-provider";
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
const COUNTRIES = ["FR", "BE", "NL", "ES", "DE"];

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
  const { locale, t } = useI18n();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [localMinQty, setLocalMinQty] = useState(minQuantity);
  const [localMaxQty, setLocalMaxQty] = useState(maxQuantity);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMinQty(minQuantity);
    setLocalMaxQty(maxQuantity);
  }, [minQuantity, maxQuantity]);

  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

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

  const pillClass = (isActive: boolean) =>
    `inline-flex items-center gap-1.5 py-2 px-3.5 rounded-sm text-xs font-semibold border transition-colors cursor-pointer ${
      isActive
        ? "bg-[#173f35] text-white border-[#173f35]"
        : "bg-white text-[#173f35] border-[#d8d1bd] hover:border-[#173f35]"
    }`;

  return (
    <div
      ref={toolbarRef}
      className="sticky top-[64px] z-30 bg-[#faf8f1]/95 backdrop-blur-md border-b border-[#e4ded0] py-3"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Horizontal Filter Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            {/* 1. Material Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("material")}
                aria-expanded={openDropdown === "material"}
                className={pillClass(selectedMaterial !== "ALL")}
              >
                <span>
                  {selectedMaterial !== "ALL"
                    ? `${t("marketplace.filter.material")}: ${formatMaterialType(selectedMaterial, locale)}`
                    : t("marketplace.filter.material")}
                </span>
                <span className="text-[10px] opacity-70" aria-hidden="true">
                  ▾
                </span>
              </button>

              {openDropdown === "material" && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-md border border-[#ded8c4] shadow-xl p-2.5 z-50">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8a6a22] px-2.5 py-1 mb-1">
                    {t("marketplace.filter.material")}
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateParam({ materialType: null });
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-medium flex items-center justify-between cursor-pointer ${
                        selectedMaterial === "ALL"
                          ? "bg-[#173f35] text-white font-bold"
                          : "text-[#173f35] hover:bg-[#f2eddf]"
                      }`}
                    >
                      <span>{t("marketplace.filter.allMaterials")}</span>
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
                          className={`w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-medium flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#173f35] text-white font-bold"
                              : "text-[#173f35] hover:bg-[#f2eddf]"
                          }`}
                        >
                          <span>{formatMaterialType(mat, locale)}</span>
                          {count !== undefined && (
                            <span
                              className={`text-[10px] tabular-nums ${
                                isSelected ? "text-white/80" : "text-[#5c6e66]"
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
                className={pillClass(selectedForm !== "ALL")}
              >
                <span>
                  {selectedForm !== "ALL"
                    ? `${t("marketplace.filter.form")}: ${formatProductForm(selectedForm, locale)}`
                    : t("marketplace.filter.form")}
                </span>
                <span className="text-[10px] opacity-70" aria-hidden="true">
                  ▾
                </span>
              </button>

              {openDropdown === "form" && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-md border border-[#ded8c4] shadow-xl p-2.5 z-50 max-h-80 overflow-y-auto">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8a6a22] px-2.5 py-1 mb-1">
                    {t("marketplace.filter.form")}
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateParam({ productForm: null });
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-medium flex items-center justify-between cursor-pointer ${
                        selectedForm === "ALL"
                          ? "bg-[#173f35] text-white font-bold"
                          : "text-[#173f35] hover:bg-[#f2eddf]"
                      }`}
                    >
                      <span>{t("marketplace.filter.allForms")}</span>
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
                          className={`w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-medium flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#173f35] text-white font-bold"
                              : "text-[#173f35] hover:bg-[#f2eddf]"
                          }`}
                        >
                          <span>{formatProductForm(form, locale)}</span>
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
                className={pillClass(selectedCountry !== "ALL")}
              >
                <span>
                  {selectedCountry !== "ALL"
                    ? `${t("marketplace.filter.origin")}: ${formatOriginCountry(selectedCountry, locale)}`
                    : t("marketplace.filter.origin")}
                </span>
                <span className="text-[10px] opacity-70" aria-hidden="true">
                  ▾
                </span>
              </button>

              {openDropdown === "origin" && (
                <div className="absolute left-0 mt-2 w-60 bg-white rounded-md border border-[#ded8c4] shadow-xl p-2.5 z-50">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8a6a22] px-2.5 py-1 mb-1">
                    {t("marketplace.filter.origin")}
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateParam({ originCountry: null });
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-medium flex items-center justify-between cursor-pointer ${
                        selectedCountry === "ALL"
                          ? "bg-[#173f35] text-white font-bold"
                          : "text-[#173f35] hover:bg-[#f2eddf]"
                      }`}
                    >
                      <span>{t("marketplace.filter.allOrigins")}</span>
                    </button>
                    {COUNTRIES.map((code) => {
                      const isSelected = selectedCountry === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            onUpdateParam({ originCountry: code });
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-medium flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#173f35] text-white font-bold"
                              : "text-[#173f35] hover:bg-[#f2eddf]"
                          }`}
                        >
                          <span>{formatOriginCountry(code, locale)}</span>
                          <span
                            className={`text-[10px] ${
                              isSelected ? "text-white/80" : "text-[#5c6e66]"
                            }`}
                          >
                            {code}
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
                className={pillClass(Boolean(minQuantity || maxQuantity))}
              >
                <span>
                  {minQuantity || maxQuantity
                    ? `${t("marketplace.filter.volume")}: ${minQuantity || "0"}–${maxQuantity || "∞"} t`
                    : t("marketplace.filter.volume")}
                </span>
                <span className="text-[10px] opacity-70" aria-hidden="true">
                  ▾
                </span>
              </button>

              {openDropdown === "volume" && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-md border border-[#ded8c4] shadow-xl p-4 z-50">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8a6a22] mb-2.5">
                    {t("marketplace.filter.volumeRange")}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
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
                        className="w-full py-1.5 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-sm text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
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
                        className="w-full py-1.5 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-sm text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#e4ded0]">
                    <button
                      type="button"
                      onClick={() => {
                        setLocalMinQty("");
                        setLocalMaxQty("");
                        onUpdateParam({ minQuantity: null, maxQuantity: null });
                        setOpenDropdown(null);
                      }}
                      className="text-xs text-[#5c6e66] hover:text-[#173f35] font-semibold cursor-pointer"
                    >
                      {t("marketplace.filter.reset")}
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
                      className="py-1.5 px-3.5 bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold rounded-sm cursor-pointer"
                    >
                      {t("marketplace.filter.apply")}
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
                className={pillClass(Boolean(minPrice || maxPrice))}
              >
                <span>
                  {minPrice || maxPrice
                    ? `${t("marketplace.filter.price")}: €${minPrice || "0"}–€${maxPrice || "∞"}`
                    : t("marketplace.filter.price")}
                </span>
                <span className="text-[10px] opacity-70" aria-hidden="true">
                  ▾
                </span>
              </button>

              {openDropdown === "price" && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-md border border-[#ded8c4] shadow-xl p-4 z-50">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8a6a22] mb-2.5">
                    {t("marketplace.filter.priceRange")}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
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
                        className="w-full py-1.5 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-sm text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
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
                        className="w-full py-1.5 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-sm text-xs text-[#173f35] focus:outline-none focus:ring-1 focus:ring-[#173f35]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#e4ded0]">
                    <button
                      type="button"
                      onClick={() => {
                        setLocalMinPrice("");
                        setLocalMaxPrice("");
                        onUpdateParam({ minPrice: null, maxPrice: null });
                        setOpenDropdown(null);
                      }}
                      className="text-xs text-[#5c6e66] hover:text-[#173f35] font-semibold cursor-pointer"
                    >
                      {t("marketplace.filter.reset")}
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
                      className="py-1.5 px-3.5 bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold rounded-sm cursor-pointer"
                    >
                      {t("marketplace.filter.apply")}
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
              className={pillClass(hasQualityApproved)}
            >
              {hasQualityApproved && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2c98c]" aria-hidden="true" />
              )}
              <span>{t("marketplace.filter.quality")}</span>
            </button>

            {/* 7. Certifications Toggle Button */}
            <button
              type="button"
              onClick={() =>
                onUpdateParam({ hasCertifications: hasCertifications ? null : "true" })
              }
              className={pillClass(hasCertifications)}
            >
              {hasCertifications && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2c98c]" aria-hidden="true" />
              )}
              <span>{t("marketplace.filter.certifications")}</span>
            </button>

            {/* 8. Traceability / DPP Toggle Button */}
            <button
              type="button"
              onClick={() => onUpdateParam({ hasDpp: hasDpp ? null : "true" })}
              className={pillClass(hasDpp)}
            >
              {hasDpp && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2c98c]" aria-hidden="true" />
              )}
              <span>{t("marketplace.filter.dpp")}</span>
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAllFilters}
              className="flex items-center gap-2 py-2 px-3.5 bg-white border border-[#d8d1bd] rounded-sm text-xs font-bold text-[#173f35] hover:bg-[#f2eddf] cursor-pointer"
            >
              <svg
                className="w-4 h-4 text-[#173f35]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>{t("marketplace.filter.filtersMobile")}</span>
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#173f35] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Right: All Filters Modal Trigger & Sort */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenAllFilters}
              className="hidden lg:inline-flex items-center gap-2 py-2 px-3.5 bg-white border border-[#d8d1bd] hover:border-[#173f35] rounded-sm text-xs font-bold text-[#173f35] transition-colors cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5 text-[#173f35]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span>{t("marketplace.filter.allFilters")}</span>
              {activeCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#c89b3c] text-[#13352c] text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                  {activeCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <label
                htmlFor="toolbar-sort-select"
                className="text-xs font-semibold text-[#5c6e66] hidden sm:inline"
              >
                {t("marketplace.sort.label")}:
              </label>
              <select
                id="toolbar-sort-select"
                value={sort}
                onChange={(e) => onUpdateParam({ sort: e.target.value })}
                className="py-2 px-3 bg-white border border-[#d8d1bd] hover:border-[#173f35] rounded-sm text-xs font-semibold text-[#173f35] focus:outline-none focus:ring-2 focus:ring-[#173f35] cursor-pointer"
              >
                <option value="newest">{t("marketplace.sort.newest")}</option>
                <option value="price_asc">{t("marketplace.sort.priceAsc")}</option>
                <option value="price_desc">{t("marketplace.sort.priceDesc")}</option>
                <option value="quantity_desc">{t("marketplace.sort.volumeDesc")}</option>
                <option value="oldest">{t("marketplace.sort.oldest")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
