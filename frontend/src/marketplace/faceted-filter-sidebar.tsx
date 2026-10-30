"use client";

import { useState } from "react";
import { formatMaterialType, formatProductForm } from "./formatters";
import type { PublicMarketplaceFacets } from "./public-contracts";

export interface FacetedFilterSidebarProps {
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
  readonly facets?: PublicMarketplaceFacets;
  readonly activeCount: number;
  readonly onUpdateParam: (updates: Record<string, string | null>) => void;
  readonly onClearAll: () => void;
  /** Renders without sticky card chrome, for use inside the mobile drawer. */
  readonly embedded?: boolean;
}

export function FacetedFilterSidebar({
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
  facets,
  activeCount,
  onUpdateParam,
  onClearAll,
  embedded = false,
}: FacetedFilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    material: true,
    form: true,
    country: true,
    traceability: true,
    volume: true,
    price: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  return (
    <aside className={embedded ? "w-full" : "w-72 shrink-0"} aria-label="Marketplace filters">
      <div
        className={
          embedded
            ? "space-y-5"
            : "sticky top-20 bg-white rounded-2xl border border-[#ded8c4] p-5 shadow-xs space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto"
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#173f35]">
              Filters
            </h3>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#1e5442] text-white text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-[#1e5442] hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Section: Material Type */}
        <div className="border-b border-[#f0ebe0] pb-4">
          <button
            type="button"
            onClick={() => toggleSection("material")}
            aria-expanded={openSections.material}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#173f35] py-1 text-left"
          >
            <span>Material Category</span>
            <span className="text-[#8a9990]">{openSections.material ? "−" : "+"}</span>
          </button>
          {openSections.material && (
            <div className="mt-2.5 space-y-1.5">
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35]">
                <input
                  type="radio"
                  name="materialFilter"
                  checked={selectedMaterial === "ALL"}
                  onChange={() => onUpdateParam({ materialType: null })}
                  className="w-4 h-4 accent-[#1e5442] cursor-pointer"
                />
                <span className="flex-1">All Materials</span>
              </label>
              {MATERIALS.filter((mat) => {
                if (!facets) return true;
                const c = facets.materials.find((m) => m.value.toUpperCase() === mat)?.count ?? 0;
                return c > 0 || selectedMaterial === mat;
              }).map((mat) => {
                const count = facets?.materials.find((m) => m.value.toUpperCase() === mat)?.count;
                return (
                  <label
                    key={mat}
                    className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35]"
                  >
                    <input
                      type="radio"
                      name="materialFilter"
                      checked={selectedMaterial === mat}
                      onChange={() => onUpdateParam({ materialType: mat })}
                      className="w-4 h-4 accent-[#1e5442] cursor-pointer"
                    />
                    <span className="flex-1">{formatMaterialType(mat)}</span>
                    {count !== undefined && (
                      <span className="text-[11px] text-[#8a9990] font-medium">({count})</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Product Form */}
        <div className="border-b border-[#f0ebe0] pb-4">
          <button
            type="button"
            onClick={() => toggleSection("form")}
            aria-expanded={openSections.form}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#173f35] py-1 text-left"
          >
            <span>Product Form</span>
            <span className="text-[#8a9990]">{openSections.form ? "−" : "+"}</span>
          </button>
          {openSections.form && (
            <div className="mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35]">
                <input
                  type="radio"
                  name="formFilter"
                  checked={selectedForm === "ALL"}
                  onChange={() => onUpdateParam({ productForm: null })}
                  className="w-4 h-4 accent-[#1e5442] cursor-pointer"
                />
                <span className="flex-1">All Forms</span>
              </label>
              {PRODUCT_FORMS.map((form) => (
                <label
                  key={form}
                  className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35]"
                >
                  <input
                    type="radio"
                    name="formFilter"
                    checked={selectedForm === form}
                    onChange={() => onUpdateParam({ productForm: form })}
                    className="w-4 h-4 accent-[#1e5442] cursor-pointer"
                  />
                  <span className="flex-1">{formatProductForm(form)}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Section: Origin Country */}
        <div className="border-b border-[#f0ebe0] pb-4">
          <button
            type="button"
            onClick={() => toggleSection("country")}
            aria-expanded={openSections.country}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#173f35] py-1 text-left"
          >
            <span>Origin Country</span>
            <span className="text-[#8a9990]">{openSections.country ? "−" : "+"}</span>
          </button>
          {openSections.country && (
            <div className="mt-2.5 space-y-1.5">
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35]">
                <input
                  type="radio"
                  name="countryFilter"
                  checked={selectedCountry === "ALL"}
                  onChange={() => onUpdateParam({ originCountry: null })}
                  className="w-4 h-4 accent-[#1e5442] cursor-pointer"
                />
                <span className="flex-1">All Origins</span>
              </label>
              {COUNTRIES.map((c) => (
                <label
                  key={c.code}
                  className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35]"
                >
                  <input
                    type="radio"
                    name="countryFilter"
                    checked={selectedCountry === c.code || selectedCountry === c.name}
                    onChange={() => onUpdateParam({ originCountry: c.code })}
                    className="w-4 h-4 accent-[#1e5442] cursor-pointer"
                  />
                  <span className="flex-1">{c.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Section: Quality & Traceability Badges */}
        <div className="border-b border-[#f0ebe0] pb-4">
          <button
            type="button"
            onClick={() => toggleSection("traceability")}
            aria-expanded={openSections.traceability}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#173f35] py-1 text-left"
          >
            <span>Trust & Compliance</span>
            <span className="text-[#8a9990]">{openSections.traceability ? "−" : "+"}</span>
          </button>
          {openSections.traceability && (
            <div className="mt-2.5 space-y-2">
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35]">
                <input
                  type="checkbox"
                  checked={hasDpp}
                  onChange={(e) => onUpdateParam({ hasDpp: e.target.checked ? "true" : null })}
                  className="w-4 h-4 rounded accent-[#1e5442] cursor-pointer"
                />
                <span className="flex-1 font-medium">Digital Product Passport (DPP)</span>
              </label>
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35]">
                <input
                  type="checkbox"
                  checked={hasQualityApproved}
                  onChange={(e) => onUpdateParam({ hasQualityApproved: e.target.checked ? "true" : null })}
                  className="w-4 h-4 rounded accent-[#1e5442] cursor-pointer"
                />
                <span className="flex-1 font-medium">Lab Quality Inspected</span>
              </label>
              <label className="flex items-center space-x-2.5 text-xs text-[#2c4038] cursor-pointer hover:text-[#173f35]">
                <input
                  type="checkbox"
                  checked={hasCertifications}
                  onChange={(e) => onUpdateParam({ hasCertifications: e.target.checked ? "true" : null })}
                  className="w-4 h-4 rounded accent-[#1e5442] cursor-pointer"
                />
                <span className="flex-1 font-medium">Verified Certifications</span>
              </label>
            </div>
          )}
        </div>

        {/* Section: Volume & Price Ranges */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("volume")}
            aria-expanded={openSections.volume}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#173f35] py-1 text-left"
          >
            <span>Volume (Tonnes)</span>
            <span className="text-[#8a9990]">{openSections.volume ? "−" : "+"}</span>
          </button>
          {openSections.volume && (
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="filter-min-qty" className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">Min</label>
                <input
                  id="filter-min-qty"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={minQuantity}
                  onChange={(e) => onUpdateParam({ minQuantity: e.target.value || null })}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-2 focus:ring-[#1e5442]"
                />
              </div>
              <div>
                <label htmlFor="filter-max-qty" className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">Max</label>
                <input
                  id="filter-max-qty"
                  type="number"
                  min={0}
                  placeholder="500"
                  value={maxQuantity}
                  onChange={(e) => onUpdateParam({ maxQuantity: e.target.value || null })}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-2 focus:ring-[#1e5442]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => toggleSection("price")}
            aria-expanded={openSections.price}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#173f35] py-1 text-left"
          >
            <span>Indicative Price (€/t)</span>
            <span className="text-[#8a9990]">{openSections.price ? "−" : "+"}</span>
          </button>
          {openSections.price && (
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="filter-min-price" className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">Min €</label>
                <input
                  id="filter-min-price"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => onUpdateParam({ minPrice: e.target.value || null })}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-2 focus:ring-[#1e5442]"
                />
              </div>
              <div>
                <label htmlFor="filter-max-price" className="block text-[10px] text-[#5c6e66] uppercase mb-0.5">Max €</label>
                <input
                  id="filter-max-price"
                  type="number"
                  min={0}
                  placeholder="1000"
                  value={maxPrice}
                  onChange={(e) => onUpdateParam({ maxPrice: e.target.value || null })}
                  className="w-full py-2 px-2.5 bg-[#faf8f1] border border-[#d8d1bd] rounded-lg text-xs text-[#173f35] focus:outline-none focus:ring-2 focus:ring-[#1e5442]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
